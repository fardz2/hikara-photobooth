# DB Refactor Spec — Service Layer + `"use cache"` + Partial Rendering

## Principles

1. **Service = single source of truth for all DB calls**
   - No direct `supabase.from()` outside `services/`
   - Components & pages call services, never Supabase directly
   - Services are plain modules (no `"use server"`)

2. **Actions = thin orchestrators**
   - Validate input (Zod)
   - Call service
   - `revalidateTag()` / `updateTag()` on relevant tags
   - Return result

3. **Cache: `"use cache"` + `cacheLife()` + `cacheTag()`**
   - NOT `unstable_cache` (deprecated)
   - Public reads → `"use cache"` + `cacheLife('hours')` + `cacheTag()`
   - Admin reads → **NO cache** (real-time)
   - Writes → `revalidateTag()` in actions

4. **Partial Rendering via `cacheLife('seconds')`**
   - Short-lived caches auto-become "dynamic holes"
   - Static shell renders immediately, data streams in
   - `<Suspense>` boundaries provide fallbacks
   - This IS the PPR pattern from the skill

---

## Cache Strategy

### Public (cached with `"use cache"`)

| Data | `cacheLife` | `cacheTag` | Revalidate on |
|------|-------------|------------|---------------|
| `getSiteContent(section)` | `'hours'` | `'site-content'`, `'site-content:{section}'` | settings save |
| `getPricing()` | `'hours'` | `'pricing'` | pricing save |
| `getBookedSlots(date)` | `'seconds'` | `'booked-slots:{date}'` | new reservation |

`getBookedSlots` uses `'seconds'` → becomes dynamic hole → partial rendering.
Static shell loads instantly, slot data streams in behind `<Suspense>`.

### Admin (NO cache — always fresh)

| Data | Reason |
|------|--------|
| `getReservations(...)` | Must show new reservations immediately |
| `getReservationStats(...)` | Must reflect real-time counts |
| `getRecentReservations(limit)` | Must show latest activity |
| `getRevenueStats(from, to)` | Financial data must be accurate |
| `getAllSiteContent(sections[])` | Settings — admin edits, sees changes |
| `getCurrentUser()` | Auth — always fresh |

---

## Files to Modify

### Phase 1: Services (DB calls + `"use cache"`)

| Service | Add methods | Cache? |
|---------|-------------|--------|
| `site-content-service.ts` | `getSiteContent()`, `getPricing()` | ✅ `"use cache"` |
| `site-content-service.ts` | `getAllSiteContent(sections[])` | ❌ admin |
| `site-content-service.ts` | `upsertSiteContent()`, `upsertSectionContent()`, `upsertPricing()` | ❌ writes |
| `reservation-service.ts` | `getReservations()`, `getReservationStats()` | ❌ admin |
| `reservation-service.ts` | `getRecentReservations(limit)` | ❌ admin |
| `reservation-service.ts` | `getBookedSlots(date)` | ✅ `"use cache"` + `'seconds'` |
| `reservation-service.ts` | `checkSlotAvailability()`, `getReservationById()` | ❌ fresh |
| `reservation-service.ts` | `insertReservation()`, `updateReservation()`, `deleteReservation()` | ❌ writes |
| `revenue-service.ts` | `getRevenueStats(from, to)` | ❌ admin |
| `revenue-service.ts` | `logTransaction(data)` | ❌ write |
| `auth-service.ts` (new) | `getCurrentUser()` | ❌ fresh |

### Phase 2: Components → Service calls

| Component | Current | After |
|-----------|---------|-------|
| `settings/page.tsx` | Direct `supabase.from()` | `siteContentService.getAllSiteContent()` |
| `dashboard-stats.tsx` | Direct `supabase.from()` × 4 | `reservationService.getReservationStats()` |
| `dashboard-overview-data.tsx` | Direct `supabase.from()` | `reservationService.getRecentReservations()` |
| `user-info.tsx` | Direct `supabase.auth.getUser()` | `authService.getCurrentUser()` |

### Phase 3: Actions → Service + `revalidateTag()`

| Action | Current | After |
|--------|---------|-------|
| `reservation-actions.ts` | Direct insert/update/delete | `reservationService.*()` + `revalidateTag()` |
| `revenue-actions.ts` | Direct insert | `revenueService.logTransaction()` + `revalidateTag()` |
| `site-content-actions.ts` | Direct upsert × 3 | `siteContentService.upsert*()` + `revalidateTag()` |

### Phase 4: Cleanup

- Delete `src/lib/data/site-content.ts`
- Delete `src/lib/data/pricing.ts`
- Update all imports

---

## Service API (final shape)

```
src/lib/services/
├── site-content-service.ts
│   ├── getSiteContent(section)        # public, "use cache", cacheLife('hours')
│   ├── getPricing()                   # public, "use cache", cacheLife('hours')
│   ├── getAllSiteContent(sections[])   # admin, no cache
│   ├── upsertSiteContent(...)
│   ├── upsertSectionContent(...)
│   └── upsertPricing(...)
│
├── reservation-service.ts
│   ├── getReservations(filters)       # admin, no cache
│   ├── getReservationStats(from, to)  # admin, no cache
│   ├── getRecentReservations(limit)   # admin, no cache
│   ├── getBookedSlots(date)           # public, "use cache", cacheLife('seconds')
│   ├── checkSlotAvailability(...)     # no cache
│   ├── getReservationById(id)         # no cache
│   ├── insertReservation(record)
│   ├── updateReservation(id, payload)
│   ├── updateReservationStatus(id, status)
│   └── deleteReservation(id)
│
├── revenue-service.ts
│   ├── getRevenueStats(from, to)      # admin, no cache
│   └── logTransaction(data)           # write
│
└── auth-service.ts (new)
    └── getCurrentUser()               # no cache
```

---

## Partial Rendering Example

```tsx
// reservasi/page.tsx — static shell + dynamic slots
export default function ReservasiPage() {
  return (
    <ReservasiPageShell>           {/* ← static, prerendered */}
      <Suspense fallback={<Skeleton />}>
        <ReservationFormWithPricing />  {/* ← dynamic hole */}
      </Suspense>
    </ReservasiPageShell>
  );
}

// Inside ReservationFormWithPricing:
// pricing = "use cache" + cacheLife('hours') → cached
// bookedSlots = "use cache" + cacheLife('seconds') → dynamic hole
```

Result: `◐ (Partial Prerender)` — shell loads instantly, data streams in.

---

## Validation Gate

1. `npx tsc --noEmit` — zero new errors
2. `next build` — passes, routes show `◐` (partial prerender)
3. Manual: create reservation → admin dashboard shows it immediately
4. Manual: edit settings → landing page reflects change after `revalidateTag()`

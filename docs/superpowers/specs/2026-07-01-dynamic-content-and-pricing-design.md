# Dynamic Content + Pricing + Auth — Design Spec

**Date:** 2026-07-01
**Status:** Approved
**Scope:** Landing page dynamic content, dynamic pricing, change password, admin settings

---

## Goals

1. **Dynamic landing page** — admin bisa edit konten dari dashboard tanpa deploy
2. **Dynamic pricing** — admin bisa naik/turun harga dari dashboard
3. **Change password** — admin bisa ganti password
4. **Cache architecture** — nextjs-cache-architecture skill pattern
5. **Style/layout unchanged** — cuma konten yang jadi dynamic

---

## Non-Goals

- Drag-drop CMS — overkill untuk photobox lokal
- Multi-admin role management — Phase 3
- Dynamic section ordering — section order tetap hardcoded
- Dynamic component layout — style & layout tetap 100%

---

## Architecture Overview

```
lib/cache/tags.ts              — Cache tag registry (single source of truth)
lib/cache/revalidate.ts        — Revalidation utilities (all updateTag here)
lib/data/site-content.ts       — Cached data fetching ("use cache" + cacheTag)
lib/data/pricing.ts            — Cached pricing fetching
lib/actions/site-content-actions.ts — Server actions: update content
lib/actions/auth-actions.ts    — + changePassword()
supabase/migrations/           — site_content table
components/features/landing/   — Style 100% unchanged, data from DB
app/(admin)/dashboard/settings/ — Admin settings page (edit content + change password)
```

---

## Cache Architecture

Follows nextjs-cache-architecture skill pattern:

### Tag Registry — `lib/cache/tags.ts`

```ts
export const CACHE_TAGS = {
  siteContent: "site_content",
  siteContentSection: (section: string) => `site_content:${section}`,
  pricing: "pricing",
  reservations: "reservations",
  reservation: (id: string) => `reservation:${id}`,
  revenue: "revenue",
} as const satisfies TagRegistry;
```

### Revalidation — `lib/cache/revalidate.ts`

```ts
"use server";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "./tags";

function updateTags(tags: string[]) {
  for (const tag of tags) updateTag(tag);
}

export async function revalidateSiteContent(section: string) {
  updateTags([CACHE_TAGS.siteContent, CACHE_TAGS.siteContentSection(section)]);
}

export async function revalidatePricing() {
  updateTags([CACHE_TAGS.pricing, CACHE_TAGS.siteContentSection("pricing")]);
}
```

### Data Fetching — `lib/data/site-content.ts`

```ts
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";

export async function getSiteContent(section: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.siteContentSection(section));

  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("key, value")
    .eq("section", section);

  return data;
}
```

### Pricing Fetch — `lib/data/pricing.ts`

```ts
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";

export interface PricingItem {
  id: string;
  label: string;
  price: number;
  maxPeople?: number;
  note?: string;
}

export async function getPricing(): Promise<{
  paket_utama: PricingItem;
  extra_person: PricingItem;
  extra_print: PricingItem;
  custom_frame: PricingItem;
}> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.pricing);

  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("key, value")
    .eq("section", "pricing");

  // Transform rows to structured pricing object
  // Falls back to defaults if DB is empty (initial state)
}
```

---

## Database

### Table: `site_content`

```sql
create table site_content (
  section text not null,
  key text not null,
  value jsonb not null default '{}',
  updated_at timestamptz default now(),
  primary key (section, key)
);

alter table site_content enable row level security;

-- Public read
create policy "Public read site_content"
  on site_content for select
  using (true);

-- Admin-only write
create policy "Admin write site_content"
  on site_content for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```

### Seed Data

Initial rows inserted via migration. All current hardcoded content becomes DB rows.

---

## Dynamic Content Fields per Section

### Hero (`section = 'hero'`)

| key | type | description |
|-----|------|-------------|
| `tagline` | text | "HIKARA PHOTOBOX" |
| `title_line1` | text | "MOMEN KECIL," |
| `title_highlight` | text | "KENANGAN" |
| `title_line2` | text | "ABADI" |
| `subtitle` | text | Description below title |
| `brand_name` | text | "HIKARA" (large background text) |
| `vertical_text_right` | text | "PHOTOBOX" |
| `vertical_text_left` | text | "Abadikan Momen" |
| `cta_text` | text | "Book Now" |
| `cta_link` | text | "/reservasi" |
| `polaroid_1` | text | Image URL |
| `polaroid_2` | text | Image URL |
| `polaroid_3` | text | Image URL |

### Marquee (`section = 'marquee'`)

| key | type | description |
|-----|------|-------------|
| `text` | text[] | Array: ["HIKARA", "PHOTOBOX"] |

### About (`section = 'about'`)

| key | type | description |
|-----|------|-------------|
| `image_url` | text | About section image |
| `description` | text | About description text |

### Gallery (`section = 'gallery'`)

| key | type | description |
|-----|------|-------------|
| `images` | text[] | Array of image URLs |

### Themes (`section = 'themes'`)

| key | type | description |
|-----|------|-------------|
| `items` | jsonb | Array of { name, desc, img, images[] } |

### Testimonials (`section = 'testimonials'`)

| key | type | description |
|-----|------|-------------|
| `items` | jsonb | Array of { quote, author, context } |

### Pricing (`section = 'pricing'`)

| key | type | description |
|-----|------|-------------|
| `paket_utama` | jsonb | { label, price, maxPeople, note } |
| `extra_person` | jsonb | { label, price } |
| `extra_print` | jsonb | { label, price } |
| `custom_frame` | jsonb | { label, price } |

### Location (`section = 'location'`)

| key | type | description |
|-----|------|-------------|
| `map_embed_url` | text | Google Maps embed URL |
| `address` | text | Full address |
| `phone` | text | Phone number |
| `hours` | text | Operating hours |

### CTA (`section = 'cta'`)

| key | type | description |
|-----|------|-------------|
| `title` | text | CTA headline |
| `description` | text | CTA description |
| `button_text` | text | Button label |
| `button_link` | text | Button link |

---

## Pricing Dynamic — Impact Chain

### Files to Refactor

| File | Change |
|------|--------|
| `lib/constants/reservation.ts` | **DELETE** — diganti DB |
| `lib/utils/price.ts` | `calculateTotalPrice()` jadi async, baca dari cache |
| `lib/utils/revenue.ts` | `EXTRA_PERSON_PRICE` → baca dari cache |
| `lib/actions/reservation-actions.ts` | `calculateTotalPrice()` → await |
| `lib/actions/revenue-actions.ts` | Pricing → await |
| `components/features/reservation/reservation-form.tsx` | Props pricing dari parent |
| `components/features/revenue/log-transaction-form.tsx` | Props pricing dari parent |
| `components/features/landing/packages-section.tsx` | Fetch pricing langsung |
| `components/features/dashboard/columns.tsx` | Harga dari DB |

### Flow

```
Admin edit pricing (settings page)
  → revalidatePricing()
    → getPricing() cache invalidated
      → Next request fetches fresh from DB
        → All pricing refs get new values
```

### Price Calculation

`lib/utils/price.ts` — new signature:

```ts
export async function calculateTotalPrice(input: {
  packageId: string;
  extraPeopleCount?: number;
  extraPrintCount?: number;
  addons?: string[];
}): Promise<number>
```

Internally calls `getPricing()` (cached) to get current prices.

---

## Auth Changes

### Change Password — `lib/actions/auth-actions.ts`

```ts
export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: currentUser.email,
    password: currentPassword,
  });
  if (signInError) return { error: "Password lama salah" };

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (updateError) return { error: updateError.message };

  return { success: true };
}
```

### Admin Settings Page — `/dashboard/settings`

Tabs:
1. **Site Content** — Edit per section (hero, gallery, testimonials, etc.)
2. **Pricing** — Edit paket, extras, max people
3. **Change Password** — Current password + new password + confirm

---

## File Structure Changes

### New Files

```
src/lib/cache/tags.ts
src/lib/cache/revalidate.ts
src/lib/data/site-content.ts
src/lib/data/pricing.ts
src/lib/actions/site-content-actions.ts
src/app/(admin)/(dashboard)/dashboard/settings/page.tsx
src/components/features/dashboard/settings/site-content-form.tsx
src/components/features/dashboard/settings/pricing-form.tsx
src/components/features/dashboard/settings/change-password-form.tsx
supabase/migrations/YYYYMMDD_add_site_content.sql
```

### Modified Files

```
src/app/(public)/page.tsx           — Fetch all section content
src/components/features/landing/*.tsx — Props instead of hardcoded data
src/lib/utils/price.ts              — Async pricing
src/lib/utils/revenue.ts            — Async pricing
src/lib/actions/reservation-actions.ts — Async pricing
src/lib/actions/revenue-actions.ts    — Async pricing
src/components/features/reservation/reservation-form.tsx — Props pricing
src/components/features/revenue/log-transaction-form.tsx — Props pricing
src/components/features/dashboard/columns.tsx — Props pricing
src/components/features/dashboard/edit-reservation-dialog.tsx — Props pricing
src/components/features/dashboard/dashboard-stats.tsx — Props pricing
src/components/features/dashboard/reservation-list.tsx — Props pricing
src/components/features/revenue/revenue-stats.tsx — Props pricing
src/components/features/revenue/revenue-chart.tsx — Props pricing
src/components/features/revenue/revenue-overview.tsx — Props pricing
src/components/features/revenue/transaction-detail-sheet.tsx — Props pricing
```

### Deleted Files

```
src/lib/constants/reservation.ts — Replaced by DB
```

---

## Testing

- Existing 108 tests must pass
- Add tests for:
  - `getPricing()` — cache behavior
  - `getSiteContent()` — cache behavior
  - `calculateTotalPrice()` — async with pricing object
  - `changePassword()` — success + error cases
  - Server actions — site content update + revalidation

---

## Success Criteria

- [ ] All landing sections read from DB, style unchanged
- [ ] All pricing read from DB, admin editable
- [ ] Cache tag system working with `CACHE_TAGS`
- [ ] Revalidation working (admin edit → live update on next request)
- [ ] Change password working
- [ ] Admin settings page functional
- [ ] All 108+ tests pass
- [ ] Build passes
- [ ] react-doctor 0 issues

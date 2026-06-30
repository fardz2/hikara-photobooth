# Settings Page Refactor — Spec & Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Refactor admin settings page → per-section partial rendering with skeleton, smart form fields (not raw JSON textarea), image upload, and responsive mobile layout.

**Architecture:** Split monolithic `SettingsClient` into per-section async server components wrapped in individual `<Suspense>` boundaries. Each section fetches its own data independently (PPR pattern). Smart field renderer detects value type (string, URL, array, object) and renders appropriate input. Image upload uses Supabase Storage bucket `site-images`.

**Tech Stack:** Next.js 16.2.9 (cacheComponents), Supabase, shadcn/ui, Tailwind, hugeicons

---

## Current Problems

1. **No skeleton** — fallback is `<div>Loading settings...</div>` text
2. **No partial rendering** — ALL 8 sections + pricing fetched in one blocking component
3. **Raw JSON textarea** — `SectionForm` dumps `JSON.stringify(value)` for arrays/objects
4. **Not responsive** — sidebar `w-48` breaks on mobile
5. **No image upload** — image URLs are just text inputs, no preview

## Target State

- Shell (header + tab nav) renders instantly
- Each section content streams in independently via `<Suspense>`
- Strings → text input/textarea, URLs with images → preview + upload, arrays → grid/cards, objects → structured fields
- Mobile: horizontal scrollable tab bar replaces sidebar
- Gallery/template images: upload via Supabase Storage, max configurable per section

## Reference Pattern (from dashboard pages)

```tsx
// src/app/(admin)/(dashboard)/dashboard/page.tsx — THE pattern to follow
export default function DashboardPage({ searchParams }: Props) {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-[#2C2A29] tracking-tight mb-2">Overview</h1>
          <p className="text-sm text-[#5A5550] uppercase tracking-widest opacity-80">...</p>
        </div>
      </div>
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<DashboardOverviewSkeleton />}>
        <DashboardOverviewData searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
```

**Pattern rules:**
- Server component page → async data components → each wrapped in `<Suspense fallback={<Skeleton />}>`
- Skeleton uses `Skeleton` from `@/components/ui/skeleton` with `rounded-none bg-[#2C2A29]/5`
- Section titles: `font-heading text-3xl md:text-4xl text-[#2C2A29] tracking-tight`
- Description: `text-sm text-[#5A5550] uppercase tracking-widest opacity-80`

---

## Data Structure Reference (site_content table)

| Section | Keys | Value Type | UI Widget |
|---------|------|-----------|-----------|
| hero | tagline, title_line1, title_highlight, title_line2, subtitle, brand_name, vertical_text_right, vertical_text_left, cta_text, cta_link | string | text input |
| hero | polaroid_1, polaroid_2, polaroid_3 | string (URL) | image preview + upload |
| marquee | text | `["HIKARA","PHOTOBOX"]` | tag input (add/remove) |
| about | image_url | string (URL) | image preview + upload |
| about | description | string (long) | textarea |
| gallery | images | `[url, url, ...]` | image grid + upload (max 3) |
| themes | items | `[{name, desc, img, images}]` | card list |
| testimonials | items | `[{quote, author, context}]` | card list |
| pricing | paket_utama, extra_person, extra_print, custom_frame | `{label, price, maxPeople?, note?}` | structured form (existing) |
| location | address, phone, hours | string | text input |
| location | map_embed_url | string (URL) | textarea |
| cta | title, description, button_text, button_link | string | text input |

---

## Tasks

### Task 1: Create SettingsSkeleton component

**Objective:** Proper skeleton fallback matching Hikara admin style

**Files:**
- Modify: `src/components/skeletons/settings-skeleton.tsx` (already created, needs update)

**Implementation:**

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tab bar skeleton — mobile */}
      <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 shrink-0 rounded-none bg-[#2C2A29]/5" />
        ))}
      </div>
      <div className="flex gap-8">
        {/* Sidebar skeleton — desktop */}
        <nav className="hidden md:block w-48 shrink-0 space-y-1">
          <Skeleton className="h-3 w-16 mb-4 rounded-none bg-[#2C2A29]/5" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-none bg-[#2C2A29]/5" />
          ))}
        </nav>
        {/* Content skeleton */}
        <div className="flex-1 max-w-2xl space-y-4">
          <Skeleton className="h-7 w-48 rounded-none bg-[#2C2A29]/5" />
          <Skeleton className="h-10 w-full rounded-none bg-[#2C2A29]/5" />
          <Skeleton className="h-10 w-full rounded-none bg-[#2C2A29]/5" />
          <Skeleton className="h-20 w-full rounded-none bg-[#2C2A29]/5" />
          <Skeleton className="h-9 w-28 rounded-none bg-[#2C2A29]/5" />
        </div>
      </div>
    </div>
  )
}
```

**Verify:** TypeScript passes `bun x tsc --noEmit`

**Commit:** `feat: settings skeleton component`

---

### Task 2: Split settings page into per-section Suspense boundaries

**Objective:** Replace single blocking `SettingsContent` with per-section async server components

**Files:**
- Modify: `src/app/(admin)/(dashboard)/dashboard/settings/page.tsx`

**Pattern:** Each section = async server component wrapped in `<Suspense>`. Tab nav stays client-side but content is server-rendered per section.

**Architecture:**

```
settings/page.tsx (server)
├── <Suspense fallback={<SettingsSkeleton />}>  ← shell skeleton
│   └── <SettingsShell>                         ← client: tab nav + layout
│       ├── <Suspense fallback={...}>           ← per-section
│       │   └── <SectionContent section="hero" />
│       ├── <Suspense fallback={...}>
│       │   └── <SectionContent section="about" />
│       └── ... (each section isolated)
```

**Key decision:** Settings page is admin-only → NO `"use cache"` on page or section data fetches. Use `createClient()` (server client with auth). `connection()` not needed (already admin-only, no static prerender).

**Implementation:**

```tsx
// src/app/(admin)/(dashboard)/dashboard/settings/page.tsx
import { Suspense } from "react"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"
import { SettingsShell } from "@/components/features/dashboard/settings/settings-shell"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading uppercase tracking-widest text-[#2C2A29]">Settings</h1>
        <p className="text-sm text-[#5A5550] mt-1">Manage site content, pricing, and account</p>
      </div>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsShell />
      </Suspense>
    </div>
  )
}
```

**Verify:** Page loads, skeleton shows, then content streams in

**Commit:** `feat: split settings into per-section suspense boundaries`

---

### Task 3: Create SettingsShell with responsive tab navigation

**Objective:** Client component with responsive tab bar (sidebar on desktop, horizontal scroll on mobile)

**Files:**
- Create: `src/components/features/dashboard/settings/settings-shell.tsx`

**Implementation notes:**
- Desktop (md+): sidebar `w-48` left side (current pattern)
- Mobile: horizontal scrollable tab bar at top with `overflow-x-auto`
- Tab active style: `bg-[#632626] text-white` (current)
- Tab inactive: `text-[#5A5550] hover:bg-[#EBE6DF]` (current)
- Uses `ScrollArea` from shadcn for mobile scroll, or simple `overflow-x-auto flex gap-1`
- Each tab section = `<Suspense>` with section-specific skeleton

**Skeleton per section (inline, small):**
```tsx
const SectionSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <Skeleton className="h-6 w-40 rounded-none bg-[#2C2A29]/5" />
    <Skeleton className="h-10 w-full rounded-none bg-[#2C2A29]/5" />
    <Skeleton className="h-10 w-full rounded-none bg-[#2C2A29]/5" />
    <Skeleton className="h-20 w-full rounded-none bg-[#2C2A29]/5" />
    <Skeleton className="h-9 w-28 rounded-none bg-[#2C2A29]/5" />
  </div>
)
```

**Commit:** `feat: responsive settings shell with tab navigation`

---

### Task 4: Create smart SectionForm with type-based field rendering

**Objective:** Replace raw textarea `SectionForm` with smart field renderer

**Files:**
- Create: `src/components/features/dashboard/settings/smart-section-form.tsx`

**Field type detection logic:**

```ts
function detectFieldType(key: string, value: unknown): "image" | "tag-list" | "object-list" | "long-text" | "text" {
  // URL ending in image extension → image field
  if (typeof value === "string" && /\.(jpg|jpeg|png|webp|gif|svg)/i.test(value)) return "image"
  if (typeof value === "string" && value.startsWith("http") && key.match(/img|image|photo|polaroid|logo/i)) return "image"
  
  // Array of strings → tag list
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") return "tag-list"
  
  // Array of objects → object list (cards)
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") return "object-list"
  
  // Long string → textarea
  if (typeof value === "string" && (value.length > 100 || value.includes("\n"))) return "long-text"
  
  // Default → text input
  return "text"
}
```

**Field widgets:**

| Type | Widget |
|------|--------|
| `text` | `<Input>` with label |
| `long-text` | `<textarea>` rows=4 |
| `image` | URL input + `<img>` preview thumbnail + upload button |
| `tag-list` | Horizontal chips with add/remove |
| `object-list` | Card list with structured fields per object |

**Commit:** `feat: smart section form with type-based field rendering`

---

### Task 5: Create ImageField component with upload + preview

**Objective:** Image URL input with live preview thumbnail and upload button

**Files:**
- Create: `src/components/features/dashboard/settings/image-field.tsx`
- Modify: `src/lib/actions/upload-actions.ts` (already created, verify it works)

**Implementation:**

```tsx
// image-field.tsx — "use client"
interface ImageFieldProps {
  name: string        // form field name
  label: string
  defaultValue?: string
  onUpload?: (url: string) => void  // callback after successful upload
}

export function ImageField({ name, label, defaultValue, onUpload }: ImageFieldProps) {
  // State: url (text input value), preview (shown thumbnail), uploading
  // On URL change → update preview
  // On file select → call uploadSiteImage → get URL → set as value → preview
  // Style: border border-[#E8E2D9] rounded-none, button bg-[#632626]
}
```

**Style reference (proof-preview.tsx pattern):**
- Sharp edges: `rounded-none`
- Border: `border-[#2C2A29]/10`
- Hover: `hover:border-[#2C2A29]/30 transition-all duration-300`
- Button: `text-[10px] uppercase tracking-widest font-bold`

**Commit:** `feat: image field with upload and preview`

---

### Task 6: Create GalleryField component (multi-image with limit)

**Objective:** Gallery image management — grid of thumbnails, add/remove, configurable max

**Files:**
- Create: `src/components/features/dashboard/settings/gallery-field.tsx`

**Implementation:**

```tsx
interface GalleryFieldProps {
  name: string
  label: string
  defaultValue?: string[]
  maxImages?: number  // default 3 for polaroid templates, configurable
  onUpload?: (urls: string[]) => void
}

export function GalleryField({ name, label, defaultValue = [], maxImages = 3 }: GalleryFieldProps) {
  // Grid of image thumbnails (responsive: 1 col mobile, 3 col desktop)
  // Each thumbnail: image preview + remove button (X icon)
  // Add button: file input (hidden) + styled trigger
  // Disabled when images.length >= maxImages
  // Hidden inputs for form submission: one per image URL
}
```

**Style:**
- Grid: `grid grid-cols-1 sm:grid-cols-3 gap-3`
- Thumbnail: `border border-[#2C2A29]/10 overflow-hidden group aspect-square`
- Remove button: `absolute top-2 right-2 size-6 bg-red-500/80 text-white`
- Add button: `border-2 border-dashed border-[#E8E2D9] flex items-center justify-center aspect-square hover:border-[#632626]`

**Commit:** `feat: gallery field with multi-image upload`

---

### Task 7: Create TagListField and ObjectListField

**Objective:** Smart rendering for array data (marquee text, themes, testimonials)

**Files:**
- Create: `src/components/features/dashboard/settings/tag-list-field.tsx`
- Create: `src/components/features/dashboard/settings/object-list-field.tsx`

**TagListField** (for marquee `["HIKARA", "PHOTOBOX"]`):
- Horizontal chips with X remove button
- Text input + add button at bottom
- Hidden inputs for form submission

**ObjectListField** (for themes `[{name, desc, img}]`, testimonials `[{quote, author, context}]`):
- Card per item with structured fields
- Add new item button
- Remove item button per card
- ImageField for img URLs within objects
- Collapsible (show/hide details)

**Commit:** `feat: tag list and object list field components`

---

### Task 8: Wire everything together in SettingsShell

**Objective:** Connect SettingsShell with all new components

**Files:**
- Modify: `src/components/features/dashboard/settings/settings-shell.tsx`

**Flow:**
1. `SettingsShell` → fetch all section data (server action or pass as props from page)
2. For each section tab → render `<Suspense>` with section skeleton
3. Section content uses `<SmartSectionForm>` which auto-detects field types
4. Gallery section uses `<GalleryField>` with `maxImages=3`
5. Hero polaroids use `<ImageField>` per polaroid
6. Pricing keeps existing `<PricingForm>` (already good)

**Commit:** `feat: wire settings shell with smart form components`

---

### Task 9: Verify TypeScript + Build

**Objective:** All type checks pass, build succeeds

**Commands:**
```bash
export PATH="$HOME/.bun/bin:$PATH"
bun x tsc --noEmit              # Type check
NODE_OPTIONS="--max-old-space-size=768" NEXT_WORKER_COUNT=1 bun run build  # Build
bun run test                     # Tests
```

**Commit:** `fix: settings refactor — types + build pass`

---

### Task 10: Run Supabase migration for site-images bucket

**Objective:** Apply storage bucket migration

**Commands:**
```bash
cd ~/projects/hikara-photobooth
npx supabase migration up  # Apply site-images bucket
```

**Verify:** Bucket exists in Supabase dashboard

**Commit:** `feat: add site-images storage bucket migration`

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/skeletons/settings-skeleton.tsx` | Modify | Full skeleton with responsive layout |
| `src/app/(admin)/(dashboard)/dashboard/settings/page.tsx` | Modify | Thin wrapper → SettingsShell |
| `src/components/features/dashboard/settings/settings-shell.tsx` | Create | Responsive tab nav + per-section Suspense |
| `src/components/features/dashboard/settings/smart-section-form.tsx` | Create | Type-based field renderer |
| `src/components/features/dashboard/settings/image-field.tsx` | Create | Single image URL + preview + upload |
| `src/components/features/dashboard/settings/gallery-field.tsx` | Create | Multi-image grid with upload + limit |
| `src/components/features/dashboard/settings/tag-list-field.tsx` | Create | Array of strings (chips) |
| `src/components/features/dashboard/settings/object-list-field.tsx` | Create | Array of objects (cards) |
| `src/lib/actions/upload-actions.ts` | Verify | Upload/delete (already created) |
| `supabase/migrations/20260701000001_add_site_images_bucket.sql` | Verify | Storage bucket (already created) |
| `src/components/features/dashboard/settings/settings-client.tsx` | Delete | Replaced by shell + smart forms |

## Execution Order

1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

Tasks 4-7 can be parallelized (independent components).

# Dynamic Content + Pricing Implementation Plan

> **For Hermes:** Use subagent-driven-development to implement this plan task-by-task.

**Goal:** Landing page konten + pricing jadi dinamis dari Supabase, admin bisa edit dari dashboard, plus change password.

**Architecture:** Cache tag registry (CACHE_TAGS) + revalidation utilities + "use cache" data fetching. One `site_content` table. Style & layout 100% unchanged.

**Tech Stack:** Next.js 16 cache components, Supabase, Zod

---

## Phase 1: Cache Infrastructure + Migration

### Task 1: Create cache tag registry

**Objective:** Single source of truth for all cache tags

**Files:**
- Create: `src/lib/cache/tags.ts`

**Code:**
```ts
export const CACHE_TAGS = {
  siteContent: "site_content",
  siteContentSection: (section: string) => `site_content:${section}`,
  pricing: "pricing",
  reservations: "reservations",
  reservation: (id: string | number) => `reservation:${id}`,
  revenue: "revenue",
} as const;
```

**Commit:** `git commit -m "feat: add cache tag registry"`

### Task 2: Create revalidation utilities

**Objective:** All `updateTag()` centralized

**Files:**
- Create: `src/lib/cache/revalidate.ts`

**Code:**
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

**Commit:** `git commit -m "feat: add cache revalidation utilities"`

### Task 3: Create site_content table migration + seed

**Objective:** DB table + seed data from current hardcoded content

**Files:**
- Create: `supabase/migrations/20260701000000_add_site_content.sql`

**Code:**
```sql
create table site_content (
  section text not null,
  key text not null,
  value jsonb not null default '{}',
  updated_at timestamptz default now(),
  primary key (section, key)
);

alter table site_content enable row level security;

create policy "Public read site_content"
  on site_content for select
  using (true);

create policy "Admin write site_content"
  on site_content for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Seed: Hero
insert into site_content (section, key, value) values
('hero', 'tagline', '"HIKARA PHOTOBOX"'),
('hero', 'title_line1', '"MOMEN KECIL,"'),
('hero', 'title_highlight', '"KENANGAN"'),
('hero', 'title_line2', '"ABADI"'),
('hero', 'subtitle', '"Photobox estetik dengan sentuhan minimalis. Tangkap versi terbaik dari dirimu."'),
('hero', 'brand_name', '"HIKARA"'),
('hero', 'vertical_text_right', '"PHOTOBOX"'),
('hero', 'vertical_text_left', '"Abadikan Momen"'),
('hero', 'cta_text', '"Book Now"'),
('hero', 'cta_link', '"/reservasi"'),
('hero', 'polaroid_1', '"https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"'),
('hero', 'polaroid_2', '"https://images.unsplash.com/photo-1518599904199-0ca897819ddb?q=80&w=400&auto=format&fit=crop"'),
('hero', 'polaroid_3', '"https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop"');

-- Seed: Marquee
insert into site_content (section, key, value) values
('marquee', 'text', '["HIKARA", "PHOTOBOX"]');

-- Seed: About
insert into site_content (section, key, value) values
('about', 'image_url', '"https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop"'),
('about', 'description', '"HIKARA PHOTOBOX adalah studio foto konsep estetik minimalis modern yang berlokasi di Kotabaru. [...]"');

-- Seed: Gallery
insert into site_content (section, key, value) values
('gallery', 'images', '["https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1518599904199-0ca897819ddb?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=800&auto=format&fit=crop"]');

-- Seed: Themes
insert into site_content (section, key, value) values
('themes', 'items', '[{"name":"Classic Monochrome","desc":"Nuansa hitam putih abadi dengan kontras yang dramatis.","img":"https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=800&auto=format&fit=crop"},{"name":"Tokyo Vintage","desc":"Warna analog pudar khas cuci film 90-an.","img":"https://images.unsplash.com/photo-1542051842920-c7aa7111c12e?q=80&w=800&auto=format&fit=crop"},{"name":"Soft Cinematic","desc":"Tonasi pastel hangat yang memberikan kesan dreamy.","img":"https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=800&auto=format&fit=crop"}]');

-- Seed: Testimonials
insert into site_content (section, key, value) values
('testimonials', 'items', '[{"quote":"Pengalaman photobox yang belum pernah ada di Kotabaru.","author":"RANI & ANDI","context":"Sesi Prewedding"},{"quote":"Suka banget sama hasil print Classic Strip-nya.","author":"SABRINA","context":"Sesi Graduation"},{"quote":"Tempatnya nyaman banget, privasi terjaga.","author":"KEVIN W.","context":"Family Portrait"}]');

-- Seed: Pricing
insert into site_content (section, key, value) values
('pricing', 'paket_utama', '{"label":"Foto per Sesi + 2 Photostrip (Maks 3 Orang)","price":35000,"maxPeople":3,"note":"MAX. 3 ORANG"}'),
('pricing', 'extra_person', '{"label":"Tambahan per Orang","price":5000}'),
('pricing', 'extra_print', '{"label":"Extra Print","price":10000}'),
('pricing', 'custom_frame', '{"label":"Custom Frame Birthday, Dll","price":15000}');

-- Seed: Location
insert into site_content (section, key, value) values
('location', 'map_embed_url', '"https://maps.google.com/maps?q=Hikara.photobox%2C%20Jl.%20Veteran%2C%20Dirgahayu%2C%20Kec.%20Pulau%20Laut%20Utara%2C%20Kab.%20Kotabaru%2C%20Kalimantan%20Selatan%2072111&t=&z=16&ie=UTF8&iwloc=&output=embed"'),
('location', 'address', '"Jl. Veteran, Dirgahayu, Kec. Pulau Laut Utara, Kab. Kotabaru, Kalimantan Selatan 72111"'),
('location', 'phone', '"6285652046716"'),
('location', 'hours', '"14:00 - 23:00 (Senin - Minggu)"');

-- Seed: CTA
insert into site_content (section, key, value) values
('cta', 'title', '"Siap Mengabadikan Momen?"'),
('cta', 'description', '"Jangan biarkan momen berharga berlalu begitu saja."'),
('cta', 'button_text', '"Book Now"'),
('cta', 'button_link', '"/reservasi"');
```

**Commit:** `git commit -m "feat: add site_content migration with seed data"`

---

## Phase 2: Data Fetching Layer

### Task 4: Create site-content data fetching

**Objective:** Cached data fetching for site content

**Files:**
- Create: `src/lib/data/site-content.ts`

**Code:**
```ts
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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

  if (!data) return null;
  return data;
}

export async function getSiteContentMap(sections: string[]) {
  const results: Record<string, any> = {};
  for (const section of sections) {
    const data = await getSiteContent(section);
    if (data) results[section] = data;
  }
  return results;
}
```

**Commit:** `git commit -m "feat: add site content data fetching"`

### Task 5: Create pricing data fetching

**Objective:** Cached pricing fetching with structured return type

**Files:**
- Create: `src/lib/data/pricing.ts`

**Code:**
```ts
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CACHE_TAGS } from "@/lib/cache/tags";

export interface PricingItem {
  id: string;
  label: string;
  price: number;
  maxPeople?: number;
  note?: string;
};

export interface PricingDict {
  [key: string]: PricingItem;
}

export async function getPricing(): Promise<PricingDict> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.pricing);

  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("key, value")
    .eq("section", "pricing");

  if (!data) return defaultPricing();

  const dict: PricingDict = {};
  for (const row of data) {
    dict[row.key] = { id: row.key, ...row.value as any };
  }
  return dict;
}

function defaultPricing(): PricingDict {
  return {
    paket_utama: { id: "paket_utama", label: "Foto per Sesi + 2 Photostrip (Maks 3 Orang)", price: 35000, maxPeople: 3, note: "MAX. 3 ORANG" },
    extra_person: { id: "extra_person", label: "Tambahan per Orang", price: 5000 },
    extra_print: { id: "extra_print", label: "Extra Print", price: 10000 },
    custom_frame: { id: "custom_frame", label: "Custom Frame Birthday, Dll", price: 15000 },
  };
}
```

**Commit:** `git commit -m "feat: add pricing data fetching"`

### Task 6: Update price.ts to async

**Objective:** `calculateTotalPrice()` jadi async, baca dari DB

**Files:**
- Modify: `src/lib/utils/price.ts`

Read current file first. Change to be async:
```ts
import { getPricing } from "@/lib/data/pricing";

export async function calculateTotalPrice(input: {
  packageId: string;
  extraPeopleCount?: number;
  extraPrintCount?: number;
  addons?: string[];
}): Promise<number> {
  const pricing = await getPricing();
  const pkg = pricing[input.packageId] || pricing.paket_utama;
  let total = pkg.price || 0;
  total += (input.extraPeopleCount || 0) * (pricing.extra_person?.price || 5000);
  total += (input.extraPrintCount || 0) * (pricing.extra_print?.price || 10000);
  // addons: custom_frame etc.
  const addonPrices: Record<string, number> = {
    custom_frame: pricing.custom_frame?.price || 15000,
  };
  for (const addon of input.addons || []) {
    total += addonPrices[addon] || 0;
  }
  return total;
}
```

Update revenue.ts:
```ts
import { getPricing } from "@/lib/data/pricing";

export async function calculateRevenuePrices() {
  const pricing = await getPricing();
  return {
    extraPersonPrice: pricing.extra_person?.price || 5000,
    extraPrintPrice: pricing.extra_print?.price || 10000,
    addonPrices: { custom_frame: pricing.custom_frame?.price || 15000 },
  };
}
```

**Commit:** `git commit -m "refactor: make price calculation async from DB"`

### Task 7: Update server actions for async pricing

**Files:**
- Modify: `src/lib/actions/reservation-actions.ts`
- Modify: `src/lib/actions/revenue-actions.ts`

Change `calculateTotalPrice()` calls to `await calculateTotalPrice()`. Import from new path.

**Commit:** `git commit -m "refactor: update actions for async pricing"`

---

## Phase 3: Landing Page Dynamic Content

### Task 8: Refactor landing page — fetch all sections

**Objective:** `(public)/page.tsx` fetch all content, pass as props

**Files:**
- Modify: `src/app/(public)/page.tsx`

```tsx
import { getSiteContentMap } from "@/lib/data/site-content";
import { getPricing } from "@/lib/data/pricing";

export default async function Home() {
  const [content, pricing] = await Promise.all([
    getSiteContentMap(["hero", "marquee", "about", "gallery", "themes", "testimonials", "location", "cta"]),
    getPricing(),
  ]);

  // Transform to section data
  const heroData = content.hero ? parseHero(content.hero) : null;
  // ...

  return (
    <>
      <Nav />
      <HeroSection data={heroData} />
      <Marquee text={marqueeText} />
      <AboutSection data={aboutData} />
      <GallerySection images={galleryImages} />
      <ThemesSection items={themesItems} />
      <PackagesSection pricing={pricing} />
      <Marquee text={marqueeText} />
      <TestimonialSection items={testimonialsItems} />
      <LocationSection data={locationData} />
      <CtaSection data={ctaData} />
      <AnchorSection />
    </>
  );
}
```

### Task 9-17: Update each landing section component

**Each section:** Add props interface, replace hardcoded data with props. Style & layout unchanged.

**Components to modify:**
1. `hero-section.tsx` — props for all text, images, CTA
2. `marquee.tsx` — props for text array
3. `about-section.tsx` — props for image_url, description
4. `gallery-section.tsx` — props for images array
5. `themes-section.tsx` — props for items array
6. `testimonial-section.tsx` — props for items array
7. `packages-section.tsx` — props for pricing object
8. `location-section.tsx` — props for map, address, phone, hours
9. `cta-section.tsx` — props for title, description, button

**Also update:**
- `reservation-form.tsx` — accept pricing as props
- `log-transaction-form.tsx` — accept pricing as props
- `edit-reservation-dialog.tsx` — accept pricing as props
- `columns.tsx` — accept pricing as props

**Commit per component.**

---

## Phase 4: Admin Settings Page

### Task 18: Create site content server actions

**Files:**
- Create: `src/lib/actions/site-content-actions.ts`

```ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidateSiteContent, revalidatePricing } from "@/lib/cache/revalidate";

export async function updateSiteContent(section: string, key: string, value: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_content")
    .upsert({ section, key, value }, { onConflict: "section, key" });

  if (error) return { error: error.message };
  await revalidateSiteContent(section);
  return { success: true };
}

export async function updatePricing(pricingDict: Record<string, any>) {
  const supabase = await createClient();
  const rows = Object.entries(pricingDict).map(([key, value]) => ({
    section: "pricing",
    key,
    value,
  }));
  const { error } = await supabase.from("site_content").upsert(rows, {
    onConflict: "section, key",
  });
  if (error) return { error: error.message };
  await revalidatePricing();
  return { success: true };
}
```

### Task 19: Create change password action

**Files:**
- Modify: `src/lib/actions/auth-actions.ts`

Add:
```ts
export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) return { error: "Password lama salah" };

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) return { error: updateError.message };

  return { success: true };
}
```

### Task 20: Create settings page

**Files:**
- Create: `src/app/(admin)/(dashboard)/dashboard/settings/page.tsx`
- Create: `src/components/features/dashboard/settings/site-content-form.tsx`
- Create: `src/components/features/dashboard/settings/pricing-form.tsx`
- Create: `src/components/features/dashboard/settings/change-password-form.tsx`

Tabs: Content (per section), Pricing, Change Password.

Each form: read current value from DB, save via server action.

**Commit:** `git commit -m "feat: add admin settings page"`

---

## Phase 5: Cleanup & Verification

### Task 21: Delete hardcoded constants

**Files:**
- Delete: `src/lib/constants/reservation.ts`

Remove all imports referencing this file.

**Commit:** `git commit -m "feat: remove hardcoded constants file"`

### Task 22: Run tests & build

```bash
cd ~/projects/hikara-photobooth
npx vitest run
npx next build
npx react-doctor@latest --no-score --no-telemetry --no-dead-code --no-lint
```

### Task 23: Supabase migration apply

```bash
supabase db push
```

### Task 24: Final commit

```bash
git push origin main
```

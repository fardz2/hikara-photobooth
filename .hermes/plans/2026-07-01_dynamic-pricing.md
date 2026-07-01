# Pricing Dynamic + Cleanup Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Pricing jadi fully dynamic (admin bisa tambah/hapus paket), landing page render dari DB. Hapus field statik dari hero config (teks vertikal, teks tombol, link tombol).

**Architecture:** Pricing jadi array objects seperti themes/testimonials — 1 row di `site_content` (`section=pricing, key=items`). Admin form pakai reusable `ObjectListField`. Landing iterasi array.

**Tech Stack:** Next.js 16, Supabase, shadcn/ui, Server Actions, "use cache"

---

## Context

### Saat ini (static)
```
site_content table:
  section=pricing, key=paket_utama  → {label, price, maxPeople, note}
  section=pricing, key=extra_print   → {label, price}
  section=pricing, key=extra_people  → {label, price}
  section=pricing, key=custom_frame  → {label, price}
```
- Admin hardcoded: iterasi `Object.entries(pricing)` → form per key
- Landing hardcoded: `p.paket_utama.label`, `p.extra_print.price`, dst
- Tambah paket = ubah code + manual INSERT ke DB

### Target (dynamic)
```
site_content table:
  section=pricing, key=items → [{label, price, maxPeople, note}, ...]
```
- Admin: `ObjectListField` — tambah/hapus card, grid 2-col
- Landing: iterasi array, render flex row per item
- Tambah paket = klik "Tambah Item" di admin

### Juga: Hapus field statik dari config
- `vertical_text_right`, `vertical_text_left` → hapus (style website, bukan konten)
- `cta_text`, `cta_link` → hapus dari hero (tombol tidak boleh diganti user)
- Tetap render di landing, tapi hardcoded di component

---

## Data: PricingItem interface

```ts
export interface PricingItem {
  label: string        // "Paket Utama", "Extra Print"
  price: number        // 35000
  maxPeople?: number   // 3 (opsional, hanya untuk paket utama)
  note?: string        // "MAX. 3 ORANG" (opsional)
}
```

---

## Files Changed

| File | Action | Lines |
|------|--------|-------|
| `supabase/migrations/20260701000002_dynamic_pricing.sql` | CREATE | ~30 |
| `src/lib/services/site-content-service.ts` | MODIFY | ~40 |
| `src/lib/actions/site-content-actions.ts` | MODIFY | ~20 |
| `src/components/features/dashboard/settings/section-config.ts` | MODIFY | ~30 |
| `src/components/features/dashboard/settings/settings-client.tsx` | MODIFY | ~10 |
| `src/components/features/dashboard/settings/pricing-form.tsx` | DELETE | 0 |
| `src/components/features/landing/packages-section.tsx` | REWRITE | ~60 |
| `src/app/(public)/page.tsx` | MODIFY | ~10 |

---

## Task 1: Migration SQL — convert pricing rows to single array

**File:** `supabase/migrations/20260701000002_dynamic_pricing.sql`

```sql
-- Convert per-key pricing rows to single items array
-- Step 1: Build array from existing rows
-- Step 2: Insert as single row
-- Step 3: Delete old rows

DO $$
DECLARE
  items jsonb := '[]'::jsonb;
  row RECORD;
BEGIN
  FOR row IN
    SELECT key, value FROM site_content
    WHERE section = 'pricing' AND key != 'items'
    ORDER BY key
  LOOP
    items := items || jsonb_build_array(
      jsonb_build_object(
        'label', row.value->>'label',
        'price', (row.value->>'price')::numeric,
        'maxPeople', CASE WHEN row.value->>'maxPeople' IS NOT NULL
                     THEN (row.value->>'maxPeople')::numeric ELSE NULL END,
        'note', row.value->>'note'
      )
    );
  END LOOP;

  IF jsonb_array_length(items) > 0 THEN
    INSERT INTO site_content (section, key, value)
    VALUES ('pricing', 'items', items)
    ON CONFLICT (section, key) DO UPDATE SET value = EXCLUDED.value;

    DELETE FROM site_content
    WHERE section = 'pricing' AND key != 'items';
  END IF;
END $$;
```

**Verify:** `supabase db push` → cek `SELECT * FROM site_content WHERE section='pricing'` → 1 row, key=items, value=array.

**Commit:** `feat: migration — dynamic pricing array`

---

## Task 2: Update service — getPricing returns array

**File:** `src/lib/services/site-content-service.ts`

**Ganti `getPricing()`:**
```ts
export async function getPricing(): Promise<PricingItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.pricing, CACHE_TAGS.siteContentSection("pricing"));

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_content")
    .select("value")
    .eq("section", "pricing")
    .eq("key", "items")
    .single();

  if (!data) return defaultPricing();
  return (data.value as PricingItem[]) || defaultPricing();
}
```

**Ganti `defaultPricing()`:**
```ts
function defaultPricing(): PricingItem[] {
  return [
    { label: "Foto per Sesi + Print 2 Photostrip", price: 35000, maxPeople: 3, note: "MAX. 3 ORANG" },
    { label: "Tambahan per Orang", price: 5000 },
    { label: "Extra Print", price: 10000 },
    { label: "Custom Frame Birthday, Dll", price: 15000 },
  ];
}
```

**Ganti `getPricingAdmin()`:**
```ts
export async function getPricingAdmin(): Promise<PricingItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("value")
    .eq("section", "pricing")
    .eq("key", "items")
    .single();

  if (!data) return defaultPricing();
  return (data.value as PricingItem[]) || defaultPricing();
}
```

**Update `updatePricing()`** — accept `PricingItem[]`, save as single row:
```ts
export async function updatePricing(items: PricingItem[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_content")
    .upsert({
      section: "pricing",
      key: "items",
      value: items,
    }, { onConflict: "section,key" });

  if (error) return { error: error.message };
  revalidateTag(CACHE_TAGS.pricing, "hours");
  return { success: true };
}
```

**Verify:** `bun x tsc --noEmit`

**Commit:** `refactor: getPricing returns PricingItem[], updatePricing saves array`

---

## Task 3: Update admin — pricing masuk SECTION_CONFIG, hapus PricingForm

**File:** `src/components/features/dashboard/settings/section-config.ts`

**Tambah pricing ke CONTENT_SECTIONS:**
```ts
export const CONTENT_SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "marquee", label: "Marquee" },
  { id: "about", label: "Tentang" },
  { id: "gallery", label: "Galeri" },
  { id: "themes", label: "Tema" },
  { id: "testimonials", label: "Testimoni" },
  { id: "pricing", label: "Harga" },
  { id: "location", label: "Lokasi" },
  { id: "cta", label: "CTA" },
]
```

**Hapus `SETTINGS_TABS` pricing entry** (pricing sekarang di CONTENT_SECTIONS):
```ts
export const SETTINGS_TABS = [
  { id: "password", label: "Kata Sandi" },
]
```

**Tambah pricing ke SECTION_CONFIG:**
```ts
pricing: [
  {
    key: "items", label: "Paket", type: "objects",
    objectFields: [
      { key: "label", label: "Nama Paket" },
      { key: "price", label: "Harga (Rp)" },
      { key: "maxPeople", label: "Maks Orang" },
      { key: "note", label: "Catatan" },
    ],
  },
],
```

**Hapus hero fields statik:**
```ts
// HAPUS dari hero config:
{ key: "vertical_text_right", label: "Teks Vertikal Kanan", type: "text" },
{ key: "vertical_text_left", label: "Teks Vertikal Kiri", type: "text" },
{ key: "cta_text", label: "Teks Tombol", type: "text" },
```

**File:** `src/components/features/dashboard/settings/settings-client.tsx`

Hapus `PricingForm` special case. Pricing sekarang render via `SectionForm` generic.

```diff
- import { PricingForm } from "./pricing-form";
  ...
- <TabsContent value="pricing"><PricingForm pricing={pricing} /></TabsContent>
```

**Hapus:** `src/components/features/dashboard/settings/pricing-form.tsx`

**Verify:** `bun x tsc --noEmit`

**Commit:** `refactor: pricing via SECTION_CONFIG, hapus PricingForm, hapus hero statik fields`

---

## Task 4: Update page.tsx (settings) — pricing dari service array

**File:** `src/app/(admin)/(dashboard)/dashboard/settings/page.tsx`

```diff
- const [sectionData, pricing] = await Promise.all([
-   getAllSiteContent(sectionKeys),
-   getPricing(),
- ])
- return <SettingsClient sectionData={sectionData} pricing={pricing} />
+ const sectionData = await getAllSiteContent(sectionKeys)
+ return <SettingsClient sectionData={sectionData} />
```

**File:** `src/components/features/dashboard/settings/settings-client.tsx`

```diff
- interface Props {
-   sectionData: Record<string, unknown>;
-   pricing: Record<string, PricingItem>;
- }
- export function SettingsClient({ sectionData, pricing }: Props) {
+ interface Props {
+   sectionData: Record<string, unknown>;
+ }
+ export function SettingsClient({ sectionData }: Props) {
```

**Verify:** `bun x tsc --noEmit`

**Commit:** `refactor: settings page — pricing from sectionData, no separate prop`

---

## Task 5: Update landing — PackagesSection iterasi array

**File:** `src/components/features/landing/packages-section.tsx`

```tsx
interface Props {
  pricing: PricingItem[];
}

export const PackagesSection = ({ pricing }: Props) => {
  const mainPaket = pricing.find((p) => p.maxPeople);
  const otherPaket = pricing.filter((p) => !p.maxPeople);

  return (
    <section id="packages" className="...">
      {/* Left column: heading (sama) */}
      <div className="lg:col-span-5 ...">
        <h2>Paket</h2>
        <h3>Investasi Momen Kita</h3>
        {/* ... */}
      </div>

      {/* Right column: pricing list — dynamic */}
      <div className="lg:col-span-7">
        <StaggerContainer ...>
          {pricing.map((item, idx) => (
            <StaggerItem key={idx} className="flex ... border-b ...">
              <div>
                <h3 className="...">{item.label}</h3>
                {item.note && <p className="...">({item.note})</p>}
                {item.maxPeople && !item.note && (
                  <p className="...">(MAX. {item.maxPeople} ORANG)</p>
                )}
              </div>
              <div className="...">
                RP. {item.price.toLocaleString('id-ID')}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
```

**File:** `src/app/(public)/page.tsx`

```diff
- import { getPricing } from "@/lib/services/site-content-service";
  ...
- const pricing = await getPricing();
- // ...
- <PackagesSection pricing={pricing} />
```

Pricing sekarang di `getSiteContent("pricing")`, bukan `getPricing()`.

```diff
+ const pricingData = await getSiteContent("pricing");
+ const pricingItems = (pricingData?.items as PricingItem[]) || [];
+ ...
+ <PackagesSection pricing={pricingItems} />
```

Import `PricingItem` dari section-config.

**Verify:** `bun x tsc --noEmit`

**Commit:** `feat: landing pricing — fully dynamic from DB array`

---

## Task 6: Update action — updatePricing saves array

**File:** `src/lib/actions/site-content-actions.ts`

```diff
- export async function updatePricing(entries: {key: string, value: unknown}[]) {
+ export async function updatePricing(items: PricingItem[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_content")
    .upsert(
-     entries.map(({key, value}) => ({
-       section: "pricing", key, value,
-     })),
-     { onConflict: "section,key" }
+     { section: "pricing", key: "items", value: items },
+     { onConflict: "section,key" }
    );
  if (error) return { error: error.message };
  revalidateTag(CACHE_TAGS.pricing, "hours");
  return { success: true };
}
```

**Verify:** `bun x tsc --noEmit`

**Commit:** `fix: updatePricing saves single items array`

---

## Task 7: Verify + cleanup

1. `bun x tsc --noEmit` — TS clean
2. `npx react-doctor --no-lint --no-dead-code` — 100/100
3. Push migration: `supabase db push`
4. Manual test:
   - Admin: tambah item pricing baru → save → landing update
   - Admin: hapus item pricing → save → landing update
   - Landing: pricing list render sesuai DB data
5. Commit: `chore: verify pricing dynamic`

---

## Risks & Tradeoffs

| Risk | Mitigation |
|------|-----------|
| Migration data loss | `ON CONFLICT` + fallback `defaultPricing()` |
| Cache stale | `revalidateTag` di `updatePricing` |
| Number type mismatch | Form submit → Number() conversion di reconstructFormValue |
| maxPeople null handling | Landing checks `item.maxPeople` sebelum render |

## Open Questions

- Harga per item format: `number` (35000) atau `string` ("Rp 35.000")? → **number**, format di render.
- Urutan item: pakai array order atau field `order`? → **array order** (simpler).
- Apakah semua pricing item punya maxPeople? → Tidak, hanya paket utama.

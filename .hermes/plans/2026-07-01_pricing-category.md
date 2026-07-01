# Pricing Category System + Price History

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Pricing items punya `category` (package/extra/addon), UI render otomatis berdasarkan kategori. Reservasi simpan harga saat booking. Admin ubah harga → reservasi lama aman.

**Architecture:**
- `PricingItem.category: "package" | "extra" | "addon"` — single source of truth
- UI components filter by category, render widget sesuai tipe
- Reservations store `pricing_snapshot` JSONB — lock harga saat booking
- Cache: `getPricing()` cached jam-an, `updatePricing()` revalidate

**Tech Stack:** Next.js 16, Supabase, shadcn/ui, vitest

---

## Data Model

```ts
type PricingCategory = "package" | "extra" | "addon"

interface PricingItem {
  label: string
  price: number
  maxPeople?: number
  note?: string
  category: PricingCategory  // ← baru
}
```

## UI Rendering Rules

| Category | Widget | Behavior |
|---|---|---|
| `package` | Card + Radio | Select 1, show price + maxPeople + note |
| `extra` | Counter (+/-) | Default 0, user set amount |
| `addon` | Checkbox | Toggle on/off |

---

## Task 1: Migration — add category to existing pricing data

**Objective:** Infer category dari data existing, simpan ke DB

**File:** `supabase/migrations/20260702000000_pricing_category.sql`

```sql
-- Add category to existing pricing items
-- Rules: maxPeople → package, contains "orang"/"print" → extra, rest → addon

do $$
declare
  items jsonb;
  updated jsonb := '[]'::jsonb;
  item jsonb;
  cat text;
begin
  -- Get current pricing items
  select value into items from site_content where section = 'pricing' and key = 'items';
  
  if items is null then return; end if;
  
  for item in select * from jsonb_array_elements(items)
  loop
    if (item->>'maxPeople') is not null then
      cat := 'package';
    elsif lower(item->>'label') like '%orang%' or lower(item->>'label') like '%print%' then
      cat := 'extra';
    else
      cat := 'addon';
    end if;
    
    updated := updated || (item || jsonb_build_object('category', cat));
  end loop;
  
  update site_content set value = updated where section = 'pricing' and key = 'items';
end $$;
```

**Verify:** `supabase db push` → check data has `category` field

**Commit:** `feat(migration): add pricing category field`

---

## Task 2: Update PricingItem type + service

**Objective:** Add `category` to TypeScript type, make required

**Files:**
- Modify: `src/components/features/dashboard/settings/section-config.ts` (PricingItem interface)
- Modify: `src/lib/services/site-content-service.ts` (PricingItem interface)

```ts
export type PricingCategory = "package" | "extra" | "addon"

export interface PricingItem {
  label: string
  price: number
  maxPeople?: number
  note?: string
  category: PricingCategory  // ← tambah
}
```

Update `defaultPricing()` di `site-content-service.ts`:

```ts
function defaultPricing(): PricingItem[] {
  return [
    { label: "Foto per Sesi + 2 Photostrip (Maks 3 Orang)", price: 35000, maxPeople: 3, note: "MAX. 3 ORANG", category: "package" },
    { label: "Tambahan per Orang", price: 5000, category: "extra" },
    { label: "Extra Print", price: 10000, category: "extra" },
    { label: "Custom Frame Birthday, Dll", price: 15000, category: "addon" },
  ];
}
```

**Verify:** `bun x tsc --noEmit` — expect type errors in consumers (fix in later tasks)

**Commit:** `feat: add PricingCategory type`

---

## Task 3: Update admin config — pricing objectFields + ObjectListField select support

**Objective:** Admin bisa pilih category dropdown saat tambah/edit pricing item

**Files:**
- Modify: `src/components/features/dashboard/settings/section-config.ts` (pricing config)
- Modify: `src/components/features/dashboard/settings/fields/object-list-field.tsx` (add select type)

**section-config.ts** — update pricing objectFields:
```ts
pricing: [
  {
    key: "items", label: "Paket", type: "objects",
    objectFields: [
      { key: "label", label: "Nama Paket" },
      { key: "price", label: "Harga (Rp)" },
      { key: "maxPeople", label: "Maks Orang" },
      { key: "note", label: "Catatan" },
      { key: "category", label: "Kategori", type: "select", options: [
        { value: "package", label: "Paket Utama" },
        { value: "extra", label: "Tambahan" },
        { value: "addon", label: "Add-on" },
      ]},
    ],
  },
],
```

**ObjectFieldDef** di `section-config.ts`:
```ts
export interface ObjectFieldDef {
  key: string
  label: string
  type?: "text" | "textarea" | "image" | "select"  // ← tambah "select"
  options?: { value: string; label: string }[]       // ← baru
}
```

**ObjectListField** — tambah render select:
```tsx
case "select":
  return (
    <select
      value={String(item[f.key] ?? "")}
      onChange={(e) => update(idx, f.key, e.target.value)}
      className="mt-1 w-full border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white h-9"
    >
      <option value="">Pilih...</option>
      {f.options?.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
```

**Verify:** TS clean, admin settings render dropdown kategori

**Commit:** `feat: admin pricing — category dropdown`

---

## Task 4: Update price.ts + revenue.ts — category-based matching

**Objective:** Hapus label matching, ganti dengan `category` filter

**Files:**
- Modify: `src/lib/utils/price.ts`
- Modify: `src/lib/utils/revenue.ts`

**price.ts** — `calculateTotalPriceSync`:
```ts
const mainPkg = pricing.find((p) => p.category === "package") || pricing[0];
const extraItems = pricing.filter((p) => p.category === "extra");
const addonItems = pricing.filter((p) => p.category === "addon");

let total = mainPkg?.price || 0;

// Extras: find by label substring (aman karena category udah filter)
const extraPerson = extraItems.find(p => p.label.toLowerCase().includes("orang"));
const extraPrint = extraItems.find(p => p.label.toLowerCase().includes("print"));

total += (input.extraPeopleCount || 0) * (extraPerson?.price || 5000);
total += (input.extraPrintCount || 0) * (extraPrint?.price || 10000);

// Addons: match by ID
if (input.addons) {
  for (const addonId of input.addons) {
    const addon = addonItems.find(a => norm(a.label).includes(norm(addonId)));
    if (addon) total += addon.price;
  }
}
```

**revenue.ts** — sama pattern, category filter dulu.

**Verify:** tests pass, no label-based fuzzy match outside category block

**Commit:** `feat: category-based pricing matching`

---

## Task 5: Store pricing snapshot di reservasi

**Objective:** Saat booking, simpan harga saat itu di DB. Edit reservasi lama = tetap pake harga lama.

**Files:**
- Modify: `src/lib/actions/reservation-actions.ts` (submitReservation)
- Modify: `src/lib/validations/reservation.ts` (tambah pricing_snapshot)
- Migration: `supabase/migrations/20260702000001_reservation_pricing_snapshot.sql`

**Migration:**
```sql
alter table reservations add column if not exists pricing_snapshot jsonb;
```

**reservation-actions.ts** — saat submit:
```ts
const pricing = await getPricing();

const { error } = await supabase.from("reservations").insert({
  ...validatedData,
  total_price: totalPrice,
  pricing_snapshot: pricing,  // ← snapshot harga saat booking
});
```

**Verify:** reservasi baru punya `pricing_snapshot`, reservasi lama null (OK, fallback ke current pricing)

**Commit:** `feat: store pricing snapshot in reservation`

---

## Task 6: Reservation form — category-aware rendering

**Objective:** Render widget berdasarkan category: Card Radio (package), Counter (extra), Checkbox (addon)

**File:** Modify: `src/components/features/reservation/reservation-form.tsx`

**Replace hardcoded PRICELIST/ADDONS/EXTRA counters dengan:**
```tsx
const packages = pricing.filter(p => p.category === "package");
const extras = pricing.filter(p => p.category === "extra");
const addons = pricing.filter(p => p.category === "addon");

// Extras state: { [label]: count }
const [extraCounts, setExtraCounts] = useState<Record<string, number>>({});

// Addons state: string[] (selected addon labels)
const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
```

**Render:**
```tsx
{/* Paket — Card Radio */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {packages.map((pkg) => (
    <button type="button" key={pkg.label}
      onClick={() => setValue("package", pkg.label)}
      className={`p-4 border text-left ${selectedPkg === pkg.label ? "border-[#8B5E56]" : "border-[#2C2A29]/10"}`}
    >
      <span className="font-heading uppercase">{pkg.label}</span>
      <span className="block text-[#8B5E56]">Rp {pkg.price.toLocaleString("id-ID")}</span>
      {pkg.maxPeople && <span className="text-[10px]">Maks {pkg.maxPeople} Orang</span>}
    </button>
  ))}
</div>

{/* Extras — Counter */}
{extras.map((extra) => (
  <div key={extra.label} className="flex justify-between items-center p-3 border">
    <span>{extra.label} (+Rp {extra.price.toLocaleString("id-ID")})</span>
    <div className="flex items-center gap-3">
      <button onClick={() => decExtra(extra.label)}>-</button>
      <span>{extraCounts[extra.label] || 0}</span>
      <button onClick={() => incExtra(extra.label)}>+</button>
    </div>
  </div>
))}

{/* Addons — Checkbox */}
{addons.map((addon) => (
  <label key={addon.label} className="flex items-center gap-2 p-3 border">
    <Checkbox checked={selectedAddons.includes(addon.label)} onCheckedChange={...} />
    <span>{addon.label} (+Rp {addon.price.toLocaleString("id-ID")})</span>
  </label>
))}
```

**Total price:** dynamic berdasarkan extras + addons
**Form values:** flatten ke `extraPeopleCount`, `extraPrintCount`, `addons` (sesuai DB schema)

**Verify:** form render 3 sections, total price correct

**Commit:** `feat: reservation form — category-aware rendering`

---

## Task 7: LogTransactionForm — category-aware rendering

**Objective:** Sama seperti reservasi form, render berdasarkan category

**File:** Modify: `src/components/features/revenue/log-transaction-form.tsx`

Same pattern as Task 6 — packages card, extras counter, addons checkbox.

**Verify:** form render populer categories

**Commit:** `feat: log transaction form — category-aware rendering`

---

## Task 8: EditReservationDialog — category-aware + snapshot support

**Objective:** Edit dialog render sesuai category, fallback ke current pricing kalau snapshot null

**File:** Modify: `src/components/features/dashboard/edit-reservation-dialog.tsx`

```tsx
const effectivePricing = reservation.pricing_snapshot || pricing;
const packages = effectivePricing.filter(p => p.category === "package");
const extras = effectivePricing.filter(p => p.category === "extra");
const addons = effectivePricing.filter(p => p.category === "addon");
```

Render sama seperti Task 6.

**Verify:** edit reservasi lama (snapshot null) tetap render, edit reservasi baru (snapshot ada) render harga lama

**Commit:** `feat: edit reservation — category-aware + pricing snapshot`

---

## Task 9: Cache strategy

**Objective:** Cache pricing (public), revalidate on admin update

**Already implemented:**
- `getPricing()` → `"use cache"` + `cacheLife("hours")` + `cacheTag(CACHE_TAGS.pricing)` ✅
- `updatePricing()` → `revalidateTag(CACHE_TAGS.pricing, "hours")` ✅

**Verify:** Admin ubah harga → landing + reservasi reflect perubahan (after cache revalidation)

**No changes needed** — existing cache strategy handles this.

**Key fix — immediate revalidation:**
```ts
// site-content-service.ts → upsertPricing()
revalidateTag(CACHE_TAGS.pricing);  // ← immediate, gak pake "hours" profile
```

Alasan: `revalidateTag(tag, "hours")` = scheduling lambat. Admin ubah harga → reservasi baru harus langsung dapet harga baru, bukan stale. Tanpa profile = immediate invalidate. Gap negligible (milidetik).

**Verify:** Admin ubah harga → reservasi baru dalam hitungan detik = harga baru ✅

---

## Task 10: Tests — update mocks to use category

**Objective:** Semua test pakai PricingItem dengan `category`

**Files:**
- Modify: `tests/lib/utils/price.test.ts`
- Modify: `tests/lib/utils/revenue.test.ts`
- Modify: `tests/lib/services/revenue-service.test.ts`
- Modify: `tests/components/features/reservation/reservation-form.test.tsx`
- Modify: `tests/components/features/revenue/log-transaction-form.test.tsx`
- Modify: `tests/components/features/revenue/revenue-stats.test.tsx`

**Mock data pattern:**
```ts
const mockPricing: PricingItem[] = [
  { label: "Foto per Sesi + 2 Photostrip (Maks 3 Orang)", price: 35000, maxPeople: 3, note: "MAX. 3 ORANG", category: "package" },
  { label: "Tambahan per Orang", price: 5000, category: "extra" },
  { label: "Extra Print", price: 10000, category: "extra" },
  { label: "Custom Frame Birthday, Dll", price: 15000, category: "addon" },
]
```

**Verify:** `npx vitest run` → 31/31 pass, 109/109 tests

**Commit:** `test: update mocks with category field`

---

## Execution Order

| Task | Depends On | ~Time |
|---|---|---|
| 1. Migration SQL | — | 2 min |
| 2. PricingItem type | — | 2 min |
| 3. Admin config + ObjectListField select | 2 | 5 min |
| 4. price.ts + revenue.ts | 2 | 5 min |
| 5. Pricing snapshot di reservasi | 2 | 5 min |
| 6. Reservation form | 4 | 10 min |
| 7. LogTransactionForm | 4 | 5 min |
| 8. EditReservationDialog | 4, 5 | 5 min |
| 9. Cache verification | — | 2 min |
| 10. Tests | 2-8 | 5 min |

**Total: ~45 menit**

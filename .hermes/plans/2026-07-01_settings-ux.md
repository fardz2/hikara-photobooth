# Settings UX Improvement Plan — Pricing Focus

> For Hermes: Use subagent-driven-development to implement task-by-task.

**Goal:** Pricing section admin-friendly, user-friendly landing page, category-aware rendering.

---

## Task 1: ObjectListField — category grouping + badges

**What:** Group pricing items by category with visual section headers.

**File:** `src/components/features/dashboard/settings/fields/object-list-field.tsx`

**Changes:**
1. Add `categoryKey?: string` prop to ObjectFieldConfig/ObjectListField
2. If `categoryKey` is set, group items by that field value
3. Render category headers: "Paket Utama", "Tambahan", "Add-on"
4. Add Badge component for category label on each item card

**New layout:**
```
┌─ Paket Utama ──────────────────────────┐
│ ┌──────────────┐ ┌──────────────┐       │
│ │ Nama: Sesi   │ │ Kategori: ▼  │       │
│ │ Harga: 35000 │ │ Max: 3       │       │
│ │ Note: MAX 3  │ │              │       │
│ └──────────────┘ └──────────────┘       │
│                                         │
│ ┌──────────────┐                        │
│ │ + Tambah     │                        │
│ └──────────────┘                        │
├─ Tambahan ─────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐       │
│ │ Orang: 5000  │ │ Print: 10000 │       │
│ └──────────────┘ └──────────────┘       │
├─ Add-on ──────────────────────────────┤
│ ┌──────────────┐                        │
│ │ Frame: 15000 │                        │
│ └──────────────┘                        │
└────────────────────────────────────────┘
```

---

## Task 2: ObjectListField — mobile delete visible + numeric price

**What:** Fix mobile UX issues.

**Changes:**
1. Delete button: `opacity-100 md:opacity-0 md:group-hover:opacity-100` — always visible on mobile
2. Price field: add `inputMode="numeric"` and `pattern="[0-9]*"` when key contains "price"
3. "Tambah Item" button: show current category context

---

## Task 3: SectionForm — better section titles

**What:** Use Indonesian titles, not raw section keys.

**File:** `src/components/features/dashboard/settings/section-form.tsx`

**Change:** Replace `{section}` with `SECTION_LABELS[section] || section`

```ts
const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  marquee: "Marquee",
  about: "Tentang Kami",
  gallery: "Galeri",
  themes: "Tema",
  testimonials: "Testimoni",
  pricing: "Pengaturan Harga",
  location: "Lokasi",
  cta: "Call to Action",
  password: "Kata Sandi",
};
```

---

## Task 4: PackagesSection — filter by category for landing page

**What:** Landing page groups pricing by category.

**File:** `src/components/features/landing/packages-section.tsx`

**Changes:**
1. Import PricingItem with category
2. Filter: `packages = pricing.filter(p => p.category === "package")`
3. Show only packages in the main pricing section
4. Extras/addons are shown in reservation form, not landing page

```tsx
const packages = pricing.filter(p => p.category === "package");

// In JSX: only render packages
{packages.map((item) => (
  <StaggerItem key={item.label} ...>
    <h3>{item.label}</h3>
    <p>{item.note || `MAX. ${item.maxPeople} ORANG`}</p>
    <span>RP. {item.price.toLocaleString("id-ID")}</span>
  </StaggerItem>
))}
```

---

## Task 5: Section-config — add "addCategoryLabel" for ObjectListField

**What:** Pass category config to ObjectListField so it knows how to group.

**File:** `src/components/features/dashboard/settings/section-config.ts`

**Change:**
```ts
export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  max?: number;
  objectFields?: ObjectFieldDef[];
  categoryKey?: string;  // ← baru: field name to group by
}

// In pricing config:
pricing: [{
  key: "items",
  label: "Paket",
  type: "objects",
  categoryKey: "category",  // ← group by this field
  objectFields: [...],
}]
```

---

## Task 6: Tests — update mocks if needed

**What:** Ensure existing tests still pass with grouped rendering.

**Verify:** `npx vitest run` → 31/31 pass

---

## Execution Order

| Task | Depends | Time |
|---|---|---|
| 1. Category grouping + badges | — | 10 min |
| 2. Mobile delete + numeric | — | 3 min |
| 3. Section titles | — | 2 min |
| 4. Landing page filter | — | 5 min |
| 5. Config categoryKey | 1 | 2 min |
| 6. Tests | 1-5 | 3 min |

**Total: ~25 min**

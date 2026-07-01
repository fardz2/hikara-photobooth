export type SectionTab = "hero" | "marquee" | "about" | "gallery" | "themes" | "testimonials" | "location" | "cta"
export type Tab = SectionTab | "pricing" | "password"

export const CONTENT_SECTIONS: { id: SectionTab; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "marquee", label: "Marquee" },
  { id: "about", label: "Tentang" },
  { id: "gallery", label: "Galeri" },
  { id: "themes", label: "Tema" },
  { id: "testimonials", label: "Testimoni" },
  { id: "location", label: "Lokasi" },
  { id: "cta", label: "CTA" },
]

export const SETTINGS_TABS: { id: Tab; label: string }[] = [
  { id: "pricing", label: "Harga" },
  { id: "password", label: "Kata Sandi" },
]

export const ALL_TABS: { id: Tab; label: string }[] = [...CONTENT_SECTIONS, ...SETTINGS_TABS]

export interface PricingItem {
  label: string
  price: number
  maxPeople?: number
  note?: string
}

// ─── Field definition types ───

export type FieldType = "text" | "textarea" | "image" | "gallery" | "tags" | "objects"

export interface ObjectFieldDef {
  key: string
  label: string
  type?: "text" | "textarea" | "image"
}

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  max?: number
  objectFields?: ObjectFieldDef[]
}

export type SectionConfig = Record<string, FieldDef[]>

// ─── Field name builder ───

export function fieldPath(section: string, key: string, ...parts: (string | number)[]): string {
  return [`s_${section}_${key}`, ...parts].join("_")
}

// ─── Declarative section layouts (Indonesian labels) ───

export const SECTION_CONFIG: SectionConfig = {
  hero: [
    { key: "tagline", label: "Tagline", type: "text" },
    { key: "title_line1", label: "Judul Baris 1", type: "text" },
    { key: "title_highlight", label: "Judul Highlight", type: "text" },
    { key: "title_line2", label: "Judul Baris 2", type: "text" },
    { key: "subtitle", label: "Subjudul", type: "textarea" },
    { key: "brand_name", label: "Nama Brand", type: "text" },
    { key: "vertical_text_right", label: "Teks Vertikal Kanan", type: "text" },
    { key: "vertical_text_left", label: "Teks Vertikal Kiri", type: "text" },
    { key: "cta_text", label: "Teks Tombol", type: "text" },
    { key: "polaroid_1", label: "Polaroid 1", type: "image" },
    { key: "polaroid_2", label: "Polaroid 2", type: "image" },
    { key: "polaroid_3", label: "Polaroid 3", type: "image" },
  ],
  about: [
    { key: "image_url", label: "Gambar", type: "image" },
    { key: "description", label: "Deskripsi", type: "textarea" },
  ],
  gallery: [
    { key: "images", label: "Gambar Galeri", type: "gallery", max: 3 },
  ],
  marquee: [
    { key: "text", label: "Teks Marquee", type: "tags" },
  ],
  themes: [
    {
      key: "items", label: "Tema", type: "objects",
      objectFields: [
        { key: "name", label: "Nama" },
        { key: "desc", label: "Deskripsi", type: "textarea" },
        { key: "img", label: "Gambar", type: "image" },
      ],
    },
  ],
  testimonials: [
    {
      key: "items", label: "Testimoni", type: "objects",
      objectFields: [
        { key: "quote", label: "Kutipan", type: "textarea" },
        { key: "author", label: "Penulis" },
        { key: "context", label: "Konteks" },
      ],
    },
  ],
  location: [
    { key: "address", label: "Alamat", type: "text" },
    { key: "phone", label: "Telepon", type: "text" },
    { key: "hours", label: "Jam Operasional", type: "text" },
    { key: "map_embed_url", label: "URL Peta", type: "text" },
  ],
  cta: [
    { key: "title", label: "Judul", type: "text" },
    { key: "description", label: "Deskripsi", type: "textarea" },
    { key: "button_text", label: "Teks Tombol", type: "text" },
  ],
}

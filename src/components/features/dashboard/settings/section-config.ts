export type SectionTab = "hero" | "marquee" | "about" | "gallery" | "themes" | "testimonials" | "location" | "cta"
export type Tab = SectionTab | "pricing" | "password"

export const CONTENT_SECTIONS: { id: SectionTab; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "marquee", label: "Marquee" },
  { id: "about", label: "About" },
  { id: "gallery", label: "Gallery" },
  { id: "themes", label: "Themes" },
  { id: "testimonials", label: "Testimonials" },
  { id: "location", label: "Location" },
  { id: "cta", label: "CTA" },
]

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
  type?: "text" | "textarea"
}

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  max?: number
  objectFields?: ObjectFieldDef[]
}

export type SectionConfig = Record<string, FieldDef[]>

// ─── Field name builder (shared with FormData reconstruction) ───

export function fieldPath(section: string, key: string, ...parts: (string | number)[]): string {
  return [`s_${section}_${key}`, ...parts].join("_")
}

// ─── Declarative section layouts ───

export const SECTION_CONFIG: SectionConfig = {
  hero: [
    { key: "tagline", label: "Tagline", type: "text" },
    { key: "title_line1", label: "Title Line 1", type: "text" },
    { key: "title_highlight", label: "Title Highlight", type: "text" },
    { key: "title_line2", label: "Title Line 2", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "textarea" },
    { key: "brand_name", label: "Brand Name", type: "text" },
    { key: "vertical_text_right", label: "Vertical Text Right", type: "text" },
    { key: "vertical_text_left", label: "Vertical Text Left", type: "text" },
    { key: "cta_text", label: "CTA Text", type: "text" },
    { key: "cta_link", label: "CTA Link", type: "text" },
    { key: "polaroid_1", label: "Polaroid 1", type: "image" },
    { key: "polaroid_2", label: "Polaroid 2", type: "image" },
    { key: "polaroid_3", label: "Polaroid 3", type: "image" },
  ],
  about: [
    { key: "image_url", label: "Image", type: "image" },
    { key: "description", label: "Description", type: "textarea" },
  ],
  gallery: [
    { key: "images", label: "Gallery Images", type: "gallery", max: 3 },
  ],
  marquee: [
    { key: "text", label: "Marquee Text", type: "tags" },
  ],
  themes: [
    {
      key: "items", label: "Themes", type: "objects",
      objectFields: [
        { key: "name", label: "Name" },
        { key: "desc", label: "Description", type: "textarea" },
        { key: "img", label: "Image URL" },
      ],
    },
  ],
  testimonials: [
    {
      key: "items", label: "Testimonials", type: "objects",
      objectFields: [
        { key: "quote", label: "Quote", type: "textarea" },
        { key: "author", label: "Author" },
        { key: "context", label: "Context" },
      ],
    },
  ],
  location: [
    { key: "address", label: "Address", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "hours", label: "Hours", type: "text" },
    { key: "map_embed_url", label: "Map Embed URL", type: "text" },
  ],
  cta: [
    { key: "title", label: "Title", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "button_text", label: "Button Text", type: "text" },
    { key: "button_link", label: "Button Link", type: "text" },
  ],
}

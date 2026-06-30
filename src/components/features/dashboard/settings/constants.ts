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

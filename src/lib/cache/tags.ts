export const CACHE_TAGS = {
  siteContent: "site_content",
  siteContentSection: (section: string) => `site_content:${section}`,
  pricing: "pricing",
  reservations: "reservations",
  reservation: (id: string | number) => `reservation:${id}`,
  revenue: "revenue",
} as const;

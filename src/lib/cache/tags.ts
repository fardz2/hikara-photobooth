/**
 * Centralized cache tags.
 *
 * Pattern: `entity` for list-level, `entity:id` for item-level.
 * Use tag functions for dynamic segments — never interpolate manually.
 */
export const CACHE_TAGS = {
  // Site content
  siteContent: "site-content",
  siteContentSection: (section: string) => `site-content:${section}`,

  // Pricing (alias for convenience)
  pricing: "site-content:pricing",

  // Reservations
  reservations: "reservations",
  reservation: (id: string | number) => `reservations:${id}`,
  reservationStats: (from?: string, to?: string) =>
    `reservation-stats:${from ?? "all"}:${to ?? "all"}`,
  bookedSlots: (date: string) => `booked-slots:${date}`,

  // Revenue
  revenue: (from: string, to: string) => `revenue:${from}:${to}`,
} as const;

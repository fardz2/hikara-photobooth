"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "./tags";

export async function revalidateSiteContent(section: string) {
  updateTag(CACHE_TAGS.siteContent);
  updateTag(CACHE_TAGS.siteContentSection(section));
}

export async function revalidatePricing() {
  updateTag(CACHE_TAGS.siteContent);
  updateTag(CACHE_TAGS.pricing);
}

export async function revalidateReservations() {
  updateTag(CACHE_TAGS.reservations);
}

export async function revalidateReservation(id: string | number) {
  updateTag(CACHE_TAGS.reservations);
  updateTag(CACHE_TAGS.reservation(id));
}

export async function revalidateBookedSlots(date: string) {
  updateTag(CACHE_TAGS.bookedSlots(date));
}

export async function revalidateRevenue(from: string, to: string) {
  updateTag(CACHE_TAGS.revenue(from, to));
}

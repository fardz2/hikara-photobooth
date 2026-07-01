"use server";

import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "./tags";

export async function revalidateSiteContent(section: string) {
  revalidateTag(CACHE_TAGS.siteContent, "hours");
  revalidateTag(CACHE_TAGS.siteContentSection(section), "hours");
}

export async function revalidatePricing() {
  revalidateTag(CACHE_TAGS.siteContent, "hours");
  revalidateTag(CACHE_TAGS.pricing, "hours");
}

export async function revalidateReservations() {
  revalidateTag(CACHE_TAGS.reservations, "minutes");
}

export async function revalidateReservation(id: string | number) {
  revalidateTag(CACHE_TAGS.reservations, "minutes");
  revalidateTag(CACHE_TAGS.reservation(id), "minutes");
}

export async function revalidateBookedSlots(date: string) {
  revalidateTag(CACHE_TAGS.bookedSlots(date), "seconds");
}

export async function revalidateRevenue(from: string, to: string) {
  revalidateTag(CACHE_TAGS.revenue(from, to), "hours");
}

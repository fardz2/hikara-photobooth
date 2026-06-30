"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "./tags";

function updateTags(tags: string[]) {
  for (const tag of tags) updateTag(tag);
}

export async function revalidateSiteContent(section: string) {
  updateTags([CACHE_TAGS.siteContent, CACHE_TAGS.siteContentSection(section)]);
}

export async function revalidatePricing() {
  updateTags([CACHE_TAGS.pricing, CACHE_TAGS.siteContentSection("pricing")]);
}

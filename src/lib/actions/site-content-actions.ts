"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import {
  type PricingItem,
  upsertPricing,
  upsertSectionContent,
  upsertSiteContent,
} from "@/lib/services/site-content-service";

export async function updateSiteContent(
  section: string,
  key: string,
  value: unknown,
) {
  const result = await upsertSiteContent(section, key, value);
  if (result.error) return result;

  updateTag(CACHE_TAGS.siteContent);
  updateTag(CACHE_TAGS.siteContentSection(section));
  return { success: true };
}

export async function updateSectionContent(
  section: string,
  entries: { key: string; value: unknown }[],
) {
  const result = await upsertSectionContent(section, entries);
  if (result.error) return result;

  updateTag(CACHE_TAGS.siteContent);
  updateTag(CACHE_TAGS.siteContentSection(section));
  return { success: true };
}

export async function updatePricing(items: PricingItem[]) {
  const result = await upsertPricing(items);
  if (result.error) return result;

  updateTag(CACHE_TAGS.siteContent);
  updateTag(CACHE_TAGS.pricing);
  return { success: true };
}

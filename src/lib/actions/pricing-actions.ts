"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import {
  type PricingItem,
  deletePricingItem,
  upsertPricingItem,
} from "@/lib/services/pricing-service";

export async function savePricingItem(item: PricingItem) {
  const result = await upsertPricingItem(item);
  if ("error" in result) return result;

  updateTag(CACHE_TAGS.pricing);
  updateTag(CACHE_TAGS.siteContent);
  revalidatePath("/dashboard/settings");
  return { success: true, data: result.data };
}

export async function removePricingItem(id: string) {
  const result = await deletePricingItem(id);
  if ("error" in result) return result;

  updateTag(CACHE_TAGS.pricing);
  updateTag(CACHE_TAGS.siteContent);
  revalidatePath("/dashboard/settings");
  return { success: true };
}

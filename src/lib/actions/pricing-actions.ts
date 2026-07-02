"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { getCurrentUser } from "@/lib/services/auth-service";
import {
  deletePricingItem,
  type PricingItem,
  upsertPricingItem,
} from "@/lib/services/pricing-service";

export async function savePricingItem(item: PricingItem) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const result = await upsertPricingItem(item);
  if ("error" in result) return result;

  updateTag(CACHE_TAGS.pricing);
  return { success: true, data: result.data };
}

export async function removePricingItem(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const result = await deletePricingItem(id);
  if ("error" in result) return result;

  updateTag(CACHE_TAGS.pricing);
  return { success: true };
}

"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { getCurrentUser } from "@/lib/services/auth-service";
import {
  upsertSectionContent,
  upsertSiteContent,
} from "@/lib/services/site-content-service";

function invalidateSection(section: string) {
  updateTag(CACHE_TAGS.siteContentSection(section));
}

export async function updateSiteContent(
  section: string,
  key: string,
  value: unknown,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const result = await upsertSiteContent(section, key, value);
  if (result.error) return result;

  invalidateSection(section);
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateSectionContent(
  section: string,
  entries: { key: string; value: unknown }[],
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const result = await upsertSectionContent(section, entries);
  if (result.error) return result;

  invalidateSection(section);
  revalidatePath("/dashboard/settings");
  return { success: true };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateSiteContent, revalidatePricing } from "@/lib/cache/revalidate";

export async function updateSiteContent(section: string, key: string, value: unknown) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_content")
    .upsert({ section, key, value }, { onConflict: "section, key" });

  if (error) return { error: error.message };
  await revalidateSiteContent(section);
  return { success: true };
}

export async function updateSectionContent(
  section: string,
  entries: { key: string; value: unknown }[]
) {
  const supabase = await createClient();
  const rows = entries.map((e) => ({ section, key: e.key, value: e.value }));
  const { error } = await supabase.from("site_content").upsert(rows, {
    onConflict: "section, key",
  });
  if (error) return { error: error.message };
  await revalidateSiteContent(section);
  return { success: true };
}

export async function updatePricing(
  entries: { key: string; value: unknown }[]
) {
  const supabase = await createClient();
  const rows = entries.map((e) => ({ section: "pricing", key: e.key, value: e.value }));
  const { error } = await supabase.from("site_content").upsert(rows, {
    onConflict: "section, key",
  });
  if (error) return { error: error.message };
  await revalidatePricing();
  return { success: true };
}

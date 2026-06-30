import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CACHE_TAGS } from "@/lib/cache/tags";

export async function getSiteContent(section: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.siteContentSection(section));

  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("key, value")
    .eq("section", section);

  if (!data) return null;

  // Transform [{key, value}] → { [key]: value }
  const map: Record<string, unknown> = {};
  for (const row of data) {
    map[row.key] = row.value;
  }
  return map;
}

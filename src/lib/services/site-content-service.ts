import { cacheLife, cacheTag, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

// ─── Read: public, cached ───

export async function getSiteContent(section: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.siteContent, CACHE_TAGS.siteContentSection(section));

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_content")
    .select("key, value")
    .eq("section", section);

  if (!data) return null;

  const map: Record<string, unknown> = {};
  for (const row of data) {
    map[row.key] = row.value;
  }
  return map;
}

// ─── Read: admin, no cache ───

export async function getAllSiteContent(sections: string[]) {
  const supabase = await createClient();

  const results = await Promise.all(
    sections.map((s) =>
      supabase.from("site_content").select("key, value").eq("section", s),
    ),
  );

  const sectionData: Record<string, unknown> = {};
  results.forEach(({ data }, i) => {
    if (!data) return;
    const map: Record<string, unknown> = {};
    for (const row of data) map[row.key] = row.value;
    sectionData[sections[i]] = map;
  });

  return sectionData;
}

// ─── Write ───

export async function upsertSiteContent(
  section: string,
  key: string,
  value: unknown,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_content")
    .upsert({ section, key, value }, { onConflict: "section, key" });

  if (error) return { error: error.message };
  return { success: true };
}

export async function upsertSectionContent(
  section: string,
  entries: { key: string; value: unknown }[],
) {
  const supabase = await createClient();
  const rows = entries.map((e) => ({ section, key: e.key, value: e.value }));
  const { error } = await supabase.from("site_content").upsert(rows, {
    onConflict: "section, key",
  });
  if (error) return { error: error.message };
  return { success: true };
}

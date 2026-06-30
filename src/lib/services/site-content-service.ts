import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { CACHE_TAGS } from "@/lib/cache/tags";

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

export interface PricingItem {
  label: string;
  price: number;
  maxPeople?: number;
  note?: string;
}

export type PricingDict = Record<string, PricingItem>;

function defaultPricing(): PricingDict {
  return {
    paket_utama: { label: "Foto per Sesi + 2 Photostrip (Maks 3 Orang)", price: 35000, maxPeople: 3, note: "MAX. 3 ORANG" },
    extra_person: { label: "Tambahan per Orang", price: 5000 },
    extra_print: { label: "Extra Print", price: 10000 },
    custom_frame: { label: "Custom Frame Birthday, Dll", price: 15000 },
  };
}

export async function getPricing() {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.pricing, CACHE_TAGS.siteContentSection("pricing"));

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_content")
    .select("key, value")
    .eq("section", "pricing");

  if (!data || data.length === 0) return defaultPricing();

  const dict: Record<string, any> = {};
  for (const row of data) {
    dict[row.key] = row.value;
  }
  return dict;
}

// ─── Read: admin, no cache ───

export async function getAllSiteContent(sections: string[]) {
  const supabase = await createClient();

  const results = await Promise.all(
    sections.map((s) =>
      supabase.from("site_content").select("key, value").eq("section", s)
    )
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

export async function upsertSiteContent(section: string, key: string, value: unknown) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_content")
    .upsert({ section, key, value }, { onConflict: "section, key" });

  if (error) return { error: error.message };
  return { success: true };
}

export async function upsertSectionContent(
  section: string,
  entries: { key: string; value: unknown }[]
) {
  const supabase = await createClient();
  const rows = entries.map((e) => ({ section, key: e.key, value: e.value }));
  const { error } = await supabase.from("site_content").upsert(rows, {
    onConflict: "section, key",
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function upsertPricing(entries: { key: string; value: unknown }[]) {
  const supabase = await createClient();
  const rows = entries.map((e) => ({ section: "pricing", key: e.key, value: e.value }));
  const { error } = await supabase.from("site_content").upsert(rows, {
    onConflict: "section, key",
  });
  if (error) return { error: error.message };
  return { success: true };
}

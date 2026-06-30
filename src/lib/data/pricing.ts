import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CACHE_TAGS } from "@/lib/cache/tags";

export interface PricingItem {
  label: string;
  price: number;
  maxPeople?: number;
  note?: string;
}

export interface PricingDict {
  [key: string]: PricingItem;
}

function defaultPricing(): PricingDict {
  return {
    paket_utama: { label: "Foto per Sesi + 2 Photostrip (Maks 3 Orang)", price: 35000, maxPeople: 3, note: "MAX. 3 ORANG" },
    extra_person: { label: "Tambahan per Orang", price: 5000 },
    extra_print: { label: "Extra Print", price: 10000 },
    custom_frame: { label: "Custom Frame Birthday, Dll", price: 15000 },
  };
}

export async function getPricing(): Promise<PricingDict> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.pricing);

  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("key, value")
    .eq("section", "pricing");

  if (!data || data.length === 0) return defaultPricing();

  const dict: PricingDict = {};
  for (const row of data) {
    dict[row.key] = row.value as unknown as PricingItem;
  }
  return dict;
}

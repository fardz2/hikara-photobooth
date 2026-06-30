"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SettingsClient } from "@/components/features/dashboard/settings/settings-client";

export default function SettingsPage() {
  const [sectionData, setSectionData] = useState<Record<string, unknown>>({});
  const [pricing, setPricing] = useState<Record<string, { label: string; price: number; maxPeople?: number; note?: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const sections = ["hero", "marquee", "about", "gallery", "themes", "testimonials", "location", "cta"];

    Promise.all([
      ...sections.map((s) =>
        supabase.from("site_content").select("key, value").eq("section", s).then(({ data }) => {
          if (!data) return;
          const map: Record<string, unknown> = {};
          for (const row of data) map[row.key] = row.value;
          return [s, map] as const;
        })
      ),
      supabase.from("site_content").select("key, value").eq("section", "pricing").then(({ data }) => {
        if (!data) return {};
        const dict: Record<string, any> = {};
        for (const row of data) dict[row.key] = row.value;
        return dict;
      }),
    ]).then(([...sectionResults]) => {
      const data: Record<string, unknown> = {};
      for (const r of sectionResults.slice(0, -1)) {
        if (r) data[r[0]] = r[1];
      }
      setSectionData(data);
      setPricing(sectionResults[sectionResults.length - 1] as any || {});
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-[#5A5550] text-sm">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading uppercase tracking-widest text-[#2C2A29]">Settings</h1>
        <p className="text-sm text-[#5A5550] mt-1">Manage site content, pricing, and account</p>
      </div>
      <SettingsClient sectionData={sectionData} pricing={pricing} />
    </div>
  );
}

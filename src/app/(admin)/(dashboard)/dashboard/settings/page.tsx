import { getSiteContent } from "@/lib/data/site-content";
import { getPricing } from "@/lib/data/pricing";
import { SettingsClient } from "@/components/features/dashboard/settings/settings-client";

export default async function SettingsPage() {
  const sections = ["hero", "marquee", "about", "gallery", "themes", "testimonials", "location", "cta"] as const;

  const sectionData: Record<string, unknown> = {};
  for (const s of sections) {
    sectionData[s] = await getSiteContent(s);
  }

  const [pricing] = await Promise.all([getPricing()]);

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

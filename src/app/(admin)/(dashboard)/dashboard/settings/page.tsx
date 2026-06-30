import { Suspense } from "react";
import { getAllSiteContent, getPricing } from "@/lib/services/site-content-service";
import { SettingsClient } from "@/components/features/dashboard/settings/settings-client";

async function SettingsContent() {
  const sections = ["hero", "marquee", "about", "gallery", "themes", "testimonials", "location", "cta"];

  const [sectionData, pricing] = await Promise.all([
    getAllSiteContent(sections),
    getPricing(),
  ]);

  return <SettingsClient sectionData={sectionData} pricing={pricing as any} />;
}

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading uppercase tracking-widest text-[#2C2A29]">Settings</h1>
        <p className="text-sm text-[#5A5550] mt-1">Manage site content, pricing, and account</p>
      </div>
      <Suspense fallback={<div className="p-8 text-[#5A5550] text-sm">Loading settings...</div>}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import { CONTENT_SECTIONS } from "@/components/features/dashboard/settings/section-config";
import { SettingsClient } from "@/components/features/dashboard/settings/settings-client";
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton";
import { getAllPricing } from "@/lib/services/pricing-service";
import { getAllSiteContent } from "@/lib/services/site-content-service";

const sectionKeys = CONTENT_SECTIONS.map((s) => s.id);

async function SettingsContent() {
  const [sectionData, pricingData] = await Promise.all([
    getAllSiteContent(sectionKeys),
    getAllPricing(),
  ]);
  return <SettingsClient sectionData={sectionData} pricingData={pricingData} />;
}

export default function SettingsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-heading uppercase tracking-[0.2em] text-[#2C2A29]">
          Pengaturan Situs
        </h1>
        <p className="text-sm text-[#5A5550] mt-1">
          Kelola konten situs, harga, dan kata sandi
        </p>
      </div>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </>
  );
}

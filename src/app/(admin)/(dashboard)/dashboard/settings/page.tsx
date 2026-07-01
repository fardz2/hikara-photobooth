import { Suspense } from "react"
import { getAllSiteContent, getPricing } from "@/lib/services/site-content-service"
import { SettingsClient } from "@/components/features/dashboard/settings/settings-client"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"
import { CONTENT_SECTIONS } from "@/components/features/dashboard/settings/section-config"

const sectionKeys = CONTENT_SECTIONS.map((s) => s.id)

async function SettingsContent() {
  const [sectionData, pricing] = await Promise.all([
    getAllSiteContent(sectionKeys),
    getPricing(),
  ])
  return <SettingsClient sectionData={sectionData} pricing={pricing} />
}

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-heading uppercase tracking-[0.2em] text-[#2C2A29]">Pengaturan Situs</h1>
        <p className="text-sm text-[#5A5550] mt-1">Kelola konten situs, harga, dan kata sandi</p>
      </div>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  )
}

"use client";

import { Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SectionForm, SectionFormSkeleton } from "./section-form";
import { PricingForm } from "./pricing-form";
import { PasswordForm } from "./password-form";
import { CONTENT_SECTIONS, SETTINGS_TABS, type PricingItem } from "./section-config";

interface Props {
  sectionData: Record<string, unknown>;
  pricing: Record<string, PricingItem>;
}

export function SettingsClient({ sectionData, pricing }: Props) {
  return (
    <Tabs defaultValue="hero" className="flex flex-col md:flex-row gap-4 md:gap-8">
      {/* Mobile: horizontal scroller */}
      <TabsList className="flex md:hidden w-full overflow-x-auto justify-start gap-1 bg-transparent p-0 border-b border-[#E8E2D9] h-auto rounded-none">
        {[...CONTENT_SECTIONS, ...SETTINGS_TABS].map((t) => (
          <TabsTrigger
            key={t.id}
            value={t.id}
            className="shrink-0 rounded-none px-3 py-2 text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-[#632626] data-[state=active]:text-white"
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Desktop: vertical sidebar */}
      <TabsList className="hidden md:flex flex-col w-48 shrink-0 items-stretch gap-1 bg-transparent p-0 h-auto rounded-none">
        <div className="text-[10px] uppercase tracking-widest text-[#8B5E56] font-bold mb-3 px-3">Konten</div>
        {CONTENT_SECTIONS.map((s) => (
          <TabsTrigger
            key={s.id}
            value={s.id}
            className="w-full justify-start rounded-none px-3 py-2 data-[state=active]:bg-[#632626] data-[state=active]:text-white"
          >
            {s.label}
          </TabsTrigger>
        ))}
        <div className="text-[10px] uppercase tracking-widest text-[#8B5E56] font-bold mb-3 mt-6 px-3">Pengaturan</div>
        {SETTINGS_TABS.map((t) => (
          <TabsTrigger
            key={t.id}
            value={t.id}
            className="w-full justify-start rounded-none px-3 py-2 data-[state=active]:bg-[#632626] data-[state=active]:text-white"
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Content panels */}
      <div className="flex-1 max-w-2xl">
        <TabsContent value="pricing" className="mt-0"><PricingForm pricing={pricing} /></TabsContent>
        <TabsContent value="password" className="mt-0"><PasswordForm /></TabsContent>
        {CONTENT_SECTIONS.map((s) => (
          <TabsContent key={s.id} value={s.id} className="mt-0">
            <Suspense fallback={<SectionFormSkeleton />}>
              <SectionForm section={s.id} data={(sectionData[s.id] as Record<string, unknown>) || {}} />
            </Suspense>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

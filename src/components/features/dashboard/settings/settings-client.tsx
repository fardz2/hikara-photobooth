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
    <Tabs defaultValue="hero">
      {/* Always horizontal tabs — scrollable */}
      <TabsList className="w-full overflow-x-auto justify-start gap-1 bg-transparent p-0 border-b border-[#E8E2D9] h-auto rounded-none">
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

      {/* Content panels */}
      <div className="pt-6">
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

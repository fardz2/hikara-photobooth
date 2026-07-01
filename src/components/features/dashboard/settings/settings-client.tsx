"use client";

import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordForm } from "./password-form";
import { PricingAdmin, PricingFormSkeleton } from "./pricing-admin";
import { CONTENT_SECTIONS, SETTINGS_TABS } from "./section-config";
import { SectionForm, SectionFormSkeleton } from "./section-form";
import type { PricingItem } from "@/lib/services/pricing-service";

interface Props {
  sectionData: Record<string, unknown>;
  pricingData: PricingItem[];
}

export function SettingsClient({ sectionData, pricingData }: Props) {
  return (
    <Tabs defaultValue="hero">
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

      <div className="pt-6">
        <TabsContent value="password" className="mt-0">
          <PasswordForm />
        </TabsContent>
        <TabsContent value="pricing" className="mt-0">
          <PricingAdmin initial={pricingData} />
        </TabsContent>
        {CONTENT_SECTIONS.map((s) => (
          <TabsContent key={s.id} value={s.id} className="mt-0">
            <Suspense fallback={<SectionFormSkeleton />}>
              <SectionForm
                section={s.id}
                data={(sectionData[s.id] as Record<string, unknown>) || {}}
              />
            </Suspense>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

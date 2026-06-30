"use client";

import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SectionForm, SectionFormSkeleton } from "./section-form";
import { PricingForm } from "./pricing-form";
import { PasswordForm } from "./password-form";
import { CONTENT_SECTIONS, type PricingItem } from "./section-config";

interface Props {
  sectionData: Record<string, unknown>;
  pricing: Record<string, PricingItem>;
}

export function SettingsClient({ sectionData, pricing }: Props) {
  return (
    <Tabs defaultValue="hero" orientation="vertical" className="flex flex-col md:flex-row gap-4 md:gap-8">
      {/* Mobile: horizontal scrollable tabs */}
      <TabsList
        variant="line"
        className="flex md:hidden w-full overflow-x-auto rounded-none justify-start gap-1 bg-transparent p-0 border-b border-[#E8E2D9]"
      >
        {[...CONTENT_SECTIONS, { id: "pricing" as const, label: "Pricing" }, { id: "password" as const, label: "Password" }].map((t) => (
          <TabsTrigger
            key={t.id}
            value={t.id}
            className={cn(
              "shrink-0 rounded-none px-3 py-2 text-[10px] uppercase tracking-widest font-bold data-[state=active]:bg-[#632626] data-[state=active]:text-white hover:text-[#2C2A29]",
              "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#632626] after:opacity-0 data-[state=active]:after:opacity-100",
            )}
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Desktop: vertical sidebar */}
      <TabsList
        variant="line"
        className="hidden md:flex flex-col w-48 shrink-0 rounded-none bg-transparent p-0 gap-1 items-stretch"
      >
        <div className="text-[10px] uppercase tracking-widest text-[#8B5E56] font-bold mb-3 px-3">Content</div>
        {CONTENT_SECTIONS.map((s) => (
          <TabsTrigger
            key={s.id}
            value={s.id}
            className={cn(
              "w-full justify-start rounded-none text-sm px-3 py-2 data-[state=active]:bg-[#632626] data-[state=active]:text-white hover:text-[#2C2A29]",
              "after:absolute after:inset-y-0 after:-right-1 after:w-0.5 after:bg-[#632626] after:opacity-0 data-[state=active]:after:opacity-0",
            )}
          >
            {s.label}
          </TabsTrigger>
        ))}
        <div className="text-[10px] uppercase tracking-widest text-[#8B5E56] font-bold mb-3 mt-6 px-3">Settings</div>
        <TabsTrigger
          value="pricing"
          className={cn(
            "w-full justify-start rounded-none text-sm px-3 py-2 data-[state=active]:bg-[#632626] data-[state=active]:text-white hover:text-[#2C2A29]",
          )}
        >
          Pricing
        </TabsTrigger>
        <TabsTrigger
          value="password"
          className={cn(
            "w-full justify-start rounded-none text-sm px-3 py-2 data-[state=active]:bg-[#632626] data-[state=active]:text-white hover:text-[#2C2A29]",
          )}
        >
          Password
        </TabsTrigger>
      </TabsList>

      {/* Content panels */}
      <div className="flex-1 max-w-2xl">
        <TabsContent value="pricing" className="mt-0">
          <PricingForm pricing={pricing} />
        </TabsContent>
        <TabsContent value="password" className="mt-0">
          <PasswordForm />
        </TabsContent>
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

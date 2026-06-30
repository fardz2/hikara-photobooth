"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updatePricing } from "@/lib/actions/site-content-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PricingItem } from "./section-config";

interface Props {
  pricing: Record<string, PricingItem>;
}

export function PricingForm({ pricing }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const entries = Object.keys(pricing).map((key) => ({
      key,
      value: {
        label: fd.get(`pricing_${key}_label`) || "",
        price: Number(fd.get(`pricing_${key}_price`)) || 0,
        maxPeople: Number(fd.get(`pricing_${key}_maxPeople`)) || 0,
        note: fd.get(`pricing_${key}_note`) || "",
      },
    }));
    const res = await updatePricing(entries);
    setLoading(false);
    if ("error" in res && res.error) toast.error(res.error);
    else toast.success("Pricing updated");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-heading uppercase tracking-wider text-[#2C2A29]">Pricing</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(pricing).map(([key, p]) => (
          <div key={key} className="border border-[#2C2A29]/10 p-4 space-y-3 bg-white">
            <h3 className="text-xs uppercase tracking-widest font-bold text-[#5A5550]">{key.replace(/_/g, " ")}</h3>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-[#5A5550]">Label</Label>
              <Input name={`pricing_${key}_label`} defaultValue={p.label} className="rounded-none border-[#E8E2D9] bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-[#5A5550]">Price</Label>
              <Input name={`pricing_${key}_price`} type="number" defaultValue={p.price} className="rounded-none border-[#E8E2D9] bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-[#5A5550]">Max People</Label>
              <Input name={`pricing_${key}_maxPeople`} type="number" defaultValue={p.maxPeople} className="rounded-none border-[#E8E2D9] bg-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-[#5A5550]">Note</Label>
              <Input name={`pricing_${key}_note`} defaultValue={p.note} className="rounded-none border-[#E8E2D9] bg-white" />
            </div>
          </div>
        ))}
      </div>
      <Button type="submit" disabled={loading} className="rounded-none bg-[#632626] text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#4a1c1c]">
        {loading ? "Saving..." : "Simpan"}
      </Button>
    </form>
  );
}

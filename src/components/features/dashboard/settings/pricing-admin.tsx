"use client";

import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { savePricingItem, removePricingItem } from "@/lib/actions/pricing-actions";
import { getAllPricing } from "@/lib/services/pricing-service";
import type { PricingCategory, PricingItem } from "@/lib/services/pricing-service";

type TabId = "package" | "extra" | "addon";

const TAB_LABELS: Record<TabId, string> = {
  package: "Paket Utama",
  extra: "Tambahan",
  addon: "Add-on",
};

const TAB_COLORS: Record<TabId, string> = {
  package: "text-[#632626] border-[#632626]/30",
  extra: "text-[#8B5E56] border-[#8B5E56]/30",
  addon: "text-[#2C2A29]/60 border-[#2C2A29]/20",
};

const newItem = (category: PricingCategory): PricingItem => ({
  label: "",
  price: 0,
  maxQty: null,
  note: null,
  category,
  sortOrder: 99,
});

export function PricingFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-40 rounded-none bg-[#2C2A29]/5" />
      <Skeleton className="h-64 w-full rounded-none bg-[#2C2A29]/5" />
    </div>
  );
}

interface Props {
  initial?: PricingItem[];
}

export function PricingAdmin({ initial }: Props) {
  const [items, setItems] = useState<PricingItem[]>(initial ?? []);
  const [loading, setLoading] = useState(!initial);
  const [saving, startSave] = useTransition();
  const [tab, setTab] = useState<TabId>("package");

  useEffect(() => {
    if (initial) return;
    getAllPricing().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [initial]);

  const filtered = items.filter((i) => i.category === tab);

  const update = (id: string | undefined, key: string, val: unknown) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [key]: val } : i)),
    );
  };

  const add = () => {
    setItems((prev) => [...prev, newItem(tab)]);
  };

  const remove = (id: string | undefined) => {
    if (id) {
      startSave(async () => {
        const res = await removePricingItem(id);
        if ("error" in res) toast.error(res.error);
        else {
          setItems((prev) => prev.filter((i) => i.id !== id));
          toast.success("Item dihapus");
        }
      });
    } else {
      setItems((prev) => prev.filter((i) => i.id !== undefined));
    }
  };

  const saveAll = () => {
    startSave(async () => {
      for (const item of filtered) {
        if (!item.id) {
          const res = await savePricingItem(item);
          if ("error" in res) { toast.error(res.error); return; }
          // update local id
          setItems((prev) =>
            prev.map((i) => (i === item ? { ...i, id: res.data?.id } : i)),
          );
        }
      }
      // Save existing items
      for (const item of filtered) {
        if (item.id) {
          const res = await savePricingItem(item);
          if ("error" in res) { toast.error(res.error); return; }
        }
      }
      toast.success("Harga tersimpan");
    });
  };

  if (loading) return <PricingFormSkeleton />;

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-lg font-heading uppercase tracking-wider text-[#2C2A29]">
        Pengaturan Harga
      </h2>

      {/* Category tabs */}
      <div className="flex gap-2 border-b border-[#E8E2D9] pb-px">
        {(Object.keys(TAB_LABELS) as TabId[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? `border-[#632626] text-[#632626]`
                : `border-transparent text-[#5A5550]/60 hover:text-[#2C2A29]`
            }`}
          >
            {TAB_LABELS[t]}
            <span className="ml-1.5 text-[10px] opacity-50">
              ({items.filter((i) => i.category === t).length})
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-sm text-[#5A5550]/60">
            Belum ada item. Klik "Tambah" untuk menambahkan.
          </div>
        )}
        {filtered.map((item, idx) => (
          <div
            key={item.id ?? `new-${idx}`}
            className="border border-[#E8E2D9] p-4 flex flex-col gap-3 relative group"
          >
            {/* Delete */}
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="absolute top-2 right-2 size-6 flex items-center justify-center bg-white/80 hover:bg-red-50 rounded-full transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
              aria-label="Hapus item"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4 text-red-500" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <Input
                value={item.label}
                onChange={(e) => update(item.id, "label", e.target.value)}
                placeholder="Nama Paket"
                className="text-xs col-span-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={item.price || ""}
                onChange={(e) =>
                  update(item.id, "price", Number(e.target.value.replace(/\D/g, "")) || 0)
                }
                placeholder="Harga — contoh: 35000"
                className="text-xs"
              />
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={item.maxQty ?? ""}
                onChange={(e) =>
                  update(
                    item.id,
                    "maxQty",
                    e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null,
                  )
                }
                placeholder="Maks Orang (opsional)"
                className="text-xs"
              />
            </div>
            <Input
              value={item.note ?? ""}
              onChange={(e) => update(item.id, "note", e.target.value || null)}
              placeholder="Catatan (opsional)"
              className="text-xs"
            />
          </div>
        ))}

        {/* Add button */}
        <button
          type="button"
          onClick={add}
          className="border-2 border-dashed border-[#E8E2D9] p-4 flex items-center justify-center gap-2 text-sm text-[#8B5E56] hover:border-[#632626] hover:text-[#632626] transition-colors"
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-5" />
          <span className="text-xs uppercase tracking-widest font-medium">
            Tambah {TAB_LABELS[tab]}
          </span>
        </button>
      </div>

      {/* Sticky save */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E2D9] p-4 flex justify-end z-50">
        <Button
          type="button"
          disabled={saving}
          onClick={saveAll}
          className="rounded-none bg-[#632626] text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#4a1c1c] disabled:opacity-50 transition-opacity"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}

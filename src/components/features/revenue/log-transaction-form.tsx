"use client";

import { useTransition, useState } from "react";
import { logTransaction } from "@/lib/actions/revenue-actions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon, Money01Icon, Loading03Icon, Add01Icon } from "@hugeicons/core-free-icons";

const ADDONS = [
  { id: "extra_orang", label: "Extra Orang", price: 5000 },
  { id: "extra_print", label: "Extra Print", price: 10000 },
  { id: "custom_frame", label: "Custom Frame", price: 15000 },
];

export const LogTransactionForm = () => {
  const [isPending, startTransition] = useTransition();
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [pkg, setPkg] = useState("Sesi Foto + 2 Strip");
  const [method, setMethod] = useState<"tunai" | "qris_manual">("tunai");

  const basePrice = pkg === "Sesi Foto + 2 Strip" ? 35000 : 35000; // Fixed base for now
  const addonsPrice = selectedAddons.reduce((acc, id) => {
    const addon = ADDONS.find(a => a.id === id);
    return acc + (addon?.price || 0);
  }, 0);
  const totalPrice = basePrice + addonsPrice;

  const handleAddonToggle = (id: string, checked: boolean) => {
    if (checked) setSelectedAddons([...selectedAddons, id]);
    else setSelectedAddons(selectedAddons.filter(a => a !== id));
  };

  const handleLog = () => {
    startTransition(async () => {
      const result = await logTransaction({
        package: pkg,
        payment_method: method,
        amount: totalPrice,
        addons: selectedAddons,
      });

      if (result.success) {
        toast.success("Transaksi berhasil dicatat");
        setSelectedAddons([]);
      } else {
        toast.error("Gagal mencatat transaksi");
      }
    });
  };

  return (
    <div className="bg-white p-10 border border-[#2C2A29]/10 shadow-sm space-y-8 flex flex-col justify-between h-full min-h-[400px]">
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60 flex items-center gap-2">
            <HugeiconsIcon icon={Add01Icon} size={14} className="text-[#8B5E56]" />
            Entry Transaksi
          </label>
          <Select value={pkg} onValueChange={setPkg}>
            <SelectTrigger className="rounded-none border-[#2C2A29]/10 focus:ring-[#8B5E56] h-12">
              <SelectValue placeholder="Pilih Paket" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="Sesi Foto + 2 Strip">Sesi Foto + 2 Strip (35k)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60">Add-ons POS</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ADDONS.map((addon) => (
              <div key={addon.id} className="flex items-center space-x-2 p-3 bg-[#F6F4F0]/30 hover:bg-[#F6F4F0]/60 transition-colors border border-transparent hover:border-[#8B5E56]/10">
                <Checkbox 
                  id={`pos-${addon.id}`}
                  checked={selectedAddons.includes(addon.id)}
                  onCheckedChange={(checked) => handleAddonToggle(addon.id, checked === true)}
                  className="rounded-none border-[#2C2A29]/20 data-[state=checked]:bg-[#8B5E56] data-[state=checked]:border-[#8B5E56]"
                />
                <label
                  htmlFor={`pos-${addon.id}`}
                  className="text-[10px] font-bold tracking-tight text-[#2C2A29] cursor-pointer"
                >
                  {addon.label} (+{addon.price / 1000}k)
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <label className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60">Metode Bayar</label>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setMethod("tunai")} className="relative group focus:outline-none">
              <div className={`flex flex-col items-center justify-center p-6 border transition-all ${method === "tunai" ? "border-[#8B5E56] bg-[#F6F4F0]" : "border-[#2C2A29]/10 opacity-40 hover:opacity-100"}`}>
                <HugeiconsIcon icon={Money01Icon} strokeWidth={2} className={`size-8 mb-3 ${method === "tunai" ? "text-[#8B5E56]" : "text-[#5A5550]"}`} />
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#2C2A29]">Tunai</span>
              </div>
            </button>

            <button onClick={() => setMethod("qris_manual")} className="relative group focus:outline-none">
              <div className={`flex flex-col items-center justify-center p-6 border transition-all ${method === "qris_manual" ? "border-[#8B5E56] bg-[#F6F4F0]" : "border-[#2C2A29]/10 opacity-40 hover:opacity-100"}`}>
                <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} className={`size-8 mb-3 ${method === "qris_manual" ? "text-[#8B5E56]" : "text-[#5A5550]"}`} />
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#2C2A29]">QRIS</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-[#2C2A29]/10">
         <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60">Grand Total</span>
            <span className="text-xl font-bold text-[#8B5E56]">Rp {totalPrice.toLocaleString("id-ID")}</span>
         </div>
         <Button
            onClick={handleLog}
            disabled={isPending}
            className="w-full bg-[#2C2A29] text-[#F6F4F0] rounded-none py-8 uppercase tracking-[0.3em] text-[11px] font-bold hover:bg-[#8B5E56] transition-all relative overflow-hidden group shadow-lg"
         >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isPending ? (
              <HugeiconsIcon icon={Loading03Icon} className="animate-spin size-5" />
              ) : (
              <>
                <span>Submit Transaksi</span>
              </>
              )}
            </span>
         </Button>
      </div>
    </div>
  );
};

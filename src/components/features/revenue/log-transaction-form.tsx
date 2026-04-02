"use client";

import { useTransition } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { logTransaction } from "@/lib/actions/revenue-actions";
import { TransactionSchema, type TransactionValues } from "@/lib/validations/revenue";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon, Money01Icon, Loading03Icon, Add01Icon, Clock01Icon } from "@hugeicons/core-free-icons";

// Slot jam operasional: 14:00 - 23:00 WIB

const ADDONS = [
  { id: "custom_frame", label: "Custom Frame", price: 15000 },
];

const EXTRA_PERSON_PRICE = 5000;
const EXTRA_PRINT_PRICE = 10000;

export const LogTransactionForm = () => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<TransactionValues>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      customerName: "",
      sessionTime: "",
      package: "Sesi Foto + 2 Strip",
      addons: [],
      extraPeopleCount: 0,
      extraPrintCount: 0,
      paymentMethod: "tunai",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;




  const pkg = watch("package");
  const sessionTime = watch("sessionTime");
  const selectedAddons = watch("addons");
  const extraPeopleCount = watch("extraPeopleCount");
  const extraPrintCount = watch("extraPrintCount");
  const paymentMethod = watch("paymentMethod");

  const basePrice = pkg === "Sesi Foto + 2 Strip" ? 35000 : 35000;
  const addonsPrice = (selectedAddons || []).reduce((acc, id) => {
    const addon = ADDONS.find(a => a.id === id);
    return acc + (addon?.price || 0);
  }, 0);
  const extraPeoplePrice = (extraPeopleCount) * EXTRA_PERSON_PRICE;
  const extraPrintPrice = (extraPrintCount) * EXTRA_PRINT_PRICE;
  const totalPrice = basePrice + addonsPrice + extraPeoplePrice + extraPrintPrice;

  const handleAddonToggle = (id: string, checked: boolean) => {
    const current = selectedAddons || [];
    if (checked) {
      setValue("addons", [...current, id]);
    } else {
      setValue("addons", current.filter(a => a !== id));
    }
  };

  const onSubmit: SubmitHandler<TransactionValues> = (data) => {
    startTransition(async () => {
      const result = await logTransaction({
        package: data.package,
        payment_method: data.paymentMethod,
        amount: totalPrice,
        addons: data.addons,
        session_time: data.sessionTime,
        extra_people_count: data.extraPeopleCount,
        extra_print_count: data.extraPrintCount,
        customer_name: data.customerName,
      });

      if (result.success) {
        toast.success("Transaksi berhasil dicatat");
        reset();
      } else {
        toast.error("Gagal mencatat transaksi: " + result.message);
      }
    });
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-10 border border-[#2C2A29]/10 shadow-sm space-y-8 flex flex-col justify-between h-full min-h-[400px]"
    >
      <div className="space-y-6">
        {/* Customer Name Input */}
        <div className="space-y-3">
          <label htmlFor="customerName" className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60 flex items-center gap-2">
            Nama Pelanggan
          </label>
          <input
            id="customerName"
            data-testid="customer-name-input"
            type="text"
            placeholder="Contoh: Budi Santoso"
            {...register("customerName")}
            className="w-full h-12 px-4 border border-[#2C2A29]/10 focus:outline-none focus:border-[#8B5E56] transition-all text-sm placeholder:text-[10px] placeholder:tracking-widest placeholder:uppercase"
          />
          {errors.customerName && (
            <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1">
              {errors.customerName.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label htmlFor="session-time" className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60 flex items-center gap-2 cursor-pointer">
            <HugeiconsIcon icon={Clock01Icon} size={14} className="text-[#8B5E56]" />
            Jam Sesi
            <span className="text-[8px] italic tracking-widest font-normal text-[#5A5550]/40">· 14.00 – 23.00 WIB</span>
          </label>

          <div className="relative group">
            <input
              id="session-time"
              data-testid="session-time-input"
              type="time"
              {...register("sessionTime")}
              className={`w-full h-12 bg-transparent text-sm font-bold tracking-widest border px-4 transition-all focus:outline-none focus:ring-1 focus:ring-[#8B5E56]/20 ${
                errors.sessionTime 
                  ? "border-red-500 text-red-500" 
                  : "border-[#2C2A29]/10 text-[#5A5550] focus:border-[#8B5E56]"
              }`}
              style={{ colorScheme: 'light' }}
            />
          </div>

          {errors.sessionTime && (
            <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1">
              {errors.sessionTime.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60 flex items-center gap-2">
            <HugeiconsIcon icon={Add01Icon} size={14} className="text-[#8B5E56]" />
            Entry Transaksi
          </label>
          <Select value={pkg} onValueChange={(val) => setValue("package", val)}>
            <SelectTrigger className="rounded-none border-[#2C2A29]/10 focus:ring-[#8B5E56] h-12">
              <SelectValue placeholder="Pilih Paket" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="Sesi Foto + 2 Strip">Sesi Foto + 2 Strip (35k)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60">Add-ons Pos</label>
          
          <div className="grid grid-cols-1 gap-3">
            {/* Extra People Counter */}
            <div className="flex items-center justify-between p-3 bg-[#F6F4F0]/30 border border-[#8B5E56]/10 flex-wrap gap-2">
              <div className="flex flex-col min-w-[80px]">
                <span className="text-[10px] font-bold tracking-tight text-[#2C2A29]">Tambahan Orang</span>
                <span className="text-[8px] text-[#5A5550]/60 italic font-medium uppercase tracking-wider">Maks 5</span>
              </div>
              
              <div className="flex items-center gap-3 bg-white/50 p-1 border border-[#2C2A29]/5 ml-auto">
                <button 
                  type="button"
                  className="size-6 flex items-center justify-center bg-white shadow-sm hover:bg-[#8B5E56] hover:text-white disabled:opacity-30 disabled:hover:bg-white transition-all text-[#2C2A29] font-bold text-sm"
                  onClick={() => setValue("extraPeopleCount", Math.max(0, extraPeopleCount - 1))}
                  disabled={extraPeopleCount <= 0}
                >
                  −
                </button>
                <span className="text-xs font-bold text-[#2C2A29] w-4 text-center">{extraPeopleCount}</span>
                <button 
                  type="button"
                  className="size-6 flex items-center justify-center bg-white shadow-sm hover:bg-[#8B5E56] hover:text-white disabled:opacity-30 disabled:hover:bg-white transition-all text-[#2C2A29] font-bold text-sm"
                  onClick={() => setValue("extraPeopleCount", Math.min(5, (extraPeopleCount || 0) + 1))}
                  disabled={extraPeopleCount >= 5}
                >
                  +
                </button>
              </div>
            </div>

            {/* Extra Print Counter */}
            <div className="flex items-center justify-between p-3 bg-[#F6F4F0]/30 border border-[#8B5E56]/10 flex-wrap gap-2">
              <div className="flex flex-col min-w-[80px]">
                <span className="text-[10px] font-bold tracking-tight text-[#2C2A29]">Extra Print</span>
                <span className="text-[8px] text-[#5A5550]/60 italic font-medium uppercase tracking-wider">Maks 10</span>
              </div>
              
              <div className="flex items-center gap-3 bg-white/50 p-1 border border-[#2C2A29]/5 ml-auto">
                <button 
                  type="button"
                  className="size-6 flex items-center justify-center bg-white shadow-sm hover:bg-[#8B5E56] hover:text-white disabled:opacity-30 disabled:hover:bg-white transition-all text-[#2C2A29] font-bold text-sm"
                  onClick={() => setValue("extraPrintCount", Math.max(0, extraPrintCount - 1))}
                  disabled={extraPrintCount <= 0}
                >
                  −
                </button>
                <span className="text-xs font-bold text-[#2C2A29] w-4 text-center">{extraPrintCount}</span>
                <button 
                  type="button"
                  className="size-6 flex items-center justify-center bg-white shadow-sm hover:bg-[#8B5E56] hover:text-white disabled:opacity-30 disabled:hover:bg-white transition-all text-[#2C2A29] font-bold text-sm"
                  onClick={() => setValue("extraPrintCount", Math.min(10, (extraPrintCount || 0) + 1))}
                  disabled={extraPrintCount >= 10}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ADDONS.map((addon) => (
              <div key={addon.id} className="flex items-center space-x-2 p-3 bg-[#F6F4F0]/30 hover:bg-[#F6F4F0]/60 transition-colors border border-transparent hover:border-[#8B5E56]/10">
                <Checkbox 
                  id={`pos-${addon.id}`}
                  checked={(selectedAddons || []).includes(addon.id)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" onClick={() => setValue("paymentMethod", "tunai")} className="relative group focus:outline-none w-full">
              <div className={`flex items-center gap-4 p-4 border transition-all ${paymentMethod === "tunai" ? "border-[#8B5E56] bg-[#F6F4F0]" : "border-[#2C2A29]/10 opacity-40 hover:opacity-100"}`}>
                <HugeiconsIcon icon={Money01Icon} strokeWidth={2} className={`size-6 ${paymentMethod === "tunai" ? "text-[#8B5E56]" : "text-[#5A5550]"}`} />
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#2C2A29]">Tunai</span>
              </div>
            </button>

            <button type="button" onClick={() => setValue("paymentMethod", "qris")} className="relative group focus:outline-none w-full">
              <div className={`flex items-center gap-4 p-4 border transition-all ${paymentMethod === "qris" ? "border-[#8B5E56] bg-[#F6F4F0]" : "border-[#2C2A29]/10 opacity-40 hover:opacity-100"}`}>
                <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} className={`size-6 ${paymentMethod === "qris" ? "text-[#8B5E56]" : "text-[#5A5550]"}`} />
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
            type="submit"
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
    </form>
  );
};

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add01Icon,
  Clock01Icon,
  CreditCardIcon,
  Loading03Icon,
  Money01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { logTransaction } from "@/lib/actions/revenue-actions";
import type { PricingItem } from "@/lib/services/pricing-service";
import {
  TransactionSchema,
  type TransactionValues,
} from "@/lib/validations/revenue";

interface Props {
  pricing: PricingItem[];
}

export const LogTransactionForm = ({ pricing }: Props) => {
  const packages = pricing.filter((p) => p.category === "package");
  const extraItems = pricing.filter((p) => p.category === "extra");
  const addonItems = pricing.filter((p) => p.category === "addon");

  const [extras, setExtras] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    extraItems.forEach((item) => { if (item.id) init[item.id] = 0; });
    return init;
  });

  const ADDONS = addonItems.map((a) => ({
    id: a.id ?? a.label
      .toLowerCase()
      .replace(/[^a-z]/g, "_")
      .replace(/_+/g, "_"),
    label: a.label,
    price: a.price,
  }));

  const [isPending, startTransition] = useTransition();
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");

  const form = useForm({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      customerName: "",
      sessionTime: "",
      package: "",
      addons: [],
      extras: {},
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

  const _sessionTime = watch("sessionTime");
  const selectedAddons = watch("addons");
  const paymentMethod = watch("paymentMethod");

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) ?? packages[0];
  const basePrice = selectedPkg?.price || 0;
  const addonsPrice = (selectedAddons || []).reduce((acc, id) => {
    const addon = ADDONS.find((a) => a.id === id);
    return acc + (addon?.price || 0);
  }, 0);
  const extrasPrice = Object.entries(extras).reduce((acc, [id, qty]) => {
    const item = extraItems.find((e) => e.id === id);
    return acc + (item?.price || 0) * qty;
  }, 0);
  const totalPrice = basePrice + addonsPrice + extrasPrice;

  const handlePackageSelect = (id: string) => {
    setSelectedPkgId(id);
    const pkg = packages.find((p) => p.id === id);
    setValue("package", pkg?.label || id);
  };

  const handleAddonToggle = (id: string, checked: boolean) => {
    const current = selectedAddons || [];
    if (checked) {
      setValue("addons", [...current, id]);
    } else {
      setValue(
        "addons",
        current.filter((a) => a !== id),
      );
    }
  };

  const onSubmit: SubmitHandler<TransactionValues> = (data) => {
    startTransition(async () => {
      const result = await logTransaction({
        package: selectedPkg?.label || data.package,
        payment_method: data.paymentMethod,
        amount: totalPrice,
        addons: data.addons,
        session_time: data.sessionTime,
        extra_people_count: Object.values(extras).reduce((a, b) => a + b, 0),
        extra_print_count: 0,
        extras,
        customer_name: data.customerName,
      });

      if (result.success) {
        toast.success("Transaksi berhasil dicatat");
        reset();
        setSelectedPkgId("");
      } else {
        toast.error(`Gagal mencatat transaksi: ${result.message}`);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-10 border border-[#2C2A29]/10 shadow-sm space-y-8 flex flex-col justify-between h-full min-h-[400px]"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <label
            htmlFor="customerName"
            className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60 flex items-center gap-2"
          >
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
          <label
            htmlFor="session-time"
            className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60 flex items-center gap-2 cursor-pointer"
          >
            <HugeiconsIcon
              icon={Clock01Icon}
              size={14}
              className="text-[#8B5E56]"
            />
            Jam Sesi
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
              style={{ colorScheme: "light" }}
            />
          </div>

          {errors.sessionTime && (
            <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1">
              {errors.sessionTime.message}
            </p>
          )}
        </div>

        {/* Package Selection — radio-style cards */}
        <div className="space-y-3">
          <label className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60 flex items-center gap-2">
            <HugeiconsIcon
              icon={Add01Icon}
              size={14}
              className="text-[#8B5E56]"
            />
            Pilih Paket
          </label>
          <div className="flex flex-col gap-3">
            {packages.map((p) => {
              const isSelected = selectedPkgId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePackageSelect(p.id!)}
                  className={`p-4 border rounded-xl flex justify-between items-center group transition-all duration-300 shadow-sm ${
                    isSelected
                      ? "border-[#8B5E56] bg-[#8B5E56]/5"
                      : "border-[#2C2A29]/10 bg-white hover:border-[#8B5E56]/40 hover:bg-[#8B5E56]/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-5 rounded-full flex items-center justify-center shadow-md transition-colors ${
                        isSelected
                          ? "bg-[#8B5E56]"
                          : "bg-[#2C2A29]/10"
                      }`}
                    >
                      {isSelected && (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          strokeWidth={3}
                          className="size-3 text-white"
                        />
                      )}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-[#2C2A29] tracking-tight">
                        {p.label}
                      </span>
                      {p.note && (
                        <span className="text-[10px] text-[#5A5550] font-light tracking-widest uppercase">
                          {p.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#8B5E56]">
                    Rp {p.price.toLocaleString("id-ID")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60">
            Add-ons Pos
          </label>

          <div className="grid grid-cols-1 gap-3">
            {/* Dynamic extras */}
            {extraItems.map((item) => {
              const maxQty = item.maxQty ?? Infinity;
              const isCounter = item.maxQty !== null && item.maxQty !== undefined;
              const qty = extras[item.id!] ?? 0;

              if (isCounter) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-[#F6F4F0]/30 border border-[#8B5E56]/10 flex-wrap gap-2"
                  >
                    <div className="flex flex-col min-w-[80px]">
                      <span className="text-[10px] font-bold tracking-tight text-[#2C2A29]">
                        {item.label}
                      </span>
                      <span className="text-[8px] text-[#5A5550]/60 italic font-medium uppercase tracking-wider">
                        Maks {maxQty === Infinity ? "∞" : maxQty}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 bg-white/50 p-1 border border-[#2C2A29]/5 ml-auto">
                      <button
                        type="button"
                        className="size-6 flex items-center justify-center bg-white shadow-sm hover:bg-[#8B5E56] hover:text-white disabled:opacity-30 disabled:hover:bg-white transition-all text-[#2C2A29] font-bold text-sm"
                        onClick={() =>
                          setExtras((prev) => ({
                            ...prev,
                            [item.id!]: Math.max(0, qty - 1),
                          }))
                        }
                        disabled={qty <= 0}
                      >
                        −
                      </button>
                      <span className="text-xs font-bold text-[#2C2A29] w-4 text-center">
                        {qty}
                      </span>
                      <button
                        type="button"
                        className="size-6 flex items-center justify-center bg-white shadow-sm hover:bg-[#8B5E56] hover:text-white disabled:opacity-30 disabled:hover:bg-white transition-all text-[#2C2A29] font-bold text-sm"
                        onClick={() =>
                          setExtras((prev) => ({
                            ...prev,
                            [item.id!]: Math.min(maxQty, qty + 1),
                          }))
                        }
                        disabled={qty >= maxQty}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              }

              // Checkbox (once-off)
              return (
                <div
                  key={item.id}
                  className="flex items-center space-x-2 p-3 bg-[#F6F4F0]/30 hover:bg-[#F6F4F0]/60 transition-colors border border-transparent hover:border-[#8B5E56]/10"
                >
                  <Checkbox
                    id={`pos-extras-${item.id}`}
                    checked={qty > 0}
                    onCheckedChange={(checked) =>
                      setExtras((prev) => ({
                        ...prev,
                        [item.id!]: checked ? 1 : 0,
                      }))
                    }
                    className="rounded-none border-[#2C2A29]/20 data-[state=checked]:bg-[#8B5E56] data-[state=checked]:border-[#8B5E56]"
                  />
                  <label
                    htmlFor={`pos-extras-${item.id}`}
                    className="text-[10px] font-bold tracking-tight text-[#2C2A29] cursor-pointer"
                  >
                    {item.label} (+{item.price / 1000}k)
                  </label>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ADDONS.map((addon) => (
              <div
                key={addon.id}
                className="flex items-center space-x-2 p-3 bg-[#F6F4F0]/30 hover:bg-[#F6F4F0]/60 transition-colors border border-transparent hover:border-[#8B5E56]/10"
              >
                <Checkbox
                  id={`pos-${addon.id}`}
                  checked={(selectedAddons || []).includes(addon.id)}
                  onCheckedChange={(checked) =>
                    handleAddonToggle(addon.id, checked === true)
                  }
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
          <label className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60">
            Metode Bayar
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue("paymentMethod", "tunai")}
              className="relative group focus:outline-none w-full"
            >
              <div
                className={`flex items-center gap-4 p-4 border transition-all ${paymentMethod === "tunai" ? "border-[#8B5E56] bg-[#F6F4F0]" : "border-[#2C2A29]/10 opacity-40 hover:opacity-100"}`}
              >
                <HugeiconsIcon
                  icon={Money01Icon}
                  strokeWidth={2}
                  className={`size-6 ${paymentMethod === "tunai" ? "text-[#8B5E56]" : "text-[#5A5550]"}`}
                />
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#2C2A29]">
                  Tunai
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setValue("paymentMethod", "qris")}
              className="relative group focus:outline-none w-full"
            >
              <div
                className={`flex items-center gap-4 p-4 border transition-all ${paymentMethod === "qris" ? "border-[#8B5E56] bg-[#F6F4F0]" : "border-[#2C2A29]/10 opacity-40 hover:opacity-100"}`}
              >
                <HugeiconsIcon
                  icon={CreditCardIcon}
                  strokeWidth={2}
                  className={`size-6 ${paymentMethod === "qris" ? "text-[#8B5E56]" : "text-[#5A5550]"}`}
                />
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#2C2A29]">
                  QRIS
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-[#2C2A29]/10">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60">
            Grand Total
          </span>
          <span className="text-xl font-bold text-[#8B5E56]">
            Rp {totalPrice.toLocaleString("id-ID")}
          </span>
        </div>
        <Button
          type="submit"
          disabled={isPending || !selectedPkgId}
          className="w-full bg-[#2C2A29] text-[#F6F4F0] rounded-none py-8 uppercase tracking-[0.3em] text-[11px] font-bold hover:bg-[#8B5E56] transition-all relative overflow-hidden group shadow-lg disabled:opacity-40"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            {isPending ? (
              <HugeiconsIcon
                icon={Loading03Icon}
                className="animate-spin size-5"
              />
            ) : (
              <span>Submit Transaksi</span>
            )}
          </span>
        </Button>
      </div>
    </form>
  );
};

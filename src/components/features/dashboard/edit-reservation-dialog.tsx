"use client";

import { Edit01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { editReservation } from "@/lib/actions/reservation-actions";
import type { PricingItem } from "@/lib/services/pricing-service";
import { generateTimeSlots } from "@/lib/utils/slots";
import { normalizePhoneNumber } from "@/lib/utils/validation";
import type { Reservation } from "./columns";

interface Props {
  reservation: Reservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricing: PricingItem[];
}

export function EditReservationDialog({
  reservation,
  open,
  onOpenChange,
  pricing,
}: Props) {
  const effectivePricing = reservation?.pricing_snapshot ?? pricing;
  const packages = effectivePricing.filter(
    (p: PricingItem) => p.category === "package",
  );
  const extraItems = effectivePricing.filter(
    (p: PricingItem) => p.category === "extra",
  );
  const addonItems = effectivePricing.filter(
    (p: PricingItem) => p.category === "addon",
  );

  const mainPkg = packages[0];

  const PRICELIST = mainPkg
    ? [
        {
          id: mainPkg.id ?? "paket_utama",
          label: mainPkg.label,
          price: mainPkg.price,
        },
      ]
    : [];
  const ADDONS = addonItems.map((a: PricingItem) => ({
    id: a.label
      .toLowerCase()
      .replace(/[^a-z]/g, "_")
      .replace(/_+/g, "_"),
    label: a.label,
    price: a.price,
  }));

  const [isPending, startTransition] = useTransition();

  // State
  const [name, setName] = useState(reservation?.name || "");
  const [phone, setPhone] = useState(reservation?.phone || "");
  const [date, setDate] = useState(reservation?.date || "");
  const [time, setTime] = useState(reservation?.time || "");
  const [pkg, setPkg] = useState(reservation?.package || "paket_utama");
  const [selectedAddons, setSelectedAddons] = useState<string[]>(
    reservation?.addons || [],
  );
  const [extras, setExtras] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    extraItems.forEach((item: PricingItem) => {
      if (item.id) init[item.id] = 0;
    });
    return init;
  });
  const [paymentMethod, setPaymentMethod] = useState<"tunai" | "qris">(
    reservation?.payment_method || "tunai",
  );

  // Sync state when opening dialog with different reservation
  useEffect(() => {
    if (reservation && open) {
      setName(reservation.name);
      setPhone(reservation.phone);
      setDate(reservation.date);
      setTime(reservation.time);
      setPkg(reservation.package || "paket_utama");
      setSelectedAddons(reservation.addons || []);
      setPaymentMethod(reservation.payment_method || "tunai");
      // Initialize extras from DB
      const init: Record<string, number> = {};
      extraItems.forEach((item: PricingItem) => {
        if (item.id) init[item.id] = 0;
      });
      // Prefer per-item extras record if available
      const savedExtras = (reservation as Record<string, unknown>).extras;
      if (savedExtras && typeof savedExtras === "object") {
        Object.entries(savedExtras as Record<string, number>).forEach(
          ([k, v]) => {
            if (k in init) init[k] = v;
          },
        );
      } else {
        // Legacy: distribute extra_people_count to first counter item
        const totalExtraPeople = reservation.extra_people_count || 0;
        if (totalExtraPeople > 0) {
          const firstCounter = extraItems.find(
            (e: PricingItem) => e.maxQty && e.maxQty > 0,
          );
          if (firstCounter?.id) init[firstCounter.id] = totalExtraPeople;
        }
      }
      setExtras(init);
    }
  }, [reservation, open, extraItems]);

  if (!reservation) return null;

  const handleAddonToggle = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedAddons((prev) => [...prev, id]);
    } else {
      setSelectedAddons((prev) => prev.filter((a) => a !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        name,
        phone: normalizePhoneNumber(phone),
        date,
        time,
        package: pkg,
        addons: selectedAddons,
        extras,
        paymentMethod,
      };

      const result = await editReservation(reservation.id, payload);

      if (result.success) {
        toast.success(result.message || "Reservasi berhasil diubah");
        onOpenChange(false);
      } else {
        toast.error(result.message || "Gagal mengubah reservasi");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-none border-[#2C2A29]/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl tracking-tight text-[#2C2A29] flex items-center gap-2">
            <HugeiconsIcon icon={Edit01Icon} size={24} />
            Edit Reservasi
          </DialogTitle>
          <DialogDescription className="text-xs uppercase tracking-widest text-[#5A5550]">
            Ubah detail data pelanggan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest"
            >
              Nama Pelanggan
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-none border-[#2C2A29]/10 h-10 w-full"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest"
            >
              No. WhatsApp
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="rounded-none border-[#2C2A29]/10 h-10 w-full"
              placeholder="628..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="date"
                className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest"
              >
                Tanggal
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="rounded-none border-[#2C2A29]/10 h-10 w-full uppercase text-[10px] tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="time"
                className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest"
              >
                Jam
              </Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="rounded-none border-[#2C2A29]/10 h-10 text-[10px] tracking-widest">
                  <SelectValue placeholder="Waktu" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#2C2A29]/10">
                  {generateTimeSlots().map((timeSlot) => (
                    <SelectItem
                      key={timeSlot}
                      value={timeSlot}
                      className="text-[10px] tracking-widest rounded-none"
                    >
                      {timeSlot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="package"
              className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest"
            >
              Pilih Paket
            </Label>
            <Select value={pkg} onValueChange={setPkg}>
              <SelectTrigger className="rounded-none border-[#2C2A29]/10 h-10 text-[10px] tracking-widest">
                <SelectValue placeholder="Pilih Paket" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-[#2C2A29]/10">
                {PRICELIST.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={item.id}
                    className="text-[10px] tracking-widest rounded-none"
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest">
              Add-ons
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {ADDONS.map(
                (addon: { id: string; label: string; price: number }) => (
                  <div key={addon.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${addon.id}`}
                      checked={selectedAddons.includes(addon.id)}
                      onCheckedChange={(checked) =>
                        handleAddonToggle(addon.id, checked === true)
                      }
                      className="rounded-none border-[#2C2A29]/20 data-[state=checked]:bg-[#8B5E56] data-[state=checked]:border-[#8B5E56]"
                    />
                    <label
                      htmlFor={`edit-${addon.id}`}
                      className="text-[10px] font-bold tracking-tight text-[#2C2A29] cursor-pointer"
                    >
                      {addon.label} (+Rp {addon.price.toLocaleString("id-ID")})
                    </label>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Dynamic extras */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest">
              Tambahan
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {extraItems.map((item: PricingItem) => {
                const maxQty = item.maxQty ?? Infinity;
                const isCounter =
                  item.maxQty !== null && item.maxQty !== undefined;
                const qty = extras[item.id!] ?? 0;

                if (isCounter) {
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-[#F6F4F0]/30 border border-[#8B5E56]/10"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-tight text-[#2C2A29]">
                          {item.label}
                        </span>
                        <span className="text-[8px] text-[#5A5550]/60 italic">
                          Maks {maxQty === Infinity ? "∞" : maxQty} | +Rp{" "}
                          {item.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          className="size-6 flex items-center justify-center bg-white shadow-sm hover:bg-[#8B5E56] hover:text-white disabled:opacity-30 transition-all text-[#2C2A29] font-bold text-sm"
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
                          className="size-6 flex items-center justify-center bg-white shadow-sm hover:bg-[#8B5E56] hover:text-white disabled:opacity-30 transition-all text-[#2C2A29] font-bold text-sm"
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
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-extra-${item.id}`}
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
                      htmlFor={`edit-extra-${item.id}`}
                      className="text-[10px] font-bold tracking-tight text-[#2C2A29] cursor-pointer"
                    >
                      {item.label} (+Rp {item.price.toLocaleString("id-ID")})
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="paymentMethod"
              className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest"
            >
              Metode Pembayaran
            </Label>
            <Select
              value={paymentMethod}
              onValueChange={(val) => setPaymentMethod(val as "tunai" | "qris")}
            >
              <SelectTrigger className="rounded-none border-[#2C2A29]/10 h-10 text-[10px] tracking-widest uppercase font-bold">
                <SelectValue placeholder="Pilih Metode" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-[#2C2A29]/10">
                <SelectItem
                  value="tunai"
                  className="text-[10px] uppercase font-bold tracking-widest rounded-none"
                >
                  Tunai
                </SelectItem>
                <SelectItem
                  value="qris"
                  className="text-[10px] uppercase font-bold tracking-widest rounded-none"
                >
                  QRIS
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full mt-4 bg-[#2C2A29] text-white rounded-none h-12 uppercase tracking-widest text-[10px] font-bold hover:bg-[#8B5E56] transition-colors"
          >
            {isPending ? (
              <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

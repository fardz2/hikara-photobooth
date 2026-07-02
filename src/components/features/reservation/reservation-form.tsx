"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar01Icon,
  Clock01Icon,
  CreditCardIcon,
  ImageUploadIcon,
  InformationCircleIcon,
  Loading03Icon,
  Money01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { addMinutes, format, isBefore, isSameDay, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
import { useCallback, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getBookedSlots,
  submitReservation,
} from "@/lib/actions/reservation-actions";
import { createClient } from "@/lib/supabase/client";
import { generateDynamicQRIS } from "@/lib/utils/qris";
import { generateTimeSlots } from "@/lib/utils/slots";
import { normalizePhoneNumber } from "@/lib/utils/validation";
import {
  ReservationSchema as FormSchema,
  type ReservationValues as FormValues,
} from "@/lib/validations/reservation";

// Time slot logic moved to @/lib/utils/slots

const timeSlots = generateTimeSlots();

// Schema moved to @/lib/validations/reservation

import type { PricingItem } from "@/lib/services/pricing-service";

interface Props {
  pricing: PricingItem[];
}

export const ReservationForm = ({ pricing }: Props) => {
  const packages = pricing.filter((p) => p.category === "package");
  const extraItems = pricing.filter((p) => p.category === "extra");
  const addonItems = pricing.filter((p) => p.category === "addon");

  const [extras, setExtras] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    extraItems.forEach((item) => {
      if (item.id) init[item.id] = 0;
    });
    return init;
  });

  const pricelist = packages.map((p, i) => ({
    id: p.id ?? `pkg_${i}`,
    label: p.label,
    price: p.price,
    note: p.note,
  }));
  const addons = addonItems.map((a) => ({
    id:
      a.id ??
      a.label
        .toLowerCase()
        .replace(/[^a-z]/g, "_")
        .replace(/_+/g, "_"),
    label: a.label,
    price: a.price,
  }));

  // WITA (Asia/Makassar) Today Calculation
  const nowWita = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Makassar" }),
  );
  const today = startOfDay(nowWita);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<FormValues>({
    // ponytail: zod v4 + @hookform/resolvers type mismatch — remove when upstream fixes
    resolver: zodResolver(FormSchema) as never,
    defaultValues: {
      name: "",
      phone: "",
      date: undefined,
      time: "",
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
    formState: { errors },
  } = form;

  const selectedDate = watch("date");
  const selectedTime = watch("time");
  const selectedAddons = watch("addons");
  const pkg = watch("package");
  const paymentMethod = watch("paymentMethod");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Calculate total price
  const basePrice = pricelist.find((p) => p.id === pkg)?.price ?? 0;
  const addonsPrice = selectedAddons.reduce((acc, addonId) => {
    const addon = addons.find((a) => a.id === addonId);
    return acc + (addon?.price ?? 0);
  }, 0);
  const extrasPrice = Object.entries(extras).reduce((acc, [id, qty]) => {
    const item = extraItems.find((e) => e.id === id);
    return acc + (item?.price ?? 0) * qty;
  }, 0);
  const totalPrice = basePrice + addonsPrice + extrasPrice;

  const handleDateChange = useCallback(
    async (date: Date) => {
      setValue("date", date, { shouldValidate: true });
      setValue("time", "", { shouldValidate: true });
      setIsCalendarOpen(false); // Close calendar after selection
      setIsFetchingSlots(true);
      try {
        const slots = await getBookedSlots(format(date, "yyyy-MM-dd"));
        setBookedSlots(slots);
      } catch {
        setBookedSlots([]);
      } finally {
        setIsFetchingSlots(false);
      }
    },
    [setValue],
  );

  const handleAddonToggle = (id: string, checked: boolean) => {
    const current = selectedAddons ?? [];
    if (checked) {
      setValue("addons", [...current, id]);
    } else {
      setValue(
        "addons",
        current.filter((a) => a !== id),
      );
    }
  };

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      let paymentProofUrl = "";

      // 1. If QRIS, handle upload
      if (data.paymentMethod === "qris") {
        if (!paymentProofFile) {
          toast.error("Harap unggah bukti pembayaran QRIS.");
          return;
        }

        setIsUploading(true);
        try {
          const supabase = createClient();

          // Convert to WebP using Canvas
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = new window.Image();

          const webpBlob = await new Promise<Blob>((resolve, reject) => {
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx?.drawImage(img, 0, 0);
              canvas.toBlob(
                (blob) => {
                  if (blob) resolve(blob);
                  else reject(new Error("Gagal mengonversi gambar."));
                },
                "image/webp",
                0.8,
              );
            };
            img.onerror = () => reject(new Error("Gagal memuat gambar."));
            img.src = URL.createObjectURL(paymentProofFile);
          });

          const fileName = `${Date.now()}-${data.name.replace(/\s+/g, "-").toLowerCase()}.webp`;
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("payment-proofs")
              .upload(fileName, webpBlob, {
                contentType: "image/webp",
                upsert: true,
              });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage
            .from("payment-proofs")
            .getPublicUrl(uploadData.path);

          paymentProofUrl = publicUrl;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          toast.error(`Gagal mengunggah bukti: ${msg}`);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // 2. Submit Reservation
      let dateStr: string;
      try {
        dateStr = format(data.date, "yyyy-MM-dd");
      } catch {
        toast.error("Tanggal reservasi tidak valid.");
        return;
      }

      try {
        const result = await submitReservation({
          ...data,
          phone: normalizePhoneNumber(data.phone),
          date: dateStr,
          addons: data.addons ?? [],
          extras: extras,
          paymentMethod: data.paymentMethod,
          paymentProofUrl: paymentProofUrl,
        });

        if (result.success) {
          toast.success(result.message);
          setPaymentProofFile(null);
          // Reset form but keep the selected date and package
          const currentDate = watch("date");
          const currentPackage = watch("package");
          form.reset({
            name: "",
            phone: "",
            date: currentDate as Date,
            package: currentPackage,
            time: "",
            addons: [],
            extras: {},
            paymentMethod: "tunai",
          });
          const resetExtras: Record<string, number> = {};
          extraItems.forEach((item) => {
            if (item.id) resetExtras[item.id] = 0;
          });
          setExtras(resetExtras);

          if (currentDate) {
            handleDateChange(currentDate as Date);
          }
        } else {
          toast.error(result.message);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Gagal mengirim reservasi: ${msg}`);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8 w-full"
    >
      <div className="flex flex-col gap-6">
        {/* Nama & Telepon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-xs tracking-widest text-[#5A5550] uppercase font-medium"
            >
              Nama Lengkap
            </label>
            <Input
              id="name"
              {...register("name")}
              placeholder="John Doe"
              className="border-input focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-all"
            />
            {errors.name && (
              <span className="text-red-500 text-xs">
                {errors.name.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="phone"
              className="text-xs tracking-widest text-[#5A5550] uppercase font-medium"
            >
              Nomor WhatsApp
            </label>
            <InputGroup className="border-input">
              <InputGroupAddon>
                <InputGroupText>+62</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="phone"
                {...register("phone")}
                placeholder="812XXXXXX"
                type="tel"
                className="transition-all"
              />
            </InputGroup>
            {errors.phone && (
              <span className="text-red-500 text-[10px] mt-1 italic">
                {errors.phone.message}
              </span>
            )}
          </div>
        </div>

        {/* Tanggal & Waktu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="date-trigger"
              className="text-xs tracking-widest text-[#5A5550] uppercase font-medium"
            >
              Tanggal
            </label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date-trigger"
                  aria-label="Pilih Tanggal Reservasi"
                  variant="outline"
                  onClick={() => setIsCalendarOpen(true)}
                  className={`w-full justify-start text-left font-normal border-input focus-visible:ring-[3px] focus-visible:ring-ring/50 ${!selectedDate && "text-muted-foreground"}`}
                >
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    strokeWidth={2}
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                  />
                  {selectedDate ? (
                    format(selectedDate, "EEEE, dd MMMM yyyy", { locale: id })
                  ) : (
                    <span>Pilih Tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate as Date}
                  onSelect={(date) => date && handleDateChange(date)}
                  disabled={(date) => isBefore(startOfDay(date), today)}
                  locale={id}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <span className="text-red-500 text-xs">
                {errors.date.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="time-trigger"
              className="text-xs tracking-widest text-[#5A5550] uppercase font-medium"
            >
              Waktu Sesi
            </label>
            <Select
              onValueChange={(val) =>
                setValue("time", val, { shouldValidate: true })
              }
              disabled={isFetchingSlots}
              value={selectedTime}
              name="time"
            >
              <SelectTrigger
                id="time-trigger"
                className="w-full border-input focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <SelectValue
                  placeholder={
                    !selectedDate
                      ? "Pilih tanggal lebih dulu"
                      : isFetchingSlots
                        ? "Memuat jadwal..."
                        : selectedTime || "Pilih Jam"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!selectedDate ? (
                  <div className="px-3 py-6 text-center text-xs text-[#5A5550] font-light tracking-widest">
                    Silakan tentukan tanggal photoshoot Anda terlebih dahulu.
                  </div>
                ) : isFetchingSlots ? (
                  <div className="flex items-center justify-center gap-3 py-8 text-sm text-[#5A5550]">
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      strokeWidth={2}
                      className="size-5 animate-spin text-[#8B5E56]"
                    />
                    <span>Mengecek ketersediaan...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1 p-1">
                    {timeSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);

                      // Check if slot is too close (less than 15 mins left)
                      const [h, m] = slot.split(":").map(Number);
                      const slotTime = new Date(selectedDate);
                      slotTime.setHours(h, m, 0, 0);

                      const nowWitaActual = new Date(
                        new Date().toLocaleString("en-US", {
                          timeZone: "Asia/Makassar",
                        }),
                      );
                      // Disable if current time + 15 minutes is after slot time
                      const fifteenMinutesFromNow = addMinutes(
                        nowWitaActual,
                        15,
                      );
                      const isTooClose =
                        isSameDay(selectedDate, nowWitaActual) &&
                        isBefore(slotTime, fifteenMinutesFromNow);

                      const isDisabled = isBooked || isTooClose;

                      return (
                        <SelectItem
                          key={slot}
                          value={slot}
                          disabled={isDisabled}
                          className="justify-center"
                        >
                          <div
                            className={`flex items-center gap-1.5 ${isDisabled ? "opacity-30 line-through" : ""}`}
                          >
                            <HugeiconsIcon
                              icon={Clock01Icon}
                              strokeWidth={1.5}
                              className="size-3.5"
                            />
                            <span className="text-xs">{slot}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </div>
                )}
              </SelectContent>
            </Select>
            {errors.time && (
              <span className="text-red-500 text-xs mt-1">
                {errors.time.message}
              </span>
            )}
          </div>
        </div>

        {/* Paket Utama */}
        <div className="flex flex-col gap-2">
          <label className="text-xs tracking-widest text-[#5A5550] uppercase font-medium">
            Pilih Paket
          </label>
          <div className="flex flex-col gap-3">
            {pricelist.map((p) => {
              const isSelected = pkg === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setValue("package", p.id)}
                  className={`p-4 border rounded-xl flex justify-between items-center group transition-all duration-300 shadow-sm ${
                    isSelected
                      ? "border-[#8B5E56] bg-[#8B5E56]/5"
                      : "border-[#2C2A29]/10 bg-white hover:border-[#8B5E56]/40 hover:bg-[#8B5E56]/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-5 rounded-full flex items-center justify-center shadow-md transition-colors ${
                        isSelected ? "bg-[#8B5E56]" : "bg-[#2C2A29]/10"
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
                  <span
                    className="text-sm font-bold text-[#8B5E56]"
                    data-testid={isSelected ? "total-price" : undefined}
                  >
                    Rp {p.price.toLocaleString("id-ID")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tambahan (extras) */}
        <div className="flex flex-col gap-2 pt-4 border-t border-[#2C2A29]/10">
          <label className="text-xs tracking-widest text-[#5A5550] uppercase font-medium">
            Tambahan
          </label>
          {extraItems.length === 0 && (
            <p className="text-xs text-muted-foreground">Belum ada tambahan</p>
          )}
          {extraItems.map((item) => {
            const maxQty = item.maxQty ?? Infinity;
            const isCounter = item.maxQty !== null && item.maxQty !== undefined;
            const qty = extras[item.id!] ?? 0;

            if (isCounter) {
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-[#F6F4F0]/30 border border-[#8B5E56]/10"
                >
                  <div className="flex flex-col min-w-[80px]">
                    <span className="text-[10px] font-bold tracking-tight text-[#2C2A29]">
                      {item.label}
                    </span>
                    <span className="text-[8px] text-[#5A5550]/60 italic font-medium uppercase tracking-wider">
                      Maks {maxQty === Infinity ? "∞" : maxQty} · +Rp{" "}
                      {item.price.toLocaleString("id-ID")}
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

                  <div className="flex justify-between items-center text-[10px] tracking-wide text-[#5A5550]">
                    {qty > 0 && (
                      <span className="font-bold text-[#8B5E56]">
                        Rp {(qty * item.price).toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // Checkbox (once-off addon)
            return (
              <div
                key={item.id}
                className="flex items-center space-x-2 p-3 bg-[#F6F4F0]/30 hover:bg-[#F6F4F0]/60 transition-colors border border-transparent hover:border-[#8B5E56]/10"
              >
                <Checkbox
                  id={`extras-${item.id}`}
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
                  htmlFor={`extras-${item.id}`}
                  className="text-[10px] font-bold tracking-tight text-[#2C2A29] cursor-pointer"
                >
                  {item.label} (+Rp {item.price.toLocaleString("id-ID")})
                </label>
              </div>
            );
          })}
        </div>

        {/* Add-ons */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[#2C2A29]/10">
          <label className="text-xs tracking-widest text-[#5A5550] uppercase font-medium">
            Add-ons Lainnya (Opsional)
          </label>
          {addons.map((addon) => (
            <div key={addon.id} className="flex items-center space-x-2">
              <Checkbox
                id={addon.id}
                checked={selectedAddons.includes(addon.id)}
                onCheckedChange={(checked) =>
                  handleAddonToggle(addon.id, checked === true)
                }
              />
              <label
                htmlFor={addon.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#2C2A29]"
              >
                {addon.label} (+Rp {addon.price.toLocaleString("id-ID")})
              </label>
            </div>
          ))}
        </div>

        {/* Metode Pembayaran */}
        <div className="flex flex-col gap-4 pt-6 mt-2 border-t-2 border-dashed border-[#2C2A29]/10">
          <label className="text-xs tracking-[0.2em] text-[#5A5550] uppercase font-bold flex items-center gap-2">
            <HugeiconsIcon
              icon={Tick02Icon}
              className="size-4 text-[#8B5E56]"
            />
            Metode Pembayaran
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue("paymentMethod", "tunai")}
              aria-pressed={paymentMethod === "tunai"}
              aria-label="Bayar Tunai atau di Tempat"
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                paymentMethod === "tunai"
                  ? "border-[#8B5E56] bg-[#8B5E56]/5 shadow-md scale-[1.02]"
                  : "border-transparent bg-[#EFEBDE]/30 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
              }`}
            >
              <div
                className={`size-10 rounded-full flex items-center justify-center ${paymentMethod === "tunai" ? "bg-[#8B5E56] text-white" : "bg-[#2C2A29]/10 text-[#2C2A29]"}`}
                aria-hidden="true"
              >
                <HugeiconsIcon
                  icon={Money01Icon}
                  className="size-5"
                  strokeWidth={2}
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">
                Tunai / Selesai di Tempat
              </span>
            </button>

            <button
              type="button"
              onClick={() => setValue("paymentMethod", "qris")}
              aria-pressed={paymentMethod === "qris"}
              aria-label="Bayar via QRIS"
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                paymentMethod === "qris"
                  ? "border-[#8B5E56] bg-[#8B5E56]/5 shadow-md scale-[1.02]"
                  : "border-transparent bg-[#EFEBDE]/30 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
              }`}
            >
              <div
                className={`size-10 rounded-full flex items-center justify-center ${paymentMethod === "qris" ? "bg-[#8B5E56] text-white" : "bg-[#2C2A29]/10 text-[#2C2A29]"}`}
                aria-hidden="true"
              >
                <HugeiconsIcon
                  icon={CreditCardIcon}
                  className="size-5"
                  strokeWidth={2}
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">
                QRIS (Bayar Sekarang)
              </span>
            </button>
          </div>

          {paymentMethod === "qris" && (
            <div className="mt-4 p-6 bg-white border border-[#2C2A29]/5 rounded-2xl flex flex-col items-center gap-6 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="w-full flex flex-col items-center gap-4 text-center">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#8B5E56] uppercase">
                  Scan QR di Bawah
                </span>

                {/* Dynamic Amount Tag */}
                <div className="px-4 py-2 bg-[#8B5E56]/5 rounded-full border border-[#8B5E56]/20 shadow-sm animate-in zoom-in duration-500">
                  <span className="text-sm font-bold text-[#8B5E56]">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="relative size-48 p-2 border-4 border-[#2C2A29] rounded-xl overflow-hidden shadow-xl bg-white">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&qzone=4&data=${encodeURIComponent(generateDynamicQRIS(totalPrice))}`}
                    alt="HIKARA DYNAMIC QRIS"
                    fill
                    sizes="192px"
                    className="object-contain"
                    unoptimized
                  />
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-[#2C2A29]">
                    HIKARA PHOTOBOX
                  </span>
                  <span className="text-[10px] text-[#5A5550] italic">
                    Pastikan nominal sesuai agar cepat diproses
                  </span>
                </div>
              </div>

              <div className="w-full h-px bg-linear-to-r from-transparent via-[#2C2A29]/10 to-transparent"></div>

              <div className="w-full flex flex-col gap-3">
                <label className="text-[10px] font-bold tracking-[0.2em] text-[#5A5550] uppercase">
                  Upload Bukti Bayar{" "}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setPaymentProofFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                    id="payment-proof-upload"
                  />
                  <label
                    htmlFor="payment-proof-upload"
                    className={`flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                      paymentProofFile
                        ? "border-[#8B5E56] bg-[#8B5E56]/5"
                        : "border-[#2C2A29]/10 hover:border-[#8B5E56]/50 bg-[#F6F4F0]"
                    }`}
                  >
                    <HugeiconsIcon
                      icon={paymentProofFile ? Tick02Icon : ImageUploadIcon}
                      className={`size-5 ${paymentProofFile ? "text-[#8B5E56]" : "text-[#5A5550]"}`}
                    />
                    <span className="text-xs font-medium text-[#2C2A29]">
                      {paymentProofFile
                        ? paymentProofFile.name
                        : "Klik untuk pilih gambar"}
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#5A5550]/60 italic">
                  <HugeiconsIcon
                    icon={InformationCircleIcon}
                    className="size-3"
                  />
                  <span>Gambar akan dikonversi otomatis untuk optimasi.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Button
        type="submit"
        data-testid="reservation-submit"
        disabled={isPending || isUploading}
        className="w-full bg-[#2C2A29] hover:bg-[#1a1817] text-white py-6 sm:py-8 h-auto text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase disabled:opacity-60 flex flex-col items-center justify-center gap-1 transition-all duration-500 shadow-lg group"
      >
        {isPending || isUploading ? (
          <div className="flex items-center gap-3">
            <HugeiconsIcon
              icon={Loading03Icon}
              strokeWidth={2}
              className="size-4 animate-spin text-white"
            />
            <span className="text-xs sm:text-sm text-center">
              {isUploading ? "MENGUNGGAH BUKTI..." : "MEMPROSES..."}
            </span>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 group-hover:scale-105 transition-transform duration-500 w-full justify-center text-center">
              <span className="font-bold">PESAN SEKARANG</span>
              <span className="hidden sm:inline opacity-20 font-light">|</span>
              <span className="font-light text-[10px] sm:text-sm">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] opacity-40 font-medium tracking-normal mt-1.5 sm:mt-1 flex items-center gap-1 text-center">
              <HugeiconsIcon
                icon={Tick02Icon}
                className="size-2.5 hidden sm:block"
              />
              Satu kali klik untuk reservasi instan
            </span>
          </>
        )}
      </Button>
    </form>
  );
};

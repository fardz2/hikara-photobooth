"use client";

import React, { useTransition, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  format,
  addDays,
  startOfDay,
  isBefore,
  isSameDay,
  addMinutes,
} from "date-fns";
import { id } from "date-fns/locale";
import {
  submitReservation,
  getBookedSlots,
} from "@/lib/actions/reservation-actions";
import { toast } from "sonner";
import { generateDynamicQRIS } from "@/lib/utils/qris";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  Clock01Icon,
  Loading03Icon,
  Tick02Icon,
  InformationCircleIcon,
  ImageUploadIcon,
  Money01Icon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

// Constants
const PRICELIST = [
  {
    id: "paket_utama",
    label: "Foto per Sesi + 2 Photostrip (Maks 4 Orang)",
    price: 35000,
  },
];
const ADDONS = [
  { id: "extra_print", label: "Extra Print", price: 10000 },
  { id: "custom_frame", label: "Custom Frame Birthday, Dll", price: 15000 },
];

const EXTRA_PERSON_PRICE = 5000;

const START_HOUR = 10;
const END_HOUR = 23;

// Helper to generate time slots
function generateTimeSlots() {
  const slots = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return slots;
}

const timeSlots = generateTimeSlots();

// Zod Schema
const FormSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek"),
  phone: z
    .string()
    .min(8, "Nomor HP minimal 8 digit")
    .max(13, "Nomor HP maksimal 13 digit")
    .regex(/^\d+$/, "Hanya boleh berisi angka")
    .refine((val) => !val.startsWith("0"), "Jangan awali dengan 0 (contoh: 82148645084),"),
  date: z.instanceof(Date, { message: "Pilih tanggal reservasi" }),
  time: z.string().min(1, "Pilih waktu sesi"),
  package: z.string().min(1, "Pilih paket"),
  addons: z.array(z.string()).default([]),
  extraPeopleCount: z.number().min(0).max(5).default(0),
  paymentMethod: z.enum(["tunai", "qris"]),
  paymentProof: z.any().optional(),
});

type FormValues = z.output<typeof FormSchema>;

export const ReservationForm = () => {
  // WITA (Asia/Makassar) Today Calculation
  const nowWita = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Makassar" }),
  );
  const today = startOfDay(nowWita);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      name: "",
      phone: "",
      date: undefined,
      time: "",
      package: "paket_utama",
      addons: [],
      extraPeopleCount: 0,
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
  const extraPeopleCount = watch("extraPeopleCount");
  const paymentMethod = watch("paymentMethod");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Calculate total price
  const basePrice = PRICELIST.find((p) => p.id === pkg)?.price || 0;
  const addonsPrice = selectedAddons.reduce((acc, addonId) => {
    const addon = ADDONS.find((a) => a.id === addonId);
    return acc + (addon?.price || 0);
  }, 0);
  const extraPeoplePrice = extraPeopleCount * EXTRA_PERSON_PRICE;
  const totalPrice = basePrice + addonsPrice + extraPeoplePrice;

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
        } catch (err: any) {
          toast.error(`Gagal mengunggah bukti: ${err.message}`);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // 2. Submit Reservation
      const result = await submitReservation({
        ...data,
        phone: `62${data.phone}`,
        addons: data.addons ?? [],
        extraPeopleCount: data.extraPeopleCount,
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
          date: currentDate,
          package: currentPackage,
          time: "",
          addons: [],
          extraPeopleCount: 0,
          paymentMethod: "tunai",
        });

        if (currentDate) {
          handleDateChange(currentDate);
        }
      } else {
        toast.error(result.message);
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
                  selected={selectedDate}
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
            >
              <SelectTrigger
                id="time-trigger"
                aria-label="Pilih Waktu Sesi"
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
            Paket Utama
          </label>
          <div className="p-4 border border-[#8B5E56] bg-[#8B5E56]/5 rounded-xl flex justify-between items-center group transition-all duration-500 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="size-5 rounded-full bg-[#8B5E56] flex items-center justify-center shadow-md">
                <HugeiconsIcon
                  icon={Tick02Icon}
                  strokeWidth={3}
                  className="size-3 text-white"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#2C2A29] tracking-tight">
                  {PRICELIST[0].label}
                </span>
                <span className="text-[10px] text-[#5A5550] font-light tracking-widest uppercase">
                  Base Experience
                </span>
              </div>
            </div>
            <span className="text-sm font-bold text-[#8B5E56]">
              Rp {PRICELIST[0].price.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Extra People Count */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[#2C2A29]/10">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <label className="text-xs tracking-widest text-[#5A5550] uppercase font-medium">
                Tambahan Orang
              </label>
              <span className="text-[10px] text-[#5A5550]/60 italic">
                +{extraPeopleCount > 0 ? extraPeopleCount : 0} orang eksklusif
              </span>
            </div>

            <div className="flex items-center gap-3 bg-[#EFEBDE]/30 p-1.5 rounded-lg border border-[#2C2A29]/5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-md bg-white shadow-sm hover:bg-white active:scale-95 transition-all text-[#8B5E56]"
                onClick={() =>
                  setValue(
                    "extraPeopleCount",
                    Math.max(0, extraPeopleCount - 1),
                  )
                }
                disabled={extraPeopleCount <= 0}
              >
                <span className="text-lg font-bold">−</span>
              </Button>
              <div className="w-8 text-center">
                <span className="text-sm font-bold text-[#2C2A29]">
                  {extraPeopleCount}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-md bg-white shadow-sm hover:bg-white active:scale-95 transition-all text-[#8B5E56]"
                onClick={() =>
                  setValue(
                    "extraPeopleCount",
                    Math.min(5, extraPeopleCount + 1),
                  )
                }
                disabled={extraPeopleCount >= 5}
              >
                <span className="text-lg font-bold">+</span>
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] tracking-wide text-[#5A5550]">
            <span>Maksimal 5 orang tambahan</span>
            <span className="font-bold text-[#8B5E56]">
              Rp{" "}
              {(extraPeopleCount * EXTRA_PERSON_PRICE).toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Add-ons */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[#2C2A29]/10">
          <label className="text-xs tracking-widest text-[#5A5550] uppercase font-medium">
            Add-ons Lainnya (Opsional)
          </label>
          {ADDONS.map((addon) => (
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
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                paymentMethod === "tunai"
                  ? "border-[#8B5E56] bg-[#8B5E56]/5 shadow-md scale-[1.02]"
                  : "border-transparent bg-[#EFEBDE]/30 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
              }`}
            >
              <div
                className={`size-10 rounded-full flex items-center justify-center ${paymentMethod === "tunai" ? "bg-[#8B5E56] text-white" : "bg-[#2C2A29]/10 text-[#2C2A29]"}`}
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
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                paymentMethod === "qris"
                  ? "border-[#8B5E56] bg-[#8B5E56]/5 shadow-md scale-[1.02]"
                  : "border-transparent bg-[#EFEBDE]/30 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
              }`}
            >
              <div
                className={`size-10 rounded-full flex items-center justify-center ${paymentMethod === "qris" ? "bg-[#8B5E56] text-white" : "bg-[#2C2A29]/10 text-[#2C2A29]"}`}
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
        disabled={isPending || isUploading}
        className="w-full bg-[#2C2A29] hover:bg-[#1a1817] text-white py-8 text-sm tracking-[0.3em] uppercase disabled:opacity-60 flex flex-col items-center justify-center gap-1 transition-all duration-500 shadow-lg group"
      >
        {isPending || isUploading ? (
          <div className="flex items-center gap-3">
            <HugeiconsIcon
              icon={Loading03Icon}
              strokeWidth={2}
              className="size-4 animate-spin text-white"
            />
            <span>{isUploading ? "MENGUNGGAH BUKTI..." : "MEMPROSES..."}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 group-hover:scale-105 transition-transform duration-500">
              <span className="font-bold">PESAN SEKARANG</span>
              <span className="opacity-20 font-light">|</span>
              <span className="font-light">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
            <span className="text-[9px] opacity-40 font-medium tracking-normal mt-1 flex items-center gap-1">
              <HugeiconsIcon icon={Tick02Icon} className="size-2.5" />
              Satu kali klik untuk reservasi instan
            </span>
          </>
        )}
      </Button>
    </form>
  );
};

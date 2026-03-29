"use client";

import React, { useTransition, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays, startOfDay, isBefore } from "date-fns";
import { submitReservation, getBookedSlots } from "@/lib/actions/reservation-actions";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, Clock01Icon, Loading03Icon, Tick02Icon } from "@hugeicons/core-free-icons";

// Constants
const PRICELIST = [
  { id: "paket_utama", label: "Foto per Sesi + 2 Photostrip (Maks 4 Orang)", price: 35000 },
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
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    slots.push(`${h.toString().padStart(2, '0')}:30`);
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
    .regex(/^\d+$/, "Hanya boleh berisi angka"),
  date: z.date().refine((val) => !!val, "Pilih tanggal reservasi"),
  time: z.string().min(1, "Pilih waktu sesi"),
  package: z.string().min(1, "Pilih paket"),
  addons: z.array(z.string()).default([]),
  extraPeopleCount: z.number().min(0).max(5).default(0),
});

type FormValues = z.output<typeof FormSchema>;

export const ReservationForm = () => {
  const tomorrow = startOfDay(addDays(new Date(), 1));
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      name: "",
      phone: "",
      package: "paket_utama",
      addons: [],
      extraPeopleCount: 0,
    }
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  const selectedDate = watch("date");
  const selectedTime = watch("time");
  const selectedAddons = watch("addons");
  const pkg = watch("package");
  const extraPeopleCount = watch("extraPeopleCount");

  const [isPending, startTransition] = useTransition();

  // Calculate total price
  const basePrice = PRICELIST.find(p => p.id === pkg)?.price || 0;
  const addonsPrice = selectedAddons.reduce((acc, addonId) => {
    const addon = ADDONS.find(a => a.id === addonId);
    return acc + (addon?.price || 0);
  }, 0);
  const extraPeoplePrice = extraPeopleCount * EXTRA_PERSON_PRICE;
  const totalPrice = basePrice + addonsPrice + extraPeoplePrice;

  const handleDateChange = useCallback(async (date: Date) => {
    setValue("date", date);
    setValue("time", "");
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
  }, [setValue]);

  const handleAddonToggle = (id: string, checked: boolean) => {
    const current = selectedAddons ?? [];
    if (checked) {
      setValue("addons", [...current, id]);
    } else {
      setValue("addons", current.filter((a) => a !== id));
    }
  };

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const result = await submitReservation({
        ...data,
        phone: `62${data.phone}`,
        addons: data.addons ?? [],
        extraPeopleCount: data.extraPeopleCount,
      });
      if (result.success) {
        toast.success(result.message);
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
        });
        
        // Refresh booked slots after success
        if (currentDate) {
          handleDateChange(currentDate);
        }
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-6">
        {/* Nama & Telepon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest text-[#5A5550] uppercase font-medium">Nama Lengkap</label>
            <Input {...register("name")} placeholder="John Doe" className="border-[#2C2A29]/20 focus-visible:ring-[#8B5E56]" />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest text-[#5A5550] uppercase font-medium">Nomor WhatsApp</label>
            <InputGroup>
              <InputGroupText>+62</InputGroupText>
              <Input 
                {...register("phone")} 
                placeholder="812XXXXXX" 
                type="tel" 
                className="rounded-none border-l-0 border-[#2C2A29]/20 focus-visible:ring-0 focus-visible:border-[#8B5E56] transition-all" 
              />
            </InputGroup>
            {errors.phone && <span className="text-red-500 text-[10px] mt-1 italic">{errors.phone.message}</span>}
          </div>
        </div>

        {/* Tanggal & Waktu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest text-[#5A5550] uppercase font-medium">Tanggal</label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setIsCalendarOpen(true)}
                  className={`w-full justify-start text-left font-normal border-[#2C2A29]/20 focus-visible:ring-[#8B5E56] ${!selectedDate && "text-muted-foreground"}`}
                >
                  <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pilih Tanggal (min H+1)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && handleDateChange(date)}
                  disabled={(date) => isBefore(startOfDay(date), tomorrow)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && <span className="text-red-500 text-xs">{errors.date.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest text-[#5A5550] uppercase font-medium">Waktu Sesi</label>
            <Select onValueChange={(val) => setValue("time", val)} disabled={isFetchingSlots} value={selectedTime}>
              <SelectTrigger className="w-full border-[#2C2A29]/20 focus-visible:ring-[#8B5E56] h-11">
                <SelectValue placeholder={
                  !selectedDate ? "Pilih tanggal lebih dulu" 
                  : isFetchingSlots ? "Memuat jadwal..." 
                  : selectedTime || "Pilih Jam"
                } />
              </SelectTrigger>
              <SelectContent>
                {!selectedDate ? (
                  <div className="px-3 py-6 text-center text-xs text-[#5A5550] font-light tracking-widest">
                    Silakan tentukan tanggal photoshoot Anda terlebih dahulu.
                  </div>
                ) : isFetchingSlots ? (
                  <div className="flex items-center justify-center gap-3 py-8 text-sm text-[#5A5550]">
                    <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-5 animate-spin text-[#8B5E56]" />
                    <span>Mengecek ketersediaan...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1 p-1">
                    {timeSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      return (
                        <SelectItem key={slot} value={slot} disabled={isBooked} className="justify-center">
                          <div className={`flex items-center gap-1.5 ${isBooked ? "opacity-30 line-through" : ""}`}>
                            <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.5} className="size-3.5" />
                            <span className="text-xs">{slot}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </div>
                )}
              </SelectContent>
            </Select>
            {errors.time && <span className="text-red-500 text-xs mt-1">{errors.time.message}</span>}
          </div>
        </div>
        
        {/* Paket Utama */}
        <div className="flex flex-col gap-2">
          <label className="text-xs tracking-widest text-[#5A5550] uppercase font-medium">Paket Utama</label>
          <div className="p-4 border border-[#8B5E56] bg-[#8B5E56]/5 rounded-xl flex justify-between items-center group transition-all duration-500 shadow-sm">
             <div className="flex items-center gap-3">
               <div className="size-5 rounded-full bg-[#8B5E56] flex items-center justify-center shadow-md">
                 <HugeiconsIcon icon={Tick02Icon} strokeWidth={3} className="size-3 text-white" />
               </div>
               <div className="flex flex-col">
                 <span className="text-sm font-semibold text-[#2C2A29] tracking-tight">{PRICELIST[0].label}</span>
                 <span className="text-[10px] text-[#5A5550] font-light tracking-widest uppercase">Base Experience</span>
               </div>
             </div>
             <span className="text-sm font-bold text-[#8B5E56]">Rp {PRICELIST[0].price.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Extra People Count */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[#2C2A29]/10">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <label className="text-xs tracking-widest text-[#5A5550] uppercase font-medium">Tambahan Orang</label>
              <span className="text-[10px] text-[#5A5550]/60 italic">+{extraPeopleCount > 0 ? extraPeopleCount : 0} orang eksklusif</span>
            </div>
            
            <div className="flex items-center gap-3 bg-[#EFEBDE]/30 p-1.5 rounded-lg border border-[#2C2A29]/5">
              <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                className="size-8 rounded-md bg-white shadow-sm hover:bg-white active:scale-95 transition-all text-[#8B5E56]"
                onClick={() => setValue("extraPeopleCount", Math.max(0, extraPeopleCount - 1))}
                disabled={extraPeopleCount <= 0}
              >
                <span className="text-lg font-bold">−</span>
              </Button>
              <div className="w-8 text-center">
                <span className="text-sm font-bold text-[#2C2A29]">{extraPeopleCount}</span>
              </div>
              <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                className="size-8 rounded-md bg-white shadow-sm hover:bg-white active:scale-95 transition-all text-[#8B5E56]"
                onClick={() => setValue("extraPeopleCount", Math.min(5, extraPeopleCount + 1))}
                disabled={extraPeopleCount >= 5}
              >
                <span className="text-lg font-bold">+</span>
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] tracking-wide text-[#5A5550]">
            <span>Maksimal 5 orang tambahan</span>
            <span className="font-bold text-[#8B5E56]">Rp {(extraPeopleCount * EXTRA_PERSON_PRICE).toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Add-ons */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[#2C2A29]/10">
          <label className="text-xs tracking-widest text-[#5A5550] uppercase font-medium">Add-ons Lainnya (Opsional)</label>
          {ADDONS.map((addon) => (
            <div key={addon.id} className="flex items-center space-x-2">
              <Checkbox 
                id={addon.id} 
                checked={selectedAddons.includes(addon.id)}
                onCheckedChange={(checked) => handleAddonToggle(addon.id, checked === true)}
              />
              <label
                htmlFor={addon.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#2C2A29]"
              >
                {addon.label} (+Rp {addon.price.toLocaleString('id-ID')})
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full bg-[#8B5E56] hover:bg-[#6b4842] text-white py-6 text-sm tracking-widest uppercase disabled:opacity-60 flex items-center justify-center gap-3 transition-all duration-300">
        {isPending ? (
          <>
            <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin text-white" />
            <span>Memproses...</span>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span>Pesan Sekarang</span>
            <span className="opacity-30">|</span>
            <span className="text-xs font-light">Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
        )}
      </Button>
    </form>
  );
};

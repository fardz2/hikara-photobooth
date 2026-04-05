"use client";

import { useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reservation } from "./columns";
import { editReservation } from "@/lib/actions/reservation-actions";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Edit01Icon } from "@hugeicons/core-free-icons";
import { normalizePhoneNumber } from "@/lib/utils/validation";
import { generateTimeSlots } from "@/lib/utils/slots";
import { PRICELIST, ADDONS } from "@/lib/constants/reservation";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  reservation: Reservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditReservationDialog({ reservation, open, onOpenChange }: Props) {
  const [isPending, startTransition] = useTransition();

  // State
  const [name, setName] = useState(reservation?.name || "");
  const [phone, setPhone] = useState(reservation?.phone || "");
  const [date, setDate] = useState(reservation?.date || "");
  const [time, setTime] = useState(reservation?.time || "");
  const [pkg, setPkg] = useState(reservation?.package || "paket_utama");
  const [selectedAddons, setSelectedAddons] = useState<string[]>(reservation?.addons || []);
  const [extraPeopleCount, setExtraPeopleCount] = useState<number>(reservation?.extra_people_count || 0);
  const [extraPrintCount, setExtraPrintCount] = useState<number>(reservation?.extra_print_count || 0);
  const [paymentMethod, setPaymentMethod] = useState<"tunai" | "qris">(reservation?.payment_method || "tunai");

  // Keep synced when open/reservation changes
  useState(() => {
    if (reservation && open) {
      setName(reservation.name);
      setPhone(reservation.phone);
      setDate(reservation.date);
      setTime(reservation.time);
      setPkg(reservation.package || "paket_utama");
      setSelectedAddons(reservation.addons || []);
      setExtraPeopleCount(reservation.extra_people_count || 0);
      setExtraPrintCount(reservation.extra_print_count || 0);
      setPaymentMethod(reservation.payment_method || "tunai");
    }
  });

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
        extraPeopleCount,
        extraPrintCount,
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
            <Label htmlFor="name" className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest">Nama Pelanggan</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-none border-[#2C2A29]/10 h-10 w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest">No. WhatsApp</Label>
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
              <Label htmlFor="date" className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest">Tanggal</Label>
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
              <Label htmlFor="time" className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest">Jam</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="rounded-none border-[#2C2A29]/10 h-10 text-[10px] tracking-widest">
                  <SelectValue placeholder="Waktu" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-[#2C2A29]/10">
                  {/* Time slots with 30-minute intervals */}
                  {generateTimeSlots().map((timeSlot) => (
                    <SelectItem key={timeSlot} value={timeSlot} className="text-[10px] tracking-widest rounded-none">
                      {timeSlot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="package" className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest">Pilih Paket</Label>
            <Select value={pkg} onValueChange={setPkg}>
              <SelectTrigger className="rounded-none border-[#2C2A29]/10 h-10 text-[10px] tracking-widest">
                <SelectValue placeholder="Pilih Paket" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-[#2C2A29]/10">
                {PRICELIST.map((item) => (
                  <SelectItem key={item.id} value={item.id} className="text-[10px] tracking-widest rounded-none">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest">Add-ons</Label>
            <div className="grid grid-cols-1 gap-2">
              {ADDONS.map((addon) => (
                <div key={addon.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`edit-${addon.id}`}
                    checked={selectedAddons.includes(addon.id)}
                    onCheckedChange={(checked) => handleAddonToggle(addon.id, checked === true)}
                    className="rounded-none border-[#2C2A29]/20 data-[state=checked]:bg-[#8B5E56] data-[state=checked]:border-[#8B5E56]"
                  />
                  <label
                    htmlFor={`edit-${addon.id}`}
                    className="text-[10px] font-bold tracking-tight text-[#2C2A29] cursor-pointer"
                  >
                    {addon.label} (+Rp {addon.price.toLocaleString('id-ID')})
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="extraPeople" className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest">Extra Orang (+Rp 5.000)</Label>
              <Input
                id="extraPeople"
                type="number"
                min={0}
                max={5}
                value={extraPeopleCount}
                onChange={(e) => setExtraPeopleCount(parseInt(e.target.value) || 0)}
                className="rounded-none border-[#2C2A29]/10 h-10 w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extraPrint" className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest">Extra Print (+Rp 10.000)</Label>
              <Input
                id="extraPrint"
                type="number"
                min={0}
                max={10}
                value={extraPrintCount}
                onChange={(e) => setExtraPrintCount(parseInt(e.target.value) || 0)}
                className="rounded-none border-[#2C2A29]/10 h-10 w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-[10px] uppercase font-bold text-[#2C2A29] tracking-widest">Metode Pembayaran</Label>
            <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as "tunai" | "qris")}>
              <SelectTrigger className="rounded-none border-[#2C2A29]/10 h-10 text-[10px] tracking-widest uppercase font-bold">
                <SelectValue placeholder="Pilih Metode" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-[#2C2A29]/10">
                <SelectItem value="tunai" className="text-[10px] uppercase font-bold tracking-widest rounded-none">Tunai</SelectItem>
                <SelectItem value="qris" className="text-[10px] uppercase font-bold tracking-widest rounded-none">QRIS</SelectItem>
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

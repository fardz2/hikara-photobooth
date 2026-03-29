"use server";

import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { reservationService } from "@/lib/services/reservation-service";

type ReservationInput = {
  name: string;
  phone: string;
  date: Date;
  time: string;
  package: string;
  addons: string[];
};

export async function submitReservation(data: ReservationInput) {
  const supabase = await createClient();
  
  if (!data.name || !data.phone || !data.date || !data.time) {
    return { success: false, message: "Semua data wajib diisi." };
  }

  // Enforce Indonesia Number (62)
  if (!/^62\d+$/.test(data.phone)) {
    return { success: false, message: "Nomor WhatsApp tidak valid. Gunakan awalan 62 (contoh: 62812...)." };
  }

  const dateObj = new Date(data.date);
  const dateStr = format(dateObj, "yyyy-MM-dd");

  console.log(`[BE] Handling reservation for ${dateStr} at ${data.time}`);

  // 1. Use service for availability check
  try {
    const isBooked = await reservationService.checkSlotAvailability(dateStr, data.time);
    if (isBooked) {
      return { success: false, message: "Maaf, slot waktu ini sudah dipesan." };
    }
  } catch (err) {
    return { success: false, message: "Gagal mengecek ketersediaan." };
  }

  // 2. Insert the reservation
  const { error: insertError } = await supabase
    .from("reservations")
    .insert({
      name: data.name,
      phone: data.phone,
      date: dateStr,
      time: data.time,
      package: data.package,
      addons: data.addons,
      payment_method: "tunai", // Default for online to be paid on site
      total_price: 35000, 
      is_walk_in: false,
      status: "pending",
      created_at: new Date().toISOString(),
    });

  if (insertError) {
    return { success: false, message: `Gagal menyimpan: ${insertError.message}` };
  }

  console.log(`[BE] Reservation SUCCESS for ${data.name} on ${dateStr}`);
  revalidatePath("/reservasi");
  return { success: true, message: "Reservasi berhasil dikirim! Kami akan menghubungi Anda via WhatsApp." };
}

export async function getBookedSlots(date: string): Promise<string[]> {
  try {
    return await reservationService.getBookedSlots(date);
  } catch (err) {
    console.error(`[BE] Error fetching slots for ${date}:`, err);
    return [];
  }
}


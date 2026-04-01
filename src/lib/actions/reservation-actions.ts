"use server";

import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { revalidatePath } from "next/cache";
import { reservationService } from "@/lib/services/reservation-service";
import { fonnteService } from "@/lib/services/fonnte-service";
import { calculateTotalPrice } from "@/lib/utils/price";
import { isValidWhatsApp } from "@/lib/utils/validation";

type ReservationInput = {
  name: string;
  phone: string;
  date: Date;
  time: string;
  package: string;
  addons: string[];
  extraPeopleCount?: number;
  extraPrintCount?: number;
  paymentMethod: "tunai" | "qris";
  paymentProofUrl?: string;
};

export async function submitReservation(data: ReservationInput) {
  const supabase = await createClient();
  
  if (!data.name || !data.phone || !data.date || !data.time) {
    return { success: false, message: "Semua data wajib diisi." };
  }

  // Enforce Indonesia Number (62)
  if (!isValidWhatsApp(data.phone)) {
    return { success: false, message: "Nomor WhatsApp tidak valid. Gunakan awalan 62 (contoh: 62812...)." };
  }

  const dateObj = new Date(data.date);
  const dateStr = format(dateObj, "yyyy-MM-dd");

  console.log(`[BE] Handling reservation for ${dateStr} at ${data.time}`);

  // Calculate Price Server Side
  const totalPrice = calculateTotalPrice({
    extraPeopleCount: data.extraPeopleCount,
    extraPrintCount: data.extraPrintCount,
    addons: data.addons
  });

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
      extra_people_count: data.extraPeopleCount || 0,
      extra_print_count: data.extraPrintCount || 0,
      payment_method: data.paymentMethod,
      payment_proof_url: data.paymentProofUrl || null,
      total_price: totalPrice, 
      is_walk_in: false,
      status: "pending",
      created_at: new Date().toISOString(),
    });

  if (insertError) {
    return { success: false, message: `Gagal menyimpan: ${insertError.message}` };
  }

  console.log(`[BE] Reservation SUCCESS for ${data.name} on ${dateStr} - Total: Rp ${totalPrice.toLocaleString('id-ID')} (${data.paymentMethod})`);
  
  // 3. Send WhatsApp Notifications (Async, don't block response)
  const paymentStatus = data.paymentMethod === "qris" 
    ? "Dibayar via QRIS (Menunggu Konfirmasi)" 
    : "Bayar di Studio (Tunai/QRIS)";

  const customerMsg = `*HIKARA PHOTOBOX - RESERVASI BERHASIL* 📸

Halo *${data.name}*, 
Terima kasih telah melakukan reservasi di Hikara Photobox.

*Detail Reservasi:*
📅 Tanggal: ${format(new Date(dateStr), "EEEE, dd MMMM yyyy", { locale: idLocale })}
⏰ Waktu: ${data.time} WITA
${data.extraPeopleCount && data.extraPeopleCount > 0 ? `👤 Tambahan Orang: ${data.extraPeopleCount}\n` : ""}${data.extraPrintCount && data.extraPrintCount > 0 ? `🖼️ Tambahan Print: ${data.extraPrintCount}\n` : ""}💳 Metode: *${data.paymentMethod === 'qris' ? 'QRIS' : 'Tunai di Tempat'}*
💵 Total: *Rp ${totalPrice.toLocaleString('id-ID')}*
📝 Status: ${paymentStatus}

*Syarat & Ketentuan:*
1. Harap datang 5-10 menit sebelum jadwal sesi.
2. Tunjukkan pesan ini saat kedatangan.
${data.paymentMethod === 'tunai' ? "3. Pembayaran diselesaikan di studio." : "3. Pembayaran sudah kami terima (via QRIS)."}

Sampai jumpa di studio! ✨`;

  const adminMsg = data.paymentMethod === "qris" 
    ? `*KONFIRMASI PEMBAYARAN QRIS!* 💳 🔥
  
👤 Nama: ${data.name}
📱 WA: ${data.phone}
📅 Tanggal: ${format(new Date(dateStr), "dd MMM yyyy", { locale: idLocale })}
⏰ Waktu: ${data.time}
💰 Total: *Rp ${totalPrice.toLocaleString('id-ID')}*
📎 Bukti: ${data.paymentProofUrl || "Tidak ada bukti terlampir"}

Segera cek dashboard untuk verifikasi bukti & konfirmasi!`
    : `*RESERVASI BARU (TUNAI)!* 💵 🔥
  
👤 Nama: ${data.name}
📱 WA: ${data.phone}
📅 Tanggal: ${format(new Date(dateStr), "dd MMM yyyy", { locale: idLocale })}
⏰ Waktu: ${data.time}
💰 Total: Rp ${totalPrice.toLocaleString('id-ID')}

Konfirmasi kehadiran di dashboard admin.`;

  const adminPhone = process.env.ADMIN_PHONE;
  if (!adminPhone) {
    console.error("[BE] ADMIN_PHONE environment variable is NOT set!");
  } else {
    Promise.all([
      fonnteService.sendMessage(data.phone, customerMsg),
      fonnteService.sendMessage(adminPhone, adminMsg)
    ]).catch(err => {
      console.error("[BE] Error sending WhatsApp notifications:", err);
    });
  }

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

export async function updateReservationStatus(id: string, status: "confirmed" | "cancelled" | "pending") {
  const supabase = await createClient();
  
  // 1. Fetch reservation details first to get phone and name
  const { data: reservation, error: fetchError } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !reservation) {
    console.error(`[BE] Error fetching reservation for notification:`, fetchError);
    return { success: false, message: "Reservasi tidak ditemukan." };
  }

  // 2. Update the status
  const { error: updateError } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id);

  if (updateError) {
    console.error(`[BE] Error updating status for ${id}:`, updateError);
    return { success: false, message: updateError.message };
  }

  // 3. If confirmed & QRIS, send confirmation WA
  if (status === "confirmed" && reservation.payment_method === "qris") {
    const confirmMsg = `*KONFIRMASI PEMBAYARAN & RESERVASI* 📸

Halo *${reservation.name}*, 
Pembayaran QRIS Anda sebesar *Rp ${reservation.total_price.toLocaleString('id-ID')}* telah kami terima dan diverifikasi. 

*Pesan untuk Anda:*
📅 Tanggal: ${format(new Date(reservation.date), "EEEE, dd MMMM yyyy", { locale: idLocale })}
⏰ Waktu: ${reservation.time} WITA

Terima kasih telah melakukan pembayaran. Sampai jumpa di studio! ✨`;

    fonnteService.sendMessage(reservation.phone, confirmMsg).catch(err => {
      console.error("[BE] Error sending QRIS confirmation WA:", err);
    });
  }

  revalidatePath("/dashboard/reservations");
  revalidatePath("/dashboard/pendapatan");
  return { success: true };
}


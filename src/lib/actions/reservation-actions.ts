"use server";

import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { revalidatePath } from "next/cache";
import { reservationService } from "@/lib/services/reservation-service";
import { fonnteService } from "@/lib/services/fonnte-service";
import { calculateTotalPrice } from "@/lib/utils/price";
import { isValidWhatsApp } from "@/lib/utils/validation";
import { ReservationSchema as FormSchema } from "@/lib/validations/reservation";

type ReservationInput = {
  name: string;
  phone: string;
  date: Date | string;
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
  
  // 1. Validate with Zod for better security/consistency
  const validation = FormSchema.safeParse({
    ...data,
  });

  if (!validation.success) {
    const errorMsg = validation.error.issues[0]?.message || "Data tidak valid";
    return { success: false, message: errorMsg };
  }

  const validatedData = validation.data;

  // Phone already normalized by Zod transform (08xxx → 628xxx)
  if (!isValidWhatsApp(validatedData.phone)) {
    return { success: false, message: "Nomor WhatsApp tidak valid. Gunakan awalan 62 (contoh: 62812...)." };
  }

  const dateStr = typeof validatedData.date === "string" ? validatedData.date : format(validatedData.date, "yyyy-MM-dd");

  console.log(`[BE] Handling reservation for ${dateStr} at ${validatedData.time}`);

  // Calculate Price Server Side
  const totalPrice = calculateTotalPrice({
    packageId: validatedData.package,
    extraPeopleCount: validatedData.extraPeopleCount,
    extraPrintCount: validatedData.extraPrintCount,
    addons: validatedData.addons
  });

  // 1. Use service for availability check
  try {
    const isBooked = await reservationService.checkSlotAvailability(dateStr, validatedData.time);
    if (isBooked) {
      return { success: false, message: "Maaf, slot ini sudah habis." };
    }
  } catch (err) {
    return { success: false, message: "Gagal mengecek ketersediaan." };
  }

  // 2. Insert the reservation
  const { error: insertError } = await supabase
    .from("reservations")
    .insert({
      name: validatedData.name,
      phone: validatedData.phone,
      date: dateStr,
      time: validatedData.time,
      package: validatedData.package,
      addons: validatedData.addons,
      extra_people_count: validatedData.extraPeopleCount || 0,
      extra_print_count: validatedData.extraPrintCount || 0,
      payment_method: validatedData.paymentMethod,
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
  const paymentStatus = validatedData.paymentMethod === "qris" 
    ? "Dibayar via QRIS (Menunggu Konfirmasi)" 
    : "Bayar di Studio (Tunai/QRIS)";

  // Parse dateStr (yyyy-MM-dd) carefully for formatted display
  const [y, m, d] = dateStr.split("-").map(Number);
  const displayDate = new Date(y, m - 1, d);

  const customerMsg = `*HIKARA PHOTOBOX - RESERVASI BERHASIL* 📸

Halo *${validatedData.name}*, 
Terima kasih telah melakukan reservasi di Hikara Photobox.

*Detail Reservasi:*
📅 Tanggal: ${format(displayDate, "EEEE, dd MMMM yyyy", { locale: idLocale })}
⏰ Waktu: ${validatedData.time} WITA
${validatedData.extraPeopleCount && validatedData.extraPeopleCount > 0 ? `👤 Tambahan Orang: ${validatedData.extraPeopleCount}\\n` : ""}${validatedData.extraPrintCount && validatedData.extraPrintCount > 0 ? `🖼️ Tambahan Print: ${validatedData.extraPrintCount}\\n` : ""}💳 Metode: *${validatedData.paymentMethod === 'qris' ? 'QRIS' : 'Tunai di Tempat'}*
💵 Total: *Rp ${totalPrice.toLocaleString('id-ID')}*
📝 Status: ${paymentStatus}

*Syarat & Ketentuan:*
1. Harap datang 5-10 menit sebelum jadwal sesi.
2. Tunjukkan pesan ini saat kedatangan.
${validatedData.paymentMethod === 'tunai' ? "3. Pembayaran diselesaikan di studio." : "3. Pembayaran sudah kami terima (via QRIS)."}

Sampai jumpa di studio! ✨`;

  const adminMsg = validatedData.paymentMethod === "qris" 
    ? `*KONFIRMASI PEMBAYARAN QRIS!* 💳 🔥
  
👤 Nama: ${validatedData.name}
📱 WA: ${validatedData.phone}
📅 Tanggal: ${format(displayDate, "dd MMM yyyy", { locale: idLocale })}
⏰ Waktu: ${validatedData.time}
💰 Total: *Rp ${totalPrice.toLocaleString('id-ID')}*
📎 Bukti: ${data.paymentProofUrl || "Tidak ada bukti terlampir"}

Segera cek dashboard untuk verifikasi bukti & konfirmasi!`
    : `*RESERVASI BARU (TUNAI)!* 💵 🔥
  
👤 Nama: ${validatedData.name}
📱 WA: ${validatedData.phone}
📅 Tanggal: ${format(displayDate, "dd MMM yyyy", { locale: idLocale })}
⏰ Waktu: ${validatedData.time}
💰 Total: Rp ${totalPrice.toLocaleString('id-ID')}

Konfirmasi kehadiran di dashboard admin.`;

  const adminPhone = process.env.ADMIN_PHONE;
  if (!adminPhone) {
    console.error("[BE] ADMIN_PHONE environment variable is NOT set!");
  } else {
    try {
      await Promise.all([
        fonnteService.sendMessage(validatedData.phone, customerMsg),
        fonnteService.sendMessage(adminPhone, adminMsg)
      ]);
    } catch (err) {
      console.error("[WA] Error sending notifications:", err);
      // We don't return error because the reservation is already saved in DB
    }
  }

  revalidatePath("/reservasi");
  revalidatePath("/dashboard/reservations");
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
    .select("name, phone, date, time, payment_method, total_price, status")
    .eq("id", id)
    .single();

  if (fetchError || !reservation) {
    console.error(`[BE] Error fetching reservation for notification:`, fetchError);
    return { success: false, message: "Reservasi tidak ditemukan." };
  }

  // 2. Add availability check if re-enabling a cancelled/rejected reservation
  const isMovingToActive = ["pending", "confirmed"].includes(status);
  const isCurrentlyActive = ["pending", "confirmed"].includes(reservation.status as string);

  if (isMovingToActive && !isCurrentlyActive) {
    const isBooked = await reservationService.checkSlotAvailability(
      reservation.date,
      reservation.time,
      id
    );
    if (isBooked) {
      return { 
        success: false, 
        message: `Maaf, slot waktu ${reservation.time} pada tanggal ${reservation.date} sudah terisi oleh reservasi lain.` 
      };
    }
  }

  // 3. Update the status
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
export async function deleteReservation(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`[BE] Error deleting reservation ${id}:`, error);
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/reservations");
  revalidatePath("/dashboard/pendapatan");
  return { success: true };
}

export async function editReservation(id: string, data: Partial<ReservationInput>) {
  const supabase = await createClient();
  
  if (!id) return { success: false, message: "ID tidak valid" };

  // 1. Validasi dengan Zod (Schema partial agar fleksibel)
  const validation = FormSchema.partial().safeParse(data);
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0].message };
  }

  const validatedData = validation.data;

  // 2. Ambil data saat ini untuk pembandingan dan perhitungan harga
  const { data: current, error: fetchError } = await supabase
    .from("reservations")
    .select("date, time, package, addons, extra_people_count, extra_print_count, total_price")
    .eq("id", id)
    .single();

  if (fetchError || !current) {
    return { success: false, message: "Reservasi tidak ditemukan." };
  }

  // 3. Jika tanggal/waktu diubah, cek ketersediaan (kecuali diri sendiri)
  const targetDate = validatedData.date 
    ? (typeof validatedData.date === "string" ? validatedData.date : format(validatedData.date, "yyyy-MM-dd")) 
    : current.date;
  const targetTime = validatedData.time || current.time;

  if (targetDate !== current.date || targetTime !== current.time) {
    try {
      const isBooked = await reservationService.checkSlotAvailability(targetDate, targetTime, id);
      if (isBooked) {
        return { success: false, message: "Maaf, slot waktu tersebut sudah terisi." };
      }
    } catch (err) {
      return { success: false, message: "Terjadi kesalahan saat mengecek ketersediaan slot." };
    }
  }

  // 4. Hitung ulang total price jika ada perubahan harga
  let updatedTotalPrice = current.total_price;
  const isPricingChanged = 
    validatedData.package !== undefined || 
    validatedData.addons !== undefined || 
    validatedData.extraPeopleCount !== undefined || 
    validatedData.extraPrintCount !== undefined;

  if (isPricingChanged) {
    updatedTotalPrice = calculateTotalPrice({
      packageId: validatedData.package !== undefined ? validatedData.package : current.package,
      extraPeopleCount: validatedData.extraPeopleCount !== undefined ? validatedData.extraPeopleCount : current.extra_people_count,
      extraPrintCount: validatedData.extraPrintCount !== undefined ? validatedData.extraPrintCount : current.extra_print_count,
      addons: validatedData.addons !== undefined ? validatedData.addons : current.addons || []
    });
  }

  // 5. Update data (only defined fields to be safe)
  const updatePayload: any = {
    date: targetDate,
    time: targetTime,
    total_price: updatedTotalPrice,
  };

  if (validatedData.name !== undefined) updatePayload.name = validatedData.name;
  if (validatedData.phone !== undefined) updatePayload.phone = validatedData.phone;
  if (validatedData.package !== undefined) updatePayload.package = validatedData.package;
  if (validatedData.addons !== undefined) updatePayload.addons = validatedData.addons;
  if (validatedData.extraPeopleCount !== undefined) updatePayload.extra_people_count = validatedData.extraPeopleCount;
  if (validatedData.extraPrintCount !== undefined) updatePayload.extra_print_count = validatedData.extraPrintCount;
  if (validatedData.paymentMethod !== undefined) updatePayload.payment_method = validatedData.paymentMethod;

  const { error: updateError } = await supabase
    .from("reservations")
    .update(updatePayload)
    .eq("id", id);

  if (updateError) {
    console.error(`[BE] Error updating reservation ${id}:`, updateError);
    return { success: false, message: "Gagal memperbarui reservasi." };
  }

  revalidatePath("/dashboard/reservations");
  revalidatePath("/dashboard/pendapatan");
  return { success: true, message: "Reservasi berhasil diperbarui." };
}

"use server";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { getCurrentUser } from "@/lib/services/auth-service";
import { fonnteService } from "@/lib/services/fonnte-service";
import {
  checkSlotAvailability,
  deleteReservation as deleteRes,
  getBookedSlots as fetchBookedSlots,
  getReservationById,
  insertReservation,
  updateReservation,
  updateReservationStatus as updateStatus,
} from "@/lib/services/reservation-service";
import { calculateTotalPrice } from "@/lib/utils/price";
import { ReservationSchema as FormSchema } from "@/lib/validations/reservation";

type ReservationInput = {
  name: string;
  phone: string;
  date: Date | string;
  time: string;
  package: string;
  addons: string[];
  extras?: Record<string, number>;
  extraPeopleCount?: number;
  extraPrintCount?: number;
  paymentMethod: "tunai" | "qris";
  paymentProofUrl?: string;
};

// ─── Submit ───

export async function submitReservation(data: ReservationInput) {
  // 1. Validate
  const validation = FormSchema.safeParse({ ...data });
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Data tidak valid",
    };
  }

  const validatedData = validation.data;

  const dateStr =
    typeof validatedData.date === "string"
      ? validatedData.date
      : format(validatedData.date, "yyyy-MM-dd");

  // 2. Price
  const totalPrice = await calculateTotalPrice({
    packageId: validatedData.package,
    extras: validatedData.extras,
    addons: validatedData.addons,
  });

  // 3. Availability check
  const isBooked = await checkSlotAvailability(dateStr, validatedData.time);
  if (isBooked) {
    return { success: false, message: "Maaf, slot ini sudah habis." };
  }

  // 4. Insert via service — use explicit counts from form (extras JSONB is source of truth)
  const totalExtras = Object.values(validatedData.extras ?? {}).reduce((a, b) => a + b, 0);
  const result = await insertReservation({
    name: validatedData.name,
    phone: validatedData.phone,
    date: dateStr,
    time: validatedData.time,
    package: validatedData.package,
    addons: validatedData.addons ?? [],
    extras: validatedData.extras ?? {},
    extra_people_count: validatedData.extraPeopleCount ?? totalExtras,
    // ponytail: extra_people_count sums ALL extras (people+prints). When pricing supports
    // per-category extra counts, split by matching pricing items with category="extra" + fuzzy label.
    extra_print_count: validatedData.extraPrintCount ?? 0,
    payment_method: validatedData.paymentMethod,
    payment_proof_url: validatedData.paymentProofUrl ?? null,
    total_price: totalPrice,
    is_walk_in: false,
    status: "pending",
    created_at: new Date().toISOString(),
  });

  if (result.error)
    return { success: false, message: `Gagal menyimpan: ${result.error}` };

  // 5. WhatsApp notifications (async, don't block)
  sendReservationNotifications(
    validatedData,
    dateStr,
    totalPrice,
    data.paymentProofUrl,
  ).catch((err) => console.error("[WA] Error sending notifications:", err));

  // 6. Revalidate
  updateTag(CACHE_TAGS.reservations);
  updateTag(CACHE_TAGS.bookedSlots(dateStr));
  revalidatePath("/dashboard/reservations");

  return {
    success: true,
    message:
      "Reservasi berhasil dikirim! Kami akan menghubungi Anda via WhatsApp.",
  };
}

// ─── Update status ───

export async function updateReservationStatus(
  id: string,
  status: "confirmed" | "cancelled" | "pending",
) {
  // 0. Auth check
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Unauthorized" };

  // 1. Fetch current reservation
  const reservation = await getReservationById(id);
  if (!reservation)
    return { success: false, message: "Reservasi tidak ditemukan." };

  // 2. Check availability if reactivating
  const isMovingToActive = ["pending", "confirmed"].includes(status);
  const isCurrentlyActive = ["pending", "confirmed"].includes(
    reservation.status as string,
  );

  if (isMovingToActive && !isCurrentlyActive) {
    const isBooked = await checkSlotAvailability(
      reservation.date,
      reservation.time,
      id,
    );
    if (isBooked) {
      return {
        success: false,
        message: `Maaf, slot waktu ${reservation.time} pada tanggal ${reservation.date} sudah terisi oleh reservasi lain.`,
      };
    }
  }

  // 3. Update via service
  const result = await updateStatus(id, status);
  if (result.error) return { success: false, message: result.error };

  // 4. QRIS confirmation WA
  if (status === "confirmed" && reservation.payment_method === "qris") {
    const confirmMsg = `*KONFIRMASI PEMBAYARAN & RESERVASI* 📸

Halo *${reservation.name}*, 
Pembayaran QRIS Anda sebesar *Rp ${reservation.total_price?.toLocaleString("id-ID") ?? "0"}* telah kami terima dan diverifikasi. 

*Pesan untuk Anda:*
📅 Tanggal: ${format(new Date(reservation.date), "EEEE, dd MMMM yyyy", { locale: idLocale })}
⏰ Waktu: ${reservation.time} WITA

Terima kasih telah melakukan pembayaran. Sampai jumpa di studio! ✨`;

    fonnteService.sendMessage(reservation.phone, confirmMsg).catch((err) => {
      console.error("[BE] Error sending QRIS confirmation WA:", err);
    });
  }

  // 5. Revalidate
  updateTag(CACHE_TAGS.reservations);
  updateTag(CACHE_TAGS.bookedSlots(reservation.date));
  revalidatePath("/dashboard/reservations");
  revalidatePath("/dashboard/pendapatan");

  return { success: true };
}

// ─── Delete ───

export async function deleteReservation(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Unauthorized" };

  // Fetch first to get date for bookedSlots invalidation
  const reservation = await getReservationById(id);
  if (!reservation)
    return { success: false, message: "Reservasi tidak ditemukan." };

  const result = await deleteRes(id);
  if (result.error) return { success: false, message: result.error };

  updateTag(CACHE_TAGS.reservations);
  updateTag(CACHE_TAGS.bookedSlots(reservation.date));
  revalidatePath("/dashboard/reservations");
  revalidatePath("/dashboard/pendapatan");
  return { success: true };
}

// ─── Edit ───

export async function editReservation(
  id: string,
  data: Partial<ReservationInput>,
) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Unauthorized" };
  if (!id) return { success: false, message: "ID tidak valid" };

  // 1. Validate
  const validation = FormSchema.partial().safeParse(data);
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const validatedData = validation.data;

  // 2. Fetch current
  const current = await getReservationById(id);
  if (!current)
    return { success: false, message: "Reservasi tidak ditemukan." };

  // 3. Check slot if date/time changed
  const targetDate = validatedData.date
    ? typeof validatedData.date === "string"
      ? validatedData.date
      : format(validatedData.date, "yyyy-MM-dd")
    : current.date;
  const targetTime = validatedData.time || current.time;

  if (targetDate !== current.date || targetTime !== current.time) {
    const isBooked = await checkSlotAvailability(targetDate, targetTime, id);
    if (isBooked)
      return {
        success: false,
        message: "Maaf, slot waktu tersebut sudah terisi.",
      };
  }

  // 4. Recalculate price if pricing-relevant fields actually CHANGED
  //    Use the raw `data` keys, not zod's default-filled validatedData
  const rawKeys = Object.keys(data) as (keyof ReservationInput)[];
  const pricingKeys: (keyof ReservationInput)[] = [
    "package", "addons", "extras", "extraPeopleCount", "extraPrintCount",
  ];
  const isPricingChanged = pricingKeys.some((k) => rawKeys.includes(k));

  let updatedTotalPrice = current.total_price;
  if (isPricingChanged) {
    updatedTotalPrice = await calculateTotalPrice({
      packageId: validatedData.package ?? current.package,
      extras: validatedData.extras ?? current.extras ?? {},
      addons: validatedData.addons ?? current.addons ?? [],
    });
  }

  // 5. Build payload — only fields in raw input
  const payload: Record<string, unknown> = {
    date: targetDate,
    time: targetTime,
    total_price: updatedTotalPrice,
  };
  if ("name" in data) payload.name = validatedData.name;
  if ("phone" in data) payload.phone = validatedData.phone;
  if ("package" in data) payload.package = validatedData.package;
  if ("addons" in data) payload.addons = validatedData.addons;
  if ("extraPeopleCount" in data)
    payload.extra_people_count = validatedData.extraPeopleCount;
  if ("extraPrintCount" in data)
    payload.extra_print_count = validatedData.extraPrintCount;
  if ("extras" in data) payload.extras = validatedData.extras;
  if ("paymentMethod" in data)
    payload.payment_method = validatedData.paymentMethod;

  // 6. Update via service
  const result = await updateReservation(id, payload);
  if (result.error)
    return { success: false, message: "Gagal memperbarui reservasi." };

  // 7. Revalidate (invalidate BOTH old and new date slots)
  updateTag(CACHE_TAGS.reservations);
  updateTag(CACHE_TAGS.bookedSlots(targetDate));
  if (current.date !== targetDate) {
    updateTag(CACHE_TAGS.bookedSlots(current.date));
  }
  revalidatePath("/dashboard/reservations");
  revalidatePath("/dashboard/pendapatan");

  return { success: true, message: "Reservasi berhasil diperbarui." };
}

// ─── Helper: WhatsApp notifications ───
// ─── Re-export for client components ───

export async function getBookedSlots(date: string): Promise<string[]> {
  try {
    return await fetchBookedSlots(date);
  } catch (err: unknown) {
    console.error(`[BE] Error fetching slots for ${date}:`, err);
    return [];
  }
}

async function sendReservationNotifications(
  data: ReservationInput,
  dateStr: string,
  totalPrice: number,
  paymentProofUrl?: string,
) {
  const paymentStatus =
    data.paymentMethod === "qris"
      ? "Dibayar via QRIS (Menunggu Konfirmasi)"
      : "Bayar di Studio (Tunai/QRIS)";

  const [y, m, d] = dateStr.split("-").map(Number);
  const displayDate = new Date(y, m - 1, d);

  const customerMsg = `*HIKARA PHOTOBOX - RESERVASI BERHASIL* 📸

Halo *${data.name}*, 
Terima kasih telah melakukan reservasi di Hikara Photobox.

*Detail Reservasi:*
📅 Tanggal: ${format(displayDate, "EEEE, dd MMMM yyyy", { locale: idLocale })}
⏰ Waktu: ${data.time} WITA
${data.extraPeopleCount && data.extraPeopleCount > 0 ? `👤 Tambahan Orang: ${data.extraPeopleCount}\n` : ""}${data.extraPrintCount && data.extraPrintCount > 0 ? `🖼️ Tambahan Print: ${data.extraPrintCount}\n` : ""}💳 Metode: *${data.paymentMethod === "qris" ? "QRIS" : "Tunai di Tempat"}*
💵 Total: *Rp ${totalPrice.toLocaleString("id-ID")}*
📝 Status: ${paymentStatus}

*Syarat & Ketentuan:*
1. Harap datang 5-10 menit sebelum jadwal sesi.
2. Tunjukkan pesan ini saat kedatangan.
${data.paymentMethod === "tunai" ? "3. Pembayaran diselesaikan di studio." : "3. Pembayaran sudah kami terima (via QRIS)."}

Sampai jumpa di studio! ✨`;

  const adminMsg =
    data.paymentMethod === "qris"
      ? `*KONFIRMASI PEMBAYARAN QRIS!* 💳 🔥
  
👤 Nama: ${data.name}
📱 WA: ${data.phone}
📅 Tanggal: ${format(displayDate, "dd MMM yyyy", { locale: idLocale })}
⏰ Waktu: ${data.time}
💰 Total: *Rp ${totalPrice.toLocaleString("id-ID")}*
📎 Bukti: ${paymentProofUrl || "Tidak ada bukti terlampir"}

Segera cek dashboard untuk verifikasi bukti & konfirmasi!`
      : `*RESERVASI BARU (TUNAI)!* 💵 🔥
  
👤 Nama: ${data.name}
📱 WA: ${data.phone}
📅 Tanggal: ${format(displayDate, "dd MMM yyyy", { locale: idLocale })}
⏰ Waktu: ${data.time}
💰 Total: Rp ${totalPrice.toLocaleString("id-ID")}

Konfirmasi kehadiran di dashboard admin.`;

  const adminPhone = process.env.ADMIN_PHONE;
  if (!adminPhone) {
    console.error("[BE] ADMIN_PHONE environment variable is NOT set!");
    return;
  }

  await Promise.all([
    fonnteService.sendMessage(data.phone, customerMsg),
    fonnteService.sendMessage(adminPhone, adminMsg),
  ]);
}

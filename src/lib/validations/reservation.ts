import * as z from "zod";
import { normalizePhoneNumber } from "../utils/validation";

export const ReservationSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek"),
  phone: z
    .string()
    .min(10, "Nomor WhatsApp minimal 10 digit (contoh: 812...)")
    .max(16, "Nomor WhatsApp maksimal 15 digit")
    .transform((val: string) => normalizePhoneNumber(val))
    .refine((val: string) => /^62[2-9]\d{7,12}$/.test(val), {
      message: "Nomor WhatsApp tidak valid (Gunakan format Indonesia)",
    }),
  date: z.union([
    z.instanceof(Date, { message: "Pilih tanggal reservasi" }),
    z.string().min(1, "Pilih tanggal reservasi")
  ]),
  time: z.string()
    .min(1, "Pilih waktu sesi")
    .refine((val) => {
      const parts = val.split(":");
      const hour = parseInt(parts[0], 10);
      const minute = parseInt(parts[1], 10);
      if (hour < 14) return false;
      if (hour > 23) return false;
      if (hour === 23 && minute > 0) return false;
      // Only allow :00 or :30
      if (minute !== 0 && minute !== 30) return false;
      return true;
    }, "Jam sesi harus antara 14:00 - 23:00 (Interval 30 menit)"),
  package: z.string().min(1, "Pilih paket"),
  addons: z.array(z.string()).default([]),
  extraPeopleCount: z.number().min(0).max(5).default(0),
  extraPrintCount: z.number().min(0).max(10).default(0),
  paymentMethod: z.enum(["tunai", "qris"]),
  paymentProof: z.any().optional(),
});

export type ReservationValues = z.output<typeof ReservationSchema>;

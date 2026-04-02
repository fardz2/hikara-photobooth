import * as z from "zod";

export const ReservationSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek"),
  phone: z
    .string()
    .min(10, "Nomor WhatsApp minimal 10 digit (contoh: 62812...)")
    .max(15, "Nomor WhatsApp maksimal 15 digit")
    .regex(/^62\d+$/, "Nomor WhatsApp tidak valid. Gunakan awalan 62 (contoh: 62812...)"),
  date: z.instanceof(Date, { message: "Pilih tanggal reservasi" }),
  time: z.string()
    .min(1, "Pilih waktu sesi")
    .refine((val) => {
      const parts = val.split(":");
      const hour = parseInt(parts[0], 10);
      const minute = parseInt(parts[1], 10);
      if (hour < 14) return false;
      if (hour > 23) return false;
      if (hour === 23 && minute > 0) return false;
      return true;
    }, "Jam sesi harus antara 14:00 - 23:00"),
  package: z.string().min(1, "Pilih paket"),
  addons: z.array(z.string()).default([]),
  extraPeopleCount: z.number().min(0).max(5).default(0),
  extraPrintCount: z.number().min(0).max(10).default(0),
  paymentMethod: z.enum(["tunai", "qris"]),
  paymentProof: z.any().optional(),
});

export type ReservationValues = z.output<typeof ReservationSchema>;

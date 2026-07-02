import * as z from "zod";

export const TransactionSchema = z.object({
  customerName: z.string().min(1, "Nama pelanggan wajib diisi"),
  sessionTime: z
    .string()
    .regex(/^([0-9]{2}:[0-9]{2})(:[0-9]{2})?$/, "Format jam tidak valid"),
  package: z.string().min(1, "Pilih paket"),
  addons: z.array(z.string()).default([]),
  extras: z.record(z.string(), z.number().min(0)).default({}),
  paymentMethod: z.enum(["tunai", "qris"]),
});

export interface TransactionValues {
  customerName: string;
  sessionTime: string;
  package: string;
  addons: string[];
  extras: Record<string, number>;
  paymentMethod: "tunai" | "qris";
}

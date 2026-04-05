import * as z from "zod";

export const TransactionSchema = z.object({
  customerName: z.string().min(1, "Nama pelanggan wajib diisi"),
  sessionTime: z.string()
    .regex(/^([0-9]{2}:[0-9]{2})(:[0-9]{2})?$/, "Format jam tidak valid"),
  package: z.string().min(1, "Pilih paket"),
  addons: z.array(z.string()),
  extraPeopleCount: z.number().min(0).max(5),
  extraPrintCount: z.number().min(0).max(10),
  paymentMethod: z.enum(["tunai", "qris"]),
});

export interface TransactionValues {
  customerName: string;
  sessionTime: string;
  package: string;
  addons: string[];
  extraPeopleCount: number;
  extraPrintCount: number;
  paymentMethod: "tunai" | "qris";
}

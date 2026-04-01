import * as z from "zod";

export const TransactionSchema = z.object({
  customerName: z.string().min(1, "Nama pelanggan wajib diisi"),
  package: z.string().min(1, "Pilih paket"),
  addons: z.array(z.string()),
  extraPeopleCount: z.number().min(0).max(5),
  extraPrintCount: z.number().min(0).max(10),
  paymentMethod: z.enum(["tunai", "qris_manual"]),
});

export interface TransactionValues {
  customerName: string;
  package: string;
  addons: string[];
  extraPeopleCount: number;
  extraPrintCount: number;
  paymentMethod: "tunai" | "qris_manual";
}

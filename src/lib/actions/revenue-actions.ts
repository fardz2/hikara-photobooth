"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { getCurrentUser } from "@/lib/services/auth-service";
import {
  logTransaction as insertTransaction,
  type TransactionInput,
} from "@/lib/services/revenue-service";
import { TransactionSchema } from "@/lib/validations/revenue";

export type { TransactionInput };

export async function logTransaction(data: TransactionInput) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Unauthorized" };

  // Validate amount separately (not in form schema)
  if (typeof data.amount !== "number" || data.amount < 0) {
    return { success: false, message: "Harga tidak valid" };
  }

  // 1. Validate form fields
  const validation = TransactionSchema.safeParse({
    customerName: data.customer_name,
    sessionTime: data.session_time,
    package: data.package,
    addons: data.addons ?? [],
    extras: data.extras ?? {},
    paymentMethod: data.payment_method,
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Data tidak valid",
    };
  }

  // Build payload from VALIDATED data (not raw input)
  const v = validation.data;
  const payload: TransactionInput = {
    customer_name: v.customerName ?? "Walk-in Customer",
    session_time: v.sessionTime,
    package: v.package,
    payment_method: v.paymentMethod,
    amount: data.amount,
    addons: v.addons ?? [],
    extras: v.extras ?? {},
  };

  // 2. Call service
  const result = await insertTransaction(payload);
  if (result.error) return { success: false, message: result.error };

  // 3. Revalidate
  updateTag(CACHE_TAGS.reservations);
  revalidatePath("/dashboard/pendapatan");
  revalidatePath("/dashboard/reservations");
  return { success: true };
}

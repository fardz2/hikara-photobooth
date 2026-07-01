"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import {
  logTransaction as insertTransaction,
  type TransactionInput,
} from "@/lib/services/revenue-service";
import { TransactionSchema } from "@/lib/validations/revenue";
import { getCurrentUser } from "@/lib/services/auth-service";

export type { TransactionInput };

export async function logTransaction(data: TransactionInput) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Unauthorized" };
  // 1. Validate
  const validation = TransactionSchema.safeParse({
    customerName: data.customer_name || "Walk-in Customer",
    sessionTime: data.session_time,
    package: data.package,
    addons: data.addons || [],
    paymentMethod: data.payment_method,
    extraPeopleCount: data.extra_people_count || 0,
    extraPrintCount: data.extra_print_count || 0,
  });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Data tidak valid",
    };
  }

  // 2. Call service
  const result = await insertTransaction(data);
  if (result.error) return { success: false, message: result.error };

  // 3. Revalidate
  updateTag(CACHE_TAGS.reservations);
  revalidatePath("/dashboard/pendapatan");
  revalidatePath("/dashboard/reservations");
  return { success: true };
}

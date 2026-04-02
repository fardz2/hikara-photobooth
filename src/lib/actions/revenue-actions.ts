"use server";

import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export type TransactionInput = {
  package: string;
  payment_method: "tunai" | "qris";
  amount: number;
  addons?: string[];
  customer_name?: string;
  session_time?: string;
  extra_people_count?: number;
  extra_print_count?: number;
};

export async function logTransaction(data: TransactionInput) {
  const supabase = await createClient();
  
  const { error } = await supabase.from("reservations").insert({
    name: data.customer_name || "Walk-in Customer",
    phone: "620000000000",
    date: format(new Date(), "yyyy-MM-dd"),
    time: data.session_time ?? format(new Date(), "HH:mm"),
    package: data.package,
    addons: data.addons || [], 
    payment_method: data.payment_method,
    total_price: data.amount,
    extra_people_count: data.extra_people_count || 0,
    extra_print_count: data.extra_print_count || 0,
    is_walk_in: true,
    status: "confirmed",
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error logging transaction:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/pendapatan");
  revalidatePath("/dashboard/reservations");
  return { success: true };
}

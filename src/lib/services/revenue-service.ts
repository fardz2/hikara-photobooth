import { format } from "date-fns";
import { getPricing } from "@/lib/services/site-content-service";
import { createClient } from "@/lib/supabase/server";
import { formatRevenueStats } from "@/lib/utils/revenue";

// ─── Read: admin, no cache ───

export async function getRevenueStats(from: string, to: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "total_price, payment_method, date, extra_print_count, extra_people_count",
    )
    .gte("date", from)
    .lte("date", to)
    .eq("status", "confirmed");

  if (error || !data) return null;

  const pricing = await getPricing();
  return formatRevenueStats(data, pricing);
}

// ─── Write ───

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

  if (error) return { error: error.message };
  return { success: true };
}

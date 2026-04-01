import { createClient } from "@/lib/supabase/server";
import { formatRevenueStats } from "@/lib/utils/revenue";

export const revenueService = {
  async getRevenueStats(from: string, to: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("reservations")
      .select("total_price, payment_method, date, extra_print_count, extra_people_count")
      .gte("date", from)
      .lte("date", to)
      .eq("status", "confirmed");

    if (error || !data) return null;

    return formatRevenueStats(data);
  },
};

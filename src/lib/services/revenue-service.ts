import { createClient } from "@/lib/supabase/server";
import { format, startOfMonth, endOfMonth } from "date-fns";

export const revenueService = {
  async getRevenueStats() {
    const supabase = await createClient();
    
    const today = format(new Date(), "yyyy-MM-dd");
    const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

    const { data: todayData, error: todayError } = await supabase
      .from("reservations")
      .select("total_price, payment_method")
      .eq("date", today)
      .eq("status", "confirmed");

    const { data: monthData, error: monthError } = await supabase
      .from("reservations")
      .select("total_price, payment_method")
      .gte("date", monthStart)
      .lte("date", monthEnd)
      .eq("status", "confirmed");

    if (todayError || monthError) return null;

    const calculateTotal = (data: any[]) => {
      return data.reduce((acc, row) => acc + (row.total_price || 0), 0);
    };

    const getBreakdown = (data: any[]) => {
      const breakdown = { tunai: 0, qris_manual: 0 };
      data.forEach(row => {
        if (row.payment_method === "qris_manual") {
          breakdown.qris_manual += (row.total_price || 0);
        } else {
          breakdown.tunai += (row.total_price || 0);
        }
      });
      return breakdown;
    };

    return {
      today: calculateTotal(todayData || []),
      month: calculateTotal(monthData || []),
      breakdown: getBreakdown(todayData || []),
    };
  }
};

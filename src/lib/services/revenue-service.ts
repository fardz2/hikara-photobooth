import { createClient } from "@/lib/supabase/server";

export const revenueService = {
  async getRevenueStats(from: string, to: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("reservations")
      .select("total_price, payment_method, date")
      .gte("date", from)
      .lte("date", to)
      .eq("status", "confirmed");

    if (error || !data) return null;

    const total = data.reduce((acc, row) => acc + (row.total_price || 0), 0);

    const breakdown = data.reduce(
      (acc, row) => {
        if (row.payment_method === "qris_manual") {
          acc.qris_manual += row.total_price || 0;
        } else {
          acc.tunai += row.total_price || 0;
        }
        return acc;
      },
      { tunai: 0, qris_manual: 0 }
    );

    const countByDate: Record<string, number> = {};
    data.forEach((row) => {
      const d = row.date as string;
      countByDate[d] = (countByDate[d] || 0) + (row.total_price || 0);
    });

    return {
      total,
      breakdown,
      transactionCount: data.length,
      chartData: Object.entries(countByDate)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  },
};

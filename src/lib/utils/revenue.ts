export interface RawRevenueRow {
  total_price: number | null;
  payment_method: string | null;
  date: string | null;
  extra_print_count: number | null;
  extra_people_count: number | null;
}

export interface RevenueStats {
  total: number;
  breakdown: {
    tunai: number;
    qris: number;
    extraPrint: number;
    extraPeople: number;
  };
  transactionCount: number;
  chartData: { date: string, amount: number }[];
}

/**
 * Pure function to format and aggregate revenue data from raw database rows.
 */
export function formatRevenueStats(data: RawRevenueRow[]): RevenueStats {
  const total = data.reduce((acc, row) => acc + (row.total_price || 0), 0);

  const breakdown = data.reduce(
    (acc, row) => {
      const price = row.total_price || 0;
      if (row.payment_method === "qris_manual" || row.payment_method === "qris") {
        acc.qris += price;
      } else {
        acc.tunai += price;
      }
      
      // Calculate specific addon revenues (using fixed prices from business logic)
      acc.extraPrint += (row.extra_print_count || 0) * 10000;
      acc.extraPeople += (row.extra_people_count || 0) * 5000;
      
      return acc;
    },
    { tunai: 0, qris: 0, extraPrint: 0, extraPeople: 0 }
  );

  const countByDate: Record<string, number> = {};
  data.forEach((row) => {
    const d = row.date || 'unknown';
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
}

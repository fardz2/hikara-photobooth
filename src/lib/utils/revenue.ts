import type { PricingItem } from "../services/pricing-service";

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
  chartData: { date: string; amount: number }[];
}

/**
 * Pure function to format and aggregate revenue data from raw database rows.
 * Pricing is passed in as a parameter (pre-fetched from DB).
 */
export function formatRevenueStats(
  data: RawRevenueRow[],
  pricing: PricingItem[],
): RevenueStats {
  const total = data.reduce((acc, row) => acc + (row.total_price || 0), 0);

  const extraPerson = pricing.find(
    (p) =>
      p.label.toLowerCase().includes("tambahan") &&
      p.label.toLowerCase().includes("orang"),
  ) ||
    pricing.find(
      (p) => !p.maxQty && p.label.toLowerCase().includes("orang"),
    ) || { price: 5000 };
  const extraPrint = pricing.find(
    (p) =>
      p.label.toLowerCase().includes("extra") &&
      p.label.toLowerCase().includes("print"),
  ) ||
    pricing.find(
      (p) => p.label.toLowerCase().includes("print") && !p.maxQty,
    ) || { price: 10000 };
  const extraPersonPrice = extraPerson.price;
  const extraPrintPrice = extraPrint.price;

  const breakdown = data.reduce(
    (acc, row) => {
      const price = row.total_price || 0;
      if (row.payment_method === "qris") {
        acc.qris += price;
      } else {
        acc.tunai += price;
      }
      acc.extraPrint += (row.extra_print_count || 0) * extraPrintPrice;
      acc.extraPeople += (row.extra_people_count || 0) * extraPersonPrice;
      return acc;
    },
    { tunai: 0, qris: 0, extraPrint: 0, extraPeople: 0 },
  );

  const countByDate: Record<string, number> = {};
  data.forEach((row) => {
    const d = row.date || "unknown";
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

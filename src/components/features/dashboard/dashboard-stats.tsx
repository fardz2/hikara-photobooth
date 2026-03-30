import { createClient } from "@/lib/supabase/server";
import { parseDateRangeParams } from "@/lib/utils/date-range";
import { connection } from "next/server";

interface Props {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

export const DashboardStats = async ({ searchParams }: Props) => {
  await connection();

  const params = await searchParams;
  const { from, to, label } = parseDateRangeParams(params);

  const supabase = await createClient();

  const [
    { count: totalReservations },
    { count: confirmedCount },
    { count: pendingReservations },
    { data: revenueData },
  ] = await Promise.all([
    supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .gte("date", from)
      .lte("date", to),
    supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .gte("date", from)
      .lte("date", to)
      .eq("status", "confirmed"),
    supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .gte("date", from)
      .lte("date", to)
      .eq("status", "pending"),
    supabase
      .from("reservations")
      .select("total_price")
      .gte("date", from)
      .lte("date", to)
      .eq("status", "confirmed"),
  ]);

  const totalRevenue = (revenueData ?? []).reduce(
    (acc, row) => acc + (row.total_price || 0),
    0
  );

  const stats = [
    {
      label: "Total Reservasi",
      sublabel: label,
      value: totalReservations || 0,
      color: "text-[#2C2A29]",
      format: "number",
    },
    {
      label: "Terkonfirmasi",
      sublabel: label,
      value: confirmedCount || 0,
      color: "text-emerald-600",
      format: "number",
    },
    {
      label: "Permintaan Pending",
      sublabel: label,
      value: pendingReservations || 0,
      color: "text-amber-600",
      format: "number",
    },
    {
      label: "Total Pendapatan",
      sublabel: label,
      value: totalRevenue,
      color: "text-[#8B5E56]",
      format: "currency",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="relative bg-white p-6 border border-[#2C2A29]/10 overflow-hidden group transition-all duration-300 hover:border-[#2C2A29]/30"
        >
          {/* Subtle noise/gradient background on hover */}
          <div className="absolute inset-0 bg-linear-to-br from-transparent to-[#2C2A29]/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-8">
              <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#5A5550]">
                {stat.label}
              </span>
            </div>
            
            <div className="flex flex-col gap-1 items-start text-left">
              <span className={`font-heading text-4xl tracking-tight ${stat.color}`}>
                {stat.format === "currency"
                  ? `Rp ${stat.value.toLocaleString("id-ID")}`
                  : stat.value}
              </span>
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#5A5550]/40 mt-1 font-medium">
                {stat.sublabel}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

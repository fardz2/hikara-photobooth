import { createClient } from "@/lib/supabase/server";
import { revenueService } from "@/lib/services/revenue-service";
import { parseDateRangeParams } from "@/lib/utils/date-range";
import { RevenueChart } from "@/components/features/revenue/revenue-chart";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { connection } from "next/server";

interface Props {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

export async function DashboardOverviewData({ searchParams }: Props) {
  await connection();
  const params = await searchParams;
  const { from, to } = parseDateRangeParams(params);

  const [revenueStats, recentReservations] = await Promise.all([
    revenueService.getRevenueStats(from, to),
    createClient().then((c) =>
      c
        .from("reservations")
        .select("id, name, status, total_price, date, time")
        .order("created_at", { ascending: false })
        .limit(6)
    ),
  ]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Main Chart Area */}
      <div className="xl:col-span-2 bg-white p-8 border border-[#2C2A29]/10">
        <h3 className="text-xs tracking-widest uppercase font-bold text-[#2C2A29] mb-8 pb-4 border-b border-[#2C2A29]/5">
          Tren Arus Kas
        </h3>
        {revenueStats && revenueStats.chartData.length > 0 ? (
          <RevenueChart data={revenueStats.chartData} />
        ) : (
          <div className="h-64 flex items-center justify-center text-[10px] uppercase tracking-widest text-[#5A5550]/40 font-bold">
            Belum ada data pendapatan
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="xl:col-span-1 bg-white p-8 border border-[#2C2A29]/10 flex flex-col h-full">
        <h3 className="text-xs tracking-widest uppercase font-bold text-[#2C2A29] mb-8 pb-4 border-b border-[#2C2A29]/5">
          Aktivitas Terbaru
        </h3>
        <div className="flex-1 space-y-6">
          {recentReservations.data?.map((res, i) => {
            const firstLetter = res.name ? res.name.charAt(0).toUpperCase() : "?";
            return (
              <div
                key={res.id || i}
                className="flex items-center gap-4 group border-b border-[#2C2A29]/5 pb-4 last:border-0 last:pb-0 hover:bg-[#F6F4F0]/30 transition-colors p-2 -mx-2"
              >
                {/* Initials Avatar */}
                <div className="w-10 h-10 shrink-0 bg-[#2C2A29] flex items-center justify-center">
                  <span className="text-white text-xs font-bold font-heading">{firstLetter}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-xs font-bold text-[#2C2A29] truncate pr-2">
                      {res.name || "Tanpa Nama"}
                    </p>
                    <p className="text-xs font-bold text-[#2C2A29] shrink-0">
                      Rp {res.total_price?.toLocaleString("id-ID") || 0}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] text-[#5A5550]/80 uppercase tracking-widest truncate">
                      {res.date ? format(new Date(res.date), "dd MMM", { locale: id }) : "-"} •{" "}
                      {res.time || "-"}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1 h-1 rounded-full ${
                        res.status === "confirmed" ? "bg-emerald-500" : res.status === "cancelled" ? "bg-red-500" : "bg-amber-500"
                      }`} />
                      <span
                        className={`text-[8px] uppercase tracking-[0.15em] font-bold ${
                          res.status === "confirmed"
                            ? "text-emerald-700"
                            : res.status === "cancelled"
                            ? "text-red-700"
                            : "text-amber-700"
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {!recentReservations.data?.length && (
            <p className="text-xs text-[#5A5550]/60 italic uppercase tracking-widest text-center mt-12">
              Belum ada aktivitas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

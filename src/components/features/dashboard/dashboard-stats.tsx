import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { connection } from "next/server";

export const DashboardStats = async () => {
  // Opt-out of cache for real-time dashboard data
  await connection();
  
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const [
    { count: totalReservations },
    { count: todayReservations },
    { count: pendingReservations }
  ] = await Promise.all([
    supabase.from("reservations").select("*", { count: "exact", head: true }),
    supabase.from("reservations").select("*", { count: "exact", head: true }).eq("date", today),
    supabase.from("reservations").select("*", { count: "exact", head: true }).eq("status", "pending")
  ]);

  const stats = [
    { label: "Total Reservasi", value: totalReservations || 0, color: "text-[#2C2A29]" },
    { label: "Sesi Hari Ini", value: todayReservations || 0, color: "text-[#8B5E56]" },
    { label: "Permintaan Pending", value: pendingReservations || 0, color: "text-amber-600" },
  ];


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-8 border border-[#2C2A29]/5 shadow-sm flex flex-col items-center text-center">
          <span className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#5A5550]/60 mb-4">{stat.label}</span>
          <span className={`font-heading text-5xl ${stat.color}`}>{stat.value}</span>
        </div>
      ))}
    </div>
  );
};

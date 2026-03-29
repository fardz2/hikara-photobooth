import { Suspense } from "react";
import { DashboardStats } from "@/components/features/dashboard/dashboard-stats";
import { DashboardStatsSkeleton } from "@/components/skeletons/dashboard-stats-skeleton";

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl text-[#2C2A29] tracking-tight mb-2">Overview</h1>
        <p className="text-sm text-[#5A5550] uppercase tracking-widest opacity-80">Selamat datang kembali di pusat kendali Anda.</p>
      </div>

      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      <div className="bg-white p-8 md:p-12 border border-[#2C2A29]/5 mt-12">
        <h3 className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#2C2A29] mb-8 pb-4 border-b border-[#2C2A29]/5">Aktivitas Terbaru</h3>
        <p className="text-xs text-[#5A5550]/60 italic uppercase tracking-widest">Aktivitas terbaru akan muncul di sini segera setelah tersedia.</p>
      </div>
    </div>
  );
}


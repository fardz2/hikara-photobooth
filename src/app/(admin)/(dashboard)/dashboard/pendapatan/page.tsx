import { Suspense } from "react";
import { RevenueStats } from "@/components/features/revenue/revenue-stats";
import { RevenueStatsSkeleton } from "@/components/skeletons/revenue-stats-skeleton";

export default function PendapatanPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-heading text-[#2C2A29] uppercase tracking-tight">Pemantauan Pendapatan</h1>
        <p className="text-xs text-[#5A5550] tracking-widest uppercase mt-2 opacity-60">Laporan Keuangan Real-time Hikara</p>
      </div>

      <Suspense fallback={<RevenueStatsSkeleton />}>
        <RevenueStats />
      </Suspense>
    </div>
  );
}

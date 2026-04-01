import { Suspense } from "react";
import { RevenueStats } from "@/components/features/revenue/revenue-stats";
import { RecentTransactions } from "@/components/features/revenue/recent-transactions";
import { RevenueStatsSkeleton } from "@/components/skeletons/revenue-stats-skeleton";
import { DateRangeFilter } from "@/components/ui/date-range-filter";

interface Props {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

export default async function PendapatanPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-[#2C2A29] uppercase tracking-tight">
            Pemantauan Pendapatan
          </h1>
          <p className="text-xs text-[#5A5550] tracking-widest uppercase mt-2 opacity-60">
            Laporan Keuangan Real-time Hikara
          </p>
        </div>
        <Suspense>
          <DateRangeFilter defaultRange="month" />
        </Suspense>
      </div>

      <Suspense fallback={<RevenueStatsSkeleton />}>
        <RevenueStats searchParams={params} />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse bg-white/50 border border-dashed border-[#2C2A29]/10" />}>
        <RecentTransactions searchParams={params} />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import { RevenueStats } from "@/components/features/revenue/revenue-stats";
import { RevenueStatsSkeleton } from "@/components/skeletons/revenue-stats-skeleton";
import { DateRangeFilter } from "@/components/ui/date-range-filter";

interface Props {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

export default function PendapatanPage({ searchParams }: Props) {
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
        <RevenueStats searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

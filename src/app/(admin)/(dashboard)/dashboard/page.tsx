import { Suspense } from "react";
import { DashboardStats } from "@/components/features/dashboard/dashboard-stats";
import { DashboardStatsSkeleton } from "@/components/skeletons/dashboard-stats-skeleton";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { DashboardOverviewData } from "@/components/features/dashboard/dashboard-overview-data";
import { DashboardOverviewSkeleton } from "@/components/skeletons/dashboard-overview-skeleton";

interface Props {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

export default function DashboardPage({ searchParams }: Props) {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-[#2C2A29] tracking-tight mb-2">
            Overview
          </h1>
          <p className="text-sm text-[#5A5550] uppercase tracking-widest opacity-80">
            Selamat datang kembali di pusat kendali Anda.
          </p>
        </div>
        <Suspense>
          <DateRangeFilter defaultRange="month" />
        </Suspense>
      </div>

      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<DashboardOverviewSkeleton />}>
        <DashboardOverviewData searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import { ReservationList } from "@/components/features/dashboard/reservation-list";
import { ReservationListSkeleton } from "@/components/skeletons/reservation-list-skeleton";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { StatusFilter } from "@/components/ui/status-filter";

interface Props {
  searchParams: Promise<{ range?: string; from?: string; to?: string; status?: string }>;
}

export default function ReservationsPage({ searchParams }: Props) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-[#2C2A29] tracking-tight">
            Daftar Reservasi
          </h1>
          <p className="text-sm text-[#5A5550] uppercase tracking-widest opacity-80 mt-2">
            Pantau dan kelola seluruh jadwal pemotretan.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Suspense>
            <DateRangeFilter defaultRange="all" />
          </Suspense>
          <Suspense>
            <StatusFilter />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<ReservationListSkeleton />}>
        <ReservationList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import { ReservationList } from "@/components/features/dashboard/reservation-list";
import { ReservationListSkeleton } from "@/components/skeletons/reservation-list-skeleton";

export default function ReservationsPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl text-[#2C2A29] tracking-tight mb-2">
          Daftar Reservasi
        </h1>
        <p className="text-sm text-[#5A5550] uppercase tracking-widest opacity-80">
          Pantau dan kelola seluruh jadwal pemotretan.
        </p>
      </div>

      <Suspense fallback={<ReservationListSkeleton />}>
        <ReservationList />
      </Suspense>
    </div>
  );
}

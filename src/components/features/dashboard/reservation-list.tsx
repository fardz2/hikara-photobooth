import { reservationService } from "@/lib/services/reservation-service";
import { parseDateRangeParams } from "@/lib/utils/date-range";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { connection } from "next/server";
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon, Tick02Icon, Time02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

interface Props {
  searchParams: Promise<{ range?: string; from?: string; to?: string; status?: string }>;
}

export const ReservationList = async ({ searchParams }: Props) => {
  await connection();
  const params = await searchParams;
  const { from, to } = parseDateRangeParams(params);
  const status = params.status;

  const { data: reservations, error } = await reservationService.getReservations(from, to, status);

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 border border-red-100 uppercase text-[10px] tracking-widest">
        Error fetching reservations: {error.message}
      </div>
    );
  }

  const total = reservations?.length || 0;
  const pending = reservations?.filter((r) => r.status === "pending").length || 0;
  const confirmed = reservations?.filter((r) => r.status === "confirmed").length || 0;
  const cancelled = reservations?.filter((r) => r.status === "cancelled").length || 0;

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reservasi */}
        <div className="relative bg-[#2C2A29] p-6 border border-[#2C2A29]/10 flex flex-col justify-between group overflow-hidden">
          <div className="relative z-10 flex flex-col gap-1 items-start">
            <p className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#F6F4F0]/60">
              Total Reservasi
            </p>
            <h3 className="text-3xl font-heading text-[#F6F4F0] tracking-tight mt-2">
              {total}
            </h3>
          </div>
          <div className="absolute right-4 bottom-4 opacity-10 text-white">
            <HugeiconsIcon icon={Folder01Icon} size={48} />
          </div>
        </div>

        {/* Confirmed */}
        <div className="relative bg-white p-6 border border-[#2C2A29]/10 flex flex-col justify-between group overflow-hidden hover:border-[#2C2A29]/30 transition-all">
          <div className="relative z-10 flex flex-col gap-1 items-start w-full">
            <p className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#5A5550]">
              Terkonfirmasi
            </p>
            <h3 className="text-2xl font-heading text-emerald-600 tracking-tight mt-2">
              {confirmed}
            </h3>
          </div>
          <div className="absolute right-4 bottom-4 opacity-5 text-emerald-600">
            <HugeiconsIcon icon={Tick02Icon} size={48} />
          </div>
        </div>

        {/* Pending */}
        <div className="relative bg-white p-6 border border-[#2C2A29]/10 flex flex-col justify-between group overflow-hidden hover:border-[#2C2A29]/30 transition-all">
          <div className="relative z-10 flex flex-col gap-1 items-start w-full">
            <p className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#5A5550]">
              Menunggu Pembayaran
            </p>
            <h3 className="text-2xl font-heading text-amber-500 tracking-tight mt-2">
              {pending}
            </h3>
          </div>
          <div className="absolute right-4 bottom-4 opacity-5 text-amber-500">
            <HugeiconsIcon icon={Time02Icon} size={48} />
          </div>
        </div>

        {/* Cancelled */}
        <div className="relative bg-[#FAFAFA] p-6 border border-[#2C2A29]/10 flex flex-col justify-between group overflow-hidden hover:border-[#2C2A29]/30 transition-all">
          <div className="relative z-10 flex flex-col gap-1 items-start">
            <p className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#5A5550]/60">
              Dibatalkan
            </p>
            <h3 className="text-2xl font-heading text-red-500 tracking-tight mt-2">
              {cancelled}
            </h3>
          </div>
          <div className="absolute right-4 bottom-4 opacity-5 text-red-500">
            <HugeiconsIcon icon={Cancel01Icon} size={48} />
          </div>
        </div>
      </div>

      <div className="bg-transparent">
        <DataTable columns={columns} data={reservations || []} />
      </div>
    </div>
  );
};

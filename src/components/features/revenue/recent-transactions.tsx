import { reservationService } from "@/lib/services/reservation-service";
import { parseDateRangeParams } from "@/lib/utils/date-range";
import { DataTable } from "@/components/features/dashboard/data-table";
import { columns, type Reservation } from "@/components/features/dashboard/columns";
import { FadeIn } from "@/components/ui/fade-in";
import { HugeiconsIcon } from "@hugeicons/react";
import { Analytics01Icon } from "@hugeicons/core-free-icons";

interface Props {
  searchParams: { range?: string; from?: string; to?: string; page?: string; q?: string };
}

export const RecentTransactions = async ({ searchParams }: Props) => {
  const { from, to } = parseDateRangeParams(searchParams, "month");
  const page = Number(searchParams.page) || 1;
  const q = searchParams.q;

  const { data, count, error } = await reservationService.getReservations(from, to, "confirmed", page, 10, q);
  const transactions = (data as any[] | null)?.map((item) => ({
    ...item,
    status: item.status as "pending" | "confirmed" | "cancelled",
  })) as Reservation[] | null;

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 border border-red-100 uppercase text-[10px] tracking-widest">
        Error fetching transactions: {error.message}
      </div>
    );
  }

  const total = count || 0;

  return (
    <div className="bg-white p-8 border border-[#2C2A29]/10 space-y-6 text-[#2C2A29]">
      <div className="flex items-center justify-between pb-6 border-b border-[#2C2A29]/5">
        <div>
          <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-[#2C2A29] flex items-center gap-2">
            <HugeiconsIcon icon={Analytics01Icon} size={16} />
            Daftar Transaksi Terkonfirmasi
          </h3>
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#5A5550]/50 mt-1.5">
            Riwayat pendapatan berdasarkan rentang waktu yang dipilih
          </p>
        </div>
        <span className="text-[10px] font-bold text-[#8B5E56] bg-[#8B5E56]/5 px-3 py-1 uppercase tracking-widest border border-[#8B5E56]/10">
          {total} Transaksi
        </span>
      </div>

      <FadeIn direction="up">
        <DataTable 
          columns={columns} 
          data={transactions || []} 
          pageCount={Math.ceil(total / 10)}
          currentPage={page}
        />
      </FadeIn>
    </div>
  );
};

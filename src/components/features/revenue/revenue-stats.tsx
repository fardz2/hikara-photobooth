import {
  Analytics01Icon,
  CashIcon,
  Coins02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { connection } from "next/server";
import { LogTransactionForm } from "@/components/features/revenue/log-transaction-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getPricing } from "@/lib/services/pricing-service";
import { getRevenueStats } from "@/lib/services/revenue-service";
import { parseDateRangeParams } from "@/lib/utils/date-range";
import { RevenueChart } from "./revenue-chart";

interface Props {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

export const RevenueStats = async ({ searchParams }: Props) => {
  await connection();
  const params = await searchParams;
  const { from, to, label } = parseDateRangeParams(params);
  const [stats, pricing] = await Promise.all([
    getRevenueStats(from, to),
    getPricing(),
  ]);

  if (!stats)
    return (
      <div className="p-8 text-[10px] tracking-widest uppercase text-red-600 bg-red-50 border border-red-100">
        Gagal memuat data pendapatan
      </div>
    );

  const percentTunai =
    stats.total > 0 ? Math.round((stats.breakdown.tunai / stats.total) * 100) : 0;
  const percentQris =
    stats.total > 0 ? Math.round((stats.breakdown.qris / stats.total) * 100) : 0;

  const avgTransaction = stats.transactionCount > 0
    ? Math.round(stats.total / stats.transactionCount)
    : 0;

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pendapatan */}
        <div className="relative bg-[#2C2A29] p-6 border border-[#2C2A29]/10 flex flex-col justify-between group overflow-hidden">
          <div className="relative z-10 flex flex-col gap-1 items-start">
            <p className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#F6F4F0]/60">
              Total Pendapatan
            </p>
            <h3 className="text-3xl font-heading text-[#F6F4F0] tracking-tight mt-2">
              Rp {stats.total.toLocaleString("id-ID")}
            </h3>
            <p className="text-[8px] tracking-[0.2em] uppercase text-[#F6F4F0]/40 mt-1">
              {stats.transactionCount} Transaksi Selesai
            </p>
          </div>

          <div className="absolute right-4 top-4 opacity-10 text-white">
            <HugeiconsIcon icon={Analytics01Icon} size={32} />
          </div>

          {/* Extra breakdown */}
          <div className="mt-6 pt-4 border-t border-[#F6F4F0]/10 flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[7px] text-[#F6F4F0]/40 uppercase tracking-widest font-bold">Extra Print</span>
              <span className="text-[10px] text-[#F6F4F0] font-bold">Rp {stats.breakdown.extraPrint.toLocaleString("id-ID")}</span>
            </div>
            <div className="w-px h-4 bg-[#F6F4F0]/10" />
            <div className="flex flex-col">
              <span className="text-[7px] text-[#F6F4F0]/40 uppercase tracking-widest font-bold">Extra Person</span>
              <span className="text-[10px] text-[#F6F4F0] font-bold">Rp {stats.breakdown.extraPeople.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Tunai */}
        <div className="relative bg-white p-6 border border-[#2C2A29]/10 flex flex-col justify-between group overflow-hidden hover:border-[#2C2A29]/30 transition-all">
          <div className="relative z-10 flex flex-col gap-1 items-start w-full">
            <p className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#5A5550]">
              Pendapatan Tunai
            </p>
            <h3 className="text-2xl font-heading text-[#2C2A29] tracking-tight mt-2">
              Rp {stats.breakdown.tunai.toLocaleString("id-ID")}
            </h3>
            <div className="w-full mt-3 flex items-center gap-2">
               <div className="h-0.5 w-full bg-[#2C2A29]/5">
                 <div className="h-full bg-[#8B5E56]" style={{ width: `${percentTunai}%` }} />
               </div>
               <span className="text-[8px] font-bold text-[#8B5E56]">{percentTunai}%</span>
            </div>
          </div>
        </div>

        {/* QRIS */}
        <div className="relative bg-white p-6 border border-[#2C2A29]/10 flex flex-col justify-between group overflow-hidden hover:border-[#2C2A29]/30 transition-all">
          <div className="relative z-10 flex flex-col gap-1 items-start w-full">
            <p className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#5A5550]">
              QRIS & Transfer
            </p>
            <h3 className="text-2xl font-heading text-[#2C2A29] tracking-tight mt-2">
              Rp {stats.breakdown.qris.toLocaleString("id-ID")}
            </h3>
            <div className="w-full mt-3 flex items-center gap-2">
               <div className="h-0.5 w-full bg-[#2C2A29]/5">
                 <div className="h-full bg-[#2C2A29]" style={{ width: `${percentQris}%` }} />
               </div>
               <span className="text-[8px] font-bold text-[#2C2A29]">{percentQris}%</span>
            </div>
          </div>
        </div>

        {/* Rata-rata */}
        <div className="relative bg-[#FAFAFA] p-6 border border-[#2C2A29]/10 flex flex-col justify-between group overflow-hidden hover:border-[#2C2A29]/30 transition-all">
          <div className="relative z-10 flex flex-col gap-1 items-start">
            <p className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#5A5550]/60">
              Rata-rata Transaksi
            </p>
            <h3 className="text-2xl font-heading text-[#2C2A29] tracking-tight mt-2">
              Rp {avgTransaction.toLocaleString("id-ID")}
            </h3>
          </div>
          <div className="absolute right-4 bottom-4 opacity-5 text-[#2C2A29]">
            <HugeiconsIcon icon={CashIcon} size={48} />
          </div>
        </div>
      </div>

      {/* Chart + Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop: Form on the left (sticky) */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-6 bg-white p-6 border border-[#2C2A29]/10">
            <h3 className="font-heading text-lg text-[#2C2A29] mb-1">Pencatatan Transaksi</h3>
            <p className="text-[9px] tracking-widest uppercase text-[#5A5550] mb-6">
              Input data pendapatan manual
            </p>
            <div className="max-h-[calc(100vh-240px)] overflow-y-auto">
              <LogTransactionForm pricing={pricing} />
            </div>
          </div>
        </div>

        {/* Chart on the right */}
        <div className="lg:col-span-8">
          <div className="bg-white p-8 border border-[#2C2A29]/10 relative group hover:border-[#2C2A29]/20 transition-all hidden md:block">
            <div className="absolute inset-0 bg-linear-to-br from-transparent to-[#2C2A29]/1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 mb-10 pb-6 border-b border-[#2C2A29]/5">
              <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-[#2C2A29] flex items-center gap-2">
                <HugeiconsIcon icon={Analytics01Icon} size={16} />
                Grafik Tren Periodik
              </h3>
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#5A5550]/50 mt-1.5">{label}</p>
            </div>

            <RevenueChart data={stats.chartData} />
          </div>

          {/* Mobile chart (no form column) */}
          <div className="md:hidden bg-white p-4 border border-[#2C2A29]/10">
            <RevenueChart data={stats.chartData} />
          </div>
        </div>
      </div>

      {/* Mobile: Form trigger → bottom sheet dialog */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button className="w-full bg-[#2C2A29] text-white px-5 py-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors hover:bg-[#8B5E56] flex items-center justify-center gap-2 border border-[#2C2A29]">
              <HugeiconsIcon icon={Coins02Icon} size={14} />
              + Catat Transaksi Manual
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="w-full h-[90vh] border-t border-[#2C2A29]/10 p-0 bg-white rounded-t-xl"
          >
            <SheetHeader className="p-6 border-b border-[#2C2A29]/10 bg-[#FAFAFA]">
              <SheetTitle className="font-heading text-xl text-[#2C2A29] text-left">
                Pencatatan Transaksi
              </SheetTitle>
              <SheetDescription className="text-[9px] tracking-widest uppercase text-[#5A5550] text-left mt-1">
                Input data pendapatan manual di luar sistem reservasi otomatis.
              </SheetDescription>
            </SheetHeader>
            <div className="p-6 overflow-y-auto h-[calc(90vh-100px)]">
              <LogTransactionForm pricing={pricing} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

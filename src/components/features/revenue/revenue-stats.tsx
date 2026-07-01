import { getRevenueStats } from "@/lib/services/revenue-service";
import { getPricing } from "@/lib/services/site-content-service";
import { parseDateRangeParams } from "@/lib/utils/date-range";
import { LogTransactionForm } from "@/components/features/revenue/log-transaction-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { Analytics01Icon, CashIcon, Coins02Icon } from "@hugeicons/core-free-icons";
import { connection } from "next/server";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#8B5E56] flex items-center gap-2">
            <HugeiconsIcon icon={Analytics01Icon} size={14} />
            Pendapatan
          </span>
          <span className="text-[10px] text-[#5A5550] mt-1 block">
            {label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 border border-[#2C2A29]/10 shadow-sm">
          <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-[#5A5550]/60 block mb-2">
            Total
          </span>
          <span className="text-xl font-bold text-[#2C2A29]">
            Rp {stats.total.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="bg-white p-6 border border-[#2C2A29]/10 shadow-sm">
          <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-[#5A5550]/60 block mb-2 flex items-center gap-1">
            <HugeiconsIcon icon={CashIcon} size={12} /> Tunai
          </span>
          <span className="text-xl font-bold text-[#8B5E56]">
            Rp {stats.breakdown.tunai.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="bg-white p-6 border border-[#2C2A29]/10 shadow-sm">
          <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-[#5A5550]/60 block mb-2 flex items-center gap-1">
            <HugeiconsIcon icon={Coins02Icon} size={12} /> QRIS
          </span>
          <span className="text-xl font-bold text-[#2C2A29]">
            Rp {stats.breakdown.qris.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="bg-white p-6 border border-[#2C2A29]/10 shadow-sm">
          <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-[#5A5550]/60 block mb-2">
            Transaksi
          </span>
          <span className="text-xl font-bold text-[#2C2A29]">
            {stats.transactionCount}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-12 flex justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <button className="bg-[#2C2A29] text-white px-5 py-3 text-[9px] font-bold tracking-[0.2em] uppercase transition-colors hover:bg-[#8B5E56] flex items-center gap-2">
                <HugeiconsIcon icon={Coins02Icon} size={14} />
                + Catat Manual
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-[540px] border-l border-[#2C2A29]/10 p-0 bg-white">
              <SheetHeader className="p-8 border-b border-[#2C2A29]/10 bg-[#FAFAFA]">
                <SheetTitle className="font-heading text-2xl text-[#2C2A29] text-left">Pencatatan Transaksi</SheetTitle>
                <SheetDescription className="text-[10px] tracking-widest uppercase text-[#5A5550] text-left mt-2">
                  Input data pendapatan manual di luar sistem reservasi otomatis.
                </SheetDescription>
              </SheetHeader>
              <div className="p-8 overflow-y-auto h-[calc(100vh-140px)]">
                <LogTransactionForm pricing={pricing} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <RevenueChart data={stats.chartData} />
      </div>

      {/* Mobile Form Trigger */}
      <div className="md:hidden">
         <Sheet>
            <SheetTrigger asChild>
              <button className="w-full bg-[#2C2A29] text-white px-5 py-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors hover:bg-[#8B5E56] flex items-center justify-center gap-2 border border-[#2C2A29]">
                <HugeiconsIcon icon={Coins02Icon} size={14} />
                + Catat Transaksi Manual
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="w-full h-[90vh] border-t border-[#2C2A29]/10 p-0 bg-white rounded-t-xl">
              <SheetHeader className="p-6 border-b border-[#2C2A29]/10 bg-[#FAFAFA]">
                <SheetTitle className="font-heading text-xl text-[#2C2A29] text-left">Pencatatan Transaksi</SheetTitle>
              </SheetHeader>
              <div className="p-6 overflow-y-auto h-[calc(90vh-80px)]">
                <LogTransactionForm pricing={pricing} />
              </div>
            </SheetContent>
         </Sheet>
      </div>
    </div>
  );
};

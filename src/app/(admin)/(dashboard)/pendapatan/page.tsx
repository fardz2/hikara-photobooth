import { revenueService } from "@/lib/services/revenue-service";
import { LogTransactionForm } from "@/components/features/revenue/log-transaction-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { Money01Icon, CreditCardIcon, Analytics01Icon } from "@hugeicons/core-free-icons";

export default async function PendapatanPage() {
  const stats = await revenueService.getRevenueStats();

  if (!stats) return <div>Error loading stats</div>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-heading text-[#2C2A29] uppercase tracking-tight">Pemantauan Pendapatan</h1>
        <p className="text-xs text-[#5A5550] tracking-widest uppercase mt-2 opacity-60">Laporan Keuangan Real-time Hikara</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 border border-[#2C2A29]/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <HugeiconsIcon icon={Analytics01Icon} size={80} />
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-[#5A5550] mb-4">Total Hari Ini</p>
          <h2 className="text-4xl font-heading text-[#2C2A29]">
            Rp {stats.today.toLocaleString("id-ID")}
          </h2>
          <div className="mt-6 flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-tighter text-[#5A5550]">Tunai</span>
                <span className="text-xs font-bold text-[#8B5E56]">Rp {stats.breakdown.tunai.toLocaleString("id-ID")}</span>
             </div>
             <div className="w-px h-8 bg-[#2C2A29]/10"></div>
             <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-tighter text-[#5A5550]">QRIS</span>
                <span className="text-xs font-bold text-[#8B5E56]">Rp {stats.breakdown.qris_manual.toLocaleString("id-ID")}</span>
             </div>
          </div>
        </div>

        <div className="bg-[#2C2A29] p-8 border border-[#2C2A29]/10 shadow-sm relative overflow-hidden group">
          <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-[#F6F4F0]/60 mb-4">Estimasi Bulan Ini</p>
          <h2 className="text-4xl font-heading text-[#F6F4F0]">
            Rp {stats.month.toLocaleString("id-ID")}
          </h2>
          <div className="absolute bottom-0 right-0 p-4">
             <div className="w-12 h-1 bg-[#8B5E56]"></div>
          </div>
        </div>

        <div className="md:col-span-1">
           <LogTransactionForm />
        </div>
      </div>
    </div>
  );
}

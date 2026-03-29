import { revenueService } from "@/lib/services/revenue-service";
import { LogTransactionForm } from "@/components/features/revenue/log-transaction-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { Analytics01Icon } from "@hugeicons/core-free-icons";

export const RevenueStats = async () => {
  const stats = await revenueService.getRevenueStats();

  if (!stats) return <div className="p-8 text-[10px] tracking-widest uppercase text-red-600 bg-red-50 border border-red-100">Gagal memuat data pendapatan</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Stats - Stacked Vertically */}
      <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
        {/* Today Stats */}
        <div className="bg-white p-10 border border-[#2C2A29]/10 shadow-sm relative overflow-hidden group flex-1">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
             <HugeiconsIcon icon={Analytics01Icon} size={100} />
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#5A5550]/60 mb-2">Revenue</p>
              <h3 className="text-xs tracking-widest uppercase font-bold text-[#2C2A29]">Hari Ini</h3>
            </div>

            <div className="mt-8">
              <h2 className="text-5xl font-heading text-[#2C2A29] leading-tight">
                Rp {stats.today.toLocaleString("id-ID")}
              </h2>
              
              <div className="mt-8 space-y-3 pt-6 border-t border-[#2C2A29]/5">
                 <div className="flex items-baseline gap-2">
                    <span className="text-[8px] uppercase tracking-widest text-[#5A5550] opacity-60 flex-none">Tunai</span>
                    <span className="flex-1 border-b border-dotted border-[#2C2A29]/10" />
                    <span className="text-sm font-bold text-[#8B5E56] flex-none">Rp {stats.breakdown.tunai.toLocaleString("id-ID")}</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-[8px] uppercase tracking-widest text-[#5A5550] opacity-60 flex-none">QRIS</span>
                    <span className="flex-1 border-b border-dotted border-[#2C2A29]/10" />
                    <span className="text-sm font-bold text-[#8B5E56] flex-none">Rp {stats.breakdown.qris_manual.toLocaleString("id-ID")}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Month Stats */}
        <div className="bg-[#2C2A29] p-10 shadow-xl relative overflow-hidden group lg:h-64 flex flex-col justify-between">
          <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:opacity-20 transition-all duration-700">
             <HugeiconsIcon icon={Analytics01Icon} size={150} className="text-white rotate-12" />
          </div>

          <div className="relative z-10">
            <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-[#F6F4F0]/40 mb-2">Estimation</p>
            <h3 className="text-xs tracking-widest uppercase font-bold text-[#F6F4F0]">Bulan Ini</h3>
          </div>

          <div className="relative z-10">
            <h2 className="text-5xl font-heading text-[#F6F4F0] leading-tight">
              Rp {stats.month.toLocaleString("id-ID")}
            </h2>
            <div className="mt-6 flex items-center justify-between">
               <div className="w-12 h-1 bg-[#8B5E56]"></div>
               <span className="text-[8px] tracking-[0.3em] uppercase text-[#F6F4F0]/40 font-bold">Total Pemasukan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section - Takes rest of the space (Right) */}
      <div className="lg:col-span-8 h-full">
         <LogTransactionForm />
      </div>
    </div>
  );
};

import { Skeleton } from "@/components/ui/skeleton";

export const RevenueStatsSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 4 KPI Cards Row */}
      {/* 4 KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pendapatan Skeleton */}
        <div className="bg-[#2C2A29] p-6 border border-[#2C2A29]/10 flex flex-col justify-between h-[180px] overflow-hidden">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-2.5 w-24 rounded-none bg-[#F6F4F0]/20" />
            <Skeleton className="h-8 w-40 rounded-none bg-[#F6F4F0]/20 mt-1" />
            <Skeleton className="h-2 w-28 rounded-none bg-[#F6F4F0]/10" />
          </div>
          <div className="mt-6 pt-4 border-t border-[#F6F4F0]/10 flex items-center gap-4">
             <div className="flex flex-col gap-1">
               <Skeleton className="h-2 w-12 rounded-none bg-[#F6F4F0]/10" />
               <Skeleton className="h-3 w-16 rounded-none bg-[#F6F4F0]/20" />
             </div>
             <div className="w-px h-4 bg-[#F6F4F0]/10" />
             <div className="flex flex-col gap-1">
               <Skeleton className="h-2 w-12 rounded-none bg-[#F6F4F0]/10" />
               <Skeleton className="h-3 w-16 rounded-none bg-[#F6F4F0]/20" />
             </div>
          </div>
        </div>

        {/* Tunai Skeleton */}
        <div className="bg-white p-6 border border-[#2C2A29]/10 flex flex-col justify-between h-[180px]">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-2.5 w-24 rounded-none bg-[#2C2A29]/5" />
            <Skeleton className="h-7 w-36 rounded-none bg-[#2C2A29]/5 mt-1" />
          </div>
          <div className="w-full space-y-2 mt-auto">
            <Skeleton className="h-1 w-full rounded-none bg-[#2C2A29]/5" />
            <Skeleton className="h-2 w-8 rounded-none bg-[#2C2A29]/5" />
          </div>
        </div>

        {/* QRIS Skeleton */}
        <div className="bg-white p-6 border border-[#2C2A29]/10 flex flex-col justify-between h-[180px]">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-2.5 w-24 rounded-none bg-[#2C2A29]/5" />
            <Skeleton className="h-7 w-36 rounded-none bg-[#2C2A29]/5 mt-1" />
          </div>
          <div className="w-full space-y-2 mt-auto">
            <Skeleton className="h-1 w-full rounded-none bg-[#2C2A29]/5" />
            <Skeleton className="h-2 w-8 rounded-none bg-[#2C2A29]/5" />
          </div>
        </div>

        {/* Rata-rata Skeleton */}
        <div className="bg-[#FAFAFA] p-6 border border-[#2C2A29]/10 flex flex-col justify-between h-[180px]">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-2.5 w-24 rounded-none bg-[#2C2A29]/5" />
            <Skeleton className="h-7 w-32 rounded-none bg-[#2C2A29]/10 mt-1" />
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white p-8 border border-[#2C2A29]/10 mt-8 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40 rounded-none bg-[#2C2A29]/10" />
            <Skeleton className="h-3 w-64 rounded-none bg-[#2C2A29]/5" />
          </div>
          <Skeleton className="h-10 w-32 bg-[#2C2A29]/80 rounded-none" />
        </div>
        
        {/* Chart Bars */}
        <div className="h-[300px] w-full flex items-end gap-2 mt-8">
          {[30, 45, 25, 60, 40, 80, 50, 75, 40, 65, 90, 55, 30, 60, 100].map((height, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-none bg-[#2C2A29]/5"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

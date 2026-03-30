import { Skeleton } from "@/components/ui/skeleton";

export const RevenueStatsSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 4 KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 border border-[#2C2A29]/10 flex flex-col justify-between h-[140px]">
            <div className="flex justify-between items-start mb-8">
              <Skeleton className="h-3 w-20 rounded-none bg-[#2C2A29]/10" />
              <Skeleton className="h-6 w-12 rounded-none bg-[#2C2A29]/10" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-32 rounded-none bg-[#2C2A29]/10" />
              <Skeleton className="h-2 w-16 rounded-none bg-[#2C2A29]/10" />
            </div>
          </div>
        ))}
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

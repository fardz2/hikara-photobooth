import { Skeleton } from "@/components/ui/skeleton";

export function DashboardOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Chart Skeleton Area */}
      <div className="xl:col-span-2 bg-white p-8 border border-[#2C2A29]/10">
        <div className="mb-8 pb-4 border-b border-[#2C2A29]/5">
          <Skeleton className="h-4 w-32 rounded-none bg-[#2C2A29]/5" />
        </div>
        <div className="h-64 w-full flex items-end gap-2">
          {[30, 45, 25, 60, 40, 80, 50, 75, 40, 65, 90, 55].map((height, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-none bg-[#2C2A29]/5"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity Skeleton Area */}
      <div className="xl:col-span-1 bg-white p-8 border border-[#2C2A29]/10 flex flex-col h-full">
        <div className="mb-8 pb-4 border-b border-[#2C2A29]/5">
          <Skeleton className="h-4 w-40 rounded-none bg-[#2C2A29]/5" />
        </div>
        <div className="flex-1 space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex justify-between items-start border-b border-[#2C2A29]/5 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex flex-col gap-2 w-1/2">
                <Skeleton className="h-4 w-full rounded-none bg-[#2C2A29]/5" />
                <Skeleton className="h-2 w-2/3 rounded-none bg-[#2C2A29]/5" />
              </div>
              <div className="flex flex-col items-end gap-2 w-1/3">
                <Skeleton className="h-4 w-full rounded-none bg-[#2C2A29]/5" />
                <Skeleton className="h-3 w-1/2 rounded-none bg-[#2C2A29]/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

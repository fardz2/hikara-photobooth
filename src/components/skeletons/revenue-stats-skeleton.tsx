import { Skeleton } from "@/components/ui/skeleton";

export const RevenueStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-8 border border-[#2C2A29]/10 shadow-sm space-y-4">
        <Skeleton className="h-3 w-24 opacity-20" />
        <Skeleton className="h-10 w-48 opacity-20" />
        <div className="flex gap-4 mt-6">
          <Skeleton className="h-8 w-16 opacity-10" />
          <Skeleton className="h-8 w-16 opacity-10" />
        </div>
      </div>
      <div className="bg-[#2C2A29] p-8 border border-[#2C2A29]/10 shadow-sm space-y-4">
        <Skeleton className="h-3 w-24 bg-[#F6F4F0]/20" />
        <Skeleton className="h-10 w-48 bg-[#F6F4F0]/20" />
      </div>
      <div className="bg-white p-8 border border-[#2C2A29]/10 shadow-sm space-y-4">
        <Skeleton className="h-full w-full opacity-10" />
      </div>
    </div>
  );
};

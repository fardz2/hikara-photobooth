import { Skeleton } from "@/components/ui/skeleton";

export const RevenueStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
      {/* Sidebar Stats - Stacked Vertically */}
      <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
        {/* Today Stats Skeleton */}
        <div className="bg-white p-10 border border-[#2C2A29]/10 shadow-sm flex-1 space-y-8">
           <div className="space-y-3">
              <Skeleton className="h-3 w-20 opacity-20" />
              <Skeleton className="h-4 w-32 opacity-20" />
           </div>
           
           <Skeleton className="h-16 w-full opacity-20" />

           <div className="pt-8 border-t border-[#2C2A29]/5 space-y-4">
              <Skeleton className="h-6 w-full opacity-10" />
              <Skeleton className="h-6 w-full opacity-10" />
           </div>
        </div>

        {/* Month Stats Skeleton */}
        <div className="bg-[#2C2A29] p-10 shadow-xl lg:h-64 flex flex-col justify-between">
           <div className="space-y-3">
              <Skeleton className="h-3 w-20 bg-[#F6F4F0]/20" />
              <Skeleton className="h-4 w-32 bg-[#F6F4F0]/20" />
           </div>
           <div className="space-y-4">
              <Skeleton className="h-16 w-full bg-[#F6F4F0]/20" />
              <div className="flex justify-between items-center pt-4">
                 <Skeleton className="h-1 w-12 bg-[#8B5E56]/40" />
                 <Skeleton className="h-2 w-24 bg-[#F6F4F0]/10" />
              </div>
           </div>
        </div>
      </div>

      {/* Form Section Skeleton */}
      <div className="lg:col-span-8 bg-white border border-[#2C2A29]/10 p-10 h-full flex flex-col gap-8">
         <div className="space-y-4">
            <Skeleton className="h-8 w-64 opacity-20" />
            <Skeleton className="h-4 w-full opacity-10" />
         </div>
         <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-12 w-full opacity-10" />
            <Skeleton className="h-12 w-full opacity-10" />
            <Skeleton className="h-12 w-full opacity-10" />
            <Skeleton className="h-12 w-full opacity-10" />
         </div>
         <Skeleton className="h-32 w-full opacity-10" />
         <Skeleton className="mt-auto h-14 w-full opacity-20" />
      </div>
    </div>
  );
};

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-6 border border-[#2C2A29]/10 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start mb-8">
            <Skeleton className="h-3 w-24 rounded-none bg-[#2C2A29]/5" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-16 rounded-none bg-[#2C2A29]/10" />
            <Skeleton className="h-2 w-12 rounded-none bg-[#2C2A29]/5" />
          </div>
        </div>
      ))}
    </div>
  );
};

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-8 border border-[#2C2A29]/5 shadow-sm flex flex-col items-center text-center">
          <Skeleton className="w-24 h-3 mb-4 opacity-50" />
          <Skeleton className="w-16 h-8 opacity-30" />
        </div>
      ))}
    </div>
  );
};

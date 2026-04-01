import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const ReservationListSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* 4 KPI Cards Skeleton Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 border border-[#2C2A29]/10 flex flex-col justify-between h-[140px]">
             <Skeleton className="h-3 w-24 rounded-none bg-[#2C2A29]/5" />
             <div className="flex flex-col gap-2">
               <Skeleton className="h-8 w-16 rounded-none bg-[#2C2A29]/10" />
               <Skeleton className="h-2 w-12 rounded-none bg-[#2C2A29]/5" />
             </div>
          </div>
        ))}
      </div>

      {/* DataTable Skeleton */}
      <div className="bg-white border border-[#2C2A29]/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6F4F0]/50 border-b border-[#2C2A29]/5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <th key={i} className="px-6 py-5">
                    <Skeleton className="h-2 w-full max-w-24 rounded-none bg-[#2C2A29]/10" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2A29]/5">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5].map((j) => (
                    <td key={j} className="px-6 py-6">
                      <div className="flex flex-col gap-2">
                         <Skeleton className="h-3 w-full max-w-32 rounded-none bg-[#2C2A29]/10" />
                         <Skeleton className="h-2 w-full max-w-20 rounded-none bg-[#2C2A29]/10" />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

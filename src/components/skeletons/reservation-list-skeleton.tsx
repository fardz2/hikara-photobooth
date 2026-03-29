import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const ReservationListSkeleton = () => {
  return (
    <div className="bg-white border border-[#2C2A29]/5 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F6F4F0]/50 border-b border-[#2C2A29]/5">
              {[1, 2, 3, 4, 5].map((i) => (
                <th key={i} className="px-6 py-5">
                  <Skeleton className="h-2 w-16 opacity-30" />
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
                       <Skeleton className="h-3 w-24 opacity-40" />
                       <Skeleton className="h-2 w-16 opacity-20" />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

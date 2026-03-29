import { Skeleton } from "@/components/ui/skeleton";

export const ReservationFormSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 w-full animate-pulse">
      <div className="flex flex-col gap-6">
        {/* Nama & Telepon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24 bg-[#2C2A29]/5" />
            <Skeleton className="h-11 w-full bg-[#2C2A29]/5 border border-[#2C2A29]/10" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24 bg-[#2C2A29]/5" />
            <Skeleton className="h-11 w-full bg-[#2C2A29]/5 border border-[#2C2A29]/10" />
          </div>
        </div>

        {/* Tanggal & Waktu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20 bg-[#2C2A29]/5" />
            <Skeleton className="h-11 w-full bg-[#2C2A29]/5 border border-[#2C2A29]/10" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20 bg-[#2C2A29]/5" />
            <Skeleton className="h-11 w-full bg-[#2C2A29]/5 border border-[#2C2A29]/10" />
          </div>
        </div>

        {/* Paket Utama */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24 bg-[#2C2A29]/5" />
          <Skeleton className="h-20 w-full bg-[#2C2A29]/5 border border-[#2C2A29]/10 rounded-xl" />
        </div>

        {/* Add-ons */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[#2C2A29]/10">
          <Skeleton className="h-3 w-32 bg-[#2C2A29]/5" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 bg-[#2C2A29]/5 rounded" />
            <Skeleton className="h-4 w-48 bg-[#2C2A29]/5" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 bg-[#2C2A29]/5 rounded" />
            <Skeleton className="h-4 w-32 bg-[#2C2A29]/5" />
          </div>
        </div>
      </div>

      <Skeleton className="h-16 w-full bg-[#2C2A29]/10" />
    </div>
  );
};

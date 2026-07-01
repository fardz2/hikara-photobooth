import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tab bar skeleton */}
      <div className="flex gap-1 overflow-hidden pb-2 border-b border-[#E8E2D9]">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-9 w-20 shrink-0 rounded-none bg-[#2C2A29]/5"
          />
        ))}
      </div>

      {/* Section title */}
      <Skeleton className="h-7 w-48 rounded-none bg-[#2C2A29]/5" />

      {/* Grid fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24 rounded-none bg-[#2C2A29]/5" />
            <Skeleton className="h-10 w-full rounded-none bg-[#2C2A29]/5" />
          </div>
        ))}
      </div>

      {/* Submit button */}
      <Skeleton className="h-9 w-28 rounded-none bg-[#2C2A29]/5" />
    </div>
  );
}

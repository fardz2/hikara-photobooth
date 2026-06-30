import { Skeleton } from "@/components/ui/skeleton"

export function SettingsSkeleton() {
  return (
    <div className="flex gap-8 animate-pulse">
      <nav className="hidden md:block w-48 shrink-0 space-y-1">
        <Skeleton className="h-3 w-16 mb-4" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded" />
        ))}
        <Skeleton className="h-3 w-16 mb-4 mt-8" />
        <Skeleton className="h-9 w-full rounded" />
        <Skeleton className="h-9 w-full rounded mt-2" />
      </nav>
      <div className="flex-1 max-w-2xl space-y-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  )
}

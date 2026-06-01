import { Skeleton } from "./_components/ui/skeleton"

const HomeLoading = () => {
  return (
    <div className="mx-auto max-w-5xl px-5 py-5 lg:py-10">
      {/* Header skeleton */}
      <Skeleton className="mb-10 h-16 w-full" />

      {/* Boas-vindas */}
      <Skeleton className="mb-2 h-7 w-48" />
      <Skeleton className="mb-6 h-4 w-36" />

      {/* Search */}
      <Skeleton className="mb-6 h-10 w-full" />

      {/* Quick search */}
      <div className="mb-6 flex gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 flex-shrink-0 rounded-full" />
        ))}
      </div>

      {/* Banner */}
      <Skeleton className="mb-8 h-[150px] w-full rounded-xl lg:h-[220px]" />

      {/* Section */}
      <Skeleton className="mb-3 h-4 w-32" />
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="min-w-[167px] space-y-2">
            <Skeleton className="h-[159px] w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default HomeLoading

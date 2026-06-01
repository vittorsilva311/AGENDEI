import { Skeleton } from "../_components/ui/skeleton"

const BarbershopsLoading = () => {
  return (
    <div className="mx-auto max-w-5xl px-5 py-6">
      <Skeleton className="mb-6 h-10 w-full" />
      <Skeleton className="mb-4 h-4 w-48" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
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

export default BarbershopsLoading

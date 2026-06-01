import { Skeleton } from "../_components/ui/skeleton"

const BookingsLoading = () => {
  return (
    <div className="mx-auto max-w-5xl px-5 py-5">
      <Skeleton className="mb-6 h-7 w-48" />
      <Skeleton className="mb-3 h-4 w-32" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[90px] w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default BookingsLoading

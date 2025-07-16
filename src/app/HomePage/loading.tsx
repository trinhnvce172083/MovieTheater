import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Carousel Skeleton */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Now Showing Section Skeleton */}
      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        
        <div className="flex gap-4 sm:gap-6 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={`now-showing-skeleton-${i}`} className="flex-shrink-0 w-48 sm:w-56 md:w-64">
              <Skeleton className="aspect-[3/4] w-full mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Section Skeleton */}
      <div className="mt-12 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-36" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        
        <div className="flex gap-4 sm:gap-6 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={`upcoming-skeleton-${i}`} className="flex-shrink-0 w-48 sm:w-56 md:w-64">
              <Skeleton className="aspect-[3/4] w-full mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
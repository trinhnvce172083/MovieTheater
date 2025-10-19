export default function NowShowingLoading() {
  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8 mt-16 px-4 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="text-center mb-6 sm:mb-8 lg:mb-10">
        <div className="h-8 sm:h-10 md:h-12 lg:h-16 bg-gray-700 rounded-lg mb-3 sm:mb-4 lg:mb-6 max-w-xs sm:max-w-md mx-auto animate-pulse"></div>
        <div className="h-4 sm:h-5 lg:h-6 bg-gray-700 rounded-lg max-w-xs sm:max-w-2xl mx-auto animate-pulse"></div>
      </div>

      {/* Search and Filters Skeleton */}
      <div className="mb-6 sm:mb-8 space-y-4">
        <div className="h-10 sm:h-12 bg-gray-700 rounded-lg animate-pulse"></div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 sm:h-10 bg-gray-700 rounded-full w-16 sm:w-20 animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Results Count Skeleton */}
      <div className="mb-4 sm:mb-6 px-2 sm:px-0">
        <div className="h-4 sm:h-5 bg-gray-700 rounded-lg w-32 sm:w-40 animate-pulse"></div>
      </div>

      {/* Movies Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-[3/4] bg-gray-700"></div>
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="h-4 sm:h-5 bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="h-8 sm:h-10 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
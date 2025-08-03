"use client";

import { useMovies, useMovieFilters } from "@/hooks/NowShowing/use-movie";
import { SearchFilters } from "@/app/NowShowing/components/search-filters";
import { MovieGrid } from "@/app/NowShowing/components/movie-grid";
import { ErrorState } from "@/app/NowShowing/components/error-state";
import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";

const NowShowingContainer = memo(function NowShowingContainer() {
  const router = useRouter();
  const { movies, loading, error, refetch } = useMovies();
  const { filters, filteredMovies, allGenres, updateFilters, clearFilters } =
    useMovieFilters(movies);

  const handleBookNow = useCallback((movieId: string) => {
    router.push(`${ROUTES.MOVIES}/${movieId}`);
  }, [router]);

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-8 mt-16 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center mb-6 sm:mb-8 lg:mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">
          Now Showing
        </h1>
        <p className="text-orange-200 text-base sm:text-lg lg:text-xl max-w-xs sm:max-w-2xl mx-auto leading-relaxed">
          Discover the latest blockbusters and must-see films playing in
          theaters now
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 sm:mb-8">
        <SearchFilters
          filters={filters}
          allGenres={allGenres}
          onFiltersChange={updateFilters}
        />
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="mb-4 sm:mb-6 px-2 sm:px-0">
          <p className="text-orange-200 text-sm sm:text-base">
            Showing {filteredMovies.length} movie
            {filteredMovies.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Movies Grid */}
      <MovieGrid
        movies={filteredMovies}
        loading={loading}
        onBookNow={handleBookNow}
        onClearFilters={clearFilters}
      />
    </div>
  );
});

export default NowShowingContainer;

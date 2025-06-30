"use client";

import {
  useMoviesApi,
  useMovieFiltersApi,
} from "@/hooks/MoviesApi/use-movies-api";
import { SearchFiltersApi } from "@/app/ComingSoon/components/search-filters-api";
import { MovieGridApi } from "@/app/ComingSoon/components/movie-grid-api";
import { ErrorStateApi } from "@/app/ComingSoon/components/error-state-api";
import { LoadingStateApi } from "@/app/ComingSoon/components/loading-state-api";

export default function MoviesApiPage() {
  const { movies, loading, error, refetch } = useMoviesApi();
  const { filters, filteredMovies, allGenres, updateFilters, clearFilters } =
    useMovieFiltersApi(movies);

  const handleBookNow = (movieId: string) => {
    console.log("Booking movie:", movieId);
    // Navigate to booking page - có thể implement sau
  };

  if (error) {
    return <ErrorStateApi error={error} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-orange-900 to-black">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-8 pt-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Coming Soon
          </h1>
          <p className="text-orange-200 text-lg max-w-2xl mx-auto">
            Discover coming soon movies
          </p>
        </div>

        {/* Search and Filters */}
        <SearchFiltersApi
          filters={filters}
          allGenres={allGenres}
          onFiltersChange={updateFilters}
          loading={loading}
        />

        {/* Results Count and Status */}
        {!loading && (
          <div className="mb-6 flex justify-between items-center">
            <p className="text-orange-200">
              Showing {filteredMovies.length} movie
              {filteredMovies.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingStateApi />}

        {/* Movies Grid */}
        {!loading && (
          <MovieGridApi
            movies={filteredMovies}
            onBookNow={handleBookNow}
            onClearFilters={clearFilters}
          />
        )}
      </div>
    </div>
  );
}

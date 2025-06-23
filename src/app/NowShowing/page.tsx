"use client";
import { useMovies, useMovieFilters } from "@/hooks/NowShowing/use-movie";
import { SearchFilters } from "@/app/NowShowing/components/search-filters";
import { MovieGrid } from "@/app/NowShowing/components/movie-grid";
import { ErrorState } from "@/app/NowShowing/components/error-state";


export default function NowShowingPage() {
  const { movies, loading, error, refetch } = useMovies();
  const { filters, filteredMovies, allGenres, updateFilters, clearFilters } =
    useMovieFilters(movies);

  const handleBookNow = (movieId: string) => {
    // Handle booking logic here
    console.log("Booking movie:", movieId);
    // You can navigate to booking page or open a modal
    // router.push(`/booking/${movieId}`)
  };

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="container mx-auto py-8 mt-16">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Now Showing
        </h1>
        <p className="text-orange-200 text-lg max-w-2xl mx-auto">
          Discover the latest blockbusters and must-see films playing in
          theaters now
        </p>
      </div>

      {/* Search and Filters */}
      <SearchFilters
        filters={filters}
        allGenres={allGenres}
        onFiltersChange={updateFilters}
      />

      {/* Results Count */}
      {!loading && (
        <div className="mb-6">
          <p className="text-orange-200">
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
}

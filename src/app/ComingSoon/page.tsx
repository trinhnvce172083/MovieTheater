"use client";

import { useMoviesApi, useMovieFiltersApi } from "@/hooks/MoviesApi/use-movies-api";
import { SearchFiltersApi } from "@/api/Coming-soon/search-filters-api";
import { MovieGridApi } from "@/api/Coming-soon/movie-grid-api";
import { ErrorStateApi } from "@/api/Coming-soon/error-state-api";
import { LoadingStateApi } from "@/api/Coming-soon/loading-state-api";

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

        {/* API Info Footer */}
        {!loading && !error && (
          <div className="mt-12 text-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-orange-500/20">
              <h3 className="text-orange-300 font-semibold mb-2">API Integration Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                <div>
                  <span className="text-orange-400">Endpoint:</span>
                  <br />
                  /movies/now-showing
                </div>
                <div>
                  <span className="text-orange-400">Total Movies:</span>
                  <br />
                  {movies.length} items
                </div>
                <div>
                  <span className="text-orange-400">Last Updated:</span>
                  <br />
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
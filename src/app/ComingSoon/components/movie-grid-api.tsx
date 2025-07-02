"use client";

import { Button } from "@/components/ui/button";
import type { Movie } from "@/types/NowShowing/movie";
import { Filter } from "lucide-react";
import { MovieCardApi } from "./movie-card-api";

interface MovieGridApiProps {
  movies: Movie[];
  onBookNow?: (movieId: string) => void;
  onClearFilters?: () => void;
}

export function MovieGridApi({
  movies,
  onBookNow,
  onClearFilters,
}: MovieGridApiProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 border border-orange-500/20">
          <Filter className="h-16 w-16 mx-auto mb-4 text-orange-400" />
          <h3 className="text-xl font-semibold mb-2 text-white">
            No movies found
          </h3>
          <p className="text-orange-200 mb-6">
            Try adjusting your search criteria or filters to find more movies
          </p>

          <div className="space-y-3">
            <p className="text-sm text-gray-400">Suggestions:</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Clear all filters and try again</li>
              <li>• Search for a different movie title</li>
              <li>• Try different genre or rating filters</li>
            </ul>
          </div>

          {onClearFilters && (
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="mt-6 border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Separate featured and regular movies
  const featuredMovies = movies.filter((movie) => movie.isFeatured);
  const regularMovies = movies.filter((movie) => !movie.isFeatured);

  return (
    <div className="space-y-8">
      {/* Featured Movies Section */}
      {featuredMovies.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-1 bg-orange-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Featured Movies</h2>
            <div className="bg-orange-500/20 px-3 py-1 rounded-full">
              <span className="text-orange-300 text-sm font-medium">
                {featuredMovies.length} movies
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredMovies.map((movie) => (
              <MovieCardApi
                key={movie.movieId}
                movie={movie}
                onBookNow={onBookNow}
                isFeatured={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Movies Section */}
      {regularMovies.length > 0 && (
        <div>
          {featuredMovies.length > 0 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1 bg-gray-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white">All Movies</h2>
                <div className="bg-gray-500/20 px-3 py-1 rounded-full">
                  <span className="text-gray-300 text-sm font-medium">
                    {regularMovies.length} movies
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {regularMovies.map((movie) => (
              <MovieCardApi
                key={movie.movieId}
                movie={movie}
                onBookNow={onBookNow}
                isFeatured={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Movies Summary */}
      <div className="mt-8 text-center">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-orange-500/20 inline-block">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-orange-300">
                {featuredMovies.length} Featured
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-gray-300">
                {regularMovies.length} Regular
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-300">{movies.length} Total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

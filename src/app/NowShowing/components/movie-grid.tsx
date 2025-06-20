"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieCard } from "./movie-card";
import type { Movie } from "@/types/NowShowing/movie";

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  onBookNow?: (movieId: string) => void;
  onClearFilters?: () => void;
}

export function MovieGrid({
  movies,
  loading,
  onBookNow,
  onClearFilters,
}: MovieGridProps) {
  if (loading) {
    return <MovieGridSkeleton />;
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Filter className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No movies found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
        {onClearFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
          >
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.movieId} movie={movie} onBookNow={onBookNow} />
      ))}
    </div>
  );
}

function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="bg-gray-900/80 border border-orange-500/20 rounded-lg overflow-hidden animate-pulse"
        >
          <div className="h-64 bg-gray-700" />
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-700 rounded" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-gray-700 rounded" />
              <div className="h-5 w-20 bg-gray-700 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-700 rounded w-1/2" />
            </div>
            <div className="flex justify-between items-center pt-4">
              <div className="h-6 w-16 bg-gray-700 rounded" />
              <div className="h-8 w-20 bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

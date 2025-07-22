"use client";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Movie } from "@/types/NowShowing/movie";
import { Filter } from "lucide-react";
import { useState } from "react";
import { MovieCard } from "./movie-card";

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  onBookNow?: (movieId: string) => void;
  onClearFilters?: () => void;
  itemsPerPage?: number;
}

export function MovieGrid({
  movies,
  loading,
  onBookNow,
  onClearFilters,
  itemsPerPage = 9,
}: MovieGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (loading) {
    return <MovieGridSkeleton />;
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="text-gray-400 mb-4 sm:mb-6">
          <Filter className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No movies found</h3>
          <p className="text-sm sm:text-base">Try adjusting your search criteria or filters</p>
        </div>
        {onClearFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
          >
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(movies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovies = movies.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    // Always show first page
    pages.push(1);

    // Current page and surrounding pages
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    // Always show current page if it's not the first or last
    if (currentPage > 1 && currentPage < totalPages) {
      pages.push(currentPage);
    }

    // If there are more than 3 pages, add ellipsis before last page
    if (totalPages > 3 && currentPage < totalPages - 1) {
      pages.push(-1); // Negative values represent ellipsis
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    // Add ellipsis indicators
    const result = [];
    let prev = 0;

    // Iterate through pages and add ellipsis where needed
    for (const page of pages) {
      if (page - prev > 1) {
        result.push(-prev); // Negative values represent ellipsis after page `abs(value)`
      }
      result.push(page);
      prev = page;
    }

    return result;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Movies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {currentMovies.map((movie) => (
          <MovieCard key={movie.movieId} movie={movie} onBookNow={onBookNow} />
        ))}
      </div>

      {/* Always show Pagination bar */}
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                  window.scrollTo(0, 0);
                }
              }}
              className={
                currentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {getPageNumbers().map((pageNum, index) => {
            if (pageNum < 0) {
              // This is an ellipsis
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  isActive={pageNum === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(pageNum);
                    window.scrollTo(0, 0);
                  }}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) {
                  setCurrentPage(currentPage + 1);
                  window.scrollTo(0, 0);
                }
              }}
              className={
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="bg-gray-900/80 border border-orange-500/20 rounded-lg overflow-hidden animate-pulse"
        >
          {/* Movie poster skeleton */}
          <div className="aspect-[3/4] bg-gray-700" />
          
          {/* Movie info skeleton */}
          <div className="p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3">
            {/* Title skeleton */}
            <div className="h-4 sm:h-5 lg:h-6 bg-gray-700 rounded" />
            
            {/* Genre badges skeleton */}
            <div className="flex gap-1 sm:gap-2">
              <div className="h-4 sm:h-5 w-12 sm:w-16 bg-gray-700 rounded" />
              <div className="h-4 sm:h-5 w-16 sm:w-20 bg-gray-700 rounded" />
            </div>
            
            {/* Movie details skeleton */}
            <div className="space-y-2">
              <div className="h-3 sm:h-4 bg-gray-700 rounded w-3/4" />
              <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/2" />
            </div>
            
            {/* Price and buttons skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 sm:pt-4 gap-2 sm:gap-0">
              <div className="h-4 sm:h-6 w-12 sm:w-16 bg-gray-700 rounded" />
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-700 rounded" />
                <div className="h-6 sm:h-8 w-20 sm:w-24 bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

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
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentMovies.map((movie) => (
          <MovieCard key={movie.movieId} movie={movie} onBookNow={onBookNow} />
        ))}{" "}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, index) => (
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

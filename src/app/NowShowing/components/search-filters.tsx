"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MovieFilters } from "@/types/NowShowing/movie";
import { MovieApiService } from "@/api/movie-api";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SearchFiltersProps {
  filters: MovieFilters;
  allGenres: string[];
  onFiltersChange: (filters: Partial<MovieFilters>) => void;
}

export function SearchFilters({
  filters,
  allGenres,
  onFiltersChange,
}: SearchFiltersProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "");

  // Execute search function
  const executeSearch = async (term: string) => {
    if (term.trim().length === 0) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const result = await MovieApiService.searchMoviesNowShowing(term, 0, 9);
      if (result.success && result.data) {
        onFiltersChange({ searchTerm: term });
      }
    } catch (error) {
      console.error("Error searching movies:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle input change without searching
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim().length === 0) {
      onFiltersChange({ searchTerm: "" });
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeSearch(searchTerm);
    }
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-orange-500/20">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-8 justify-items-center">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-300 h-4 w-4" />
          <div className="flex">
            <Input
              placeholder="Search movies..."
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="pl-10 bg-gray-800 border-orange-500/30 text-white placeholder:text-gray-400"
            />
            <Button
              type="button"
              className="ml-2 px-3 py-2 bg-orange-700 text-white rounded"
              onClick={() => executeSearch(searchTerm)}
              disabled={isSearching}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-t-2 border-orange-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Genre Filter */}
        <Select
          value={filters.selectedGenre}
          onValueChange={(value) => onFiltersChange({ selectedGenre: value })}
        >
          <SelectTrigger className="bg-gray-800 border-orange-500/30 text-white">
            <SelectValue placeholder="All Genres" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-orange-500/30">
            <SelectItem value="all">All Genres</SelectItem>
            {allGenres.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rating Filter */}
        <Select
          value={filters.selectedRating}
          onValueChange={(value) => onFiltersChange({ selectedRating: value })}
        >
          <SelectTrigger className="bg-gray-800 border-orange-500/30 text-white">
            <SelectValue placeholder="All Ratings" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-orange-500/30">
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="G">G</SelectItem>
            <SelectItem value="PG">PG</SelectItem>
            <SelectItem value="PG-13">PG-13</SelectItem>
            <SelectItem value="R">R</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFiltersChange({ sortBy: value })}
        >
          <SelectTrigger className="bg-gray-800 border-orange-500/30 text-white">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-orange-500/30">
            <SelectItem value="featured">Featured First</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="price">Lowest Price</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

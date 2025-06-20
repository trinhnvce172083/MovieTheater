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
import axiosClient from "@/api/axiosClient";
import { useState, useEffect, useRef } from "react";

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
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);  // Handle search with debounce
  const handleSearch = (term: string) => {
    // Update the input value immediately
    onFiltersChange({ searchTerm: term });
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Only search if term has minimum length
    if (term.trim().length > 2) {
      setIsSearching(true);
      
      // Set a new timeout
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          // Sử dụng đúng cấu trúc API với các tham số keyword, page và size
          const result = await MovieApiService.searchMovies(term, 0, 10); // page=0, size=10
          if (result.success && result.data) {
            // You can pass the search results to parent component if needed
            // For example with a callback like onSearchResults(result.data)
            console.log("Search results:", result.data);
          }
        } catch (error) {
          console.error("Error searching movies:", error);
        } finally {
          setIsSearching(false);
        }
      }, 500); // 500ms debounce time
    } else {
      setIsSearching(false);
    }
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-orange-500/20">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-8 justify-items-center">        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-300 h-4 w-4" />
          <Input
            placeholder="Search movies..."
            value={filters.searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-gray-800 border-orange-500/30 text-white placeholder:text-gray-400"
          />
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

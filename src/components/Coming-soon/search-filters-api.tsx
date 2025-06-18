"use client";

import { Search, Filter, RotateCcw, Wifi, WifiOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MovieFilters } from "@/types/NowShowing/movie";

interface SearchFiltersApiProps {
  filters: MovieFilters;
  allGenres: string[];
  onFiltersChange: (filters: Partial<MovieFilters>) => void;
  loading?: boolean;
}

export function SearchFiltersApi({
  filters,
  allGenres,
  onFiltersChange,
  loading = false,
}: SearchFiltersApiProps) {
  const hasActiveFilters = 
    filters.searchTerm !== "" ||
    filters.selectedGenre !== "all" ||
    filters.selectedRating !== "all" ||
    filters.sortBy !== "featured";

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: "",
      selectedGenre: "all",
      selectedRating: "all",
      sortBy: "featured",
    });
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-orange-500/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-white">Search & Filter Movies</h2>
        </div>
        
        <div className="flex items-center gap-4">
          {/* API Status Indicator */}
          <div className="flex items-center gap-2">
            {loading ? (
              <>
                <WifiOff className="h-4 w-4 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400 text-sm">Loading...</span>
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm">Connected</span>
              </>
            )}
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              onClick={clearAllFilters}
              variant="outline"
              size="sm"
              className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-300 h-4 w-4" />
          <Input
            placeholder="Search movies, genres..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
            className="pl-10 bg-gray-800 border-orange-500/30 text-white placeholder:text-gray-400 focus:border-orange-500"
            disabled={loading}
          />
        </div>

        {/* Genre Filter */}
        <Select
          value={filters.selectedGenre}
          onValueChange={(value) => onFiltersChange({ selectedGenre: value })}
          disabled={loading}
        >
          <SelectTrigger className="bg-gray-800 border-orange-500/30 text-white focus:border-orange-500">
            <SelectValue placeholder="All Genres" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-orange-500/30">
            <SelectItem value="all">All Genres ({allGenres.length})</SelectItem>
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
          disabled={loading}
        >
          <SelectTrigger className="bg-gray-800 border-orange-500/30 text-white focus:border-orange-500">
            <SelectValue placeholder="All Ratings" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-orange-500/30">
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="G">G - General</SelectItem>
            <SelectItem value="PG">PG - Parental Guidance</SelectItem>
            <SelectItem value="PG-13">PG-13 - Parents Cautioned</SelectItem>
            <SelectItem value="R">R - Restricted</SelectItem>
            <SelectItem value="NC-17">NC-17 - Adults Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFiltersChange({ sortBy: value })}
          disabled={loading}
        >
          <SelectTrigger className="bg-gray-800 border-orange-500/30 text-white focus:border-orange-500">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-orange-500/30">
            <SelectItem value="featured">🌟 Featured First</SelectItem>
            <SelectItem value="title">🔤 Title A-Z</SelectItem>
            <SelectItem value="rating">⭐ Highest Rated</SelectItem>
            <SelectItem value="price">💰 Lowest Price</SelectItem>
            <SelectItem value="newest">📅 Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-orange-500/20">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-orange-300 text-sm font-medium">Active filters:</span>
            
            {filters.searchTerm && (
              <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs">
                Search: "{filters.searchTerm}"
              </span>
            )}
            
            {filters.selectedGenre !== "all" && (
              <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs">
                Genre: {filters.selectedGenre}
              </span>
            )}
            
            {filters.selectedRating !== "all" && (
              <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs">
                Rating: {filters.selectedRating}
              </span>
            )}
            
            {filters.sortBy !== "featured" && (
              <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs">
                Sort: {filters.sortBy}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
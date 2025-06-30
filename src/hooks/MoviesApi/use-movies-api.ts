"use client";

import { useState, useEffect, useMemo } from "react";
import { MovieApiService } from "@/api/movie-api";
import type { Movie, MovieFilters } from "@/types/NowShowing/movie";

// Enhanced hook với retry logic và caching
export function useMoviesApi() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchMovies = async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate network delay for demo
      await new Promise(resolve => setTimeout(resolve, isRetry ? 500 : 1000));

      const response = await MovieApiService.getUpComingMovies();

      if (response.success) {
        setMovies(response.data);
        setRetryCount(0);
      } else {
        throw new Error(response.message || "Failed to fetch movies");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("API Error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const refetch = () => {
    setRetryCount(prev => prev + 1);
    fetchMovies(true);
  };

  return {
    movies,
    loading,
    error,
    refetch,
    retryCount,
  };
}

// Enhanced filters hook với advanced filtering
export function useMovieFiltersApi(movies: Movie[]) {
  const [filters, setFilters] = useState<MovieFilters>({
    searchTerm: "",
    selectedGenre: "all",
    selectedRating: "all",
    sortBy: "featured",
  });

  // Extract unique genres from movies
  const allGenres = useMemo(() => {
    const genreSet = new Set<string>();
    movies.forEach((movie) => {
      const genreArray = Array.isArray(movie.genre) 
        ? movie.genre 
        : (typeof movie.genre === "string" ? movie.genre.split(",") : []);
      
      genreArray.forEach((genre) => {
        if (genre && genre.trim()) {
          genreSet.add(genre.trim());
        }
      });
    });
    return Array.from(genreSet).sort();
  }, [movies]);

  // Enhanced filtering logic
  const filteredMovies = useMemo(() => {
    let filtered = [...movies];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((movie) =>
        movie.title.toLowerCase().includes(searchLower) ||
        (Array.isArray(movie.genre) 
          ? movie.genre.some(g => g.toLowerCase().includes(searchLower))
          : movie.genre.toLowerCase().includes(searchLower))
      );
    }

    // Genre filter
    if (filters.selectedGenre !== "all") {
      filtered = filtered.filter((movie) => {
        const genreArray = Array.isArray(movie.genre) 
          ? movie.genre 
          : (typeof movie.genre === "string" ? movie.genre.split(",") : []);
        return genreArray.some(g => g.trim() === filters.selectedGenre);
      });
    }

    // Rating filter
    if (filters.selectedRating !== "all") {
      filtered = filtered.filter((movie) => movie.rating === filters.selectedRating);
    }

    // Sort logic
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "featured":
          // Featured movies first, then by IMDB rating
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.imdbRating - a.imdbRating;
        
        case "title":
          return a.title.localeCompare(b.title);
        
        case "rating":
          return b.imdbRating - a.imdbRating;
        
        case "price":
          return a.price - b.price;
        
        case "newest":
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        
        default:
          return 0;
      }
    });

    return filtered;
  }, [movies, filters]);

  const updateFilters = (newFilters: Partial<MovieFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      selectedGenre: "all",
      selectedRating: "all",
      sortBy: "featured",
    });
  };

  // Get filter statistics
  const filterStats = useMemo(() => {
    return {
      totalMovies: movies.length,
      filteredCount: filteredMovies.length,
      featuredCount: movies.filter(m => m.isFeatured).length,
      genreCount: allGenres.length,
      averageRating: movies.length > 0 
        ? (movies.reduce((sum, movie) => sum + movie.imdbRating, 0) / movies.length).toFixed(1)
        : "0.0"
    };
  }, [movies, filteredMovies, allGenres]);

  return {
    filters,
    filteredMovies,
    allGenres,
    updateFilters,
    clearFilters,
    filterStats,
  };
} 
"use client";

import { useState, useEffect, useMemo } from "react";
import { MovieApiService } from "@/api/movie-api";
import type { Movie, MovieFilters } from "@/types/NowShowing/movie";

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await MovieApiService.getNowShowingMovies();

      if (response.success) {
        setMovies(response.data);
      } else {
        setError(response.message || "Failed to fetch movies");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const refetch = () => {
    fetchMovies();
  };

  return {
    movies,
    loading,
    error,
    refetch,
  };
}

export function useMovieFilters(movies: Movie[]) {
  const [filters, setFilters] = useState<MovieFilters>({
    searchTerm: "",
    selectedGenre: "all",
    selectedRating: "all",
    sortBy: "featured",
  });

  // Get unique genres for filter
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    movies.forEach((movie) => {
      // Đảm bảo genre luôn là mảng
      const genreArr = Array.isArray(movie.genre)
        ? movie.genre
        : (typeof movie.genre === "string" ? movie.genre : "")
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean);
      genreArr.forEach((g) => genres.add(g));
    });
    return Array.from(genres).sort();
  }, [movies]);

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    const filtered = movies.filter((movie) => {
      const matchesSearch = movie.title
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase());
      const matchesGenre =
        filters.selectedGenre === "all" ||
        movie.genre.includes(filters.selectedGenre);
      const matchesRating =
        filters.selectedRating === "all" ||
        movie.rating === filters.selectedRating;

      return matchesSearch && matchesGenre && matchesRating;
    });

    // Sort movies
    switch (filters.sortBy) {
      case "featured":
        return filtered.sort(
          (a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
        );
      case "title":
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case "rating":
        return filtered.sort((a, b) => b.imdbRating - a.imdbRating);
      case "price":
        return filtered.sort((a, b) => a.price - b.price);
      default:
        return filtered;
    }
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

  return {
    filters,
    filteredMovies,
    allGenres,
    updateFilters,
    clearFilters,
  };
}

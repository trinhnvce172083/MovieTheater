import type { Movie, ApiResponse } from "@/types/NowShowing/movie";
import axiosClient from "./axiosClient";
import { transformBackendToFrontend, type BackendMovie } from "@/utils/movieTransform";

export class MovieApiService {
  static async getNowShowingMovies(): Promise<ApiResponse<Movie[]>> {
    try {
      const response = await axiosClient.get("/movies/now-showing");
      const data = response.data;
      
      // Backend returns array directly for this endpoint, transform each movie
      const backendMovies = Array.isArray(data) ? data : [];
      const transformedMovies = backendMovies.map((movie: BackendMovie) => transformBackendToFrontend(movie));
      
      return {
        data: transformedMovies,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error fetching now showing movies:", error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch movies",
      };
    }
  }

  static async getUpComingMovies(): Promise<ApiResponse<Movie[]>> {
    try {
      const response = await axiosClient.get("/movies/coming-soon");
      const data = response.data;
      
      // Backend returns array directly for this endpoint, transform each movie
      const backendMovies = Array.isArray(data) ? data : [];
      const transformedMovies = backendMovies.map((movie: BackendMovie) => transformBackendToFrontend(movie));
      
      return {
        data: transformedMovies,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error fetching upcoming movies:", error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch movies",
      };
    }
  }

  static async getMoviesByGenre(genre: string): Promise<ApiResponse<Movie[]>> {
    try {
      const response = await axiosClient.get(`/movies/genre/${encodeURIComponent(genre)}`);
      const data = response.data;
      
      // Backend returns array directly for this endpoint, transform each movie
      const backendMovies = Array.isArray(data) ? data : [];
      const transformedMovies = backendMovies.map((movie: BackendMovie) => transformBackendToFrontend(movie));
      
      return {
        data: transformedMovies,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error fetching movies by genre:", error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch movies",
      };
    }
  }

  static async searchMoviesNowShowing(query: string, page: number = 0, size: number = 10): Promise<ApiResponse<Movie[]>> {
    try {
      const response = await axiosClient.get("/movies/search", {
        params: { keyword: query, page, size },
      });
      const data = response.data;
      
      // Backend returns Spring Boot Page<T> format for search
      const moviesArray = Array.isArray(data.content) ? data.content : [];
      const transformedMovies = moviesArray.map((movie: BackendMovie) => transformBackendToFrontend(movie));
      const nowShowingMovies = transformedMovies.filter((movie: Movie) => movie.status === "NOW_SHOWING");
      
      return {
        data: nowShowingMovies,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error searching movies:", error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to search movies",
      };
    }
  }

  static async getMovieById(movieId: string | number): Promise<ApiResponse<Movie>> {
    try {
      const response = await axiosClient.get(`/movies/${movieId}`);
      
      // Transform the single movie response
      const transformedMovie = transformBackendToFrontend(response.data as BackendMovie);
      
      return {
        data: transformedMovie,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error fetching movie:", error);
      return {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch movie",
      };
    }
  }

  static async getAllMovies(page: number = 0, size: number = 10, sortBy: string = "title", sortDirection: string = "asc"): Promise<ApiResponse<{content: Movie[], totalElements: number, totalPages: number, page: number, size: number}>> {
    try {
      const response = await axiosClient.get("/movies", {
        params: { page, size, sortBy, sortDirection },
      });
      const data = response.data;
      
      // Backend returns Spring Boot Page<T> format - transform the content
      const backendMovies = Array.isArray(data.content) ? data.content : [];
      const transformedMovies = backendMovies.map((movie: BackendMovie) => transformBackendToFrontend(movie));
      
      return {
        data: {
          content: transformedMovies,
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0,
          page: data.number || 0,
          size: data.size || 10
        },
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error fetching all movies:", error);
      return {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          page: 0,
          size: 10
        },
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch movies",
      };
    }
  }

  static async getMoviesWithFilter(filterRequest: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
    keyword?: string;
    genres?: string[];
    status?: string;
    rating?: string;
    priceMin?: number;
    priceMax?: number;
    imdbRatingMin?: number;
    isFeatured?: boolean;
    isAdultContent?: boolean;
  }): Promise<ApiResponse<{movies: Movie[], totalElements: number, totalPages: number, page: number, size: number}>> {
    try {
      const response = await axiosClient.post("/movies/filter", filterRequest);
      const data = response.data;
      
      // Backend returns MovieListResponse format with movies array and pagination object
      const backendMovies = Array.isArray(data.movies) ? data.movies : [];
      const transformedMovies = backendMovies.map((movie: BackendMovie) => transformBackendToFrontend(movie));
      
      return {
        data: {
          movies: transformedMovies,
          totalElements: data.pagination?.totalElements || 0,
          totalPages: data.pagination?.totalPages || 0,
          page: data.pagination?.currentPage || 0,
          size: data.pagination?.pageSize || 10
        },
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error filtering movies:", error);
      return {
        data: {
          movies: [],
          totalElements: 0,
          totalPages: 0,
          page: 0,
          size: 10
        },
        success: false,
        message: error instanceof Error ? error.message : "Failed to filter movies",
      };
    }
  }
}
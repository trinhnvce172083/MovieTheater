import type { ApiResponse } from "@/types/NowShowing/movie";
import axiosClient from "./axiosClient";

// Extended Movie Details Type - Updated to match actual API response
export interface MovieDetails {
  movieId: number;
  title: string;
  description: string;
  duration: number;
  formattedDuration: string;
  genre: string;
  director: string;
  cast: string;
  language: string;
  country: string;
  releaseDate: string;
  rating: string;
  posterUrl: string;
  trailerUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  price: number;
  status: string;
  imdbRating: number;
  productionCompany: string;
  budget: number;
  boxOffice: number;
  createdAt: string;
  updatedAt: string;
  isAdultContent: boolean;
  isNowShowing: boolean;
  isComingSoon: boolean;
  isEnded: boolean;
  scheduleCount: number;
}

export class MovieDetailsApiService {
  static async getMovieDetails(movieId: string | number): Promise<ApiResponse<MovieDetails>> {
    try {
      console.log(`🎬 Fetching movie details for ID: ${movieId}`);
      
      // Fetch from real API - fixed endpoint
      const response = await axiosClient.get(`/movies/${movieId}`);
      const data = response.data;
      
      console.log("✅ Movie details API response:", data);
      
      // Handle ApiResponse format from backend
      if (data && data.success && data.data) {
        return {
          data: data.data,
          success: true,
          message: data.message
        };
      } else {
        return {
          data: null,
          success: false,
          message: data?.message || "Failed to fetch movie details"
        };
      }
    } catch (error: unknown) {
      console.error("❌ API Error:", error);
      
      return {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch movie details"
      };
    }
  }

  static async getAllMovies(): Promise<ApiResponse<MovieDetails[]>> {
    try {
      console.log("🎬 Fetching all movies from API");
      const response = await axiosClient.get('/movies');
      const data = response.data;
      
      // Handle ApiResponse format from backend
      if (data && data.success && data.data && data.data.content) {
        return {
          data: data.data.content,
          success: true,
          message: data.message
        };
      } else {
        return {
          data: [],
          success: false,
          message: data?.message || "Failed to fetch movies"
        };
      }
    } catch (error: unknown) {
      console.error("❌ API Error:", error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch movies"
      };
    }
  }

  static async getNowShowingMovies(): Promise<ApiResponse<MovieDetails[]>> {
    try {
      console.log("🎬 Fetching now showing movies from API");
      const response = await axiosClient.get('/movies/now-showing');
      const data = response.data;
      
      // Handle ApiResponse format from backend
      if (data && data.success && data.data) {
        return {
          data: data.data,
          success: true,
          message: data.message
        };
      } else {
        return {
          data: [],
          success: false,
          message: data?.message || "Failed to fetch now showing movies"
        };
      }
    } catch (error: unknown) {
      console.error("❌ API Error:", error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch now showing movies"
      };
    }
  }

  static async getComingSoonMovies(): Promise<ApiResponse<MovieDetails[]>> {
    try {
      console.log("🎬 Fetching coming soon movies from API");
      const response = await axiosClient.get('/movies/coming-soon');
      const data = response.data;
      
      // Handle ApiResponse format from backend
      if (data && data.success && data.data) {
        return {
          data: data.data,
          success: true,
          message: data.message
        };
      } else {
        return {
          data: [],
          success: false,
          message: data?.message || "Failed to fetch coming soon movies"
        };
      }
    } catch (error: unknown) {
      console.error("❌ API Error:", error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch coming soon movies"
      };
    }
  }
} 
import type { Movie, ApiResponse } from "@/types/NowShowing/movie";
import axiosClient from "./axiosClient";

export class MovieApiService {
  static async getNowShowingMovies(): Promise<ApiResponse<Movie[]>> {
    try {
      const response = await axiosClient.get("/movies/now-showing");
      const data = response.data;
      
      // Handle the structure: { success: true, data: [...] }
      if (data && data.success && Array.isArray(data.data)) {
        return {
          data: data.data,
          success: true,
          message: data.message,
        };
      } else {
        console.error("Unexpected API response structure:", data);
        return {
          data: [],
          success: false,
          message: data?.message || "Failed to fetch now showing movies",
        };
      }
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
      
      // Handle the structure: { success: true, data: [...] }
      if (data && data.success && Array.isArray(data.data)) {
        return {
          data: data.data,
          success: true,
          message: data.message,
        };
      } else {
        console.error("Unexpected API response structure for upcoming:", data);    
        return {
          data: [],
          success: false,
          message: data?.message || "Failed to fetch upcoming movies",
        };
      }
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
      
      // Handle the structure: { success: true, data: [...] }
      if (data && data.success && Array.isArray(data.data)) {
        return {
          data: data.data,
          success: true,
          message: data.message,
        };
      } else if (Array.isArray(data)) {
        // Fallback for direct array response
        return {
          data: data,
          success: true,
        };
      } else {
        console.error("Unexpected API response structure for genre:", data);
        return {
          data: [],
          success: false,
          message: data?.message || "Failed to fetch movies by genre",
        };
      }
    } catch (error: unknown) {
      console.error("Error fetching movies by genre:", error);
      return {
        data: [],success: false,
        message: error instanceof Error ? error.message : "Failed to fetch movies",
      };
    }
  }

  static async searchMoviesNowShowing(query: string, page: number = 0, size: number = 9): Promise<ApiResponse<Movie[]>> {
    try {
      const response = await axiosClient.get("/movies/search", {
        params: { keyword: query, page, size },
      });
      const data = response.data;
      
      // Handle the structure: { success: true, data: [...] }
      let moviesArray: Movie[] = [];
      if (data && data.success && Array.isArray(data.data)) {
        moviesArray = data.data;
      } else if (Array.isArray(data)) {
        moviesArray = data;
      }
      
      const nowShowingMovies = moviesArray.filter((movie: Movie) => movie.status === "NOW_SHOWING");
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
      const data = response.data;
      
      // Handle the nested structure: { success: true, data: {...} }
      if (data && data.success && data.data) {
        return {
          data: data.data,
          success: true,
          message: data.message,
        };
      } else if (data && !data.success) {
        return {
          data: null,
          success: false,
          message: data?.message || "Failed to fetch movie",
        };
      } else {
        // Fallback for direct movie object response
        return {
          data: data,
          success: true,
        };
      }
    } catch (error: unknown) {
      console.error("Error fetching movie:", error);
      return {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch movie",
      };
    }
  }
}
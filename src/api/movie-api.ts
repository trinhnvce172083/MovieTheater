import type { Movie, ApiResponse } from "@/types/NowShowing/movie";
import axiosClient from "./axiosClient";

export class MovieApiService {
  static async getNowShowingMovies(): Promise<ApiResponse<Movie[]>> {
    try {
      const response = await axiosClient.get("/movies/now-showing");
      const data = response.data;
      return {
        data: data.movies || data,
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
      return {
        data: data.movies || data,
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
      return {
        data: data.movies || data,
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

  static async searchMovies(query: string): Promise<ApiResponse<Movie[]>> {
    try {
      const response = await axiosClient.get("/movies/search", {
        params: { q: query },
      });
      const data = response.data;
      return {
        data: data.movies || data,
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
}
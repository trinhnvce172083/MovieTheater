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

  static async searchMoviesNowShowing(query: string, page: number = 0, size: number = 9): Promise<ApiResponse<Movie[]>> {
    try {
      const response = await axiosClient.get("/movies/search", {
        params: { keyword: query, page, size },
      });
      const data = response.data;
      const moviesArray = Array.isArray(data.movies)
        ? data.movies
        : Array.isArray(data)
        ? data
        : [];
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
      return {
        data: response.data,
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
}
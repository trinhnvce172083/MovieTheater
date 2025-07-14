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

  static async getAllMovies(page: number = 0, size: number = 10, sortBy: string = "title", sortDirection: string = "asc"): Promise<ApiResponse<{content: Movie[], totalElements: number, totalPages: number, page: number, size: number}>> {
    try {
      const response = await axiosClient.get("/movies", {
        params: { page, size, sortBy, sortDirection },
      });
      const data = response.data;
      
      // Transform the movie data to match the expected format
      const transformedContent = (data.content || []).map((movie: Record<string, unknown>) => ({
        ...movie,
        genre: typeof movie.genre === 'string' 
          ? movie.genre.split(', ').map((g: string) => g.trim())
          : Array.isArray(movie.genre) ? movie.genre : [movie.genre || '']
      }));
      
      return {
        data: {
          content: transformedContent,
          totalElements: data.page?.totalElements || 0,
          totalPages: data.page?.totalPages || 0,
          page: data.page?.number || 0,
          size: data.page?.size || 10
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
      
      // Transform the movie data to match the expected format
      const transformedMovies = (data.movies || []).map((movie: Record<string, unknown>) => ({
        ...movie,
        // Transform genres string to genre array
        genre: typeof movie.genres === 'string' 
          ? movie.genres.split(', ').map((g: string) => g.trim())
          : Array.isArray(movie.genres) ? movie.genres : [movie.genres || ''],
        // Map adultContent to isAdultContent if needed
        isAdultContent: movie.adultContent !== undefined ? movie.adultContent : movie.isAdultContent
      }));
      
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
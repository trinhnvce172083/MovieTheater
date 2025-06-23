import axiosClient from "../axiosClient";

// Movie Types
export interface Movie {
  movieId: number;
  title: string;
  originalTitle?: string;
  vietnameseTitle?: string;
  description?: string;
  releaseDate: string;
  productionCompany?: string;
  company?: string;
  duration: number;
  genres?: string;
  versions?: string[];
  rating: string;
  status: string; // NOW_SHOWING, COMING_SOON, ENDED
  boxOffice?: number;
  revenue?: number;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  director?: string;
  cast?: string;
  language?: string;
  country?: string;
  endDate?: string;
  price?: number;
  imdbRating?: number;
  budget?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isAdultContent?: boolean;
  isNowShowing?: boolean;
  isComingSoon?: boolean;
  isEnded?: boolean;
  scheduleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MovieCreateRequest {
  title: string;
  originalTitle?: string;
  description?: string;
  duration: number;
  genres?: string;
  director?: string;
  cast?: string;
  language?: string;
  country?: string;
  releaseDate: string;
  endDate?: string;
  rating?: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  price?: number;
  status?: string;
  imdbRating?: number;
  productionCompany?: string;
  budget?: number;
  boxOffice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface MovieUpdateRequest extends Partial<MovieCreateRequest> {}

export interface GetMoviesParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
  status?: string;
  genre?: string;
}

export interface MoviesResponse {
  content: Movie[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface MovieStatistics {
  totalMovies: number;
  nowShowing: number;
  comingSoon: number;
  ended: number;
  totalRevenue: number;
  averageRating: number;
}

// Movie API Functions
export const movieApi = {
  // Get all movies with pagination and filters
  async getMovies(params: GetMoviesParams = {}): Promise<MoviesResponse> {
    try {
      const response = await axiosClient.get("/api/movies", {
        params: {
          page: params.page || 0,
          size: params.size || 10,
          sortBy: params.sortBy || "title",
          sortDirection: params.sortDirection || "asc",
          search: params.search,
          status: params.status,
          genre: params.genre,
        },
      });

      const data = response.data;
      return {
        content: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        size: data.size || params.size || 10,
        number: data.number || params.page || 0,
        first: data.first || true,
        last: data.last || true,
      };
    } catch (error) {
      console.error("Error fetching movies:", error);
      throw error;
    }
  },

  // Get movie by ID
  async getMovieById(id: number): Promise<Movie> {
    try {
      const response = await axiosClient.get(`/api/movies/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching movie by ID:", error);
      throw error;
    }
  },

  // Create new movie
  async createMovie(movieData: MovieCreateRequest): Promise<Movie> {
    try {
      const response = await axiosClient.post("/api/movies", movieData);
      return response.data;
    } catch (error) {
      console.error("Error creating movie:", error);
      throw error;
    }
  },

  // Update movie
  async updateMovie(id: number, movieData: MovieUpdateRequest): Promise<Movie> {
    try {
      const response = await axiosClient.put(`/api/movies/${id}`, movieData);
      return response.data;
    } catch (error) {
      console.error("Error updating movie:", error);
      throw error;
    }
  },

  // Delete movie
  async deleteMovie(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/api/movies/${id}`);
    } catch (error) {
      console.error("Error deleting movie:", error);
      throw error;
    }
  },

  // Get now showing movies
  async getNowShowingMovies(): Promise<Movie[]> {
    try {
      const response = await axiosClient.get("/api/movies/now-showing");
      return response.data;
    } catch (error) {
      console.error("Error fetching now showing movies:", error);
      throw error;
    }
  },

  // Get coming soon movies
  async getComingSoonMovies(): Promise<Movie[]> {
    try {
      const response = await axiosClient.get("/api/movies/coming-soon");
      return response.data;
    } catch (error) {
      console.error("Error fetching coming soon movies:", error);
      throw error;
    }
  },

  // Get popular movies
  async getPopularMovies(limit: number = 10): Promise<Movie[]> {
    try {
      const response = await axiosClient.get("/api/movies/popular", {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      throw error;
    }
  },

  // Search movies
  async searchMovies(query: string, params: Omit<GetMoviesParams, 'search'> = {}): Promise<MoviesResponse> {
    try {
      const response = await axiosClient.get("/api/movies", {
        params: {
          ...params,
          search: query,
        },
      });

      const data = response.data;
      return {
        content: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        size: data.size || params.size || 10,
        number: data.number || params.page || 0,
        first: data.first || true,
        last: data.last || true,
      };
    } catch (error) {
      console.error("Error searching movies:", error);
      throw error;
    }
  },

  // Get movies by status
  async getMoviesByStatus(status: string, params: Omit<GetMoviesParams, 'status'> = {}): Promise<MoviesResponse> {
    try {
      const response = await axiosClient.get("/api/movies", {
        params: {
          ...params,
          status,
        },
      });

      const data = response.data;
      return {
        content: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        size: data.size || params.size || 10,
        number: data.number || params.page || 0,
        first: data.first || true,
        last: data.last || true,
      };
    } catch (error) {
      console.error("Error fetching movies by status:", error);
      throw error;
    }
  },

  // Get movies by genre
  async getMoviesByGenre(genre: string, params: Omit<GetMoviesParams, 'genre'> = {}): Promise<MoviesResponse> {
    try {
      const response = await axiosClient.get("/api/movies", {
        params: {
          ...params,
          genre,
        },
      });

      const data = response.data;
      return {
        content: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        size: data.size || params.size || 10,
        number: data.number || params.page || 0,
        first: data.first || true,
        last: data.last || true,
      };
    } catch (error) {
      console.error("Error fetching movies by genre:", error);
      throw error;
    }
  },

  // Get movie statistics
  async getMovieStatistics(): Promise<MovieStatistics> {
    try {
      const response = await axiosClient.get("/api/movies/statistics");
      return response.data;
    } catch (error) {
      console.error("Error fetching movie statistics:", error);
      throw error;
    }
  },

  // Upload movie poster
  async uploadPoster(id: number, file: File): Promise<{ posterUrl: string }> {
    try {
      const formData = new FormData();
      formData.append("poster", file);

      const response = await axiosClient.post(`/api/movies/${id}/poster`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading poster:", error);
      throw error;
    }
  },

  // Upload movie backdrop
  async uploadBackdrop(id: number, file: File): Promise<{ backdropUrl: string }> {
    try {
      const formData = new FormData();
      formData.append("backdrop", file);

      const response = await axiosClient.post(`/api/movies/${id}/backdrop`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading backdrop:", error);
      throw error;
    }
  },

  // Toggle movie status
  async toggleMovieStatus(id: number, status: string): Promise<Movie> {
    try {
      const response = await axiosClient.patch(`/api/movies/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error toggling movie status:", error);
      throw error;
    }
  },

  // Toggle movie featured status
  async toggleFeaturedStatus(id: number, isFeatured: boolean): Promise<Movie> {
    try {
      const response = await axiosClient.patch(`/api/movies/${id}/featured`, { isFeatured });
      return response.data;
    } catch (error) {
      console.error("Error toggling featured status:", error);
      throw error;
    }
  },
};

// Movie utilities
export const movieUtils = {
  // Format duration from minutes to "Xh Ym" format
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  },

  // Format release date
  formatReleaseDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  // Get status text
  getStatusText(status: string): string {
    switch (status) {
      case "NOW_SHOWING":
        return "Đang chiếu";
      case "COMING_SOON":
        return "Sắp chiếu";
      case "ENDED":
        return "Đã kết thúc";
      default:
        return status;
    }
  },

  // Get status color
  getStatusColor(status: string): string {
    switch (status) {
      case "NOW_SHOWING":
        return "green";
      case "COMING_SOON":
        return "blue";
      case "ENDED":
        return "gray";
      default:
        return "default";
    }
  },

  // Check if movie is available for booking
  isAvailableForBooking(movie: Movie): boolean {
    return movie.status === "NOW_SHOWING" && movie.isActive === true;
  },

  // Get default poster URL
  getDefaultPosterUrl(): string {
    return "/images/default-movie-poster.jpg";
  },

  // Get default backdrop URL
  getDefaultBackdropUrl(): string {
    return "/images/default-movie-backdrop.jpg";
  },

  // Format price
  formatPrice(price: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  },

  // Format revenue
  formatRevenue(revenue: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
    }).format(revenue);
  },
}; 
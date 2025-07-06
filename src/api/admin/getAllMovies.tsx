import axiosClient from "../axiosClient";
import { 
  mockGetMovies, 
  mockCreateMovie, 
  mockUpdateMovie, 
  mockDeleteMovie, 
  mockGetMovieById
} from "../mock/moviesMock";

export interface Movie {
  movieId: number;
  title: string;
  genre?: string; // Made optional for backward compatibility
  duration: number;
  formattedDuration?: string;
  releaseDate: string;
  rating: string;
  posterUrl?: string;
  price?: number;
  status: string; // NOW_SHOWING, COMING_SOON, ENDED
  imdbRating?: number;
  isFeatured?: boolean;
  isAdultContent?: boolean;
  // Legacy fields for backward compatibility
  originalTitle?: string;
  vietnameseTitle?: string;
  description?: string;
  productionCompany?: string;
  company?: string;
  genres?: string; // Alias for genre
  versions?: string[];
  boxOffice?: number;
  revenue?: number;
  backdropUrl?: string;
  trailerUrl?: string;
  director?: string;
  cast?: string;
  language?: string;
  country?: string;
  endDate?: string;
  budget?: number;
  isActive?: boolean;
  isNowShowing?: boolean;
  isComingSoon?: boolean;
  isEnded?: boolean;
  scheduleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

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

export const getMovies = async (params: GetMoviesParams = {}) => {
  try {
    const response = await axiosClient.get("/movies", { params });
    return response.data;
  } catch (error) {
    const mockResult = await mockGetMovies(params);
    return mockResult;
  }
};

export const createMovie = async (movieData: Omit<Movie, 'movieId'>) => {
  try {
    const response = await axiosClient.post("/movies", movieData);
    return response.data;
  } catch (error) {
    try {
      const mockResult = await mockCreateMovie(movieData);
      return mockResult;
    } catch (mockError) {
      throw new Error('Failed to create movie in both API and mock data');
    }
  }
};

export const updateMovie = async (id: number, movieData: Partial<Movie>) => {
  try {
    const response = await axiosClient.put(`/movies/${id}`, movieData);
    return response.data;
  } catch (error) {
    return await mockUpdateMovie(id.toString(), movieData);
  }
};

export const deleteMovie = async (id: number) => {
  try {
    await axiosClient.delete(`/movies/${id}`);
  } catch (error) {
    await mockDeleteMovie(id.toString());
  }
};

export const getMovieById = async (id: number) => {
  try {
    const response = await axiosClient.get(`/movies/${id}`);
    return response.data;
  } catch (error) {
    return await mockGetMovieById(id.toString());
  }
};

export const getMovieStatistics = async () => {
  try {
    const response = await axiosClient.get("/api/movies/statistics");
    return response.data;
  } catch (error) {
    return {
      totalMovies: 12,
      activeMovies: 7,
      totalRevenue: 1830000,
      avgDuration: 125,
    };
  }
};
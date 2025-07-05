// import axiosClient from "../axiosClient";

// export const getAllMovies = async () => {
//   try {
//     const response = await axiosClient.get("/cinema/movies?page=0&size=10&sortBy=title&sortDirection=asc");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

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

export const getMovies = async (params: GetMoviesParams = {}) => {
  try {
    // Use the correct API endpoint
    console.log('Calling API with params:', params);
    const response = await axiosClient.get("/movies", { params });
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("API failed, using mock data", error);
    // Fallback to mock data if API fails
    return await mockGetMovies(params);
  }
};

export const createMovie = async (movieData: Omit<Movie, 'movieId'>) => {
  try {
    const response = await axiosClient.post("/movies", movieData);
    return response.data;
  } catch (error) {
    console.log("API failed, using mock data", error);
    return await mockCreateMovie(movieData);
  }
};

export const updateMovie = async (id: number, movieData: Partial<Movie>) => {
  try {
    const response = await axiosClient.put(`/movies/${id}`, movieData);
    return response.data;
  } catch (error) {
    console.log("API failed, using mock data", error);
    return await mockUpdateMovie(id.toString(), movieData);
  }
};

export const deleteMovie = async (id: number) => {
  try {
    await axiosClient.delete(`/movies/${id}`);
  } catch (error) {
    console.log("API failed, using mock data", error);
    await mockDeleteMovie(id.toString());
  }
};

export const getMovieById = async (id: number) => {
  try {
    const response = await axiosClient.get(`/movies/${id}`);
    return response.data;
  } catch (error) {
    console.log("API failed, using mock data", error);
    return await mockGetMovieById(id.toString());
  }
};

export const getMovieStatistics = async () => {
  try {
    const response = await axiosClient.get("/movies/statistics");
    return response.data;
  } catch (error) {
    console.log("Statistics API failed, using mock data", error);
    // Return mock statistics if API fails
    return {
      totalMovies: 12,
      activeMovies: 7,
      totalRevenue: 1830000,
      avgDuration: 125,
    };
  }
};
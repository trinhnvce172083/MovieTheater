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
    // Use the correct API endpoint - baseURL already includes /cinema/api
    console.log('🔧 API: Fetching movies with params:', params);
    
    // Log the token being used
    const token = localStorage.getItem('accessToken');
    console.log('🔐 API: Using token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    const response = await axiosClient.get("/movies", { params });
    console.log('✅ API: Movies fetched successfully:', response.data);
    console.log('📊 API: Real movie count from database:', response.data?.content?.length || 'no content');
    return response.data;
  } catch (error) {
    console.error("❌ API call failed:");
    console.error("Error in getMovies:", error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: unknown; config?: any } };
      console.error("Response status:", axiosError.response?.status);
      console.error("Response data:", axiosError.response?.data);
      console.error("Request URL:", axiosError.response?.config?.url);
      console.error("Request headers:", axiosError.response?.config?.headers);
      
      // Handle specific error cases
      if (axiosError.response?.status === 401) {
        console.error("🚫 Authentication failed - user needs to log in or token is invalid");
      } else if (axiosError.response?.status === 403) {
        console.error("🚫 Authorization failed - user doesn't have admin permissions");
      } else {
        console.error(`🚫 API Error: ${axiosError.response?.status || 'unknown'}`);
      }
    }
    
    // Return mock data as fallback for any error
    console.log("🔄 API failed, returning mock data as fallback");
    const mockResult = await mockGetMovies(params);
    console.log('✅ MOCK: Movies fetched from mock:', mockResult);
    console.log('📊 MOCK: Mock movie count:', mockResult?.content?.length || 'no content');
    return mockResult;
  }
};

export const createMovie = async (movieData: Omit<Movie, 'movieId'>) => {
  try {
    console.log('🔧 API: Attempting to create movie with data:', movieData);
    const response = await axiosClient.post("/movies", movieData);
    console.log('✅ API: Movie created successfully:', response.data);
    return response.data;
  } catch (error) {
    // Log the error but don't make it alarming since fallback to mock is expected
    console.log("🔄 API: Create movie failed (expected in development), using mock data", error?.response?.status || 'unknown error');
    console.log('🔧 MOCK: Creating movie with mock data due to API failure:', movieData);
    
    try {
      const mockResult = await mockCreateMovie(movieData);
      console.log('✅ MOCK: Movie created successfully:', mockResult);
      return mockResult;
    } catch (mockError) {
      console.error('❌ MOCK: Failed to create movie in mock data:', mockError);
      throw new Error('Failed to create movie in both API and mock data');
    }
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
    const response = await axiosClient.get("/api/movies/statistics");
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
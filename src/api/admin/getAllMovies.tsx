import axiosClient from "../axiosClient";
import { mockMovies } from "../../app/admin/movies/mock/movies";
import { transformToBackendFormat, prepareSmartUpdateData } from "../../utils/movieDataTransform";

export interface Movie {
  movieId: number;
  title: string;
  genre?: string;
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
  genres?: string | string[];
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

// Simple mock functions for fallback
const mockGetMovies = async (params: Record<string, unknown> = {}) => {
  const { page = 0, size = 10, search, status, genre } = params;
  let filteredMovies = [...mockMovies];
  
  if (search) {
    filteredMovies = filteredMovies.filter(movie => 
      movie.title.toLowerCase().includes((search as string).toLowerCase())
    );
  }
  
  if (status) {
    filteredMovies = filteredMovies.filter(movie => movie.status === status);
  }
  
  if (genre) {
    filteredMovies = filteredMovies.filter(movie => 
      movie.genre.toLowerCase().includes((genre as string).toLowerCase())
    );
  }
  
  const startIndex = (page as number) * (size as number);
  const endIndex = startIndex + (size as number);
  const paginatedMovies = filteredMovies.slice(startIndex, endIndex);
  
  return {
    content: paginatedMovies,
    totalElements: filteredMovies.length,
    totalPages: Math.ceil(filteredMovies.length / (size as number)),
    page,
    size
  };
};

const mockCreateMovie = async (movieData: Record<string, unknown>) => {
  const newMovie = {
    ...movieData,
    id: Math.max(...mockMovies.map(m => m.id)) + 1,
    key: (Math.max(...mockMovies.map(m => m.id)) + 1).toString()
  };
  return newMovie;
};

const mockUpdateMovie = async (id: string, movieData: Record<string, unknown>) => {
  return { ...movieData, id: parseInt(id) };
};

const mockDeleteMovie = async () => {
  return { success: true };
};

const mockGetMovieById = async (id: string) => {
  const movie = mockMovies.find(m => m.id === parseInt(id));
  return movie || null;
};

export const getMovies = async (params: GetMoviesParams = {}) => {
  try {
    // Ensure we have a clean params object
    const cleanParams: any = {
      page: params.page || 0,
      size: params.size || 20,
      sortBy: params.sortBy || "movieId",
      sortDirection: params.sortDirection || "asc"
    };
    
    // Add optional filters if they exist
    if (params.search) cleanParams.search = params.search;
    if (params.status) cleanParams.status = params.status;
    if (params.genre) cleanParams.genre = params.genre;
    
    const response = await axiosClient.get("/movies", { params: cleanParams });
    
    // Backend returns ApiResponse format: { success: true, data: {...}, message: "..." }
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      // Handle case where backend returns direct array instead of wrapped response
      return {
        content: response.data,
        totalElements: response.data.length,
        totalPages: Math.ceil(response.data.length / cleanParams.size),
        size: cleanParams.size,
        number: cleanParams.page,
        first: cleanParams.page === 0,
        last: cleanParams.page >= Math.ceil(response.data.length / cleanParams.size) - 1
      };
    } else {
      throw new Error(response.data?.message || 'API call unsuccessful');
    }
  } catch (error) {
    // Re-throw the error so the UI can handle it properly
    throw error;
  }
};

export const createMovie = async (movieData: Omit<Movie, 'movieId'>) => {
  try {
    // Transform frontend data to match backend expectations
    const backendData = transformToBackendFormat(movieData);

    const response = await axiosClient.post("/movies", backendData);
    return response.data.data || response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMovie = async (id: number, movieData: Partial<Movie>) => {
  try {
    // Use smart update data preparation for backend
    const backendData = prepareSmartUpdateData(movieData);

    const response = await axiosClient.put(`/movies/${id}`, backendData);
    return response.data.data || response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMovie = async (id: number) => {
  try {
    await axiosClient.delete(`/movies/${id}`);
  } catch (error) {
    throw error;
  }
};

export const getMovieById = async (id: number) => {
  try {
    console.log('🎬 [API getMovieById] Getting movie by ID:', id);
    
    const response = await axiosClient.get(`/movies/${id}`);
    console.log('🎬 [API getMovieById] Response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("❌ [API getMovieById] API call failed:", error);
    throw error;
  }
};

export const getMovieStatistics = async () => {
  try {
    console.log('🎬 [API getMovieStatistics] Getting movie statistics');
    
    const response = await axiosClient.get("/movies/statistics");
    console.log('🎬 [API getMovieStatistics] Statistics response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("❌ [API getMovieStatistics] API call failed:", error);
    throw error;
  }
};

export const uploadMoviePoster = async (id: number, file: File) => {
  try {
    console.log('🎬 [API uploadMoviePoster] Uploading poster for movie:', id);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosClient.post(`/movies/${id}/poster`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('🎬 [API uploadMoviePoster] Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [API uploadMoviePoster] Failed to upload poster:', error);
    throw error;
  }
};

export const searchMovies = async (keyword: string, page = 0, size = 10) => {
  try {
    console.log('🎬 [API searchMovies] Searching movies with keyword:', keyword);
    
    const response = await axiosClient.get('/movies/search', {
      params: { keyword, page, size }
    });
    console.log('🎬 [API searchMovies] Search response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("❌ [API searchMovies] Search API failed:", error);
    throw error;
  }
};

export const getNowShowingMovies = async () => {
  try {
    console.log('🎬 [API getNowShowingMovies] Getting now showing movies');
    
    const response = await axiosClient.get('/movies/now-showing');
    
    console.log('🎬 [API getNowShowingMovies] Response:', response.data);
    
    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      console.error('❌ [API getNowShowingMovies] API returned unsuccessful response:', response.data);
      throw new Error(response.data?.message || 'Failed to fetch now showing movies');
    }
  } catch (error) {
    console.error("❌ [API getNowShowingMovies] Failed to fetch now showing movies:", error);
    throw error;
  }
};

export const getComingSoonMovies = async () => {
  try {
    console.log('🎬 [API getComingSoonMovies] Getting coming soon movies');
    
    const response = await axiosClient.get('/movies/coming-soon');
    
    console.log('🎬 [API getComingSoonMovies] Response:', response.data);
    
    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      console.error('❌ [API getComingSoonMovies] API returned unsuccessful response:', response.data);
      throw new Error(response.data?.message || 'Failed to fetch coming soon movies');
    }
  } catch (error) {
    console.error("❌ [API getComingSoonMovies] Failed to fetch coming soon movies:", error);
    throw error;
  }
};

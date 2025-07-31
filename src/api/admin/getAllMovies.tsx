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
    console.log('🎬 [API getMovies] Making API call to /admin/movies with params:', params);
    
    const response = await axiosClient.get("/admin/movies", { params });
    
    console.log('🎬 [API getMovies] Response status:', response.status);
    console.log('🎬 [API getMovies] Response data:', response.data);
    
    // Backend returns ApiResponse format: { success: true, data: {...}, message: "..." }
    if (response.data && response.data.success) {
      console.log('🎬 [API getMovies] Successful response, returning data:', response.data.data);
      return response.data.data;
    } else {
      console.error('❌ [API getMovies] API returned unsuccessful response:', response.data);
      throw new Error(response.data?.message || 'API call unsuccessful');
    }
  } catch (error) {
    console.error("❌ [API getMovies] API call failed:", error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; data: unknown; statusText: string } };
      console.error('❌ [API getMovies] Error status:', axiosError.response.status);
      console.error('❌ [API getMovies] Error data:', axiosError.response.data);
      console.error('❌ [API getMovies] Error status text:', axiosError.response.statusText);
    }
    
    // Instead of falling back to mock data, re-throw the error so the UI can handle it properly
    throw error;
  }
};

export const createMovie = async (movieData: Omit<Movie, 'movieId'>) => {
  try {
    console.log('🎬 [API createMovie] Creating movie with data:', movieData);
    
    // Transform frontend data to match backend expectations
    const backendData = transformToBackendFormat(movieData);
    console.log('🎬 [API createMovie] Transformed backend data:', backendData);

    const response = await axiosClient.post("/admin/movies", backendData);
    console.log('🎬 [API createMovie] Create response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("❌ [API createMovie] API call failed:", error);
    throw error;
  }
};

export const updateMovie = async (id: number, movieData: Partial<Movie>) => {
  try {
    console.log('🎬 [API updateMovie] Updating movie', id, 'with data:', movieData);
    
    // Use smart update data preparation for backend
    const backendData = prepareSmartUpdateData(movieData);
    console.log('🎬 [API updateMovie] Prepared backend data:', backendData);

    const response = await axiosClient.put(`/admin/movies/${id}`, backendData);
    console.log('🎬 [API updateMovie] Update response:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("❌ [API updateMovie] API call failed:", error);
    throw error;
  }
};

export const deleteMovie = async (id: number) => {
  try {
    console.log('🎬 [API deleteMovie] Deleting movie:', id);
    
    await axiosClient.delete(`/admin/movies/${id}`);
    console.log('🎬 [API deleteMovie] Movie deleted successfully');
  } catch (error) {
    console.error("❌ [API deleteMovie] API call failed:", error);
    throw error;
  }
};

export const getMovieById = async (id: number) => {
  try {
    console.log('🎬 [API getMovieById] Getting movie by ID:', id);
    
    const response = await axiosClient.get(`/admin/movies/${id}`);
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
    
    const response = await axiosClient.get("/admin/movies/statistics");
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
    
    const response = await axiosClient.post(`/admin/movies/${id}/poster`, formData, {
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
    
    const response = await axiosClient.get('/admin/movies/search', {
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
    
    const response = await axiosClient.get('/admin/movies/now-showing');
    
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
    
    const response = await axiosClient.get('/admin/movies/coming-soon');
    
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

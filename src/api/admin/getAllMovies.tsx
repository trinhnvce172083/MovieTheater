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
    const response = await axiosClient.get("/movies", { params });
    
    // Backend returns ApiResponse format: { success: true, data: {...}, message: "..." }
    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      console.error('API returned unsuccessful response:', response.data);
      throw new Error(response.data?.message || 'API call unsuccessful');
    }
  } catch (error) {
    console.error("API call failed:", error);
    // Instead of falling back to mock data, re-throw the error so the UI can handle it properly
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
    console.warn("API call failed, falling back to mock data:", error);
    try {
      const mockResult = await mockCreateMovie(movieData);
      return mockResult;
    } catch {
      throw new Error('Failed to create movie in both API and mock data');
    }
  }
};

export const updateMovie = async (id: number, movieData: Partial<Movie>) => {
  try {
    // Use smart update data preparation for backend
    const backendData = prepareSmartUpdateData(movieData);

    const response = await axiosClient.put(`/movies/${id}`, backendData);
    return response.data.data || response.data;
  } catch {
    console.warn("API call failed, falling back to mock data");
    return await mockUpdateMovie(id.toString(), movieData);
  }
};

export const deleteMovie = async (id: number) => {
  try {
    await axiosClient.delete(`/movies/${id}`);
  } catch {
    console.warn("API call failed, falling back to mock data");
    await mockDeleteMovie();
  }
};

export const getMovieById = async (id: number) => {
  try {
    const response = await axiosClient.get(`/movies/${id}`);
    return response.data.data || response.data;
  } catch {
    console.warn("API call failed, falling back to mock data");
    return await mockGetMovieById(id.toString());
  }
};

export const getMovieStatistics = async () => {
  try {
    const response = await axiosClient.get("/movies/statistics");
    return response.data.data || response.data;
  } catch {
    console.warn("API call failed, returning default statistics");
    return {
      totalMovies: 12,
      activeMovies: 7,
      totalRevenue: 1830000,
      avgDuration: 125,
    };
  }
};

export const uploadMoviePoster = async (id: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosClient.post(`/movies/${id}/poster`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to upload poster:', error);
    throw new Error('Failed to upload poster');
  }
};

export const searchMovies = async (keyword: string, page = 0, size = 10) => {
  try {
    const response = await axiosClient.get('/movies/search', {
      params: { keyword, page, size }
    });
    return response.data.data || response.data;
  } catch {
    console.warn("Search API failed, falling back to mock data");
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: size,
      number: page,
      first: true,
      last: true,
    };
  }
};

export const getNowShowingMovies = async () => {
  try {
    const response = await axiosClient.get('/movies/now-showing');
    
    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      console.error('API returned unsuccessful response:', response.data);
      throw new Error(response.data?.message || 'Failed to fetch now showing movies');
    }
  } catch (error) {
    console.error("Failed to fetch now showing movies:", error);
    throw error;
  }
};

export const getComingSoonMovies = async () => {
  try {
    const response = await axiosClient.get('/movies/coming-soon');
    
    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      console.error('API returned unsuccessful response:', response.data);
      throw new Error(response.data?.message || 'Failed to fetch coming soon movies');
    }
  } catch (error) {
    console.error("Failed to fetch coming soon movies:", error);
    throw error;
  }
};

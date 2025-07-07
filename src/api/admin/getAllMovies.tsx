import axiosClient from "../axiosClient";
import { 
  mockGetMovies, 
  mockCreateMovie, 
  mockUpdateMovie, 
  mockDeleteMovie, 
  mockGetMovieById
} from "../mock/moviesMock";
import { transformToBackendFormat, prepareSmartUpdateData } from "../../utils/movieDataTransform";

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
  genres?: string | string[]; // Support both string and array
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
    console.warn("API call failed, falling back to mock data:", error);
    const mockResult = await mockGetMovies(params);
    return mockResult;
  }
};

export const createMovie = async (movieData: Omit<Movie, 'movieId'>) => {
  try {
    // Transform frontend data to match backend expectations
    const backendData = transformToBackendFormat(movieData);

    console.log('Creating movie with data:', backendData);
    const response = await axiosClient.post("/movies", backendData);
    console.log('Movie created successfully:', response.data);
    return response.data;
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

    console.log('Updating movie with data:', backendData);
    const response = await axiosClient.put(`/movies/${id}`, backendData);
    console.log('Movie updated successfully:', response.data);
    return response.data;
  } catch {
    console.warn("API call failed, falling back to mock data");
    return await mockUpdateMovie(id.toString(), movieData);
  }
};

export const deleteMovie = async (id: number) => {
  try {
    console.log('Deleting movie with ID:', id);
    await axiosClient.delete(`/movies/${id}`);
    console.log('Movie deleted successfully');
  } catch {
    console.warn("API call failed, falling back to mock data");
    await mockDeleteMovie(id.toString());
  }
};

export const getMovieById = async (id: number) => {
  try {
    console.log('Fetching movie with ID:', id);
    const response = await axiosClient.get(`/movies/${id}`);
    console.log('Movie fetched successfully:', response.data);
    return response.data;
  } catch {
    console.warn("API call failed, falling back to mock data");
    return await mockGetMovieById(id.toString());
  }
};

export const getMovieStatistics = async () => {
  try {
    console.log('Fetching movie statistics');
    const response = await axiosClient.get("/movies/statistics");
    console.log('Statistics fetched successfully:', response.data);
    return response.data;
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

// Additional API functions for enhanced movie management

export const uploadMoviePoster = async (id: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Uploading poster for movie ID:', id);
    const response = await axiosClient.post(`/movies/${id}/poster`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Poster uploaded successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to upload poster:', error);
    throw new Error('Failed to upload poster');
  }
};

export const uploadMovieBackdrop = async (id: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Uploading backdrop for movie ID:', id);
    const response = await axiosClient.post(`/movies/${id}/backdrop`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Backdrop uploaded successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to upload backdrop:', error);
    throw new Error('Failed to upload backdrop');
  }
};

export const createMovieWithImages = async (
  movieData: Omit<Movie, 'movieId'>, 
  posterFile?: File, 
  backdropFile?: File
) => {
  try {
    const formData = new FormData();
    formData.append('movieData', JSON.stringify({
      title: movieData.title,
      originalTitle: movieData.originalTitle || movieData.title,
      description: movieData.description || null,
      duration: movieData.duration,
      genres: typeof movieData.genres === 'string' ? movieData.genres : 
              Array.isArray(movieData.genres) ? (movieData.genres as string[]).join(', ') : 
              movieData.genre || null,
      director: movieData.director || null,
      cast: movieData.cast || null,
      language: movieData.language || "English",
      country: movieData.country || "USA",
      releaseDate: movieData.releaseDate,
      endDate: movieData.endDate || null,
      rating: movieData.rating || "PG-13",
      posterUrl: movieData.posterUrl || null,
      backdropUrl: movieData.backdropUrl || null,
      trailerUrl: movieData.trailerUrl || null,
      isActive: movieData.isActive !== undefined ? movieData.isActive : true,
      isFeatured: movieData.isFeatured !== undefined ? movieData.isFeatured : false,
      price: movieData.price || 0,
      status: movieData.status || "COMING_SOON",
      imdbRating: movieData.imdbRating || null,
      productionCompany: movieData.productionCompany || null,
      budget: movieData.budget || null,
      boxOffice: movieData.boxOffice || null,
    }));
    
    if (posterFile) {
      formData.append('poster', posterFile);
    }
    if (backdropFile) {
      formData.append('backdrop', backdropFile);
    }
    
    console.log('Creating movie with images');
    const response = await axiosClient.post('/movies/with-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Movie created with images successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create movie with images:', error);
    // Fallback to regular movie creation
    return await createMovie(movieData);
  }
};

export const searchMovies = async (keyword: string, page = 0, size = 10) => {
  try {
    console.log('Searching movies with keyword:', keyword);
    const response = await axiosClient.get('/movies/search', {
      params: { keyword, page, size }
    });
    console.log('Search results:', response.data);
    return response.data;
  } catch {
    console.warn("Search API failed, falling back to mock data");
    // Return empty results for now
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

export const getMoviesByStatus = async (status: string) => {
  try {
    console.log('Fetching movies by status:', status);
    const endpoint = status === 'NOW_SHOWING' ? '/movies/now-showing' : 
                    status === 'COMING_SOON' ? '/movies/coming-soon' : 
                    `/movies?status=${status}`;
    const response = await axiosClient.get(endpoint);
    console.log('Movies by status fetched:', response.data);
    return response.data;
  } catch {
    console.warn("API call failed, falling back to mock data");
    return [];
  }
};

export const autoUpdateMovieStatus = async () => {
  try {
    console.log('Triggering auto update movie status');
    const response = await axiosClient.post('/movies/auto-update-status');
    console.log('Auto update completed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to auto update movie status:', error);
    throw new Error('Failed to auto update movie status');
  }
};

export const getStatusUpdateStats = async () => {
  try {
    console.log('Fetching status update statistics');
    const response = await axiosClient.get('/movies/status-update-stats');
    console.log('Status update stats:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch status update stats:', error);
    return {
      totalUpdates: 0,
      lastUpdateTime: null,
      updatedMoviesCount: 0,
    };
  }
};

export const getMovieStatusOptions = async () => {
  try {
    console.log('Fetching movie status options');
    const response = await axiosClient.get('/movies/status-options');
    console.log('Status options:', response.data);
    return response.data;
  } catch {
    console.warn("API call failed, returning default status options");
    return {
      NOW_SHOWING: { code: 'NOW_SHOWING', displayName: 'Now Showing', description: 'Currently showing in theaters' },
      COMING_SOON: { code: 'COMING_SOON', displayName: 'Coming Soon', description: 'Will be released soon' },
      ENDED: { code: 'ENDED', displayName: 'Ended', description: 'No longer showing' },
    };
  }
};
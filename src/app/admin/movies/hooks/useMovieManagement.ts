"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';
import { MovieData, MovieStatistics, CurrentUser, MovieFilters, PaginationState } from '../types';
import { MovieCreateRequest, MovieUpdateRequest } from '@/types/Admin/movie';
import { getMovies, getMovieStatistics } from '@/api/admin/getAllMovies';
import { MovieApiService } from '@/api/admin/movie-api';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { 
  transformApiMovieToMovieData, 
  getCurrentUserFromStorage
} from '../utils/movieUtils';
import { Movie } from '@/types/Admin/movie';

// Mock data for offline/demo mode
import { mockMovies } from '../mock/movies';
import { mockMovieStatistics } from '../mock/statistics';

export const useMovieManagement = () => {
  const { token } = useAuth();
  
  // Additional token check from localStorage for cases where Redux state is not persisted
  const [actualToken, setActualToken] = useState<string | null>(null);
  
  // Check for token in localStorage if Redux token is null/empty
  useEffect(() => {
    if (token && token.length > 0) {
      setActualToken(token);
    } else {
      // Check localStorage as fallback
      const storedToken = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (storedToken) {
        setActualToken(storedToken);
      } else {
        setActualToken(null);
      }
    }
  }, [token]);
  
  // State management
  const [movieData, setMovieData] = useState<MovieData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [isUsingApiData, setIsUsingApiData] = useState(true);
  const [statistics, setStatistics] = useState<MovieStatistics>(mockMovieStatistics);

  // Filters and pagination
  const [filters, setFilters] = useState<MovieFilters>({
    searchTerm: "",
    filterStatus: "",
    filterGenre: ""
  });
  
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10
  });

  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  // Initialize auth and user data - watch for token changes
  useEffect(() => {
    const hasToken = !!actualToken && actualToken.length > 0;
    setShowAuthWarning(!hasToken);
    
    if (hasToken) {
      setCurrentUser(getCurrentUserFromStorage());
    } else {
      setCurrentUser(null);
    }
  }, [token, actualToken]); // Watch both tokens

  // Fetch movies from API
  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!actualToken || actualToken.length === 0) {
        setShowAuthWarning(true);
        // Use mock data and apply client-side filtering
        let filteredMockData = [...mockMovies];
        
        if (debouncedSearchTerm) {
          filteredMockData = filteredMockData.filter(movie => 
            movie.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            movie.genre.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
          );
        }
        
        if (filters.filterStatus) {
          filteredMockData = filteredMockData.filter(movie => movie.status === filters.filterStatus);
        }
        
        if (filters.filterGenre) {
          filteredMockData = filteredMockData.filter(movie => 
            movie.genre.toLowerCase().includes(filters.filterGenre.toLowerCase())
          );
        }
        
        setMovieData(filteredMockData);
        setIsUsingApiData(false);
        return;
      }

      // Token exists - use simple getAllMovies API
      setShowAuthWarning(false);
      console.log('Fetching movies from API with token:', actualToken ? 'present' : 'missing');
      
      try {
        // Use the simpler getMovies endpoint first
        const movieResponse = await getMovies({
          page: 0,
          size: 100,
          sortBy: "title",
          sortDirection: "asc",
        });
        console.log('API Response:', movieResponse);
        
        if (movieResponse && movieResponse.content && Array.isArray(movieResponse.content)) {
          // Transform Movie[] to MovieData[] 
          let transformedData: MovieData[] = [];
          
          try {
            transformedData = movieResponse.content.map((movie: Movie) => {
              // Ensure movie has required properties before transformation
              if (!movie || typeof movie !== 'object') {
                console.warn('Invalid movie object:', movie);
                return null;
              }
              
              return transformApiMovieToMovieData({ ...movie, isActive: true });
            }).filter(Boolean) as MovieData[]; // Remove null values
          } catch (transformError) {
            console.error('Error transforming movie data:', transformError);
            setMovieData([]);
            setIsUsingApiData(false);
            return;
          }
          
          // Apply client-side filtering with safety checks
          if (debouncedSearchTerm && transformedData.length > 0) {
            transformedData = transformedData.filter(movie => 
              movie && movie.title && movie.genre &&
              (movie.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
               movie.genre.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
            );
          }
          
          if (filters.filterStatus && transformedData.length > 0) {
            transformedData = transformedData.filter(movie => 
              movie && movie.status === filters.filterStatus
            );
          }
          
          if (filters.filterGenre && transformedData.length > 0) {
            transformedData = transformedData.filter(movie => 
              movie && movie.genre && 
              movie.genre.toLowerCase().includes(filters.filterGenre.toLowerCase())
            );
          }
          
          setMovieData(transformedData);
          setIsUsingApiData(true);
          console.log('Successfully loaded movies from API:', transformedData.length);
        } else {
          console.error('API returned unexpected response structure:', movieResponse);
          message.error('Unable to load movie list - unexpected response format.');
          setMovieData(mockMovies);
          setIsUsingApiData(false);
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        message.error('An error occurred while loading the movie list.');
        setMovieData(mockMovies);
        setIsUsingApiData(false);
      }
    } catch (error) {
      console.error('Error in fetchMovies:', error);
      message.error('An error occurred while loading the movie list.');
      setMovieData(mockMovies);
      setIsUsingApiData(false);
    } finally {
      setLoading(false);
    }
  }, [actualToken, debouncedSearchTerm, filters]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    if (!actualToken || actualToken.length === 0) {
      setStatistics(mockMovieStatistics);
      return;
    }
    
    try {
      const statsResponse = await getMovieStatistics();
      if (statsResponse) {
        setStatistics(statsResponse);
      } else {
        setStatistics(mockMovieStatistics);
      }
    } catch {
      setStatistics(mockMovieStatistics);
    }
  }, [actualToken]);

  // Initial data fetch
  useEffect(() => {
    fetchMovies();
    fetchStatistics();
  }, [fetchMovies, fetchStatistics]);

  // Filter and search logic - client side for better UX
  const filteredData = useMemo(() => {
    if (!movieData || !Array.isArray(movieData)) {
      return [];
    }

    return movieData.filter((movie) => {
      if (!movie) return false;

      // Basic search
      const matchesSearch = !debouncedSearchTerm ||
        (movie.title && movie.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
        (movie.genre && movie.genre.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
        (movie.director && movie.director.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

      // Status filter
      const matchesStatus = !filters.filterStatus || movie.status === filters.filterStatus;

      // Genre filter
      const matchesGenre = !filters.filterGenre || 
        (movie.genre && movie.genre.toLowerCase().includes(filters.filterGenre.toLowerCase()));

      return matchesSearch && matchesStatus && matchesGenre;
    });
  }, [movieData, debouncedSearchTerm, filters]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination]);

  // CRUD Operations
  const createMovie = async (movieCreateData: MovieCreateRequest): Promise<boolean> => {
    if (!actualToken || actualToken.length === 0) return false;
    
    setLoading(true);
    try {
      // Transform to match backend expected format
      const backendData: MovieCreateRequest = {
  title: movieCreateData.title,
  description: movieCreateData.description     || '',
  duration: movieCreateData.duration,
  releaseDate: movieCreateData.releaseDate,
  genre: movieCreateData.genre,
  // đưa director thành chuỗi rỗng nếu undefined
  director: movieCreateData.director           || '',
  cast: movieCreateData.cast,
  language: movieCreateData.language,
  country: movieCreateData.country,
  rating: movieCreateData.rating,
  price: movieCreateData.price,
  status: movieCreateData.status,
  isFeatured: movieCreateData.isFeatured,
  isAdultContent: false,
  // thêm trailerUrl và endDate
  trailerUrl: movieCreateData.trailerUrl       || '',
  endDate: movieCreateData.endDate             || null,
};
      
      const response = await MovieApiService.createMovie(backendData, actualToken);
      if (response.success) {
        message.success('Movie created successfully!');
        fetchMovies();
        fetchStatistics();
        return true;
      } else {
        message.error(response.message || 'Unable to create movie.');
        return false;
      }
    } catch {
      message.error('An error occurred while creating the movie.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateMovie = async (movieId: number, movieUpdateData: MovieUpdateRequest): Promise<boolean> => {
    if (!actualToken || actualToken.length === 0) return false;
    
    setLoading(true);
    try {
      const response = await MovieApiService.updateMovie(movieId, movieUpdateData, actualToken);
      if (response.success) {
        message.success('Movie updated successfully!');
        fetchMovies();
        return true;
      } else {
        message.error(response.message || 'Unable to update movie.');
        return false;
      }
    } catch {
      message.error('An error occurred while updating the movie.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMovie = async (movieId: number): Promise<void> => {
    if (!actualToken || actualToken.length === 0) return;
    
    setLoading(true);
    try {
      const response = await MovieApiService.deleteMovie(movieId, actualToken);
      if (response.success) {
        message.success('Movie deleted successfully!');
        fetchMovies();
        fetchStatistics();
      } else {
        message.error(response.message || 'Unable to delete movie.');
      }
    } catch {
      message.error('An error occurred while deleting the movie.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatureMovie = async (movieId: number, isFeatured: boolean): Promise<void> => {
    if (!actualToken || actualToken.length === 0) return;
    
    setLoading(true);
    try {
      // Only send the isFeatured field to avoid any unintended side effects
      const updateData = {
        isFeatured: !isFeatured
      };
      
      console.log(`🌟 Toggling feature for movie ${movieId}:`, updateData);
      
      const response = await MovieApiService.updateMovie(movieId, updateData as MovieUpdateRequest, actualToken);
      if (response.success) {
        message.success(`${!isFeatured ? 'Movie featured' : 'Movie unfeatured'} successfully!`);
        fetchMovies();
        fetchStatistics();
      } else {
        message.error(response.message || 'Unable to change featured status.');
      }
    } catch (error) {
      console.error('Feature toggle error:', error);
      message.error('An error occurred while changing the featured status.');
    } finally {
      setLoading(false);
    }
  };

  return {
    // Data
    paginatedData,
    filteredData,
    statistics,
    currentUser,

    // State
    loading,
    showAuthWarning,
    isUsingApiData,
    filters,
    pagination,

    // Actions
    setFilters,
    setPagination,
    createMovie,
    updateMovie,
    deleteMovie,
    toggleFeatureMovie,
  };
};

"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';
import { MovieData, MovieStatistics, MovieCreateRequest, MovieUpdateRequest, CurrentUser, MovieFilters, PaginationState } from '../types';
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

      // Token exists - use API
      setShowAuthWarning(false);
      
      // Use the POST /api/movies/filter endpoint
      const filterParams = {
        page: 0,
        size: 200, // Get large size for client-side pagination
        keyword: debouncedSearchTerm || undefined,
        status: filters.filterStatus || undefined,
        genres: filters.filterGenre ? [filters.filterGenre] : undefined,
        sortBy: 'movieId',
        sortDirection: 'asc'
      };
      
      const response = await MovieApiService.getMoviesWithFilter(filterParams, actualToken);

      if (response.success && response.data) {
        // Transform Movie[] to MovieData[]
        const transformedData: MovieData[] = response.data.movies.map((movie: Movie) => 
          transformApiMovieToMovieData(movie as any)
        );
        setMovieData(transformedData);
        setIsUsingApiData(true);
      } else {
        message.error(response.message || 'Unable to load movie list.');
        setMovieData(mockMovies);
        setIsUsingApiData(false);
      }
    } catch {
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
      const response = await MovieApiService.getMovieStatistics(actualToken);
      if (response.success && response.data) {
        setStatistics(response.data);
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
      const backendData = {
        ...movieCreateData,
        genre: movieCreateData.genre, // Backend expects 'genre', frontend uses 'genre'
        isAdultContent: false // Add default value for required backend field
      };
      
      const response = await MovieApiService.createMovie(backendData as any, actualToken);
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
      const response = await MovieApiService.updateMovie(movieId, movieUpdateData as any, actualToken);
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
      
      const response = await MovieApiService.updateMovie(movieId, updateData as any, actualToken);
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

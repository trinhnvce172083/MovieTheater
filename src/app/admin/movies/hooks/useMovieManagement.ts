"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';
import { MovieData, MovieStatistics, CurrentUser, MovieFilters, PaginationState } from '../types';
import { MovieCreateRequest, MovieUpdateRequest } from '@/types/Admin/movie';
import { getMovies } from '@/api/admin/getAllMovies';
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

export const useMovieManagement = () => {
  const { token } = useAuth();
  
  // Additional token check from localStorage for cases where Redux state is not persisted
  const [actualToken, setActualToken] = useState<string | null>(null);
  
  // Check for token in localStorage if Redux token is null/empty
  useEffect(() => {
    // Check multiple possible token storage locations
    const checkTokenSources = () => {
      const reduxToken = token && token.length > 0 ? token : null;
      const accessToken = localStorage.getItem('accessToken');
      const authToken = localStorage.getItem('token');
      const userToken = localStorage.getItem('authToken');
      
      // Priority: Redux token > accessToken > token > authToken
      return reduxToken || accessToken || authToken || userToken;
    };
    
    const foundToken = checkTokenSources();
    setActualToken(foundToken);
  }, [token]);
  
  // State management
  const [movieData, setMovieData] = useState<MovieData[]>([]);
  const [allMovieData, setAllMovieData] = useState<MovieData[]>([]); // Store ALL movies for statistics
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [isUsingApiData, setIsUsingApiData] = useState(true);

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
    // Only show auth warning if no token is found anywhere
    const hasAnyToken = !!(actualToken || localStorage.getItem('accessToken') || localStorage.getItem('token'));
    setShowAuthWarning(!hasAnyToken);
    
    if (hasAnyToken) {
      setCurrentUser(getCurrentUserFromStorage());
    } else {
      setCurrentUser(null);
    }
  }, [actualToken]); // Only watch actualToken

  // Fetch movies from API
  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check for authentication token from multiple sources
      const currentToken = actualToken || localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      // Try API call first - even if no token, let the backend handle authentication
      try {
        const movieResponse = await getMovies({
          page: 0,
          size: 100,
          sortBy: "movieId",
          sortDirection: "asc",
        });
        
        // Check if we got a valid response with content
        if (movieResponse && movieResponse.content && Array.isArray(movieResponse.content)) {
          
          // Transform Movie[] to MovieData[] 
          let allTransformedData: MovieData[] = [];
          
          try {
            allTransformedData = movieResponse.content.map((movie: Movie, index: number) => {
              if (!movie || typeof movie !== 'object') {
                return null;
              }
              
              return transformApiMovieToMovieData({ ...movie, isActive: true });
            }).filter(Boolean) as MovieData[];
            
          } catch (transformError) {
            throw new Error('Failed to transform movie data from API');
          }
          
          // Store ALL movies and apply any initial filtering
          setAllMovieData(allTransformedData);
          setMovieData(allTransformedData); // Initially show all movies
          setIsUsingApiData(true);
          setShowAuthWarning(false); // Clear any auth warnings since API worked
          
        } else {
          throw new Error('API returned no movie data or unexpected format');
        }
      } catch (apiError) {
        // Enhanced error handling with better fallback
        let shouldFallbackToMock = false;
        let errorMessage = 'Failed to load movies. Please check your connection.';
        
        if (apiError && typeof apiError === 'object' && 'response' in apiError) {
          const axiosError = apiError as { response: { status: number; data?: { message?: string } } };
          if (axiosError.response.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
            setShowAuthWarning(true);
          } else if (axiosError.response.status === 403) {
            errorMessage = 'Access denied. You may not have admin permissions.';
          } else if (axiosError.response.status >= 500) {
            errorMessage = 'Server error. Using offline mode.';
            shouldFallbackToMock = true;
          } else {
            errorMessage = `Failed to load movies: ${axiosError.response.data?.message || 'Server error'}`;
            shouldFallbackToMock = true;
          }
        } else if (apiError && 'code' in apiError && apiError.code === 'ERR_NETWORK') {
          errorMessage = 'Network error. Backend server may be down. Using offline mode.';
          shouldFallbackToMock = true;
        } else {
          shouldFallbackToMock = true;
        }
        
        if (shouldFallbackToMock) {
          message.warning(errorMessage + ' Loading sample data.');
          
          // Use mock data with filtering
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
          setAllMovieData(mockMovies);
          setIsUsingApiData(false);
        } else {
          message.error(errorMessage);
          setMovieData([]);
          setAllMovieData([]);
          setIsUsingApiData(false);
        }
      }
    } catch (error) {
      message.error('An error occurred while loading the movie list.');
      setMovieData([]);
      setAllMovieData([]);
      setIsUsingApiData(false);
    } finally {
      setLoading(false);
    }
  }, [actualToken, debouncedSearchTerm, filters]);

  // Initial data fetch
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

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

  // Calculate statistics from ALL movies (not filtered) for consistent stats display
  const calculatedStatistics = useMemo((): MovieStatistics => {
    if (!allMovieData || allMovieData.length === 0) {
      return {
        totalMovies: 0,
        nowShowingCount: 0,
        comingSoonCount: 0,
        endedCount: 0,
        featuredCount: 0,
      };
    }

    const stats = allMovieData.reduce((acc, movie) => {
      // Only count active/visible movies
      acc.totalMovies += 1;
      
      if (movie.status === 'NOW_SHOWING') {
        acc.nowShowingCount += 1;
      } else if (movie.status === 'COMING_SOON') {
        acc.comingSoonCount += 1;
      } else if (movie.status === 'ENDED') {
        acc.endedCount += 1;
      }
      
      if (movie.isFeatured) {
        acc.featuredCount += 1;
      }
      
      return acc;
    }, {
      totalMovies: 0,
      nowShowingCount: 0,
      comingSoonCount: 0,
      endedCount: 0,
      featuredCount: 0,
    });

    return stats;
  }, [allMovieData]); // Changed dependency from filteredData to allMovieData

  // CRUD Operations
  const createMovie = async (movieCreateData: any): Promise<boolean> => {
    if (!actualToken || actualToken.length === 0) return false;
    
    setLoading(true);
    try {
      
      // Check if there are images to upload
      if (movieCreateData.hasImages) {
        // Use the new image upload endpoint
        const response = await MovieApiService.createMovieWithImages(
          {
            title: movieCreateData.title,
            description: movieCreateData.description || '',
            duration: movieCreateData.duration,
            releaseDate: movieCreateData.releaseDate,
            genre: movieCreateData.genre,
            director: movieCreateData.director || '',
            cast: movieCreateData.cast || '',
            language: movieCreateData.language || 'English',
            country: movieCreateData.country || 'United States',
            rating: movieCreateData.rating || 'G',
            price: movieCreateData.price,
            status: movieCreateData.status,
            isFeatured: movieCreateData.isFeatured === true,
            imdbRating: movieCreateData.imdbRating || 0,
            productionCompany: movieCreateData.productionCompany || '',
            budget: movieCreateData.budget || 0,
            boxOffice: movieCreateData.boxOffice || 0
          },
          movieCreateData.posterFile,
          movieCreateData.backdropFile,
          actualToken
        );
        
        if (response.success) {
          message.success('Movie created successfully with images!');
          fetchMovies();
          return true;
        } else {
          message.error(response.message || 'Unable to create movie with images.');
          return false;
        }
      } else {
        // Use regular creation without images
        const backendData: MovieCreateRequest = {
          title: movieCreateData.title,
          originalTitle: movieCreateData.originalTitle || movieCreateData.title,
          description: movieCreateData.description || '',
          duration: movieCreateData.duration,
          releaseDate: movieCreateData.releaseDate,
          endDate: movieCreateData.endDate || null,
          genre: movieCreateData.genre,
          director: movieCreateData.director || '',
          cast: movieCreateData.cast || '',
          language: movieCreateData.language || 'English',
          country: movieCreateData.country || 'United States',
          rating: movieCreateData.rating || 'G',
          price: movieCreateData.price,
          status: movieCreateData.status,
          isFeatured: movieCreateData.isFeatured === true,
          isAdultContent: false,
          trailerUrl: movieCreateData.trailerUrl || '',
        };
        
        const response = await MovieApiService.createMovie(backendData, actualToken);
        if (response.success) {
          message.success('Movie created successfully!');
          fetchMovies();
          return true;
        } else {
          message.error(response.message || 'Unable to create movie.');
          return false;
        }
      }
    } catch (error) {
      console.error('🎬 Create movie error:', error);
      message.error('An error occurred while creating the movie. Please check all required fields.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateMovie = async (movieId: number, movieUpdateData: any): Promise<boolean> => {
    if (!actualToken || actualToken.length === 0) return false;
    
    setLoading(true);
    try {
      // Check if there are images to upload
      if (movieUpdateData.hasImages) {
        // Use the new image upload endpoint
        const response = await MovieApiService.updateMovieWithImages(
          movieId,
          {
            title: movieUpdateData.title,
            originalTitle: movieUpdateData.originalTitle || movieUpdateData.title,
            description: movieUpdateData.description || '',
            duration: movieUpdateData.duration,
            releaseDate: movieUpdateData.releaseDate,
            endDate: movieUpdateData.endDate || null,
            genre: movieUpdateData.genre,
            director: movieUpdateData.director || '',
            cast: movieUpdateData.cast || '',
            language: movieUpdateData.language || 'English',
            country: movieUpdateData.country || 'United States',
            rating: movieUpdateData.rating || 'G',
            price: movieUpdateData.price,
            status: movieUpdateData.status,
            isFeatured: movieUpdateData.isFeatured === true,
            isAdultContent: false,
            trailerUrl: movieUpdateData.trailerUrl || '',
          },
          movieUpdateData.posterFile,
          movieUpdateData.backdropFile,
          actualToken
        );
        
        if (response.success) {
          message.success('Movie updated successfully with images!');
          fetchMovies();
          return true;
        } else {
          message.error(response.message || 'Unable to update movie with images.');
          return false;
        }
      } else {
        // Use regular update without images
        const response = await MovieApiService.updateMovie(movieId, movieUpdateData, actualToken);
        if (response.success) {
          message.success('Movie updated successfully!');
          fetchMovies();
          return true;
        } else {
          message.error(response.message || 'Unable to update movie.');
          return false;
        }
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
        fetchMovies(); // This will trigger recalculation of statistics
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
    
    // Check featured limit when adding to featured
    const currentFeaturedCount = allMovieData.filter(movie => movie.isFeatured).length;
    if (!isFeatured && currentFeaturedCount >= 5) {
      message.warning('You have reached the limit of 5 featured movies. Please unfeature some movies first.');
      return;
    }
    
    setLoading(true);
    try {
      // Only send the isFeatured field to avoid any unintended side effects
      const newFeaturedStatus = !isFeatured;
      const updateData = {
        isFeatured: newFeaturedStatus === true // Explicit boolean comparison
      };
      
      const response = await MovieApiService.updateMovie(movieId, updateData as MovieUpdateRequest, actualToken);
      if (response.success) {
        message.success(`${newFeaturedStatus ? 'Movie featured' : 'Movie unfeatured'} successfully!`);
        fetchMovies(); // This will trigger recalculation of statistics
      } else {
        message.error(response.message || 'Unable to change featured status.');
      }
    } catch (error) {
      message.error('An error occurred while changing the featured status.');
    } finally {
      setLoading(false);
    }
  };

  // Bulk Actions for Featured
  const bulkFeatureMovies = async (movieIds: number[]): Promise<void> => {
    if (!actualToken || actualToken.length === 0) return;
    
    const currentFeaturedCount = allMovieData.filter(movie => movie.isFeatured).length;
    const newlyFeaturedCount = movieIds.filter(id => 
      !allMovieData.find(movie => movie.id === id)?.isFeatured
    ).length;
    
    if (currentFeaturedCount + newlyFeaturedCount > 5) {
      message.warning(`Cannot feature ${movieIds.length} movies. Maximum limit is 5 featured movies. Current: ${currentFeaturedCount}/5`);
      return;
    }
    
    setLoading(true);
    try {
      const promises = movieIds.map(movieId => 
        MovieApiService.updateMovie(movieId, { isFeatured: true } as MovieUpdateRequest, actualToken)
      );
      
      await Promise.all(promises);
      message.success(`Successfully featured ${movieIds.length} movies!`);
      fetchMovies();
    } catch (error) {
      message.error('An error occurred while bulk featuring movies.');
    } finally {
      setLoading(false);
    }
  };

  const bulkUnfeatureMovies = async (movieIds: number[]): Promise<void> => {
    if (!actualToken || actualToken.length === 0) return;
    
    setLoading(true);
    try {
      const promises = movieIds.map(movieId => 
        MovieApiService.updateMovie(movieId, { isFeatured: false } as MovieUpdateRequest, actualToken)
      );
      
      await Promise.all(promises);
      message.success(`Successfully unfeatured ${movieIds.length} movies!`);
      fetchMovies();
    } catch (error) {
      message.error('An error occurred while bulk unfeaturing movies.');
    } finally {
      setLoading(false);
    }
  };

  return {
    // Data
    paginatedData,
    filteredData,
    statistics: calculatedStatistics, // Use calculated statistics from displayed data
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
    bulkFeatureMovies,
    bulkUnfeatureMovies,
  };
};

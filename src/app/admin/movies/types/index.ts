/**
 * Type definitions for Movie Management
 */

// Interface for Movie Data displayed in table
export interface MovieData {
  key: string;
  id: number;
  title: string;
  originalTitle?: string;
  genre: string;
  duration: number;
  releaseDate: string;
  status: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED';
  posterUrl?: string;
  isFeatured: boolean;
  price: number;
  rating?: string;
  imdbRating?: number;
  isAdultContent?: boolean;
  formattedDuration?: string;
  director?: string;
  description?: string;
  cast?: string;
  language?: string;
  country?: string;
  productionCompany?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  endDate?: string;
  isActive?: boolean;
}

// Interface for API Movie Response from backend
export interface ApiMovie {
  movieId: number;
  title: string;
  originalTitle?: string;
  description?: string;
  duration: number;
  genre: string;  // Changed from 'genres' to 'genre' to match API response
  director?: string;
  cast?: string;
  language?: string;
  country?: string;
  releaseDate?: string;
  endDate?: string;
  rating?: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  status: string;
  isFeatured: boolean;
  price: number;
  isActive: boolean;
  imdbRating?: number;
  productionCompany?: string;
  formattedDuration?: string;
  createdAt?: string;
  updatedAt?: string;
  isAdultContent?: boolean;
}

// Interface for creating movies
export interface MovieCreateRequest {
  title: string;
  originalTitle?: string;
  description: string;  // Required to match global type
  duration: number;
  genre: string;
  director: string;     // Required to match global type
  cast: string;         // Required to match global type
  language: string;     // Required to match global type
  country: string;      // Required to match global type
  releaseDate: string;  // Required to match global type (no optional)
  endDate?: string;
  rating: string;       // Required to match global type
  price: number;
  status: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED';  // Required to match global type
  isFeatured: boolean;  // Required to match global type
  isAdultContent: boolean;  // Required to match global type
  imdbRating?: number;
  productionCompany?: string;
  budget?: number;
  boxOffice?: number;
  backdropUrl?: string;
  posterUrl?: string;
  trailerUrl?: string;
  isActive?: boolean;
  autoScheduleEnabled?: boolean;
  priorityScore?: number;
  minDailyShows?: number;
  maxDailyShows?: number;
  preferredRoomTypes?: string[];
}

// Interface for updating movies
export type MovieUpdateRequest = Partial<MovieCreateRequest>;

// Interface for Movie Statistics
export interface MovieStatistics {
  totalMovies: number;
  nowShowingCount: number;
  comingSoonCount: number;
  endedCount: number;
  featuredCount: number;
  averageRating?: number;
  averagePrice?: number;
}

// Interface for Movie List Response
export interface MovieListResponse {
  movies: ApiMovie[];
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

// Interface for Current User
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Interface for Movie Filters
export interface MovieFilters {
  searchTerm: string;
  filterStatus: string;
  filterGenre: string;
}

// Interface for Pagination State
export interface PaginationState {
  currentPage: number;
  pageSize: number;
}

// API Error Response
export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

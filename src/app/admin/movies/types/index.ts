/**
 * Type definitions for Movie Management
 */

// Interface for Movie Data displayed in table
export interface MovieData {
  key: string;
  id: number;
  title: string;
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
  budget?: number;
  boxOffice?: number;
  backdropUrl?: string;
  trailerUrl?: string;
  endDate?: string;
  isActive?: boolean;
}

// Interface for API Movie Response from backend
export interface ApiMovie {
  movieId: number;
  title: string;
  description?: string;
  duration: number;
  genres: string;
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
  budget?: number;
  boxOffice?: number;
  formattedDuration?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface for creating movies
export interface MovieCreateRequest {
  title: string;
  description?: string;
  duration: number;
  genre: string;
  director?: string;
  cast?: string;
  language?: string;
  country?: string;
  releaseDate?: string;
  rating?: string;
  price: number;
  status?: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED';
  isFeatured?: boolean;
  imdbRating?: number;
  productionCompany?: string;
  budget?: number;
  boxOffice?: number;
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

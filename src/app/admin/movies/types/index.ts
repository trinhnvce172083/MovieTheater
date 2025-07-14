// Movie Management Types - Import and re-export types from existing types
import type { Movie } from '@/types/NowShowing/movie';

export type MovieResponse = Movie;

// Define create request interface
export interface MovieCreateRequest {
  title: string;
  genre: string[];
  duration: number;
  releaseDate: string;
  rating: string;
  posterUrl: string;
  price: number;
  status: string;
  imdbRating: number;
  isFeatured: boolean;
  isAdultContent: boolean;
}

export interface MovieFilters {
  searchTerm: string;
  filterGenre: string | undefined;
  filterStatus: string | undefined;
  filterRating: string | undefined;
}

export interface MovieStatistics {
  totalMovies: number;
  activeMovies: number;
  comingSoonMovies: number;
  avgRating: number;
}

export type BackendStatus = "checking" | "connected" | "disconnected";

export interface MovieManagementState {
  movieData: MovieResponse[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalElements: number;
  isModalVisible: boolean;
  editingMovie: MovieResponse | null;
  isUsingApiData: boolean;
  backendStatus: BackendStatus;
}

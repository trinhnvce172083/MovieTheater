// Utility functions for transforming movie data between backend and frontend formats

// Backend Movie types (from API responses) - Enhanced
export interface BackendMovie {
  movieId: number;
  title: string;
  originalTitle?: string;
  description?: string;
  genre?: string; // Backend returns string
  genres?: string; // Alternative field name
  duration: number;
  formattedDuration?: string;
  director?: string;
  cast?: string;
  language?: string;
  country?: string;
  releaseDate: string | { toString(): string }; // LocalDate from backend
  endDate?: string | { toString(): string };
  rating: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  price?: number;
  status: string;
  imdbRating?: number;
  productionCompany?: string;
  budget?: number;
  boxOffice?: number;
  isFeatured?: boolean;
  isAdultContent?: boolean;
  isActive?: boolean;
  scheduleCount?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown; // For additional fields
}

// Frontend Movie type - Enhanced
export interface FrontendMovie {
  movieId: string;
  title: string;
  originalTitle?: string;
  description?: string;
  genre: string[];
  duration: number;
  formattedDuration: string;
  director?: string;
  cast?: string;
  language?: string;
  country?: string;
  releaseDate: string;
  endDate?: string;
  rating: string;
  posterUrl: string;
  backdropUrl?: string;
  trailerUrl?: string;
  price: number;
  status: string;
  imdbRating: number;
  productionCompany?: string;
  budget?: number;
  boxOffice?: number;
  isFeatured: boolean;
  isAdultContent: boolean;
  isActive?: boolean;
  scheduleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Transform backend movie data to frontend format
 */
export function transformBackendToFrontend(backendMovie: BackendMovie): FrontendMovie {
  // Handle genre field - backend returns string, frontend expects array
  const genreString = backendMovie.genre || backendMovie.genres || '';
  const genreArray = genreString ? genreString.split(', ').filter(g => g.trim()) : [];
  
  // Handle release date - backend might return LocalDate object
  const releaseDate = typeof backendMovie.releaseDate === 'string' 
    ? backendMovie.releaseDate 
    : backendMovie.releaseDate?.toString() || '';

  // Handle end date
  const endDate = backendMovie.endDate 
    ? (typeof backendMovie.endDate === 'string' 
        ? backendMovie.endDate 
        : backendMovie.endDate?.toString() || '')
    : undefined;
  
  // Handle formatted duration
  const formattedDuration = backendMovie.formattedDuration || 
    `${Math.floor(backendMovie.duration / 60)}h ${backendMovie.duration % 60}m`;

  return {
    movieId: backendMovie.movieId.toString(),
    title: backendMovie.title,
    originalTitle: backendMovie.originalTitle,
    description: backendMovie.description,
    genre: genreArray,
    duration: backendMovie.duration,
    formattedDuration,
    director: backendMovie.director,
    cast: backendMovie.cast,
    language: backendMovie.language,
    country: backendMovie.country,
    releaseDate,
    endDate,
    rating: backendMovie.rating,
    posterUrl: backendMovie.posterUrl || '',
    backdropUrl: backendMovie.backdropUrl,
    trailerUrl: backendMovie.trailerUrl,
    price: backendMovie.price || 0,
    status: backendMovie.status,
    imdbRating: backendMovie.imdbRating || 0,
    productionCompany: backendMovie.productionCompany,
    budget: backendMovie.budget,
    boxOffice: backendMovie.boxOffice,
    isFeatured: backendMovie.isFeatured || false,
    isAdultContent: backendMovie.isAdultContent || false,
    isActive: backendMovie.isActive,
    scheduleCount: backendMovie.scheduleCount,
    createdAt: backendMovie.createdAt,
    updatedAt: backendMovie.updatedAt,
  };
}

/**
 * Transform frontend movie data to backend format for API requests
 */
export function transformFrontendToBackend(frontendMovie: Partial<FrontendMovie>): Partial<BackendMovie> {
  // Handle genre field - frontend has array, backend expects string
  const genreString = frontendMovie.genre ? frontendMovie.genre.join(', ') : undefined;
  
  // Create a copy without the genre array
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { genre: _, ...otherFields } = frontendMovie;
  
  return {
    ...otherFields,
    movieId: frontendMovie.movieId ? parseInt(frontendMovie.movieId) : undefined,
    genre: genreString,
  };
}

/**
 * Transform array of backend movies to frontend format
 */
export function transformMoviesBackendToFrontend(backendMovies: BackendMovie[]): FrontendMovie[] {
  return backendMovies.map(transformBackendToFrontend);
}

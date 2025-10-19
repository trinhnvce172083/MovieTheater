// Utility functions for movie data transformation
// Handles the mapping between frontend and backend movie data structures

export interface FrontendMovie {
  movieId?: number;
  title: string;
  originalTitle?: string;
  description?: string;
  genre?: string | string[];
  genres?: string | string[];
  duration: number;
  director?: string;
  cast?: string;
  language?: string;
  country?: string;
  releaseDate: string;
  endDate?: string;
  rating: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  price?: number;
  status: string;
  imdbRating?: number;
  productionCompany?: string;
  budget?: number;
  boxOffice?: number;
  isAdultContent?: boolean;
  formattedDuration?: string;
}

export interface BackendMovie {
  movieId?: number;
  title: string;
  originalTitle?: string;
  description?: string;
  duration: number;
  genre: string; // Backend expects comma-separated string
  director?: string;
  cast?: string;
  language?: string;
  country?: string;
  releaseDate: string;
  endDate?: string;
  rating: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  price?: number;
  status: string;
  imdbRating?: number;
  productionCompany?: string;
  budget?: number;
  boxOffice?: number;
  isAdultContent?: boolean;
  formattedDuration?: string;
}

/**
 * Transform frontend movie data to backend format
 */
export const transformToBackendFormat = (frontendData: FrontendMovie): BackendMovie => {
  // Handle genre/genres field mapping
  let genresValue = '';
  if (frontendData.genres) {
    genresValue = Array.isArray(frontendData.genres) 
      ? frontendData.genres.join(', ') 
      : frontendData.genres;
  } else if (frontendData.genre) {
    genresValue = Array.isArray(frontendData.genre) 
      ? frontendData.genre.join(', ') 
      : frontendData.genre;
  }

  const transformed: BackendMovie = {
    title: frontendData.title,
    originalTitle: frontendData.originalTitle || frontendData.title,
    description: frontendData.description || null,
    duration: frontendData.duration,
    genre: genresValue,
    director: frontendData.director,
    cast: frontendData.cast,
    language: frontendData.language,
    country: frontendData.country,
    releaseDate: frontendData.releaseDate,
    endDate: frontendData.endDate,
    rating: frontendData.rating,
    posterUrl: frontendData.posterUrl || null,
    backdropUrl: frontendData.backdropUrl || null,
    trailerUrl: frontendData.trailerUrl || null,
    isActive: frontendData.isActive !== undefined ? frontendData.isActive : true,
    isFeatured: frontendData.isFeatured !== undefined ? frontendData.isFeatured : false,
    price: frontendData.price || 0,
    status: frontendData.status || "COMING_SOON",
    imdbRating: frontendData.imdbRating || null,
    productionCompany: frontendData.productionCompany || null,
    budget: frontendData.budget || null,
    boxOffice: frontendData.boxOffice || null,
  };

  // Return the raw transformed object without filtering nulls
  return transformed;
};

/**
 * Transform backend movie data to frontend format
 */
export const transformToFrontendFormat = (backendData: BackendMovie): FrontendMovie => {
  return {
    ...backendData,
    // Map backend genres to frontend genre field for compatibility
    genre: backendData.genre,
    // Keep genres field as well for new components
    genres: backendData.genre,
    // Add missing fields with defaults if not present
    isAdultContent: backendData.isAdultContent ?? false,
    formattedDuration: backendData.formattedDuration ?? `${backendData.duration || 0} min`,
  };
};

/**
 * Get display genres as array for UI components
 */
export const getGenresArray = (movie: FrontendMovie | BackendMovie): string[] => {
  const genresValue = (movie as FrontendMovie & BackendMovie).genres || (movie as FrontendMovie & BackendMovie).genre || '';
  if (Array.isArray(genresValue)) {
    return genresValue;
  }
  if (typeof genresValue === 'string') {
    return genresValue.split(',').map(g => g.trim()).filter(Boolean);
  }
  return [];
};

/**
 * Get display genres as string for backend
 */
export const getGenresString = (movie: FrontendMovie): string => {
  const genresValue = movie.genres || movie.genre || '';
  if (Array.isArray(genresValue)) {
    return genresValue.join(', ');
  }
  return genresValue;
};

/**
 * Create clean movie data for API calls (removes null/undefined values)
 */
export const createCleanMovieData = (movieData: Partial<FrontendMovie>): Partial<BackendMovie> => {
  const transformed = transformToBackendFormat(movieData as FrontendMovie);
  
  // Remove null and undefined values but keep false and 0
  const cleaned = Object.fromEntries(
    Object.entries(transformed).filter(([, value]) => 
      value !== null && value !== undefined && value !== ''
    )
  );
  
  return cleaned as Partial<BackendMovie>;
};

/**
 * Prepare movie data for smart update (backend feature)
 */
export const prepareSmartUpdateData = (movieData: Partial<FrontendMovie>): Record<string, unknown> => {
  const backendData: Record<string, unknown> = {};
  
  // Handle each field explicitly for smart update
  Object.entries(movieData).forEach(([key, value]) => {
    if (value === null) {
      // Use CLEAR_FIELD to explicitly clear the field
      backendData[key] = "CLEAR_FIELD";
    } else if (value !== undefined && value !== '') {
      // Handle genre/genres mapping
      if (key === 'genre' || key === 'genres') {
        const genresValue = Array.isArray(value) ? value.join(', ') : value;
        backendData.genre = genresValue;
      } else {
        backendData[key] = value;
      }
    }
    // Skip undefined and empty string values (preserve original)
  });
  
  return backendData;
};

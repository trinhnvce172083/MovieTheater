export interface Movie {
  movieId: number;
  title: string;
  originalTitle: string;
  description: string;
  duration: number;
  genres: string;
  director: string;
  language: string;
  country: string;
  releaseDate: string;
  endDate: string;
  rating: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  price: number;
  status: string;
  imdbRating: number;
  formattedDuration: string;
  availableToday: boolean;
  adultContent: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
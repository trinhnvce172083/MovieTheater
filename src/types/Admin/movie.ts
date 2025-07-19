export interface Movie {
    movieId: number;
    title: string;
    description: string;
    duration: number;
    genre: string;
    releaseDate: string;
    status: string;
    posterUrl?: string;
    backdropUrl?: string;
    trailerUrl?: string;
    isFeatured: boolean;
    price: number;
    isAdultContent: boolean;
    rating: string;
    imdbRating: number;
    formattedDuration: string;
  }
  
  export interface MovieDetails extends Movie {
    director: string;
    cast: string;
    language: string;
    country: string;
    rating: string;
    imdbRating: number;
    productionCompany: string;
    budget: number;
    boxOffice: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface MovieListResponse {
    movies: Movie[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalElements: number;
      pageSize: number;
      hasNext: boolean;
      hasPrevious: boolean;
      isFirst: boolean;
      isLast: boolean;
    };
  }
  
  export interface MovieStatistics {
    totalMovies: number;
    nowShowingCount: number;
    comingSoonCount: number;
    endedCount: number;
    featuredCount: number;
    averageRating: number;
    averagePrice: number;
  }
  
  export interface MovieCreateRequest {
    title: string;
    description: string;
    duration: number;
    releaseDate: string;
    endDate?: string;
    genre: string;
    director: string;
    cast: string;
    language: string;
    country: string;
    rating: string;
    trailerUrl?: string;
    price: number;
    status: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED';
    isFeatured: boolean;
    isAdultContent: boolean;
  }
  
  export type MovieUpdateRequest = Partial<MovieCreateRequest>;

export interface Movie {
    movieId: number;
    title: string;
    originalTitle?: string;
    description: string;
    duration: number;
    genre: string;
    director?: string;
    cast?: string;
    language?: string;
    country?: string;
    releaseDate: string;
    endDate?: string;
    status: string;
    posterUrl?: string;
    backdropUrl?: string;
    trailerUrl?: string;
    isFeatured: boolean;
    isActive?: boolean;
    price: number;
    isAdultContent: boolean;
    rating: string;
    imdbRating?: number;
    productionCompany?: string;
    budget?: number;
    boxOffice?: number;
    formattedDuration: string;
    createdAt?: string;
    updatedAt?: string;
    scheduleCount?: number;
    isNowShowing?: boolean;
    isComingSoon?: boolean;
    isEnded?: boolean;
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
    originalTitle?: string;
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
    isAdultContent?: boolean;
    imdbRating?: number;
    productionCompany?: string;
    budget?: number;
    boxOffice?: number;
  }
  
  export type MovieUpdateRequest = Partial<MovieCreateRequest>;

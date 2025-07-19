export interface Movie {
  movieId: string // Keep as string for frontend compatibility, will be converted from number
  title: string
  genre: string[] // Frontend expects array, will be converted from backend string
  duration: number
  formattedDuration: string
  releaseDate: string
  rating: string
  posterUrl: string
  price: number
  status: string
  imdbRating: number
  isFeatured: boolean
  isAdultContent: boolean
}

export interface MovieFilters {
  searchTerm: string
  selectedGenre: string
  selectedRating: string
  sortBy: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

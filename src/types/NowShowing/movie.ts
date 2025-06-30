export interface Movie {
  movieId: string
  title: string
  genre: string[]
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

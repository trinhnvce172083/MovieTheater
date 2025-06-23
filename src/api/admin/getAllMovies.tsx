// import axiosClient from "../axiosClient";

// export const getAllMovies = async () => {
//   try {
//     const response = await axiosClient.get("/cinema/movies?page=0&size=10&sortBy=title&sortDirection=asc");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

import axiosClient from "../axiosClient";
import { 
  mockGetMovies, 
  mockCreateMovie, 
  mockUpdateMovie, 
  mockDeleteMovie, 
  mockGetMovieById 
} from "../mock/moviesMock";

export interface Movie {
  movieId: number;
  title: string;
  originalTitle?: string; // Vietnamese title
  vietnameseTitle?: string; // Alias for originalTitle
  description?: string;
  releaseDate: string;
  productionCompany?: string;
  company?: string; // Alias for productionCompany
  duration: number;
  genres?: string; // Comma-separated genres
  versions?: string[]; // Placeholder for movie versions
  rating: string;
  status: string; // NOW_SHOWING, COMING_SOON, ENDED
  boxOffice?: number; // Revenue from database
  revenue?: number; // Alias for boxOffice
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  director?: string;
  cast?: string;
  language?: string;
  country?: string;
  endDate?: string;
  price?: number;
  imdbRating?: number;
  budget?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isAdultContent?: boolean;
  isNowShowing?: boolean;
  isComingSoon?: boolean;
  isEnded?: boolean;
  scheduleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetMoviesParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
  status?: string;
  genre?: string;
}

export interface ApiMovieResponse {
  movieId: number;
  title: string;
  genre?: string;
  duration: number;
  formattedDuration?: string;
  releaseDate: string;
  rating: string;
  posterUrl?: string;
  price?: number;
  status: string;
  imdbRating?: number;
  isFeatured?: boolean;
  isAdultContent?: boolean;
  originalTitle?: string;
  description?: string;
  productionCompany?: string;
  boxOffice?: number;
  versions?: string[];
}

export interface MoviesResponse {
  content: Movie[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Flag để chuyển đổi giữa real API và mock API
const USE_MOCK_API = false; // Force to use real API for now

export const getMovies = async (params: GetMoviesParams = {}): Promise<MoviesResponse> => {
  console.log("getMovies called with USE_MOCK_API:", USE_MOCK_API);
  console.log("getMovies params:", params);
  
  if (USE_MOCK_API) {
    return mockGetMovies(params);
  }

  try {
    // Sử dụng Spring Boot API endpoints
    console.log("Making API call to /api/movies");
    const response = await axiosClient.get("/api/movies", { 
      params: {
        page: params.page || 0,
        size: params.size || 10,
        sortBy: params.sortBy || "title",
        sortDirection: params.sortDirection || "asc",
      }
    });

    console.log("API Response received:", response.data);

    // Transform Spring Boot response to match our expected format
    const springData = response.data;
    
    // Transform each movie to match our interface
    const transformedMovies = springData.content?.map((movie: ApiMovieResponse) => ({
      movieId: movie.movieId,
      title: movie.title,
      vietnameseTitle: movie.originalTitle,
      description: movie.description,
      releaseDate: movie.releaseDate,
      company: movie.productionCompany,
      duration: movie.duration,
      versions: movie.versions || ["2D"], // Default version if not provided
      genres: movie.genre, // API uses 'genre' instead of 'genres'
      rating: movie.rating,
      status: movie.status,
      revenue: movie.boxOffice || 0,
      posterUrl: movie.posterUrl,
      price: movie.price,
      imdbRating: movie.imdbRating,
      isFeatured: movie.isFeatured,
      isAdultContent: movie.isAdultContent,
      formattedDuration: movie.formattedDuration,
    })) || [];

    console.log("Transformed movies:", transformedMovies);

    const result = {
      content: transformedMovies,
      totalElements: springData.page?.totalElements || springData.totalElements || 0,
      totalPages: springData.page?.totalPages || springData.totalPages || 0,
      size: springData.page?.size || springData.size || params.size || 10,
      number: springData.page?.number || springData.number || params.page || 0,
      first: springData.page?.number === 0 || springData.first || true,
      last: springData.page ? (springData.page.number >= springData.page.totalPages - 1) : springData.last || true,
    };
    
    console.log("Final result:", result);
    return result;
  } catch (error) {
    console.error("Error fetching movies:", error);
    // Fallback to mock API if real API fails
    console.log("Falling back to mock API");
    return mockGetMovies(params);
  }
};

// API để tạo movie mới
export const createMovie = async (movieData: Omit<Movie, 'movieId'>): Promise<Movie> => {
  if (USE_MOCK_API) {
    return mockCreateMovie(movieData);
  }

  try {
    // Transform frontend data to backend format
    const backendData = {
      title: movieData.title,
      originalTitle: movieData.vietnameseTitle || movieData.originalTitle,
      description: movieData.description,
      duration: movieData.duration,
      genres: movieData.genres,
      director: movieData.director,
      cast: movieData.cast,
      language: movieData.language,
      country: movieData.country,
      releaseDate: movieData.releaseDate,
      endDate: movieData.endDate,
      rating: movieData.rating,
      posterUrl: movieData.posterUrl,
      backdropUrl: movieData.backdropUrl,
      trailerUrl: movieData.trailerUrl,
      price: movieData.price,
      status: movieData.status,
      imdbRating: movieData.imdbRating,
      productionCompany: movieData.company || movieData.productionCompany,
      budget: movieData.budget,
      boxOffice: movieData.revenue || movieData.boxOffice,
      isActive: movieData.isActive,
      isFeatured: movieData.isFeatured,
    };

    const response = await axiosClient.post("/api/movies", backendData);
    return response.data;
  } catch (error) {
    console.error("Error creating movie:", error);
    // Fallback to mock API if real API fails
    console.log("Falling back to mock API");
    return mockCreateMovie(movieData);
  }
};

// API để cập nhật movie
export const updateMovie = async (id: number, movieData: Partial<Movie>): Promise<Movie> => {
  if (USE_MOCK_API) {
    return mockUpdateMovie(String(id), movieData);
  }

  try {
    // Transform frontend data to backend format
    const backendData = {
      title: movieData.title,
      originalTitle: movieData.vietnameseTitle || movieData.originalTitle,
      description: movieData.description,
      duration: movieData.duration,
      genres: movieData.genres,
      director: movieData.director,
      cast: movieData.cast,
      language: movieData.language,
      country: movieData.country,
      releaseDate: movieData.releaseDate,
      endDate: movieData.endDate,
      rating: movieData.rating,
      posterUrl: movieData.posterUrl,
      backdropUrl: movieData.backdropUrl,
      trailerUrl: movieData.trailerUrl,
      price: movieData.price,
      status: movieData.status,
      imdbRating: movieData.imdbRating,
      productionCompany: movieData.company || movieData.productionCompany,
      budget: movieData.budget,
      boxOffice: movieData.revenue || movieData.boxOffice,
      isActive: movieData.isActive,
      isFeatured: movieData.isFeatured,
    };

    const response = await axiosClient.put(`/api/movies/${id}`, backendData);
    return response.data;
  } catch (error) {
    console.error("Error updating movie:", error);
    // Fallback to mock API if real API fails
    console.log("Falling back to mock API");
    return mockUpdateMovie(String(id), movieData);
  }
};

// API để xóa movie
export const deleteMovie = async (id: number): Promise<void> => {
  if (USE_MOCK_API) {
    return mockDeleteMovie(String(id));
  }

  try {
    await axiosClient.delete(`/api/movies/${id}`);
  } catch (error) {
    console.error("Error deleting movie:", error);
    // Fallback to mock API if real API fails
    console.log("Falling back to mock API");
    return mockDeleteMovie(String(id));
  }
};

// API để lấy chi tiết movie
export const getMovieById = async (id: number): Promise<Movie> => {
  if (USE_MOCK_API) {
    return mockGetMovieById(String(id));
  }

  try {
    const response = await axiosClient.get(`/api/movies/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching movie by ID:", error);
    // Fallback to mock API if real API fails
    console.log("Falling back to mock API");
    return mockGetMovieById(String(id));
  }
};

// API để search movies
export const searchMovies = async (keyword: string, params: GetMoviesParams = {}): Promise<MoviesResponse> => {
  if (USE_MOCK_API) {
    return mockGetMovies({ ...params, search: keyword });
  }

  try {
    const response = await axiosClient.get("/api/movies/search", {
      params: {
        keyword,
        page: params.page || 0,
        size: params.size || 10,
      }
    });

    const springData = response.data;
    return {
      content: springData.content || [],
      totalElements: springData.totalElements || 0,
      totalPages: springData.totalPages || 0,
      size: springData.size || params.size || 10,
      number: springData.number || params.page || 0,
      first: springData.first || true,
      last: springData.last || true,
    };
  } catch (error) {
    console.error("Error searching movies:", error);
    return mockGetMovies({ ...params, search: keyword });
  }
};

// API để filter movies
export const filterMovies = async (filterData: {
  keyword?: string;
  genres?: string[];
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}): Promise<MoviesResponse> => {
  if (USE_MOCK_API) {
    return mockGetMovies({
      page: filterData.page || 0,
      size: filterData.size || 10,
      search: filterData.keyword,
      status: filterData.status,
      genre: filterData.genres?.[0],
    });
  }

  try {
    const response = await axiosClient.post("/api/movies/filter", filterData);
    const springData = response.data;
    
    return {
      content: springData.movies || [],
      totalElements: springData.totalElements || 0,
      totalPages: springData.totalPages || 0,
      size: filterData.size || 10,
      number: filterData.page || 0,
      first: (filterData.page || 0) === 0,
      last: true,
    };
  } catch (error) {
    console.error("Error filtering movies:", error);
    return mockGetMovies({
      page: filterData.page || 0,
      size: filterData.size || 10,
      search: filterData.keyword,
      status: filterData.status,
      genre: filterData.genres?.[0],
    });
  }
};

// API để lấy thống kê movies
export const getMovieStatistics = async (): Promise<{
  totalMovies: number;
  activeMovies: number;
  totalRevenue: number;
  avgDuration: number;
}> => {
  if (USE_MOCK_API) {
    const mockData = await mockGetMovies();
    const totalMovies = mockData.totalElements;
    const activeMovies = mockData.content.filter(m => m.status === 'NOW_SHOWING').length;
    const totalRevenue = mockData.content.reduce((sum, m) => sum + (m.revenue || m.boxOffice || 0), 0);
    const avgDuration = Math.round(mockData.content.reduce((sum, m) => sum + (m.duration || 0), 0) / (mockData.content.length || 1));
    
    return { totalMovies, activeMovies, totalRevenue, avgDuration };
  }

  try {
    const response = await axiosClient.get("/api/movies/statistics");
    const stats = response.data;
    
    return {
      totalMovies: stats.totalMovies || 0,
      activeMovies: stats.nowShowingCount || 0,
      totalRevenue: 0, // Will be calculated from movies if needed
      avgDuration: Math.round(stats.averageRating || 0), // Using averageRating as placeholder
    };
  } catch (error) {
    console.error("Error fetching movie statistics:", error);
    // Fallback to mock statistics
    const mockData = await mockGetMovies();
    const totalMovies = mockData.totalElements;
    const activeMovies = mockData.content.filter(m => m.status === 'NOW_SHOWING').length;
    const totalRevenue = mockData.content.reduce((sum, m) => sum + (m.revenue || m.boxOffice || 0), 0);
    const avgDuration = Math.round(mockData.content.reduce((sum, m) => sum + (m.duration || 0), 0) / (mockData.content.length || 1));
    
    return { totalMovies, activeMovies, totalRevenue, avgDuration };
  }
};
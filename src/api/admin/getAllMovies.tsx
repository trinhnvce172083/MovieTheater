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

export const getMovies = async (params: GetMoviesParams) => {
  const response = await axiosClient.get("/movies", { params });
  return response.data;
};
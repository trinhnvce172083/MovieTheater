import { Movie, MovieDetails, MovieListResponse, MovieStatistics, MovieCreateRequest, MovieUpdateRequest } from "@/types/Admin/movie";
import axiosClient from "@/api/axiosClient";
import { transformToFrontendFormat, transformToBackendFormat } from "@/utils/movieDataTransform";

type ApiResponse<T> = {
    data: T | null;
    success: boolean;
    message?: string;
};

export class MovieApiService {
    static async getMoviesWithFilter(
        filterRequest: {
            page?: number;
            size?: number;
            sortBy?: string;
            sortDirection?: string;
            keyword?: string;
            genres?: string[];
            status?: string;
        },
        token: string
    ): Promise<ApiResponse<MovieListResponse>> {
        try {
            const response = await axiosClient.post("/movies/filter", filterRequest, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = response.data;
            const transformedMovies = data.movies.map(transformToFrontendFormat);
            return {
                data: {
                    movies: transformedMovies,
                    pagination: data.pagination,
                },
                success: true,
            };
        } catch (error) {
            return {
                data: null,
                success: false,
                message: (error as any).response?.data?.message || "Failed to fetch movies.",
            };
        }
    }

    static async getMovieStatistics(token: string): Promise<ApiResponse<MovieStatistics>> {
        try {
            const response = await axiosClient.get("/movies/statistics", {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {
                data: response.data,
                success: true,
            };
        } catch (error) {
            return {
                data: null,
                success: false,
                message: (error as any).response?.data?.message || "Failed to fetch statistics.",
            };
        }
    }

    static async createMovie(movieData: MovieCreateRequest, token: string): Promise<ApiResponse<Movie>> {
        try {
            const backendData = transformToBackendFormat(movieData);
            const response = await axiosClient.post("/movies", backendData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {
                data: transformToFrontendFormat(response.data),
                success: true,
            };
        } catch (error) {
            return {
                data: null,
                success: false,
                message: (error as any).response?.data?.message || "Failed to create movie.",
            };
        }
    }

    static async updateMovie(movieId: number, movieData: MovieUpdateRequest, token: string): Promise<ApiResponse<Movie>> {
        try {
            const backendData = transformToBackendFormat(movieData);
            const response = await axiosClient.put(`/movies/${movieId}`, backendData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {
                data: transformToFrontendFormat(response.data),
                success: true,
            };
        } catch (error) {
            return {
                data: null,
                success: false,
                message: (error as any).response?.data?.message || "Failed to update movie.",
            };
        }
    }

    static async deleteMovie(movieId: number, token: string): Promise<ApiResponse<null>> {
        try {
            await axiosClient.delete(`/movies/${movieId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {
                data: null,
                success: true,
            };
        } catch (error) {
            return {
                data: null,
                success: false,
                message: (error as any).response?.data?.message || "Failed to delete movie.",
            };
        }
    }

    static async getMovieDetails(movieId: number, token: string): Promise<ApiResponse<MovieDetails>> {
        try {
            const response = await axiosClient.get(`/movies/${movieId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return {
                data: response.data,
                success: true,
            };
        } catch (error) {
            return {
                data: null,
                success: false,
                message: (error as any).response?.data?.message || "Failed to get movie details.",
            };
        }
    }
}

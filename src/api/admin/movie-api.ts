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
            const response = await axiosClient.post("/api/movies/filter", filterRequest, {
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
                message: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to fetch movies.",
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
                message: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to fetch statistics.",
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
                data: transformToFrontendFormat(response.data) as Movie,
                success: true,
            };
        } catch (error) {
            return {
                data: null,
                success: false,
                message: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to create movie.",
            };
        }
    }

    static async updateMovie(movieId: number, movieData: MovieUpdateRequest, token: string): Promise<ApiResponse<Movie>> {
        try {
            // For partial updates, only send the specific fields to avoid unintended changes
            const cleanData: Record<string, unknown> = {};
            
            // Only include non-undefined fields in the request
            Object.entries(movieData).forEach(([key, value]) => {
                if (value !== undefined) {
                    // Handle genre/genres mapping for backend compatibility
                    if (key === 'genre' && typeof value === 'string') {
                        cleanData.genre = value;
                    } else if (key === 'genres' && typeof value === 'string') {
                        cleanData.genre = value;
                    } else {
                        cleanData[key] = value;
                    }
                }
            });
            
            console.log(`🔧 Updating movie ${movieId} with data:`, cleanData);
            
            const response = await axiosClient.put(`/movies/${movieId}`, cleanData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            console.log('✅ Movie update response:', response.data);
            
            return {
                data: transformToFrontendFormat(response.data) as Movie,
                success: true,
            };
        } catch (error) {
            console.error('❌ Movie update error:', error);
            return {
                data: null,
                success: false,
                message: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to update movie.",
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
                message: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to delete movie.",
            };
        }
    }

    static async updateMovieWithImages(
        movieId: number,
        movieData: any,
        posterFile?: File,
        backdropFile?: File,
        token?: string
    ): Promise<ApiResponse<any>> {
        try {
            const formData = new FormData();
            
            // Add movie data as JSON string
            formData.append('movieData', JSON.stringify(movieData));
            
            // Add image files if provided
            if (posterFile) {
                formData.append('poster', posterFile);
            }
            if (backdropFile) {
                formData.append('backdrop', backdropFile);
            }

            const response = await axiosClient.put(`/api/movies/${movieId}/with-images`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });
            
            return {
                data: response.data.data,
                success: response.data.success,
                message: response.data.message,
            };
        } catch (error) {
            return {
                data: null,
                success: false,
                message: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to update movie with images.",
            };
        }
    }

    static async createMovieWithImages(
        movieData: any,
        posterFile?: File,
        backdropFile?: File,
        token?: string
    ): Promise<ApiResponse<any>> {
        try {
            const formData = new FormData();
            
            // Add movie data as JSON string
            formData.append('movieData', JSON.stringify(movieData));
            
            // Add image files if provided
            if (posterFile) {
                formData.append('poster', posterFile);
            }
            if (backdropFile) {
                formData.append('backdrop', backdropFile);
            }

            const response = await axiosClient.post(`/movies/with-images`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });
            
            return {
                data: response.data.data,
                success: response.data.success,
                message: response.data.message,
            };
        } catch (error) {
            return {
                data: null,
                success: false,
                message: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to create movie with images.",
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
                message: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to get movie details.",
            };
        }
    }
}

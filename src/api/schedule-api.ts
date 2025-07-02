import axiosClient from "./axiosClient";
import type { Schedule } from "@/types/schedule";

// Giả định một kiểu ApiResponse chung, nếu chưa có
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export class ScheduleApiService {
  static async getSchedulesForMovie(
    movieId: string | number,
    date: string // Định dạng YYYY-MM-DD
  ): Promise<ApiResponse<Schedule[]>> {
    try {
      const response = await axiosClient.get(`/schedules/movie/${movieId}`, {
        params: { fromDate: date, toDate: date },
      });
      return {
        data: response.data || [],
        success: true,
      };
    } catch (error: unknown) {
      console.error(`Error fetching schedules for movie ${movieId} on date ${date}:`, error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch schedules",
      };
    }
  }

  static async getSchedulesByMovie(movieId: string | number): Promise<ApiResponse<Schedule[]>> {
    try {
      const response = await axiosClient.get(`/movies/${movieId}/schedules`);
      return {
        data: response.data || [],
        success: true,
      };
    } catch (error: unknown) {
      console.error(`Error fetching schedules for movie ${movieId}:`, error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch schedules",
      };
    }
  }

  static async getScheduleById(scheduleId: number) {
    return axiosClient.get(`/schedules/${scheduleId}`);
  }
} 
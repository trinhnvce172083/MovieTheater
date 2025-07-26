import axiosClient from "./axiosClient";
import type { Schedule } from "@/types/schedule";

// Giả định một kiểu ApiResponse chung, nếu chưa có
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export class ScheduleApiService {
  static async getScheduleById(scheduleId: string | number): Promise<ApiResponse<Schedule>> {
    try {
      const response = await axiosClient.get(`/schedules/${scheduleId}`);
      
      // Xử lý response data
      let scheduleData: Schedule;
      
      if (response.data && response.data.data) {
        // Nếu response có cấu trúc { data: {...}, success: true }
        scheduleData = response.data.data;
      } else {
        // Nếu response trực tiếp là object
        scheduleData = response.data;
      }
      
      return {
        data: scheduleData,
        success: true,
        message: response.data?.message || "Schedule fetched successfully"
      };
    } catch (error: unknown) {
      return {
        data: {} as Schedule,
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch schedule",
      };
    }
  }

  static async getSchedulesForMovie(
    movieId: string | number,
    date: string // Định dạng YYYY-MM-DD
  ): Promise<ApiResponse<Schedule[]>> {
    try {
      const response = await axiosClient.get(`/schedules/movie/${movieId}`, {
        params: { 
          fromDate: date, 
          toDate: date 
        },
      });
      
      // Xử lý response data
      let schedulesData: Schedule[] = [];
      
      if (response.data && response.data.data) {
        // Nếu response có cấu trúc { data: [...], success: true }
        schedulesData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        // Nếu response trực tiếp là array
        schedulesData = response.data;
      }
      
      return {
        data: schedulesData,
        success: true,
        message: response.data?.message || "Schedules fetched successfully"
      };
    } catch (error: unknown) {
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
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch schedules",
      };
    }
  }
} 
import axiosClient from "./axiosClient";

// Types
export interface Seat {
  id: number;
  row: string;
  number: string;
  status: string;
}

export interface SeatReservationRequest {
  seatIds: string[];
  scheduleId: string | number;
  sessionId?: string;
}

export interface BookingRequest {
  scheduleId: string | number;
  seatIds: string[];
  userId?: string;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface BookingSummary {
  bookingId: string;
  movieTitle: string;
  scheduleInfo: {
    date: string;
    time: string;
    cinemaRoom: string;
  };
  seats: Seat[];
  totalAmount: number;
  status: string;
}

export interface SeatLayout {
  seatId: number;
  seatNumber: string;
  seatRow: number;
  seatType: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export class BookingApiService {
  // Lấy trạng thái ghế của suất chiếu
  static async getSeatStatus(scheduleId: string | number): Promise<ApiResponse<Seat[]>> {
    try {
      // Thử các endpoint khác nhau có thể tồn tại
      let response;
      
      try {
        // Thử endpoint theo format bạn đã cung cấp
        response = await axiosClient.get(`/bookings/schedules/${scheduleId}/seats`);
      } catch {
        // Nếu không được, thử endpoint khác
        try {
          response = await axiosClient.get(`/schedules/${scheduleId}/seats`);
        } catch {
          // Thử endpoint khác nữa
          response = await axiosClient.get(`/schedule/${scheduleId}/seats`);
        }
      }
      
      return {
        data: response.data,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error fetching seat status:", error);
      
      // Log chi tiết lỗi để debug
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch seat status",
      };
    }
  }

  // Lấy layout ghế của phòng chiếu
  static async getSeatLayout(roomId: string | number): Promise<ApiResponse<SeatLayout[]>> {
    try {
      const response = await axiosClient.get(`/cinema-rooms/${roomId}/seats`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: unknown) {
      console.error(`Error fetching seat layout for room ${roomId}:`, error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch seat layout",
      };
    }
  }

  // Tạm thời giữ ghế
  static async reserveSeats(request: SeatReservationRequest): Promise<ApiResponse<{ sessionId: string }>> {
    try {
      const response = await axiosClient.post(`/bookings/schedules/${request.scheduleId}/seats/reserve`, {
        seatIds: request.seatIds,
      });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error reserving seats:", error);
      return {
        data: { sessionId: "" },
        success: false,
        message: error instanceof Error ? error.message : "Failed to reserve seats",
      };
    }
  }

  // Gia hạn giữ ghế
  static async extendSeatReservation(sessionId: string): Promise<ApiResponse<{ extended: boolean }>> {
    try {
      const response = await axiosClient.post(`/bookings/sessions/${sessionId}/seats/extend`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error extending seat reservation:", error);
      return {
        data: { extended: false },
        success: false,
        message: error instanceof Error ? error.message : "Failed to extend reservation",
      };
    }
  }

  // Giải phóng ghế
  static async releaseSeats(sessionId: string): Promise<ApiResponse<{ released: boolean }>> {
    try {
      const response = await axiosClient.delete(`/bookings/sessions/${sessionId}/seats/release`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error releasing seats:", error);
      return {
        data: { released: false },
        success: false,
        message: error instanceof Error ? error.message : "Failed to release seats",
      };
    }
  }

  // Tạo booking
  static async createBooking(request: BookingRequest): Promise<ApiResponse<{ bookingId: string }>> {
    try {
      const response = await axiosClient.post("/bookings", request);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error creating booking:", error);
      return {
        data: { bookingId: "" },
        success: false,
        message: error instanceof Error ? error.message : "Failed to create booking",
      };
    }
  }

  // Lấy tóm tắt booking
  static async getBookingSummary(bookingId: string): Promise<ApiResponse<BookingSummary>> {
    try {
      const response = await axiosClient.get(`/bookings/${bookingId}/summary`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error fetching booking summary:", error);
      return {
        data: {} as BookingSummary,
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch booking summary",
      };
    }
  }

  // Lấy booking details
  static async getBookingDetails(bookingId: string): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const response = await axiosClient.get(`/bookings/${bookingId}`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error fetching booking details:", error);
      return {
        data: {},
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch booking details",
      };
    }
  }

  // Hủy booking
  static async cancelBooking(bookingId: string): Promise<ApiResponse<{ cancelled: boolean }>> {
    try {
      const response = await axiosClient.post(`/bookings/${bookingId}/cancel`);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error cancelling booking:", error);
      return {
        data: { cancelled: false },
        success: false,
        message: error instanceof Error ? error.message : "Failed to cancel booking",
      };
    }
  }

  // Lấy booking của user
  static async getMyBookings(): Promise<ApiResponse<Record<string, unknown>[]>> {
    try {
      const response = await axiosClient.get("/bookings/my-bookings");
      return {
        data: response.data,
        success: true,
      };
    } catch (error: unknown) {
      console.error("Error fetching my bookings:", error);
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch my bookings",
      };
    }
  }
} 
import axiosClient from "./axiosClient";

// Types
export interface Seat {
  seatId: number;
  seatNumber: string;
  seatRow: string | number;
  seatColumn?: number;
  status: string; // AVAILABLE | OCCUPIED | TEMPORARILY_RESERVED
  seatType: string; // STANDARD | VIP | COUPLE
  reservedBySession?: string;
  reservationExpiry?: string;
  isActive?: boolean;
  priceMultiplier?: number;
  isRecliner?: boolean;
  hasTable?: boolean;
  cinemaRoomId?: number;
  cinemaRoomName?: string;
  rowLetter?: string;
  displayName?: string;
  isAvailable?: boolean;
  isOccupied?: boolean;
  isTemporarilyReserved?: boolean;
  isVIP?: boolean;
  isCouple?: boolean;
  isWheelchair?: boolean;
  isPremium?: boolean;
}

export interface SeatStatusResponse {
  seats: Seat[];
  lastUpdated: string;
}

export interface BookingRequest {
  scheduleId: number;
  seatIds: number[];
  concessions?: {
    concessionId: number;
    quantity: number;
  }[];
  promotionCode?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  isGuestBooking?: boolean;
}

export interface BookingResponse {
  bookingId: number;
  bookingCode: string;
  bookingDate: string;
  bookingStatus: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isGuestBooking: boolean;
  schedule: {
    scheduleId: number;
    showDateTime: string;
    formattedShowDateTime: string;
    language: string;
    isSubtitled: boolean;
  };
  movie: {
    movieId: number;
    title: string;
    originalTitle: string;
    duration: number;
    rating: string;
    genres: string;
    director: string;
    posterUrl: string;
    formattedDuration: string;
  };
  cinema: {
    cinemaRoomId: number;
    cinemaRoomName: string;
    cinemaLocation: string;
    address: string;
  };
  paymentMethod: string;
  qrCode: string;
  isCheckedIn: boolean;
  canBeCancelled: boolean;
  canBeCheckedIn: boolean;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
  formattedBookingDate: string;
  formattedShowDateTime: string;
  statusDisplayName: string;
  refundPolicy: string;
  discountPercentage: number;
}

export interface SeatReservationRequest {
  seatIds: string[];
  scheduleId: string | number;
  sessionId?: string;
}

export interface SeatReservationResponse {
  sessionId: string;
  expiresAt: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export const BookingApiService = {
  // Cập nhật endpoint để phù hợp với backend
  getSeatStatus: (scheduleId: string | number) =>
    axiosClient.get<SeatStatusResponse>(`/bookings/schedules/${scheduleId}/seats`),

  // API lấy layout ghế của phòng chiếu
  getSeatLayout: (roomId: string | number) =>
    axiosClient.get<Seat[]>(`/cinema-rooms/${roomId}/seats`),

  // Sửa endpoint reserve seats theo backend
  reserveSeats: (data: {
    seatIds: string[];
    scheduleId: string | number;
    sessionId?: string;
  }) => axiosClient.post<SeatReservationResponse>(`/bookings/schedules/${data.scheduleId}/seats/reserve`, {
    seatIds: data.seatIds
  }),

  // Sửa endpoint release seats theo backend
  releaseSeats: (sessionId: string) =>
    axiosClient.post(`/bookings/sessions/${sessionId}/seats/release`),

  // Sửa endpoint extend reservation theo backend
  extendSeatReservation: (sessionId: string) =>
    axiosClient.post(`/bookings/sessions/${sessionId}/seats/extend`),

  // Cập nhật để phù hợp với backend
  createBooking: (data: BookingRequest) =>
    axiosClient.post<BookingResponse>("/bookings", data),

  // Tạo booking với concessions
  createBookingWithConcessions: (data: BookingRequest) =>
    axiosClient.post<BookingResponse>("/bookings", data),

  // Tạo guest booking
  createGuestBooking: (data: BookingRequest) =>
    axiosClient.post<BookingResponse>("/bookings/guest", data),

  getBookingSummary: (bookingId: string) =>
    axiosClient.get<BookingResponse>(`/bookings/summary/${bookingId}`),

  // Lấy booking details
  getBookingDetails: (bookingId: string) =>
    axiosClient.get<ApiResponse<BookingResponse>>(`/bookings/${bookingId}`),

  // Hủy booking
  cancelBooking: (bookingId: string) =>
    axiosClient.post<ApiResponse<{ cancelled: boolean }>>(`/bookings/${bookingId}/cancel`),

  // Lấy booking của user
  getMyBookings: () =>
    axiosClient.get<ApiResponse<BookingResponse[]>>("/bookings/my-bookings"),
}; 
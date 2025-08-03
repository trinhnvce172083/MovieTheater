import axiosClient from "./axiosClient";

// Types based on backend employee endpoints
export interface EmployeeBookingRecord {
  id: number;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  movieTitle: string;
  showTime: string;
  showDate: string;
  room: string;
  seats: string[];
  totalAmount: number;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  bookingStatus: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'NO_SHOW';
  createdAt: string;
  employeeId: string;
  customerType: 'guest' | 'member';
}

export interface EmployeeBookingFilters {
  search?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CheckInRequest {
  bookingId: number;
  employeeId?: number;
}

export interface CheckInResponse {
  bookingId: number;
  checkedInAt: string;
  employeeId: number;
  success: boolean;
}

export interface MemberSearchRequest {
  query: string; // phone, email, or member code
  page?: number;
  size?: number;
}

export interface MemberInfo {
  memberId: number;
  memberCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  address?: string;
  membershipLevel: string;
  totalBookings: number;
  totalSpent: number;
  isActive: boolean;
}

export interface EmployeeGuestBookingRequest {
  scheduleId: number;
  seatIds: number[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  concessions?: {
    concessionId: number;
    quantity: number;
  }[];
  promotionCode?: string;
  paymentMethod: string;
  customerType: 'guest' | 'existing_member' | 'new_member';
  memberId?: number;
  newMemberInfo?: {
    dateOfBirth: string;
    address: string;
  };
}

export interface EmployeeStatistics {
  todayBookings: number;
  todayRevenue: number;
  todayCheckIns: number;
  todayNewMembers: number;
  monthlyBookings: number;
  monthlyRevenue: number;
}

// Employee API Service
export const EmployeeApiService = {
  // Booking Management
  getBookings: (filters?: EmployeeBookingFilters) =>
    axiosClient.get<ApiResponse<PaginatedResponse<EmployeeBookingRecord>>>("/employees/booking-management", {
      params: filters
    }),

  getBookingById: (bookingId: number) =>
    axiosClient.get<ApiResponse<EmployeeBookingRecord>>(`/employees/booking-management/${bookingId}`),

  // Check-in functionality
  checkInBooking: (data: CheckInRequest) =>
    axiosClient.post<ApiResponse<CheckInResponse>>("/checkin", data),

  checkInByQrCode: (qrCode: string) =>
    axiosClient.post<ApiResponse<CheckInResponse>>("/checkin/qr", { qrCode }),

  checkInByBookingCode: (bookingCode: string) =>
    axiosClient.post<ApiResponse<CheckInResponse>>("/checkin/booking-code", { bookingCode }),

  // Member search and management
  searchMembers: (data: MemberSearchRequest) =>
    axiosClient.get<ApiResponse<PaginatedResponse<MemberInfo>>>("/employees/members", {
      params: data
    }),

  getMemberById: (memberId: number) =>
    axiosClient.get<ApiResponse<MemberInfo>>(`/employees/members/${memberId}`),

  getMemberByPhone: (phoneNumber: string) =>
    axiosClient.get<ApiResponse<MemberInfo>>(`/employees/members/phone/${phoneNumber}`),

  // Guest booking for employees (staff can create booking for customers)
  createGuestBooking: (data: EmployeeGuestBookingRequest) =>
    axiosClient.post<ApiResponse<any>>("/employees/ticket-selling/guest-booking", data),

  // Employee statistics
  getEmployeeStatistics: () =>
    axiosClient.get<ApiResponse<EmployeeStatistics>>("/employees/statistics"),

  getDailyStatistics: (date?: string) =>
    axiosClient.get<ApiResponse<any>>("/employees/statistics/daily", {
      params: { date }
    }),

  // Staff payment processing
  processStaffPayment: (data: {
    bookingId: number;
    paymentMethod: 'CASH' | 'CARD' | 'WALLET';
    amount: number;
    customerInfo: {
      name: string;
      phone: string;
      email?: string;
    };
  }) =>
    axiosClient.post<ApiResponse<any>>("/payment/staff", data),

  confirmCashPayment: (data: {
    bookingId: number;
    amount: number;
    receivedAmount: number;
    change?: number;
  }) =>
    axiosClient.post<ApiResponse<any>>("/payment/staff/cash", data),

  // Employee profile
  getEmployeeProfile: () =>
    axiosClient.get<ApiResponse<any>>("/employees/profile"),

  updateEmployeeProfile: (data: any) =>
    axiosClient.put<ApiResponse<any>>("/employees/profile", data),

  // Daily reports
  getDailyReport: (date: string) =>
    axiosClient.get<ApiResponse<any>>(`/employees/reports/daily/${date}`),

  getShiftReport: () =>
    axiosClient.get<ApiResponse<any>>("/employees/reports/shift"),
};
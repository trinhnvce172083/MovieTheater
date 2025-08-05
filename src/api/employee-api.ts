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



// Employee API Service
export const EmployeeApiService = {
  // Booking Management - sử dụng endpoint search thực tế
  getBookings: (filters?: EmployeeBookingFilters) => {
    const params: any = {
      page: filters?.page || 0,
      size: filters?.size || 10,
    };
    
    // Add search params if provided
    if (filters?.search) {
      params.search = filters.search; // Backend sẽ search across multiple fields
    }
    
    if (filters?.status) {
      params.status = filters.status;
    }
    
    if (filters?.paymentStatus) {
      params.paymentStatus = filters.paymentStatus;
    }
    
    if (filters?.startDate) {
      params.startDate = filters.startDate;
    }
    
    if (filters?.endDate) {
      params.endDate = filters.endDate;
    }
    
    console.log('API Request params:', params);
    
    return axiosClient.get<ApiResponse<PaginatedResponse<EmployeeBookingRecord>>>("/bookings/search", {
      params
    });
  },

  getBookingById: (bookingId: number) =>
    axiosClient.get<ApiResponse<EmployeeBookingRecord>>(`/bookings/${bookingId}`),

  // Check-in functionality - sử dụng booking API
  checkInBooking: (data: CheckInRequest) =>
    axiosClient.post<ApiResponse<CheckInResponse>>(`/bookings/${data.bookingId}/checkin`),

  checkInByQrCode: (qrCode: string) =>
    axiosClient.post<ApiResponse<CheckInResponse>>("/bookings/checkin-qr", { qrCode }),

  checkInByBookingCode: (bookingCode: string) =>
    axiosClient.post<ApiResponse<CheckInResponse>>("/bookings/checkin-code", { bookingCode }),

  // Member search and management - tạm thời disable vì chưa có API
  searchMembers: (data: MemberSearchRequest) =>
    Promise.resolve({ data: { success: true, data: { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0, first: true, last: true } } }),

  getMemberById: (memberId: number) =>
    Promise.resolve({ data: { success: false, message: "Member API chưa có" } }),

  getMemberByPhone: (phoneNumber: string) =>
    Promise.resolve({ data: { success: false, message: "Member search chưa có" } }),

  // Guest booking for employees - sử dụng endpoint booking/guest
  createGuestBooking: (data: EmployeeGuestBookingRequest) =>
    axiosClient.post<ApiResponse<any>>("/bookings/guest", data),



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

  // API mới: Cập nhật trạng thái thanh toán
  updatePaymentStatus: (bookingId: number, data: {
    paymentStatus: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIAL_REFUNDED' | 'EXPIRED';
    paymentReference?: string;
    paymentMethod?: string;
    notes?: string;
    refundAmount?: number;
  }) =>
    axiosClient.post<ApiResponse<any>>(`/bookings/${bookingId}/payment/status`, data),

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
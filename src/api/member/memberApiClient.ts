/**
 * Member API Client
 * Professional API client for member-related operations
 * Features: Type safety, error handling, caching, loading states
 */

import axiosClient from "../axiosClient";
import type {
  ApiResponse,
  PaginatedResponse,
  MemberProfile,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  MemberBooking,
  BookingListParams,
  HistoryParams,
  BookingCancelRequest,
  BookingCheckInRequest,
  LoyaltyTransaction,
  MembershipBenefits,
  MemberStatistics,
  CacheEntry,
  MemberApiConfig,
} from "../../types/member";

// Import MemberApiError as value not type since we need to instantiate it
import { MemberApiError } from "../../types/member";

// ==================== CONFIGURATION ====================

const DEFAULT_CONFIG: MemberApiConfig = {
  enableMock: process.env.NODE_ENV === "development",
  mockDelay: 0,
  cacheEnabled: false,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
};

// ==================== CACHE MANAGER ====================

class CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly maxSize = 100;

  set<T>(key: string, data: T, ttl: number = DEFAULT_CONFIG.cacheTTL): void {
    if (!DEFAULT_CONFIG.cacheEnabled) return;

    // Clean expired entries
    this.cleanup();

    // Remove oldest if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    });
  }

  get<T>(key: string): T | null {
    if (!DEFAULT_CONFIG.cacheEnabled) return null;

    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    // Fix ES2015+ compatibility for Map iteration
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}

// ==================== API CLIENT CLASS ====================

export class MemberApiClient {
  private cache = new CacheManager();
  private config: MemberApiConfig;

  constructor(config: Partial<MemberApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Get member profile
   */
  async getProfile(
    useCache: boolean = true
  ): Promise<ApiResponse<MemberProfile>> {
    const cacheKey = "member:profile";

    try {
      // Check cache first
      if (useCache) {
        const cached = this.cache.get<MemberProfile>(cacheKey);
        if (cached) {
          return { success: true, data: cached };
        }
      }

      const response = await axiosClient.get("/auth/profile");
      const data = response.data.data;
      const profile: MemberProfile = {
        accountId: data.accountId,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        avatarUrl: data.avatarUrl,
        role: data.role,
        isActive: data.isActive,
        isVerified: data.isVerified,
        emailVerified: data.emailVerified,
        membershipLevel: data.membershipLevel || "BRONZE",
        membershipPoints: data.membershipPoints || 0,
        lastLogin: data.lastLogin,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        totalBookings: data.totalBookings || 0,
        totalSpent: data.totalSpent || 0,
      };

      // Cache the result
      this.cache.set(cacheKey, profile);

      return { success: true, data: profile };
    } catch (error) {
      console.error("Error fetching member profile:", error);
      throw new MemberApiError(
        "Failed to fetch profile",
        "PROFILE_FETCH_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Update member profile
   */
  async updateProfile(
    request: ProfileUpdateRequest
  ): Promise<ApiResponse<MemberProfile>> {
    try {
      let response;

      if (request.avatarFile) {
        // Use multipart form data for avatar upload
        const formData = new FormData();
        formData.append("avatar", request.avatarFile);

        // Add other profile data as JSON
        const profileData = {
          fullName: request.fullName,
          phoneNumber: request.phoneNumber,
          dateOfBirth: request.dateOfBirth,
          address: request.address,
        };
        formData.append("profileData", JSON.stringify(profileData));

        response = await axiosClient.put(
          "/auth/profile/with-avatar",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        // Regular JSON update
        response = await axiosClient.put("/auth/profile", request);
      }

      // Clear profile cache
      this.cache.delete("member:profile");

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new MemberApiError(
        "Failed to update profile",
        "PROFILE_UPDATE_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Change password
   */
  async changePassword(
    request: PasswordChangeRequest
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      await axiosClient.post("/auth/change-password", request);
      return { success: true, data: { success: true } };
    } catch (error) {
      console.error("Error changing password:", error);
      throw new MemberApiError(
        "Failed to change password",
        "PASSWORD_CHANGE_ERROR",
        500,
        error
      );
    }
  }

  // ==================== BOOKING MANAGEMENT ====================

  /**
   * Get member bookings with filters
   */
  async getBookings(
    params: BookingListParams = {}
  ): Promise<ApiResponse<PaginatedResponse<MemberBooking>>> {
    const cacheKey = `member:bookings:${JSON.stringify(params)}`;

    try {
      // Check cache for short-lived data
      const cached = this.cache.get<PaginatedResponse<MemberBooking>>(cacheKey);
      if (cached && (!params.page || params.page === 0)) {
        return { success: true, data: cached };
      }

      const queryParams = {
        page: params.page || 0,
        size: params.size || 10,
        sortBy: params.sortBy || "bookingDate",
        sortDirection: params.sortDirection || "DESC",
        ...(params.status && { status: params.status.join(",") }),
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate }),
      };

      const response = await axiosClient.get("/bookings/my-bookings", {
        params: queryParams,
      });

      // Transform response to match our interface
      const bookings: PaginatedResponse<MemberBooking> = {
        content: (response.data.content || [])
          .filter((item: any) => !!item)
          .map((item: any) => {
            try {
              return this.transformBookingResponse(item);
            } catch (e) {
              console.error("transformBookingResponse error", e, item);
              return null;
            }
          })
          .filter((item: any) => !!item),
        page: response.data.page,
      };

      // Cache only first page
      if (!params.page || params.page === 0) {
        this.cache.set(cacheKey, bookings, 2 * 60 * 1000); // 2 minutes for dynamic data
      }

      return { success: true, data: bookings };
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw new MemberApiError(
        "Failed to fetch bookings",
        "BOOKINGS_FETCH_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get booking history (completed/cancelled)
   */
  async getBookingHistory(
    params: HistoryParams = {}
  ): Promise<ApiResponse<PaginatedResponse<MemberBooking>>> {
    const historyParams: BookingListParams = {
      ...params,
      status: ["COMPLETED", "CANCELLED"],
    };

    return this.getBookings(historyParams);
  }

  /**
   * Get active bookings (confirmed/paid)
   */
  async getActiveBookings(
    params: BookingListParams = {}
  ): Promise<ApiResponse<PaginatedResponse<MemberBooking>>> {
    const activeParams: BookingListParams = {
      ...params,
      status: ["CONFIRMED", "PAID"],
    };

    return this.getBookings(activeParams);
  }

  /**
   * Get booking details by ID
   */
  async getBookingDetails(
    bookingId: string
  ): Promise<ApiResponse<MemberBooking>> {
    const cacheKey = `member:booking:${bookingId}`;

    try {
      const cached = this.cache.get<MemberBooking>(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const response = await axiosClient.get(`/bookings/${bookingId}`);
      const booking = this.transformBookingResponse(response.data);

      this.cache.set(cacheKey, booking);

      return { success: true, data: booking };
    } catch (error) {
      console.error("Error fetching booking details:", error);
      throw new MemberApiError(
        "Failed to fetch booking details",
        "BOOKING_DETAILS_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(
    request: BookingCancelRequest
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      await axiosClient.post(`/bookings/${request.bookingId}/cancel`, {
        reason: request.reason,
      });

      // Clear related caches
      this.cache.delete(`member:booking:${request.bookingId}`);
      this.clearBookingListCaches();

      return { success: true, data: { success: true } };
    } catch (error) {
      console.error("Error cancelling booking:", error);
      throw new MemberApiError(
        "Failed to cancel booking",
        "BOOKING_CANCEL_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Check in to booking
   */
  async checkInBooking(
    request: BookingCheckInRequest
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      await axiosClient.post(`/bookings/${request.bookingId}/checkin`, {
        qrCode: request.qrCode,
      });

      // Clear related caches
      this.cache.delete(`member:booking:${request.bookingId}`);
      this.clearBookingListCaches();

      return { success: true, data: { success: true } };
    } catch (error) {
      console.error("Error checking in booking:", error);
      throw new MemberApiError(
        "Failed to check in",
        "BOOKING_CHECKIN_ERROR",
        500,
        error
      );
    }
  }

  // ==================== LOYALTY SYSTEM ====================

  /**
   * Get loyalty transactions
   */
  async getLoyaltyTransactions(
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PaginatedResponse<LoyaltyTransaction>>> {
    const cacheKey = `member:loyalty:${page}:${size}`;

    try {
      const cached =
        this.cache.get<PaginatedResponse<LoyaltyTransaction>>(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const response = await axiosClient.get("/loyalty/transactions", {
        params: { page, size },
      });

      this.cache.set(cacheKey, response.data);

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching loyalty transactions:", error);
      throw new MemberApiError(
        "Failed to fetch loyalty transactions",
        "LOYALTY_FETCH_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get membership benefits
   */
  async getMembershipBenefits(): Promise<ApiResponse<MembershipBenefits>> {
    const cacheKey = "member:benefits";

    try {
      const cached = this.cache.get<MembershipBenefits>(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const response = await axiosClient.get("/members/benefits");

      this.cache.set(cacheKey, response.data, 60 * 60 * 1000); // Cache for 1 hour

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching membership benefits:", error);
      throw new MemberApiError(
        "Failed to fetch membership benefits",
        "BENEFITS_FETCH_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get member statistics
   */
  async getStatistics(): Promise<ApiResponse<MemberStatistics>> {
    const cacheKey = "member:statistics";

    try {
      const cached = this.cache.get<MemberStatistics>(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }

      const response = await axiosClient.get("/members/statistics");

      this.cache.set(cacheKey, response.data, 10 * 60 * 1000); // Cache for 10 minutes

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching member statistics:", error);
      throw new MemberApiError(
        "Failed to fetch statistics",
        "STATISTICS_FETCH_ERROR",
        500,
        error
      );
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Transform booking response to our interface
   */
  private transformBookingResponse(item: unknown): MemberBooking {
    if (!item || typeof item !== 'object') {
      // Trả về object mặc định nếu item không hợp lệ
      return {
        bookingId: '',
        movieTitle: '',
        moviePoster: '',
        movieId: 0,
        scheduleId: 0,
        cinemaRoom: '',
        showDate: '',
        startTime: '',
        endTime: '',
        seats: [],
        concessions: [],
        totalAmount: 0,
        finalAmount: 0,
        discountAmount: 0,
        status: 'PENDING',
        paymentMethod: '',
        paymentStatus: '',
        bookingDate: '',
        bookingCode: '',
        qrCode: '',
        isCheckedIn: false,
        checkInTime: '',
        canCancel: false,
        canCheckIn: false,
        expiresAt: '',
      };
    }
    const booking = item as Record<string, any>;
    return {
      bookingId: booking.bookingId || booking.id,
      movieTitle: booking.movieTitle || booking.movie?.title,
      moviePoster: booking.moviePoster || booking.movie?.posterUrl,
      movieId: booking.movieId || booking.movie?.movieId,
      scheduleId: booking.scheduleId || booking.schedule?.scheduleId,
      cinemaRoom: booking.cinemaRoom || booking.schedule?.cinemaRoom?.name,
      showDate: booking.showDate || booking.schedule?.showDate,
      startTime: booking.startTime || booking.schedule?.startTime,
      endTime: booking.endTime || booking.schedule?.endTime,
      seats: booking.seats || booking.bookingSeats || [],
      concessions: booking.concessions || booking.bookingConcessions || [],
      totalAmount: booking.totalAmount || 0,
      finalAmount: booking.finalAmount || booking.totalAmount || 0,
      discountAmount: booking.discountAmount || 0,
      status: booking.status || "PENDING",
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      bookingDate: booking.bookingDate || booking.createdAt,
      bookingCode: booking.bookingCode || booking.code,
      qrCode: booking.qrCode,
      isCheckedIn: booking.isCheckedIn || false,
      checkInTime: booking.checkInTime,
      canCancel: this.canCancelBooking(booking),
      canCheckIn: this.canCheckInBooking(booking),
      expiresAt: booking.expiresAt,
    };
  }

  /**
   * Check if booking can be cancelled
   */
  private canCancelBooking(booking: any): boolean {
    const status = booking.status || booking.bookingStatus;
    const showDate = new Date(booking.showDate || booking.schedule?.showDate);
    const now = new Date();

    return (
      ["CONFIRMED", "PAID"].includes(status) &&
      showDate > now &&
      showDate.getTime() - now.getTime() > 2 * 60 * 60 * 1000
    ); // 2 hours before
  }

  /**
   * Check if booking can be checked in
   */
  private canCheckInBooking(booking: any): boolean {
    const status = booking.status || booking.bookingStatus;
    const showDate = new Date(booking.showDate || booking.schedule?.showDate);
    const now = new Date();

    return (
      status === "PAID" &&
      !booking.isCheckedIn &&
      Math.abs(showDate.getTime() - now.getTime()) < 30 * 60 * 1000
    ); // 30 minutes window
  }

  /**
   * Clear booking list caches
   */
  private clearBookingListCaches(): void {
    const keysToDelete: string[] = [];

    this.cache["cache"].forEach((entry, key) => {
      if (key.startsWith("member:bookings:")) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MemberApiConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ==================== SINGLETON INSTANCE ====================

export const memberApi = new MemberApiClient();

// ==================== CONVENIENCE FUNCTIONS ====================

export const MemberApiService = {
  // Profile
  getProfile: () => memberApi.getProfile(),
  updateProfile: (request: ProfileUpdateRequest) =>
    memberApi.updateProfile(request),
  changePassword: (request: PasswordChangeRequest) =>
    memberApi.changePassword(request),

  // Bookings
  getBookings: (params?: BookingListParams) => memberApi.getBookings(params),
  getBookingHistory: (params?: HistoryParams) =>
    memberApi.getBookingHistory(params),
  getActiveBookings: (params?: BookingListParams) =>
    memberApi.getActiveBookings(params),
  getBookingDetails: (bookingId: string) =>
    memberApi.getBookingDetails(bookingId),
  cancelBooking: (request: BookingCancelRequest) =>
    memberApi.cancelBooking(request),
  checkInBooking: (request: BookingCheckInRequest) =>
    memberApi.checkInBooking(request),

  // Loyalty
  getLoyaltyTransactions: (page?: number, size?: number) =>
    memberApi.getLoyaltyTransactions(page, size),
  getMembershipBenefits: () => memberApi.getMembershipBenefits(),
  getStatistics: () => memberApi.getStatistics(),

  // Utility
  clearCache: () => memberApi.clearCache(),
};

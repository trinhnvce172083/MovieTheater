/**
 * Member API Module
 * Centralized exports for all member-related API functionality
 */

// ==================== TYPE EXPORTS ====================
export type {
  // Response types
  ApiResponse,
  PaginatedResponse,

  // Profile types
  MemberProfile,
  ProfileUpdateRequest,
  PasswordChangeRequest,

  // Booking types
  MemberBooking,
  BookingSeat,
  BookingConcession,
  BookingStatus,
  BookingListParams,
  HistoryParams,
  BookingCancelRequest,
  BookingCheckInRequest,

  // Loyalty types
  LoyaltyTransaction,
  MembershipBenefits,
  MemberStatistics,

  // Configuration types
  MemberApiConfig,

  // Error types
  MemberApiError,
} from "../../types/member";

// ==================== API CLIENT EXPORTS ====================
export {
  MemberApiClient,
  memberApi,
  MemberApiService,
} from "@/api/member/memberApiClient";

import { MemberApiService } from "@/api/member/memberApiClient";

// ==================== HOOK EXPORTS ====================
export {
  // Profile hooks
  useMemberProfile,

  // Booking hooks
  useMemberBookings,
  useBookingHistory,
  useActiveBookings,
  useBookingDetails,
  useBookingActions,

  // Loyalty hooks
  useLoyaltyTransactions,
  useMembershipBenefits,
  useMemberStatistics,

  // Combined hooks
  useMemberDashboard,
  useMemberDataRefresh,
} from "@/hooks/member";

// ==================== CONVENIENCE FUNCTIONS ====================

import type {
  ProfileUpdateRequest,
  PasswordChangeRequest,
  BookingListParams,
  HistoryParams,
  BookingCancelRequest,
  BookingCheckInRequest,
} from "../../types/member";
import { MemberApiError } from "../../types/member";

/**
 * Quick access functions for common member operations
 */
export const MemberAPI = {
  // Profile operations
  getProfile: () => MemberApiService.getProfile(),
  updateProfile: (request: ProfileUpdateRequest) =>
    MemberApiService.updateProfile(request),
  changePassword: (request: PasswordChangeRequest) =>
    MemberApiService.changePassword(request),

  // Booking operations
  getBookings: (params?: BookingListParams) =>
    MemberApiService.getBookings(params),
  getBookingHistory: (params?: HistoryParams) =>
    MemberApiService.getBookingHistory(params),
  getActiveBookings: (params?: BookingListParams) =>
    MemberApiService.getActiveBookings(params),
  getBookingDetails: (bookingId: string) =>
    MemberApiService.getBookingDetails(bookingId),
  cancelBooking: (request: BookingCancelRequest) =>
    MemberApiService.cancelBooking(request),
  checkInBooking: (request: BookingCheckInRequest) =>
    MemberApiService.checkInBooking(request),

  // Loyalty operations
  getLoyaltyTransactions: (page?: number, size?: number) =>
    MemberApiService.getLoyaltyTransactions(page, size),
  getMembershipBenefits: () => MemberApiService.getMembershipBenefits(),
  getStatistics: () => MemberApiService.getStatistics(),

  // Utility operations
  clearCache: () => MemberApiService.clearCache(),
};

// ==================== ERROR HANDLING UTILITIES ====================

export const handleMemberApiError = (error: unknown): string => {
  if (error instanceof MemberApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

// ==================== DEFAULT CONFIGURATIONS ====================

export const MEMBER_API_DEFAULTS = {
  PAGE_SIZE: 10,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MOCK_DELAY: 1000,
  MAX_RETRIES: 3,
} as const;

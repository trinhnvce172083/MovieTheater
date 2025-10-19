/**
 * Member Types
 * Type definitions for member-related operations
 */

// ==================== COMMON TYPES ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  code?: number;
  message?: string;
  data: T;
  error?: string;
  errorCode?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
    numberOfElements: number;
  };
}

// ==================== MEMBER PROFILE TYPES ====================

export interface MemberProfile {
  accountId: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  emailVerified: boolean;
  membershipLevel: string;
  membershipPoints: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  totalBookings: number;
  totalSpent: number;
  lastUpdated?: number; // Add for cache validation
}

export interface ProfileUpdateRequest {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  avatarFile?: File;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ==================== BOOKING TYPES ====================

export interface MemberBooking {
  bookingId: string;
  movieTitle: string;
  moviePoster?: string;
  movieId: number;
  scheduleId: number;
  cinemaRoom: string;
  showDate: string;
  startTime: string;
  endTime: string;
  seats: BookingSeat[];
  concessions: BookingConcession[];
  totalAmount: number;
  finalAmount: number;
  discountAmount: number;
  status: BookingStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  bookingDate: string;
  bookingCode: string;
  qrCode?: string;
  isCheckedIn: boolean;
  checkInTime?: string;
  canCancel: boolean;
  canCheckIn: boolean;
  expiresAt?: string;
  schedule?: {
    scheduleId: number;
    showDateTime: string;
    formattedShowDateTime: string;
    language: string;
    isSubtitled: boolean;
  } | null;
}

export interface BookingSeat {
  seatId: number;
  seatRow: string;
  seatNumber: string;
  seatType: "STANDARD" | "VIP" | "COUPLE";
  price: number;
}

export interface BookingConcession {
  concessionId: number;
  concessionName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

// ==================== LOYALTY TYPES ====================

export interface LoyaltyTransaction {
  transactionId: string;
  type: "EARN" | "REDEEM" | "EXPIRE" | "ADJUST";
  points: number;
  description: string;
  referenceId?: string;
  referenceType?: "BOOKING" | "PROMOTION" | "MANUAL";
  createdAt: string;
  expiresAt?: string;
}

export interface MembershipBenefits {
  level: string;
  discountPercent: number;
  pointsMultiplier: number;
  earlyBooking: boolean;
  freeSnacks: boolean;
  prioritySupport: boolean;
  pointsToNextLevel?: number;
  nextLevel?: string;
}

// ==================== STATISTICS TYPES ====================

export interface MemberStatistics {
  totalBookings: number;
  totalSpent: number;
  totalSaved: number;
  currentPoints: number;
  pointsEarned: number;
  pointsUsed: number;
  favoriteGenre: string;
  favoriteTime: string;
  memberSince: string;
  lastActivity: string;
}

// ==================== REQUEST/FILTER TYPES ====================

export interface BookingListParams {
  page?: number;
  size?: number;
  status?: BookingStatus[];
  startDate?: string;
  endDate?: string;
  sortBy?: "bookingDate" | "showDate" | "totalAmount";
  sortDirection?: "ASC" | "DESC";
}

export interface HistoryParams extends BookingListParams {
  movieTitle?: string;
  cinemaRoom?: string;
}

// ==================== ACTION TYPES ====================

export interface BookingCancelRequest {
  bookingId: string;
  reason?: string;
}

export interface BookingCheckInRequest {
  bookingId: string;
  qrCode?: string;
}

// ==================== CONFIGURATION TYPES ====================

export interface MemberApiConfig {
  enableMock: boolean;
  mockDelay: number;
  cacheEnabled: boolean;
  cacheTTL: number;
}

// ==================== ERROR TYPES ====================

export class MemberApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "MemberApiError";
  }
}

// ==================== CACHE TYPES ====================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

// ==================== NOTIFICATION TYPES ====================

export interface MemberNotification {
  id: string;
  type: "booking" | "payment" | "loyalty" | "promotion";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

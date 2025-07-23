// Mock data for Member Promotions tests

export const MockMemberProfile = {
  accountId: 1,
  username: "member1",
  email: "member@example.com",
  fullName: "Test Member",
  phoneNumber: "0123456789",
  role: "MEMBER",
  isActive: true,
  isVerified: true,
  emailVerified: true,
  membershipLevel: "BRONZE" as const,
  membershipPoints: 777,
  lastLogin: "2024-01-15T10:30:00Z",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  totalBookings: 5,
  totalSpent: 500000,
};

export const MockPromotions = [
  {
    promotionId: 1,
    promotionCode: "POINTS100",
    promotionName: "Đổi điểm ưu đãi",
    description: "Đổi 100 điểm để giảm 30,000 VNĐ",
    discountType: "FIXED_AMOUNT" as const,
    discountValue: 30000,
    maxDiscountAmount: 30000,
    minPurchaseAmount: 50000,
    startDate: "2025-06-01",
    endDate: "2025-12-31",
    isActive: true,
    maxUsageCount: 200,
    currentUsageCount: 0,
    maxUsagePerUser: 1,
    isPointsPromotion: true,
    pointsRequired: 100,
    pointsValue: 30000,
    statusDisplay: "Active",
    discountDisplay: "30000₫ OFF",
    pointsDisplay: "100 points",
    validityDisplay: "2025-06-01 to 2025-12-31",
    usageDisplay: "0/200",
    bannerUrl: "https://example.com/banner1.jpg",
    isFeatured: false,
    memberOnly: true,
    applicableDays: "All days",
    applicableTimes: "All times",
    applicableMovies: "All movies",
    applicableRooms: "All rooms",
    isValid: true,
    isExpired: false,
    isNotStarted: false,
    isUsageLimitReached: false,
    remainingUsage: 200,
  },
  {
    promotionId: 2,
    promotionCode: "POINTS200",
    promotionName: "Giảm giá 50%",
    description: "Đổi 200 điểm để giảm 50% giá vé",
    discountType: "PERCENTAGE" as const,
    discountValue: 50,
    maxDiscountAmount: 100000,
    minPurchaseAmount: 100000,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    isActive: true,
    maxUsageCount: 100,
    currentUsageCount: 10,
    maxUsagePerUser: 2,
    isPointsPromotion: true,
    pointsRequired: 200,
    pointsValue: 50,
    statusDisplay: "Active",
    discountDisplay: "50% OFF",
    pointsDisplay: "200 points",
    validityDisplay: "2025-01-01 to 2025-12-31",
    usageDisplay: "10/100",
    bannerUrl: "https://example.com/banner2.jpg",
    isFeatured: true,
    memberOnly: true,
    applicableDays: "Weekends",
    applicableTimes: "Evening",
    applicableMovies: "Action movies",
    applicableRooms: "VIP rooms",
    isValid: true,
    isExpired: false,
    isNotStarted: false,
    isUsageLimitReached: false,
    remainingUsage: 90,
  },
];

export const SuccessPurchaseResponse = {
  success: true,
  message: "Đổi promotion thành công với 100 điểm",
  data: "USER_POINTS100_1705123456789",
};

export const InsufficientPointsResponse = {
  response: {
    data: {
      success: false,
      message: "Không đủ điểm. Cần: 100, Có: 50",
    },
  },
};

export const PromotionNotFoundResponse = {
  response: {
    data: {
      success: false,
      message: "Promotion code không tồn tại",
    },
  },
};

export const PromotionNotRedeemableResponse = {
  response: {
    data: {
      success: false,
      message: "Promotion này không thể đổi bằng điểm",
    },
  },
};

export const NetworkErrorResponse = {
  message: "Network Error",
  code: "NETWORK_ERROR",
}; 
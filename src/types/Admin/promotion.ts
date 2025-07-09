// Định nghĩa interface phù hợp với DTO từ backend
export interface PromotionDto {
  promotionId: number;
  promotionCode: string;
  promotionName: string;
  description: string;
  discountType: string; // PERCENTAGE, FIXED_AMOUNT, BUY_ONE_GET_ONE
  discountValue: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  currentUsageCount: number;
  maxUsageCount?: number;
  maxUsagePerUser?: number;
  memberOnly: boolean;
  membershipLevels?: string;
  bannerUrl?: string;
  bannerImageUrl?: string;
  promotionType: string; // PUBLIC, POINT_BASED
  promotionTypeDisplay: string;
  isExpired: boolean;
  isValid: boolean;
  isNotStarted?: boolean;
  isUsageLimitReached?: boolean;
  remainingUsage?: number;
  
  // Additional fields from backend
  applicableDays?: string; // ALL, WEEKDAYS, WEEKENDS
  applicableTimes?: string; // MORNING,AFTERNOON,EVENING or ALL
  applicableMovies?: string; // Comma-separated movie IDs
  applicableRooms?: string; // Comma-separated room IDs
  isFeatured?: boolean;
  displayOrder?: number;
  
  // Point-based promotion fields
  isPointsPromotion?: boolean;
  pointsRequired?: number;
  pointsValue?: number;
  codeValidityHours?: number;
  maxCodesPerUser?: number;
  
  // Display fields (calculated by backend)
  statusDisplay?: string;
  discountDisplay?: string;
  pointsDisplay?: string;
  validityDisplay?: string;
  usageDisplay?: string;
  membershipDisplay?: string;
  applicabilityDisplay?: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}
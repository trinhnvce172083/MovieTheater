// Định nghĩa interface phù hợp với DTO từ backend
export interface PromotionDto {
  promotionId: number;
  promotionCode: string;
  promotionName: string;
  description: string;
  discountType: string; // PERCENTAGE, FIXED, POINTS
  discountValue: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  currentUsageCount: number;
  maxUsageCount?: number;
  maxUsagePerUser?: number;
  bannerImageUrl?: string;
  pointsRequired?: number;
  codeValidityHours?: number;
  isFeatured?: boolean;
  
  // Backend calculated fields
  usageLimitReached: boolean;
  percentageDiscount: boolean;
  fixedAmountDiscount: boolean;
  discountDisplayText: string;
  pointsDisplayText: string;
  notStarted: boolean;
  pointsDiscount: boolean;
  remainingUsage: number;
  expired: boolean;
  valid: boolean;
  
  // Additional fields
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  bookings?: any[];
  userPromotionCodes?: any[];
  
  // Legacy fields for compatibility
  memberOnly?: boolean;
  membershipLevels?: string;
  bannerUrl?: string;
  promotionType?: string;
  promotionTypeDisplay?: string;
  isExpired?: boolean;
  isValid?: boolean;
  isNotStarted?: boolean;
  isUsageLimitReached?: boolean;
  applicableDays?: string;
  applicableTimes?: string;
  applicableMovies?: string;
  applicableRooms?: string;
  displayOrder?: number;
  isPointsPromotion?: boolean;
  pointsValue?: number;
  maxCodesPerUser?: number;
  statusDisplay?: string;
  discountDisplay?: string;
  pointsDisplay?: string;
  validityDisplay?: string;
  usageDisplay?: string;
  membershipDisplay?: string;
  applicabilityDisplay?: string;
}
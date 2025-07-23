import axiosClient from '../axiosClient';

// Types
export interface MemberPromotion {
  promotionId: number;
  promotionCode: string;
  promotionName: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_ONE_GET_ONE';
  discountValue: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxUsageCount: number;
  currentUsageCount: number;
  maxUsagePerUser: number;
  
  // Points-based promotions
  isPointsPromotion: boolean;
  pointsRequired: number;
  pointsValue: number;
  
  // Display fields
  statusDisplay: string;
  discountDisplay: string;
  pointsDisplay: string;
  validityDisplay: string;
  usageDisplay: string;
  
  // Additional info
  bannerUrl?: string;
  isFeatured: boolean;
  memberOnly: boolean;
  applicableDays?: string;
  applicableTimes?: string;
  applicableMovies?: string;
  applicableRooms?: string;
  
  // Computed fields
  isValid: boolean;
  isExpired: boolean;
  isNotStarted: boolean;
  isUsageLimitReached: boolean;
  remainingUsage: number;
}

export interface PromotionPurchaseResponse {
  success: boolean;
  message: string;
  data: string; // Unique code for the purchased promotion
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// API Client
class MemberPromotionApi {
  /**
   * Get all points-based promotions that can be redeemed
   */
  async getPointsPromotions(): Promise<ApiResponse<MemberPromotion[]>> {
    try {
      const response = await axiosClient.get('/promotions/points');
      return {
        success: true,
        message: 'Promotions loaded successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching points promotions:', error);
      throw new Error(error.response?.data?.message || 'Failed to load promotions');
    }
  }

  /**
   * Get all active promotions
   */
  async getActivePromotions(): Promise<ApiResponse<MemberPromotion[]>> {
    try {
      const response = await axiosClient.get('/promotions/active');
      return {
        success: true,
        message: 'Active promotions loaded successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching active promotions:', error);
      throw new Error(error.response?.data?.message || 'Failed to load active promotions');
    }
  }

  /**
   * Get featured promotions
   */
  async getFeaturedPromotions(): Promise<ApiResponse<MemberPromotion[]>> {
    try {
      const response = await axiosClient.get('/promotions/featured');
      return {
        success: true,
        message: 'Featured promotions loaded successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching featured promotions:', error);
      throw new Error(error.response?.data?.message || 'Failed to load featured promotions');
    }
  }

  /**
   * Purchase promotion with points
   */
  async purchasePromotion(promotionCode: string): Promise<ApiResponse<string>> {
    try {
      const response = await axiosClient.post(`/promotions/purchase?promotionCode=${promotionCode}`);
      return {
        success: true,
        message: response.data.message || 'Promotion purchased successfully',
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error purchasing promotion:', error);
      throw new Error(error.response?.data?.message || 'Failed to purchase promotion');
    }
  }

  /**
   * Validate promotion code
   */
  async validatePromotionCode(code: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await axiosClient.post(`/promotions/validate?code=${code}`);
      return {
        success: true,
        message: 'Validation completed',
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error validating promotion code:', error);
      throw new Error(error.response?.data?.message || 'Failed to validate promotion code');
    }
  }

  /**
   * Get promotion by code
   */
  async getPromotionByCode(code: string): Promise<ApiResponse<MemberPromotion>> {
    try {
      const response = await axiosClient.get(`/promotions/code/${code}`);
      return {
        success: true,
        message: 'Promotion loaded successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error fetching promotion by code:', error);
      throw new Error(error.response?.data?.message || 'Failed to load promotion');
    }
  }
}

// Export singleton instance
export const memberPromotionApi = new MemberPromotionApi();
export default memberPromotionApi; 
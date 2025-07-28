import axiosClient from '../axiosClient';

export interface MemberPromotion {
  promotionId: number;
  promotionCode: string;
  promotionName: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'POINTS';
  discountValue: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  startDate: string;
  endDate: string;
  maxUsageCount: number;
  currentUsageCount: number;
  maxUsagePerUser: number;
  isFeatured: boolean;
  bannerImageUrl?: string;
  pointsRequired: number;
  codeValidityHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class MemberPromotionApi {
  // Lấy danh sách promotion đang hoạt động
  async getActivePromotions(): Promise<MemberPromotion[]> {
    try {
      const response = await axiosClient.get<ApiResponse<MemberPromotion[]>>('/api/promotions/active');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching active promotions:', error);
      throw error;
    }
  }
}

export const memberPromotionApi = new MemberPromotionApi(); 
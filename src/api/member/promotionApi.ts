import axiosClient from '../axiosClient';

// Kết quả trả về khi redeem promotion
// Đúng với response thực tế: data là string (promotion code)
export interface RedeemPromotionResponse {
  data: string; // promotion code
  message: string;
  success: boolean;
}

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
  // Đổi điểm lấy mã giảm giá
  async redeemPromotion(promotionCode: string): Promise<RedeemPromotionResponse> {
    try {
      const response = await axiosClient.post(
        `/promotions/purchase?promotionCode=${encodeURIComponent(promotionCode)}`
      );
      // Trả về đúng cấu trúc { data, message, success }
      return {
        data: response.data.data,
        message: response.data.message,
        success: response.data.success,
      };
    } catch (error) {
      console.error('Error redeeming promotion:', error);
      throw error;
    }
  }
  // Lấy danh sách promotion đang hoạt động
  async getActivePromotions(): Promise<MemberPromotion[]> {
    try {
      const response = await axiosClient.get<ApiResponse<MemberPromotion[]>>('/promotions/active');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching active promotions:', error);
      throw error;
    }
  }
}

export const memberPromotionApi = new MemberPromotionApi(); 
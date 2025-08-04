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
  // Lấy danh sách promotions active có thể redeem bằng points
  async getActivePromotions(): Promise<MemberPromotion[]> {
    try {
      const response = await axiosClient.get('/promotions/active');
      console.log('🎁 Promotions API response:', response.data);
      
      if (response.data.success && response.data.data) {
        // Filter chỉ lấy promotions có pointsRequired > 0 (đổi bằng điểm)
        const pointsPromotions = response.data.data
          .filter((promo: any) => promo.pointsRequired && promo.pointsRequired > 0)
          .map((item: any) => ({
            promotionId: item.promotionId,
            promotionCode: item.promotionCode || item.code,
            promotionName: item.promotionName || item.title || item.name,
            description: item.description,
            discountType: item.discountType || 'POINTS',
            discountValue: item.discountValue || item.value || 0,
            pointsRequired: item.pointsRequired || 0,
            startDate: item.startDate,
            endDate: item.endDate,
            maxUsageCount: item.maxUsageCount || item.maxUsage || 999,
            currentUsageCount: item.currentUsageCount || item.usageCount || 0,
            maxUsagePerUser: item.maxUsagePerUser || 1,
            isFeatured: item.isFeatured || false,
            bannerImageUrl: item.bannerImageUrl,
            codeValidityHours: item.codeValidityHours || 24,
            isActive: item.isActive !== false,
            minPurchaseAmount: item.minPurchaseAmount || item.minOrderAmount || 0,
            maxDiscountAmount: item.maxDiscountAmount || 999999,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }));
          
        console.log('🎯 Filtered points promotions:', pointsPromotions);
        return pointsPromotions;
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching active promotions:', error);
      throw error;
    }
  }
}

export const memberPromotionApi = new MemberPromotionApi(); 
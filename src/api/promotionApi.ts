import axiosClient from "./axiosClient";

// Types
export interface Promotion {
  promotionId: number;
  code: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount?: number;
  applicableMovies?: number[];
  applicableDays?: string[];
  applicableTimes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionValidationRequest {
  code: string;
  orderAmount: number;
  movieId?: number;
  showDate?: string;
  showTime?: string;
}

export interface PromotionValidationResponse {
  isValid: boolean;
  promotion?: Promotion;
  message: string;
  discountAmount: number;
  finalAmount: number;
}

export interface PromotionApplyRequest {
  code: string;
  orderAmount?: number;
  movieId?: number;
}

export interface PromotionApplyResponse {
  success: boolean;
  message: string;
  data?: any;
  appliedPromotion?: Promotion;
  discountAmount?: number;
  finalAmount?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const promotionApi = {
  // Lấy tất cả promotions (public)
  getAll: () => {
    const url = "promotions";
    return axiosClient.get<ApiResponse<Promotion[]>>(url);
  },

  // Lấy active promotions
  getActive: () => {
    const url = "promotions/active";
    return axiosClient.get<ApiResponse<Promotion[]>>(url);
  },

  // Lấy promotion theo code
  getByCode: (code: string) => {
    const url = `promotions/code/${code}`;
    return axiosClient.get<ApiResponse<Promotion>>(url);
  },

  // Lấy promotions theo type
  getByType: (type: string) => {
    const url = `promotions/type/${type}`;
    return axiosClient.get<ApiResponse<Promotion[]>>(url);
  },

  // Lấy promotions cho movie cụ thể
  getByMovie: (movieId: number) => {
    const url = `promotions/movie/${movieId}`;
    return axiosClient.get<ApiResponse<Promotion[]>>(url);
  },

  // Lấy point-based promotions
  getPointBased: () => {
    const url = "promotions/point-based";
    return axiosClient.get<ApiResponse<Promotion[]>>(url);
  },

  // Validate promotion code (public) - Sử dụng API validate
  validateCode: (request: PromotionValidationRequest) => {
    const url = "promotions/validate";
    return axiosClient.post<ApiResponse<PromotionValidationResponse>>(url, request);
  },

  // Apply promotion code - Sử dụng API mới /api/promotions/{code}/apply
  applyCode: (code: string, request?: PromotionApplyRequest) => {
    const url = `promotions/${code}/apply`;
    return axiosClient.post<ApiResponse<PromotionApplyResponse>>(url, request || {});
  },

  // Validate promotion code uniqueness (admin)
  validateCodeUniqueness: (code: string) => {
    const url = "promotions/validate-code";
    return axiosClient.post<ApiResponse<{ isUnique: boolean }>>(url, { code });
  },

  // Apply promotion to booking
  applyToBooking: (bookingId: number, promotionCode: string) => {
    const url = `bookings/${bookingId}/promotion`;
    return axiosClient.post<ApiResponse<PromotionApplyResponse>>(url, {
      promotionCode: promotionCode
    });
  },

  // Remove promotion from booking
  removeFromBooking: (bookingId: number) => {
    const url = `bookings/${bookingId}/promotion`;
    return axiosClient.delete<ApiResponse<{ removed: boolean }>>(url);
  },

  // Get promotion info for booking
  getBookingPromotion: (bookingId: number) => {
    const url = `bookings/${bookingId}/promotion`;
    return axiosClient.get<ApiResponse<Promotion>>(url);
  },

  // Admin: Tạo promotion mới
  create: (promotion: Omit<Promotion, 'promotionId' | 'createdAt' | 'updatedAt'>) => {
    const url = "promotions";
    return axiosClient.post<ApiResponse<Promotion>>(url, promotion);
  },

  // Admin: Cập nhật promotion
  update: (id: number, promotion: Partial<Promotion>) => {
    const url = `promotions/${id}`;
    return axiosClient.put<ApiResponse<Promotion>>(url, promotion);
  },

  // Admin: Xóa promotion
  delete: (id: number) => {
    const url = `promotions/${id}`;
    return axiosClient.delete<ApiResponse<{ deleted: boolean }>>(url);
  },

  // Admin: Upload banner cho promotion
  uploadBanner: (id: number, file: File) => {
    const url = `promotions/${id}/banner`;
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post<ApiResponse<{ bannerUrl: string }>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Admin: Xóa banner promotion
  deleteBanner: (id: number) => {
    const url = `promotions/${id}/banner`;
    return axiosClient.delete<ApiResponse<{ deleted: boolean }>>(url);
  },
};

export default promotionApi; 
import axiosClient from "@/api/axiosClient";
import { PromotionDto } from "@/types/Admin/promotion";

// Types for API requests and responses
export interface PromotionCreateRequest {
  promotionCode: string;
  promotionName: string;
  description: string;
  promotionType: "PUBLIC" | "POINT_BASED";
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "BUY_ONE_GET_ONE";
  discountValue: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  isActive: boolean;
  maxUsageCount?: number;
  maxUsagePerUser?: number;
  applicableDays?: "ALL" | "WEEKDAYS" | "WEEKENDS";
  applicableTimes?: string; // "MORNING,AFTERNOON,EVENING" or specific combinations
  applicableMovies?: string; // Comma-separated movie IDs
  applicableRooms?: string; // Comma-separated room IDs
  memberOnly: boolean;
  membershipLevels?: string; // "BRONZE,SILVER,GOLD,PLATINUM"
  isFeatured?: boolean;
  displayOrder?: number;
  // Point-based fields
  pointsRequired?: number;
  pointsValue?: number;
  codeValidityHours?: number;
  maxCodesPerUser?: number;
}

export interface PromotionUpdateRequest extends Partial<PromotionCreateRequest> {}

export interface PromotionSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  isActive?: boolean;
  promotionType?: "PUBLIC" | "POINT_BASED";
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT" | "BUY_ONE_GET_ONE";
  memberOnly?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export interface PromotionListResponse {
  content: PromotionDto[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface PromotionValidationRequest {
  code: string;
  orderAmount: number;
}

export interface PromotionValidationResponse {
  isValid: boolean;
  promotion?: PromotionDto;
  discountAmount?: number;
  message?: string;
}

export interface PromotionUsageResponse {
  promotionId: number;
  currentUsage: number;
  maxUsage?: number;
  userUsage?: number;
  maxUserUsage?: number;
  remainingUsage?: number;
}

export interface BannerUploadResponse {
  code: number;
  message: string;
  data: string; // Banner URL
}

// Get all promotions with pagination and filters
export const getAllPromotions = async (params: PromotionSearchParams = {}): Promise<PromotionListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.promotionType) queryParams.append('promotionType', params.promotionType);
    if (params.discountType) queryParams.append('discountType', params.discountType);
    if (params.memberOnly !== undefined) queryParams.append('memberOnly', params.memberOnly.toString());
    if (params.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured.toString());
    if (params.search) queryParams.append('search', params.search);

    const response = await axiosClient.get(`/promotions?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching promotions:', error);
    throw error;
  }
};

// Get promotion by ID
export const getPromotionById = async (id: number): Promise<PromotionDto> => {
  try {
    const response = await axiosClient.get(`/promotions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching promotion:', error);
    throw error;
  }
};

// Get promotion by code
export const getPromotionByCode = async (code: string): Promise<PromotionDto> => {
  try {
    const response = await axiosClient.get(`/promotions/code/${code}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching promotion by code:', error);
    throw error;
  }
};

// Create new promotion
export const createPromotion = async (promotionData: PromotionCreateRequest): Promise<PromotionDto> => {
  try {
    const response = await axiosClient.post(`/promotions`, promotionData);
    return response.data;
  } catch (error) {
    console.error('Error creating promotion:', error);
    throw error;
  }
};

// Update promotion
export const updatePromotion = async (id: number, promotionData: PromotionUpdateRequest): Promise<PromotionDto> => {
  try {
    const response = await axiosClient.put(`/promotions/${id}`, promotionData);
    return response.data;
  } catch (error) {
    console.error('Error updating promotion:', error);
    throw error;
  }
};

// Delete promotion
export const deletePromotion = async (id: number): Promise<void> => {
  try {
    await axiosClient.delete(`/promotions/${id}`);
  } catch (error) {
    console.error('Error deleting promotion:', error);
    throw error;
  }
};

// Get active promotions
export const getActivePromotions = async (): Promise<PromotionDto[]> => {
  try {
    const response = await axiosClient.get(`/promotions/active`);
    return response.data;
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    throw error;
  }
};

// Get promotions by type
export const getPromotionsByType = async (type: string): Promise<PromotionDto[]> => {
  try {
    const response = await axiosClient.get(`/promotions/type/${type}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching promotions by type:', error);
    throw error;
  }
};

// Validate promotion code
export const validatePromotionCode = async (request: PromotionValidationRequest): Promise<PromotionValidationResponse> => {
  try {
    const response = await axiosClient.post(`/promotions/validate`, request);
    return response.data;
  } catch (error) {
    console.error('Error validating promotion code:', error);
    throw error;
  }
};

// Get promotion usage statistics
export const getPromotionUsage = async (id: number): Promise<PromotionUsageResponse> => {
  try {
    const response = await axiosClient.get(`/promotions/usage/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching promotion usage:', error);
    throw error;
  }
};

// Get expiring promotions
export const getExpiringPromotions = async (days: number = 7): Promise<PromotionDto[]> => {
  try {
    const response = await axiosClient.get(`/promotions/expiring?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expiring promotions:', error);
    throw error;
  }
};

// Activate promotion
export const activatePromotion = async (id: number): Promise<PromotionDto> => {
  try {
    const response = await axiosClient.post(`/promotions/${id}/activate`);
    return response.data;
  } catch (error) {
    console.error('Error activating promotion:', error);
    throw error;
  }
};

// Deactivate promotion
export const deactivatePromotion = async (id: number): Promise<PromotionDto> => {
  try {
    const response = await axiosClient.post(`/promotions/${id}/deactivate`);
    return response.data;
  } catch (error) {
    console.error('Error deactivating promotion:', error);
    throw error;
  }
};

// Get movie-specific promotions
export const getMoviePromotions = async (movieId: number): Promise<PromotionDto[]> => {
  try {
    const response = await axiosClient.get(`/promotions/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie promotions:', error);
    throw error;
  }
};

// Get user eligible promotions
export const getUserEligiblePromotions = async (): Promise<PromotionDto[]> => {
  try {
    const response = await axiosClient.get(`/promotions/user-eligible`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user eligible promotions:', error);
    throw error;
  }
};

// Upload promotion banner
export const uploadPromotionBanner = async (id: number, bannerFile: File): Promise<BannerUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('banner', bannerFile);

    const response = await axiosClient.post(
      `/promotions/${id}/banner`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading promotion banner:', error);
    throw error;
  }
};

// Update promotion banner
export const updatePromotionBanner = async (id: number, bannerFile: File): Promise<BannerUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('banner', bannerFile);

    const response = await axiosClient.put(
      `/promotions/${id}/banner`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating promotion banner:', error);
    throw error;
  }
};

// Get promotion banner URL
export const getPromotionBannerUrl = async (id: number): Promise<string> => {
  try {
    const response = await axiosClient.get(`/promotions/${id}/banner`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching promotion banner URL:', error);
    throw error;
  }
};

// Delete promotion banner
export const deletePromotionBanner = async (id: number): Promise<boolean> => {
  try {
    const response = await axiosClient.delete(`/promotions/${id}/banner`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting promotion banner:', error);
    throw error;
  }
};

// Check if promotion has banner
export const hasPromotionBanner = async (id: number): Promise<boolean> => {
  try {
    const response = await axiosClient.get(`/promotions/${id}/banner/exists`);
    return response.data.data;
  } catch (error) {
    console.error('Error checking promotion banner:', error);
    throw error;
  }
}; 
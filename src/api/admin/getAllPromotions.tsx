import axiosClient from '../axiosClient';
import { 
  Promotion, 
  PromotionCreateRequest, 
  PromotionUpdateRequest, 
  PromotionSearchParams,
  PromotionValidationRequest,
  PromotionValidationResponse,
  PromotionUsageResponse
} from '../../types/Admin/promotion';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/cinema';

// Get all promotions with pagination and filters
export const getAllPromotions = async (params: PromotionSearchParams = {}) => {
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

    const response = await axiosClient.get(`${API_BASE_URL}/api/promotions?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching promotions:', error);
    throw error;
  }
};

// Get promotion by ID
export const getPromotionById = async (id: number): Promise<Promotion> => {
  try {
    const response = await axiosClient.get(`${API_BASE_URL}/api/promotions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching promotion:', error);
    throw error;
  }
};

// Get promotion by code
export const getPromotionByCode = async (code: string): Promise<Promotion> => {
  try {
    const response = await axiosClient.get(`${API_BASE_URL}/api/promotions/code/${code}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching promotion by code:', error);
    throw error;
  }
};

// Create new promotion
export const createPromotion = async (promotionData: PromotionCreateRequest): Promise<Promotion> => {
  try {
    const response = await axiosClient.post(`${API_BASE_URL}/api/promotions`, promotionData);
    return response.data;
  } catch (error) {
    console.error('Error creating promotion:', error);
    throw error;
  }
};

// Update promotion
export const updatePromotion = async (id: number, promotionData: PromotionUpdateRequest): Promise<Promotion> => {
  try {
    const response = await axiosClient.put(`${API_BASE_URL}/api/promotions/${id}`, promotionData);
    return response.data;
  } catch (error) {
    console.error('Error updating promotion:', error);
    throw error;
  }
};

// Delete promotion
export const deletePromotion = async (id: number): Promise<void> => {
  try {
    await axiosClient.delete(`${API_BASE_URL}/api/promotions/${id}`);
  } catch (error) {
    console.error('Error deleting promotion:', error);
    throw error;
  }
};

// Get active promotions
export const getActivePromotions = async (): Promise<Promotion[]> => {
  try {
    const response = await axiosClient.get(`${API_BASE_URL}/api/promotions/active`);
    return response.data;
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    throw error;
  }
};

// Get promotions by type
export const getPromotionsByType = async (type: string): Promise<Promotion[]> => {
  try {
    const response = await axiosClient.get(`${API_BASE_URL}/api/promotions/type/${type}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching promotions by type:', error);
    throw error;
  }
};

// Validate promotion code
export const validatePromotionCode = async (request: PromotionValidationRequest): Promise<PromotionValidationResponse> => {
  try {
    const response = await axiosClient.post(`${API_BASE_URL}/api/promotions/validate`, request);
    return response.data;
  } catch (error) {
    console.error('Error validating promotion code:', error);
    throw error;
  }
};

// Get promotion usage statistics
export const getPromotionUsage = async (id: number): Promise<PromotionUsageResponse> => {
  try {
    const response = await axiosClient.get(`${API_BASE_URL}/api/promotions/usage/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching promotion usage:', error);
    throw error;
  }
};

// Get expiring promotions
export const getExpiringPromotions = async (days: number = 7): Promise<Promotion[]> => {
  try {
    const response = await axiosClient.get(`${API_BASE_URL}/api/promotions/expiring?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expiring promotions:', error);
    throw error;
  }
};

// Activate promotion
export const activatePromotion = async (id: number): Promise<Promotion> => {
  try {
    const response = await axiosClient.post(`${API_BASE_URL}/api/promotions/${id}/activate`);
    return response.data;
  } catch (error) {
    console.error('Error activating promotion:', error);
    throw error;
  }
};

// Deactivate promotion
export const deactivatePromotion = async (id: number): Promise<Promotion> => {
  try {
    const response = await axiosClient.post(`${API_BASE_URL}/api/promotions/${id}/deactivate`);
    return response.data;
  } catch (error) {
    console.error('Error deactivating promotion:', error);
    throw error;
  }
};

// Get movie-specific promotions
export const getMoviePromotions = async (movieId: number): Promise<Promotion[]> => {
  try {
    const response = await axiosClient.get(`${API_BASE_URL}/api/promotions/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie promotions:', error);
    throw error;
  }
};

// Get user eligible promotions
export const getUserEligiblePromotions = async (): Promise<Promotion[]> => {
  try {
    const response = await axiosClient.get(`${API_BASE_URL}/api/promotions/user-eligible`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user eligible promotions:', error);
    throw error;
  }
};

// Upload promotion banner
export const uploadPromotionBanner = async (id: number, bannerFile: File): Promise<{ url: string }> => {
  try {
    const formData = new FormData();
    formData.append('banner', bannerFile);

    const response = await axiosClient.post(
      `${API_BASE_URL}/api/promotions/${id}/banner`,
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
export const updatePromotionBanner = async (id: number, bannerFile: File): Promise<{ url: string }> => {
  try {
    const formData = new FormData();
    formData.append('banner', bannerFile);

    const response = await axiosClient.put(
      `${API_BASE_URL}/api/promotions/${id}/banner`,
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
    const response = await axiosClient.get(`${API_BASE_URL}/api/promotions/${id}/banner`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching promotion banner URL:', error);
    throw error;
  }
};

// Delete promotion banner
export const deletePromotionBanner = async (id: number): Promise<boolean> => {
  try {
    const response = await axiosClient.delete(`${API_BASE_URL}/api/promotions/${id}/banner`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting promotion banner:', error);
    throw error;
  }
};

// Check if promotion has banner
export const hasPromotionBanner = async (id: number): Promise<boolean> => {
  try {
    const response = await axiosClient.get(`${API_BASE_URL}/api/promotions/${id}/banner/exists`);
    return response.data.data;
  } catch (error) {
    console.error('Error checking promotion banner:', error);
    throw error;
  }
}; 
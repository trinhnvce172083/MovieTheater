import axiosClient from "./axiosClient";

// Types
export interface Concession {
  concessionId: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  imageUrl?: string;
  size?: string;
  flavor?: string;
  stockQuantity?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  priceDisplay?: string;
  fullName?: string;
  flavorDisplay?: string;
  sizeDisplay?: string;
  inStock?: boolean;
}

export interface ConcessionCategory {
  categoryId: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface ConcessionOrderRequest {
  concessionId: number;
  quantity: number;
}

export interface ConcessionOrderResponse {
  orderId: number;
  concessionId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  concession: Concession;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const concessionApi = {
  // Lấy tất cả concessions
  getAll: () => {
    const url = "/concessions";
    return axiosClient.get<ApiResponse<Concession[]>>(url);
  },

  // Lấy concessions theo category
  getByCategory: (category: string) => {
    const url = `/concessions/category/${category}`;
    return axiosClient.get<ApiResponse<Concession[]>>(url);
  },

  // Lấy tất cả categories
  getCategories: () => {
    const url = "/concessions/categories";
    return axiosClient.get<ApiResponse<ConcessionCategory[]>>(url);
  },

  // Tìm kiếm concessions
  search: (keyword: string) => {
    const url = `/concessions/search?keyword=${encodeURIComponent(keyword)}`;
    return axiosClient.get<ApiResponse<Concession[]>>(url);
  },

  // Lọc concessions
  filter: (filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    
    const url = `/concessions/filter?${params.toString()}`;
    return axiosClient.get<ApiResponse<Concession[]>>(url);
  },

  // Lấy concession theo ID
  getById: (id: number) => {
    const url = `/concessions/${id}`;
    return axiosClient.get<ApiResponse<Concession>>(url);
  },

  // Admin: Thêm concession mới
  add: (concession: Omit<Concession, 'concessionId' | 'createdAt' | 'updatedAt'>) => {
    const url = "/concessions";
    return axiosClient.post<ApiResponse<Concession>>(url, concession);
  },

  // Admin: Cập nhật concession
  update: (id: number, concession: Partial<Concession>) => {
    const url = `/concessions/${id}`;
    return axiosClient.put<ApiResponse<Concession>>(url, concession);
  },

  // Admin: Xóa concession
  delete: (id: number) => {
    const url = `/concessions/${id}`;
    return axiosClient.delete<ApiResponse<{ deleted: boolean }>>(url);
  },

  // Upload hình ảnh concession
  uploadImage: (id: number, file: File) => {
    const url = `/concessions/${id}/image`;
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post<ApiResponse<{ imageUrl: string }>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default concessionApi; 
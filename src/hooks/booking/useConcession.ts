import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  addConcession,
  updateConcessionQuantity,
  removeConcession,
} from "@/store/slices/bookingSlice";
import concessionApi from "@/api/concessionApi";
import { message } from "antd";

export interface Concession {
  concessionId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  isAvailable?: boolean;
  stockQuantity?: number;
}

export function useConcession() {
  const dispatch = useDispatch();
  const { selectedConcessions, concessionsTotal } = useSelector(
    (state: RootState) => state.booking
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách concessions
  const fetchConcessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await concessionApi.getAll();
      
      // Xử lý response theo cấu trúc API
      if (response.data && response.data.success) {
        return response.data.data || [];
      } else {
        const errorMessage = response.data?.message || "Failed to fetch concessions";
        console.error('Concession API error:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load concessions";
      console.error('Concession fetch error:', errorMessage);
      setError(errorMessage);
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy concessions theo category
  const fetchConcessionsByCategory = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await concessionApi.getByCategory(category);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch concessions");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load concessions";
      setError(errorMessage);
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await concessionApi.getCategories();
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch categories");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load categories";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Thêm concession vào booking
  const addConcessionToBooking = useCallback((concession: Concession, quantity: number = 1) => {
    dispatch(addConcession({ concession, quantity }));
    message.success(`Đã thêm ${quantity} ${concession.name} vào giỏ hàng`);
  }, [dispatch]);

  // Cập nhật số lượng concession
  const updateConcessionQuantityInBooking = useCallback((concessionId: number, quantity: number) => {
    dispatch(updateConcessionQuantity({ concessionId, quantity }));
    if (quantity === 0) {
      message.info("Đã xóa đồ ăn khỏi giỏ hàng");
    } else {
      message.success("Đã cập nhật số lượng");
    }
  }, [dispatch]);

  // Xóa concession khỏi booking
  const removeConcessionFromBooking = useCallback((concessionId: number) => {
    dispatch(removeConcession(concessionId));
    message.info("Đã xóa đồ ăn khỏi giỏ hàng");
  }, [dispatch]);

  // Kiểm tra concession đã có trong booking chưa
  const isConcessionInBooking = useCallback((concessionId: number) => {
    return selectedConcessions.some(item => item.concessionId === concessionId);
  }, [selectedConcessions]);

  // Lấy số lượng concession trong booking
  const getConcessionQuantity = useCallback((concessionId: number) => {
    const item = selectedConcessions.find(item => item.concessionId === concessionId);
    return item ? item.quantity : 0;
  }, [selectedConcessions]);

  // Tính tổng số lượng concessions
  const getTotalConcessionItems = useCallback(() => {
    return selectedConcessions.reduce((total, item) => total + item.quantity, 0);
  }, [selectedConcessions]);

  // Xóa tất cả concessions
  const clearAllConcessions = useCallback(() => {
    selectedConcessions.forEach(item => {
      dispatch(removeConcession(item.concessionId));
    });
    message.info("Đã xóa tất cả đồ ăn khỏi giỏ hàng");
  }, [dispatch, selectedConcessions]);

  // Tìm kiếm concessions
  const searchConcessions = useCallback(async (keyword: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await concessionApi.search(keyword);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to search concessions");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to search concessions";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lọc concessions
  const filterConcessions = useCallback(async (filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await concessionApi.filter(filters);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to filter concessions");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to filter concessions";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    selectedConcessions,
    concessionsTotal,
    loading,
    error,

    // API actions
    fetchConcessions,
    fetchConcessionsByCategory,
    fetchCategories,

    // Booking actions
    addConcessionToBooking,
    updateConcessionQuantityInBooking,
    removeConcessionFromBooking,
    clearAllConcessions,

    // Utility functions
    isConcessionInBooking,
    getConcessionQuantity,
    getTotalConcessionItems,

    // Search and filter actions
    searchConcessions,
    filterConcessions,
  };
} 
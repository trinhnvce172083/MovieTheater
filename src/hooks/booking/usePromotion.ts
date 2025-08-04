import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  applyPromotion,
  removePromotion,
  setPromotionCode,
} from "@/store/slices/bookingSlice";
import promotionApi, { Promotion, PromotionValidationRequest } from "@/api/promotionApi";

export function usePromotion() {
  const dispatch = useDispatch();
  const { 
    appliedPromotion, 
    promotionCode, 
    discountAmount,
    totalAmount,
    movieInfo 
  } = useSelector((state: RootState) => state.booking);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách promotions
  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await promotionApi.getActive();
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch promotions");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load promotions";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply promotion code - Sử dụng API mới
  const applyPromotionCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const request = {
        code,
        orderAmount: totalAmount,
        movieId: movieInfo?.movieId,
      };

      const response = await promotionApi.applyCode(code, request);
      
      if (response.data.success) {
        // Lấy thông tin promotion từ API getByCode
        try {
          const promotionResponse = await promotionApi.getByCode(code);
          if (promotionResponse.data.success && promotionResponse.data.data) {
            const promotion = promotionResponse.data.data;
            
            // Áp dụng promotion vào Redux (sẽ tự động tính discountAmount)
            dispatch(applyPromotion(promotion));
            
            return {
              isValid: true,
              promotion: promotion,
              message: "Promotion applied successfully",
              discountAmount: 0, // Sẽ được tính tự động trong Redux
              finalAmount: 0, // Sẽ được tính tự động trong Redux
            };
          }
        } catch (promotionError) {
          console.error("Error fetching promotion details:", promotionError);
        }
        
        // Fallback nếu không lấy được promotion details
        return {
          isValid: true,
          message: "Promotion applied successfully",
          discountAmount: 0,
          finalAmount: totalAmount,
        };
      } else {
        // Xóa promotion nếu không hợp lệ
        dispatch(removePromotion());
        return {
          isValid: false,
          message: response.data.message || "Invalid promotion code",
          discountAmount: 0,
          finalAmount: totalAmount,
        };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to apply promotion";
      setError(errorMessage);
      // Xóa promotion nếu có lỗi
      dispatch(removePromotion());
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dispatch, totalAmount, movieInfo?.movieId]);

  // Validate promotion code (legacy - giữ lại để tương thích)
  const validatePromotionCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const request: PromotionValidationRequest = {
        code,
        orderAmount: totalAmount,
        movieId: movieInfo?.movieId,
        // Có thể thêm showDate và showTime nếu cần
      };

      const response = await promotionApi.validateCode(request);
      if (response.data.success) {
        const validationResult = response.data.data;
        
        if (validationResult.isValid && validationResult.promotion) {
          // Áp dụng promotion vào Redux
          dispatch(applyPromotion(validationResult.promotion));
          return {
            isValid: true,
            promotion: validationResult.promotion,
            message: validationResult.message,
            discountAmount: validationResult.discountAmount,
            finalAmount: validationResult.finalAmount,
          };
        } else {
          // Xóa promotion nếu không hợp lệ
          dispatch(removePromotion());
          return {
            isValid: false,
            message: validationResult.message,
            discountAmount: 0,
            finalAmount: totalAmount,
          };
        }
      } else {
        throw new Error(response.data.message || "Failed to validate promotion");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to validate promotion";
      setError(errorMessage);
      // Xóa promotion nếu có lỗi
      dispatch(removePromotion());
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dispatch, totalAmount, movieInfo?.movieId]);

  // Áp dụng promotion code
  const applyPromotionCodeLegacy = useCallback(
    (code: string) => {
      dispatch(setPromotionCode(code));
      return validatePromotionCode(code);
    },
    [dispatch, validatePromotionCode]
  );

  // Xóa promotion
  const removePromotionCode = useCallback(() => {
    dispatch(removePromotion());
  }, [dispatch]);

  // Lấy promotion theo code
  const getPromotionByCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promotionApi.getByCode(code);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch promotion");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load promotion";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy promotions cho movie
  const getPromotionsByMovie = useCallback(async (movieId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promotionApi.getByMovie(movieId);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch movie promotions");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load movie promotions";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    appliedPromotion,
    promotionCode,
    discountAmount,
    loading,
    error,

    // Actions
    fetchPromotions,
    validatePromotionCode,
    applyPromotionCode, // API mới
    applyPromotionCodeLegacy, // API cũ
    removePromotionCode,
    getPromotionByCode,
    getPromotionsByMovie,
  };
} 
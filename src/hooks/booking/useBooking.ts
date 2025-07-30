import { useState, useCallback } from "react";
import { message } from "antd";
import { BookingApiService } from "@/api/booking-api";
import type { BookingRequest, BookingResponse, ApiResponse } from "@/api/booking-api";
import { useDispatch } from "react-redux";
import { 
  clearSelectedSeats, 
  clearConcessions, 
  clearPromotion, 
  updateSeatTotal, 
  recalculateTotals 
} from "@/store/slices/bookingSlice";

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const handleApiResponse = useCallback((response: any, operation: string) => {
    if (response?.data?.success) {
      return response.data.data || response.data;
    } else if (response?.success) {
      return response.data || response;
    } else {
      throw new Error(`Invalid response structure for ${operation}`);
    }
  }, []);

  const handleError = useCallback((err: any, operation: string, defaultMessage: string, shouldThrow: boolean = true) => {
    let errorMessage = defaultMessage;
    
    if (err?.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err?.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    message.error(errorMessage);
    
    if (shouldThrow) {
      throw new Error(errorMessage);
    }
  }, []);

  const createBooking = useCallback(async (bookingData: BookingRequest): Promise<BookingResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await BookingApiService.createBooking(bookingData);
      const result = handleApiResponse(response, 'createBooking');
      
      message.success("Đặt vé thành công!");
      return result;
    } catch (err: any) {
      handleError(err, 'createBooking', "Không thể tạo booking");
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  const createGuestBooking = useCallback(async (bookingData: BookingRequest): Promise<BookingResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await BookingApiService.createGuestBooking(bookingData);
      const result = handleApiResponse(response, 'createGuestBooking');
      
      message.success("Đặt vé thành công!");
      return result;
    } catch (err: any) {
      handleError(err, 'createGuestBooking', "Không thể tạo guest booking");
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  const getBookingDetails = useCallback(async (bookingId: string): Promise<BookingResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await BookingApiService.getBookingDetails(bookingId);
      return handleApiResponse(response, 'getBookingDetails');
    } catch (err: any) {
      handleError(err, 'getBookingDetails', "Không thể lấy thông tin booking");
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  const cancelBooking = useCallback(async (bookingId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await BookingApiService.cancelBooking(bookingId);
      handleApiResponse(response, 'cancelBooking');
      message.success("Hủy vé thành công!");
    } catch (err: any) {
      handleError(err, 'cancelBooking', "Không thể hủy booking");
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  const getMyBookings = useCallback(async (): Promise<BookingResponse[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await BookingApiService.getMyBookings();
      return handleApiResponse(response, 'getMyBookings');
    } catch (err: any) {
      handleError(err, 'getMyBookings', "Không thể lấy danh sách booking");
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  const getSeatStatus = useCallback(async (scheduleId: string | number): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await BookingApiService.getSeatStatus(scheduleId);
      return handleApiResponse(response, 'getSeatStatus');
    } catch (err: any) {
      handleError(err, 'getSeatStatus', "Không thể lấy trạng thái ghế", false);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  const reserveSeats = useCallback(async (scheduleId: string | number, seatIds: number[]): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await BookingApiService.reserveSeats({
        scheduleId,
        seatIds: seatIds.map(id => id.toString())
      });
      return handleApiResponse(response, 'reserveSeats');
    } catch (err: any) {
      handleError(err, 'reserveSeats', "Không thể đặt ghế tạm thời");
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  // Helper functions for Redux Persist management
  const clearSelectedSeatsData = useCallback(() => {
    dispatch(clearSelectedSeats());
  }, [dispatch]);

  const clearConcessionsData = useCallback(() => {
    dispatch(clearConcessions());
  }, [dispatch]);

  const clearPromotionData = useCallback(() => {
    dispatch(clearPromotion());
  }, [dispatch]);

  const updateSeatTotalData = useCallback((total: number) => {
    dispatch(updateSeatTotal(total));
  }, [dispatch]);

  const recalculateTotalsData = useCallback(() => {
    dispatch(recalculateTotals());
  }, [dispatch]);

  // Auto-cleanup logic for booking data
  const clearBookingDataAfterTimeout = useCallback(() => {
    const lastActivity = localStorage.getItem('booking_last_activity');
    if (lastActivity) {
      const lastActivityTime = new Date(lastActivity).getTime();
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastActivityTime;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff >= 24) {
        clearSelectedSeatsData();
        clearConcessionsData();
        clearPromotionData();
        localStorage.removeItem('booking_last_activity');
        localStorage.removeItem('currentBookingId');
      }
    }
  }, [clearSelectedSeatsData, clearConcessionsData, clearPromotionData]);

  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    localStorage.setItem('booking_last_activity', new Date().toISOString());
  }, []);

  return {
    loading,
    error,
    createBooking,
    createGuestBooking,
    getBookingDetails,
    cancelBooking,
    getMyBookings,
    getSeatStatus,
    reserveSeats,
    clearSelectedSeatsData,
    clearConcessionsData,
    clearPromotionData,
    updateSeatTotalData,
    recalculateTotalsData,
    clearBookingDataAfterTimeout,
    updateLastActivity,
  };
}; 
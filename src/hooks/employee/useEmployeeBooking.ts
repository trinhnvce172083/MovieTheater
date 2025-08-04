import { useState, useCallback } from "react";
import { message } from "antd";
import { EmployeeApiService } from "@/api/employee-api";
import type { 
  EmployeeBookingRecord, 
  EmployeeBookingFilters, 
  PaginatedResponse,
  CheckInRequest,
  CheckInResponse,
  ApiResponse 
} from "@/api/employee-api";

export const useEmployeeBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<EmployeeBookingRecord[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 10,
  });

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

  const fetchBookings = useCallback(async (filters?: EmployeeBookingFilters): Promise<PaginatedResponse<EmployeeBookingRecord>> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await EmployeeApiService.getBookings(filters);
      const result = handleApiResponse(response, 'fetchBookings');
      
      setBookings(result.content);
      setPagination({
        total: result.totalElements,
        current: result.number + 1,
        pageSize: result.size,
      });
      
      return result;
    } catch (err: any) {
      handleError(err, 'fetchBookings', "Không thể tải danh sách booking", false);
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
      };
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  const getBookingById = useCallback(async (bookingId: number): Promise<EmployeeBookingRecord | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await EmployeeApiService.getBookingById(bookingId);
      return handleApiResponse(response, 'getBookingById');
    } catch (err: any) {
      handleError(err, 'getBookingById', "Không thể tải chi tiết booking", false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  const checkInBooking = useCallback(async (data: CheckInRequest): Promise<CheckInResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await EmployeeApiService.checkInBooking(data);
      const result = handleApiResponse(response, 'checkInBooking');
      
      message.success("Check-in thành công!");
      
      // Update local state if the booking exists
      setBookings(prev => 
        prev.map(booking => 
          booking.id === data.bookingId 
            ? { ...booking, bookingStatus: 'CHECKED_IN' as const }
            : booking
        )
      );
      
      return result;
    } catch (err: any) {
      handleError(err, 'checkInBooking', "Không thể check-in", false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  const checkInByQrCode = useCallback(async (qrCode: string): Promise<CheckInResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await EmployeeApiService.checkInByQrCode(qrCode);
      const result = handleApiResponse(response, 'checkInByQrCode');
      
      message.success("Check-in bằng QR thành công!");
      
      return result;
    } catch (err: any) {
      handleError(err, 'checkInByQrCode', "Không thể check-in bằng QR code", false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  const checkInByBookingCode = useCallback(async (bookingCode: string): Promise<CheckInResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await EmployeeApiService.checkInByBookingCode(bookingCode);
      const result = handleApiResponse(response, 'checkInByBookingCode');
      
      message.success("Check-in bằng mã booking thành công!");
      
      return result;
    } catch (err: any) {
      handleError(err, 'checkInByBookingCode', "Không thể check-in bằng mã booking", false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  return {
    loading,
    error,
    bookings,
    pagination,
    fetchBookings,
    getBookingById,
    checkInBooking,
    checkInByQrCode,
    checkInByBookingCode,
  };
};
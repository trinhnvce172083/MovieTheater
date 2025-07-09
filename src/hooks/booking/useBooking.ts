import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  initializeBooking,
  setMovieInfo,
  setScheduleInfo,
  updateSelectedSeats,
  setSeatTotal,
  resetBooking
} from "@/store/slices/bookingSlice";
import { BookingApiService, BookingRequest, BookingResponse } from "@/api/booking-api";
import { message } from "antd";

export function useBooking() {
  const dispatch = useDispatch();
  const bookingData = useSelector((state: RootState) => state.booking);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy trạng thái ghế cho lịch chiếu
  const getSeatStatus = useCallback(async (scheduleId: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookingApiService.getSeatStatus(scheduleId);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể lấy trạng thái ghế";
      setError(errorMessage);
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Giữ chỗ tạm thời
  const reserveSeats = useCallback(async (scheduleId: string | number, seatIds: number[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookingApiService.reserveSeats({
        scheduleId,
        seatIds: seatIds.map(id => id.toString())
      });
      message.success("Đã giữ chỗ tạm thời trong 15 phút");
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể giữ chỗ";
      setError(errorMessage);
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hủy giữ chỗ
  const releaseSeats = useCallback(async (sessionId: string) => {
    try {
      await BookingApiService.releaseSeats(sessionId);
      message.info("Đã hủy giữ chỗ tạm thời");
    } catch (err: any) {
      console.error("Error releasing seats:", err);
    }
  }, []);

  // Gia hạn giữ chỗ
  const extendReservation = useCallback(async (sessionId: string, additionalMinutes: number = 5) => {
    try {
      await BookingApiService.extendSeatReservation(sessionId);
      message.success(`Đã gia hạn giữ chỗ thêm ${additionalMinutes} phút`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể gia hạn giữ chỗ";
      message.error(errorMessage);
    }
  }, []);

  // Tạo booking
  const createBooking = useCallback(async (bookingData: BookingRequest): Promise<BookingResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookingApiService.createBooking(bookingData);
      message.success("Đặt vé thành công!");
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể tạo booking";
      setError(errorMessage);
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo guest booking
  const createGuestBooking = useCallback(async (bookingData: BookingRequest): Promise<BookingResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookingApiService.createGuestBooking(bookingData);
      message.success("Đặt vé thành công!");
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể tạo booking";
      setError(errorMessage);
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy booking details
  const getBookingDetails = useCallback(async (bookingId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookingApiService.getBookingDetails(bookingId);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể lấy thông tin booking";
      setError(errorMessage);
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hủy booking
  const cancelBooking = useCallback(async (bookingId: string, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookingApiService.cancelBooking(bookingId);
      message.success("Đã hủy booking thành công");
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể hủy booking";
      setError(errorMessage);
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy booking của user
  const getMyBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookingApiService.getMyBookings();
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể lấy danh sách booking";
      setError(errorMessage);
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Khởi tạo booking
  const initializeBookingData = useCallback((scheduleId: string, roomId: string) => {
    dispatch(initializeBooking({ scheduleId, roomId }));
  }, [dispatch]);

  // Cập nhật thông tin phim
  const updateMovieInfo = useCallback((movieInfo: any) => {
    dispatch(setMovieInfo(movieInfo));
  }, [dispatch]);

  // Cập nhật thông tin lịch chiếu
  const updateScheduleInfo = useCallback((scheduleInfo: any) => {
    dispatch(setScheduleInfo(scheduleInfo));
  }, [dispatch]);

  // Cập nhật ghế đã chọn
  const updateSelectedSeatsData = useCallback((seats: any[]) => {
    dispatch(updateSelectedSeats(seats));
    // Tính tổng tiền ghế (backend sẽ tính chính xác)
    const seatTotal = seats.length * 150000; // Giá tạm thời
    dispatch(setSeatTotal(seatTotal));
  }, [dispatch]);

  // Reset booking
  const resetBookingData = useCallback(() => {
    dispatch(resetBooking());
  }, [dispatch]);

  return {
    // State
    bookingData,
    loading,
    error,

    // Seat management
    getSeatStatus,
    reserveSeats,
    releaseSeats,
    extendReservation,

    // Booking management
    createBooking,
    createGuestBooking,
    getBookingDetails,
    cancelBooking,
    getMyBookings,

    // Redux actions
    initializeBookingData,
    updateMovieInfo,
    updateScheduleInfo,
    updateSelectedSeatsData,
    resetBookingData,
  };
} 
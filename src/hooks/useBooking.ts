import { useState, useEffect, useCallback } from "react";
import { BookingApiService, type Seat, type BookingSummary } from "@/api/booking-api";
import { message } from "antd";

export interface UseBookingOptions {
  scheduleId?: string | number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useBooking(options: UseBookingOptions = {}) {
  const { scheduleId, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy trạng thái ghế
  const fetchSeatStatus = useCallback(async () => {
    if (!scheduleId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await BookingApiService.getSeatStatus(scheduleId);
      
      if (response.success) {
        setSeats(response.data);
      } else {
        setError(response.message || "Không thể tải trạng thái ghế");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi kết nối server";
      setError(errorMessage);
      console.error("Error fetching seat status:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [scheduleId]);

  // Giữ ghế tạm thời
  const reserveSeats = useCallback(async (seatIds: string[]) => {
    if (!scheduleId) {
      throw new Error("Schedule ID is required");
    }

    try {
      const response = await BookingApiService.reserveSeats({
        seatIds,
        scheduleId,
        sessionId: sessionId || undefined,
      });

      if (response.success) {
        setSessionId(response.data.sessionId);
        return response.data.sessionId;
      } else {
        throw new Error(response.message || "Không thể giữ ghế");
      }
    } catch (error) {
      console.error("Error reserving seats:", error);
      throw error;
    }
  }, [scheduleId, sessionId]);

  // Giải phóng ghế
  const releaseSeats = useCallback(async () => {
    if (!sessionId) return;

    try {
      await BookingApiService.releaseSeats(sessionId);
      setSessionId(null);
      setSelectedSeats([]);
    } catch (error) {
      console.error("Error releasing seats:", error);
    }
  }, [sessionId]);

  // Gia hạn giữ ghế
  const extendReservation = useCallback(async () => {
    if (!sessionId) return false;

    try {
      const response = await BookingApiService.extendSeatReservation(sessionId);
      return response.success;
    } catch (error) {
      console.error("Error extending reservation:", error);
      return false;
    }
  }, [sessionId]);

  // Chọn ghế
  const selectSeat = useCallback(async (seat: Seat, maxSeats: number = 10) => {
    const isCurrentlySelected = selectedSeats.some((s) => s.id === seat.id);

    if (isCurrentlySelected) {
      // Bỏ chọn ghế
      setSelectedSeats((prev) => {
        if (seat.type === "couple") {
          return prev.filter(s => s.coupleId !== seat.coupleId);
        } else {
          return prev.filter((s) => s.id !== seat.id);
        }
      });
    } else {
      // Chọn ghế mới
      if (selectedSeats.length >= maxSeats) {
        throw new Error(`Bạn chỉ có thể chọn tối đa ${maxSeats} ghế!`);
      }

      // Xử lý ghế đôi
      if (seat.type === "couple") {
        const coupleSeats = seats.filter(s => s.coupleId === seat.coupleId);
        if (selectedSeats.length + 2 <= maxSeats) {
          setSelectedSeats((prev) => [...prev, ...coupleSeats.map(s => ({ ...s, status: "selected" as const }))]);
          
          // Giữ ghế tạm thời
          const seatIds = coupleSeats.map(s => s.id);
          await reserveSeats(seatIds);
        } else {
          throw new Error(`Bạn chỉ có thể chọn thêm ${maxSeats - selectedSeats.length} ghế!`);
        }
      } else {
        setSelectedSeats((prev) => [...prev, { ...seat, status: "selected" as const }]);
        
        // Giữ ghế tạm thời
        await reserveSeats([seat.id]);
      }
    }
  }, [selectedSeats, seats, reserveSeats]);

  // Tạo booking
  const createBooking = useCallback(async () => {
    if (!scheduleId || selectedSeats.length === 0) {
      throw new Error("Vui lòng chọn ít nhất một ghế!");
    }

    try {
      const response = await BookingApiService.createBooking({
        scheduleId,
        seatIds: selectedSeats.map(seat => seat.id),
      });

      if (response.success) {
        // Giải phóng session sau khi tạo booking thành công
        await releaseSeats();
        return response.data.bookingId;
      } else {
        throw new Error(response.message || "Không thể tạo booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }, [scheduleId, selectedSeats, releaseSeats]);

  // Lấy booking summary
  const getBookingSummary = useCallback(async (bookingId: string): Promise<BookingSummary> => {
    try {
      const response = await BookingApiService.getBookingSummary(bookingId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Không thể tải thông tin booking");
      }
    } catch (error) {
      console.error("Error fetching booking summary:", error);
      throw error;
    }
  }, []);

  // Auto refresh seat status
  useEffect(() => {
    if (autoRefresh && scheduleId) {
      const interval = setInterval(fetchSeatStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, scheduleId, refreshInterval, fetchSeatStatus]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (sessionId) {
        releaseSeats().catch(console.error);
      }
    };
  }, [sessionId, releaseSeats]);

  return {
    // State
    seats,
    selectedSeats,
    sessionId,
    loading,
    error,
    
    // Actions
    fetchSeatStatus,
    selectSeat,
    reserveSeats,
    releaseSeats,
    extendReservation,
    createBooking,
    getBookingSummary,
    
    // Utilities
    totalAmount: selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
    selectedSeatIds: selectedSeats.map(seat => seat.id),
  };
} 
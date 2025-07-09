import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { updateSelectedSeats, setSeatTotal, setScheduleInfo, initializeBooking } from "@/store/slices/bookingSlice";
import { BookingApiService } from "@/api/booking-api";
import { message } from "antd";
import type { Seat } from "@/app/booking/seat-selection/seatType";

export function useSeatSelection(scheduleId?: string | number, roomId?: string | number) {
  const dispatch = useDispatch();
  const { selectedSeats } = useSelector((state: RootState) => state.booking);
  
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Hàm fetch trạng thái ghế và layout ghế
  const fetchSeatStatus = useCallback(async () => {
    if (!scheduleId || !roomId) return;
    setLoading(true);
    setError(null);
    try {
      // Lấy layout ghế
      const layoutResponse = await BookingApiService.getSeatLayout(roomId);
      const seatLayout: Seat[] = Array.isArray(layoutResponse.data) ? layoutResponse.data : [];
      // Lấy trạng thái ghế
      const statusResponse = await BookingApiService.getSeatStatus(scheduleId);
      const seatStatus: Seat[] = Array.isArray(statusResponse.data?.seats) ? statusResponse.data.seats : [];
      // Kết hợp layout và status
      const combinedSeats = seatLayout.map(layoutSeat => {
        const statusSeat = seatStatus.find(s => s.seatId === layoutSeat.seatId);
        return {
          ...layoutSeat,
          status: statusSeat?.status || layoutSeat.status || "AVAILABLE",
          reservedBySession: statusSeat?.reservedBySession,
          reservationExpiry: statusSeat?.reservationExpiry,
          isAvailable: (statusSeat?.status || layoutSeat.status) === "AVAILABLE",
          isOccupied: (statusSeat?.status || layoutSeat.status) === "OCCUPIED",
          isTemporarilyReserved: (statusSeat?.status || layoutSeat.status) === "TEMPORARILY_RESERVED",
        };
      });
      setSeats(combinedSeats);

      // Lấy lại schedule info từ API nếu cần cập nhật roomId
      if (scheduleId && (!roomId || seats.length === 0)) {
        try {
          const scheduleResponse = await import("@/api/schedule-api").then(m => m.ScheduleApiService.getScheduleById(Number(scheduleId)));
          if (scheduleResponse.success && scheduleResponse.data) {
            const scheduleData = scheduleResponse.data;
            dispatch(setScheduleInfo({
              scheduleId: scheduleData.scheduleId,
              displayTime: scheduleData.displayTime,
              displayDate: scheduleData.displayDate,
              cinemaRoomName: scheduleData.cinemaRoomName,
              movieTitle: scheduleData.movieName,
              movieId: scheduleData.movieId,
            }));
            if (scheduleData.cinemaRoomId && String(scheduleData.cinemaRoomId) !== String(roomId)) {
              dispatch(initializeBooking({
                scheduleId: String(scheduleData.scheduleId),
                roomId: String(scheduleData.cinemaRoomId),
              }));
            }
          }
        } catch (e) {
          console.warn("Không thể lấy thông tin schedule để cập nhật roomId", e);
        }
      }
      return { seats: combinedSeats, lastUpdated: statusResponse.data.lastUpdated };
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Không thể lấy trạng thái ghế");
    } finally {
      setLoading(false);
    }
  }, [scheduleId, roomId, dispatch]);

  // Gọi fetchSeatStatus ngay khi scheduleId và roomId có giá trị
  useEffect(() => {
    if (scheduleId && roomId) {
      fetchSeatStatus();
    }
  }, [scheduleId, roomId, fetchSeatStatus]);

  // Giữ chỗ tạm thời
  const reserveSeats = useCallback(async (seatIds: number[]) => {
    if (!scheduleId || seatIds.length === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await BookingApiService.reserveSeats({
        scheduleId,
        seatIds: seatIds.map(id => id.toString())
      });
      
      setSessionId(response.data.sessionId);
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
  }, [scheduleId]);

  // Hủy giữ chỗ
  const releaseSeats = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      await BookingApiService.releaseSeats(sessionId);
      setSessionId(null);
      message.info("Đã hủy giữ chỗ tạm thời");
    } catch (err: any) {
      console.error("Error releasing seats:", err);
    }
  }, [sessionId]);

  // Gia hạn giữ chỗ
  const extendReservation = useCallback(async (additionalMinutes: number = 5) => {
    if (!sessionId) return;
    
    try {
      await BookingApiService.extendSeatReservation(sessionId);
      message.success(`Đã gia hạn giữ chỗ thêm ${additionalMinutes} phút`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể gia hạn giữ chỗ";
      message.error(errorMessage);
    }
  }, [sessionId]);

  // Chọn ghế
  const selectSeat = useCallback((seat: Seat) => {
    if (seat.status !== "AVAILABLE") {
      message.warning("Ghế này không khả dụng");
      return false;
    }

    const isAlreadySelected = selectedSeats.some(s => s.seatId === seat.seatId);
    if (isAlreadySelected) {
      message.warning("Ghế này đã được chọn");
      return false;
    }

    // Kiểm tra giới hạn số ghế (tối đa 10 ghế)
    if (selectedSeats.length >= 10) {
      message.warning("Bạn chỉ có thể chọn tối đa 10 ghế");
      return false;
    }

    const newSelectedSeats = [...selectedSeats, seat];
    dispatch(updateSelectedSeats(newSelectedSeats));
    
    // Tính giá dựa trên thông tin thực tế của ghế
    const seatTotal = newSelectedSeats.reduce((total, selectedSeat) => {
      // Sử dụng priceMultiplier từ thông tin ghế nếu có
      const multiplier = selectedSeat.priceMultiplier || 1;
      const basePrice = 150000; // Giá cơ bản
      return total + (basePrice * multiplier);
    }, 0);
    
    dispatch(setSeatTotal(seatTotal));
    
    message.success(`Đã chọn ghế ${seat.seatNumber} (${seat.seatType})`);
    return true;
  }, [selectedSeats, dispatch]);

  // Bỏ chọn ghế
  const deselectSeat = useCallback((seatId: number) => {
    const newSelectedSeats = selectedSeats.filter(seat => seat.seatId !== seatId);
    dispatch(updateSelectedSeats(newSelectedSeats));
    
    // Tính lại tổng tiền ghế dựa trên thông tin thực tế
    const seatTotal = newSelectedSeats.reduce((total, selectedSeat) => {
      // Sử dụng priceMultiplier từ thông tin ghế nếu có
      const multiplier = selectedSeat.priceMultiplier || 1;
      const basePrice = 150000; // Giá cơ bản
      return total + (basePrice * multiplier);
    }, 0);
    
    dispatch(setSeatTotal(seatTotal));
    
    message.info("Đã bỏ chọn ghế");
  }, [selectedSeats, dispatch]);

  // Bỏ chọn tất cả ghế
  const deselectAllSeats = useCallback(() => {
    dispatch(updateSelectedSeats([]));
    dispatch(setSeatTotal(0));
    message.info("Đã bỏ chọn tất cả ghế");
  }, [dispatch]);

  // Kiểm tra ghế đã được chọn chưa
  const isSeatSelected = useCallback((seatId: number) => {
    return selectedSeats.some(seat => seat.seatId === seatId);
  }, [selectedSeats]);

  // Lấy danh sách ID ghế đã chọn
  const getSelectedSeatIds = useCallback(() => {
    return selectedSeats.map(seat => seat.seatId);
  }, [selectedSeats]);

  // Tự động gia hạn giữ chỗ mỗi 10 phút
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(() => {
      extendReservation(5);
    }, 10 * 60 * 1000); // 10 phút

    return () => clearInterval(interval);
  }, [sessionId, extendReservation]);

  // Tự động hủy giữ chỗ khi component unmount
  useEffect(() => {
    return () => {
      if (sessionId) {
        releaseSeats();
      }
    };
  }, [sessionId, releaseSeats]);

  return {
    // State
    seats,
    selectedSeats,
    loading,
    error,
    sessionId,

    // API actions
    fetchSeatStatus,
    reserveSeats,
    releaseSeats,
    extendReservation,

    // Selection actions
    selectSeat,
    deselectSeat,
    deselectAllSeats,

    // Utility functions
    isSeatSelected,
    getSelectedSeatIds,
  };
} 
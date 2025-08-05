import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { updateSelectedSeats, setSeatTotal, setScheduleInfo, initializeBooking } from "@/store/slices/bookingSlice";
import { BookingApiService } from "@/api/booking-api";
import { message } from "antd";
import type { Seat } from "@/app/booking/seat-selection/seatType";
import axiosClient from "@/api/axiosClient";

export function useSeatSelection(scheduleId?: string | number, roomId?: string | number) {
  const dispatch = useDispatch();
  const { selectedSeats } = useSelector((state: RootState) => state.booking);
  
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Hàm fetch trạng thái ghế và layout ghế
  const fetchSeatStatus = useCallback(async () => {
    if (!scheduleId) return;
    setLoading(true);
    setError(null);
    try {
      // Try primary API first
      let statusResponse;
      let seatData: Seat[] = [];
      
      try {
        console.log("Trying primary seat API:", `/bookings/schedules/${scheduleId}/seats`);
        statusResponse = await BookingApiService.getSeatStatus(scheduleId);
        seatData = Array.isArray(statusResponse.data?.seats) ? statusResponse.data.seats : [];
        console.log("Primary API success:", seatData.length, "seats");
      } catch (primaryErr: any) {
        console.log("Primary API failed:", primaryErr.response?.status, primaryErr.message);
        
        // If 403 and we have roomId, try cinema room API fallback
        if (primaryErr.response?.status === 403 && roomId) {
          console.log("Trying fallback cinema room API:", `/cinema-rooms/${roomId}/seats`);
          try {
            const roomResponse = await BookingApiService.getSeatLayout(roomId);
            // Room API returns seat layout, we need to mark all as AVAILABLE for now
            seatData = Array.isArray(roomResponse.data) ? 
              roomResponse.data.map(seat => ({ ...seat, status: "AVAILABLE" })) : [];
            console.log("Fallback API success:", seatData.length, "seats");
          } catch (fallbackErr: any) {
            console.log("Fallback API also failed:", fallbackErr.response?.status, fallbackErr.message);
            throw primaryErr; // Throw original error
          }
        } else {
          throw primaryErr;
        }
      }
      
      // Map dữ liệu ghế với đầy đủ thông tin
      const processedSeats = seatData.map(seat => ({
        ...seat,
        isAvailable: seat.status === "AVAILABLE",
        isOccupied: seat.status === "OCCUPIED", 
        isTemporarilyReserved: seat.status === "TEMPORARILY_RESERVED",
      }));
      
      setSeats(processedSeats);

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
      return { seats: processedSeats, lastUpdated: statusResponse.data?.lastUpdated };
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
      message.success("Seats have been temporarily reserved for 15 minutes");
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Unable to reserve seats";
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
      // Không cần thông báo khi bỏ giữ chỗ
    } catch (err: any) {
      console.error("Error releasing seats:", err);
    }
  }, [sessionId]);

  // Gia hạn giữ chỗ
  const extendReservation = useCallback(async (additionalMinutes: number = 5) => {
    if (!sessionId) return;
    try {
      await BookingApiService.extendSeatReservation(sessionId);
      // Không cần thông báo khi gia hạn giữ chỗ
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Unable to extend reservation";
      message.error(errorMessage);
    }
  }, [sessionId]);

  // Hàm tách số từ seatNumber (ví dụ: "J1" -> 1, "A10" -> 10)
  const extractNumber = useCallback((seatNumber: string) => {
    const match = seatNumber.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }, []);

  // Hàm xác định ghế đôi dựa trên seatType
  const isCoupleSeat = useCallback((seat: Seat) => {
    return seat.seatType === "COUPLE";
  }, []);

  // Hàm tìm ghế đôi còn lại trong cùng một cặp (theo thứ tự backend trả về)
  const findCouplePair = useCallback((seat: Seat) => {
    if (!isCoupleSeat(seat)) return null;
    const seatRow = seat.seatRow;
    // Lấy tất cả ghế COUPLE cùng hàng, sắp xếp theo số thứ tự
    const coupleSeatsInRow = seats
      .filter(s => s.seatRow === seatRow && isCoupleSeat(s))
      .sort((a, b) => extractNumber(a.seatNumber) - extractNumber(b.seatNumber));
    // Nhóm thành từng cặp
    for (let i = 0; i < coupleSeatsInRow.length; i += 2) {
      const pair = coupleSeatsInRow.slice(i, i + 2);
      if (pair.some(s => s.seatId === seat.seatId) && pair.length === 2) {
        return pair;
      }
    }
    return null;
  }, [seats, isCoupleSeat, extractNumber]);

  // Chọn ghế
  const selectSeat = useCallback((seat: Seat) => {
    // Nếu chưa có ghế nào được chọn, cho phép chọn bất kỳ hàng nào
    const currentRow = selectedSeats.length > 0 ? selectedSeats[0].seatRow : seat.seatRow;
    
    // 1. Không cho phép chọn ghế ở 2 hàng khác nhau
    if (selectedSeats.length > 0 && seat.seatRow !== currentRow) {
      message.warning("You can only select seats in the same row.");
      return false;
    }
    
    // 2. Nếu là ghế đôi (COUPLE)
    if (isCoupleSeat(seat)) {
      const couplePair = findCouplePair(seat);
      
      if (!couplePair) {
        message.warning("Invalid couple seat configuration.");
        return false;
      }
      
      // Nếu 1 trong 2 ghế không AVAILABLE
      if (couplePair.some(s => s.status !== "AVAILABLE")) {
        message.warning("You must select both seats in a couple pair. Please choose another pair.");
        return false;
      }
      
      // Nếu đã chọn 1 trong 2 ghế này rồi
      if (couplePair.some(s => selectedSeats.some(sel => sel.seatId === s.seatId))) {
        return false;
      }
      
      // Không cho phép chọn quá 10 ghế
      if (selectedSeats.length + 2 > 10) {
        message.warning("You can only select up to 10 seats.");
        return false;
      }
      
      // Không cho phép chọn ghế đôi nếu đã có ghế thường hoặc ngược lại
      if (selectedSeats.length > 0 && selectedSeats.some(s => !isCoupleSeat(s))) {
        message.warning("You cannot combine couple seats with other seat types in one booking.");
        return false;
      }
      
      // Thêm cả 2 ghế vào danh sách chọn
      const newSelectedSeats = [...selectedSeats, ...couplePair];
      
      // Kiểm tra không để ghế trống ở giữa
      const seatNumbers = newSelectedSeats.map(s => extractNumber(s.seatNumber)).sort((a, b) => a - b);
      for (let i = 1; i < seatNumbers.length; i++) {
        if (seatNumbers[i] - seatNumbers[i - 1] > 1) {
          message.warning("You cannot leave a single empty seat between selected seats.");
          return false;
        }
      }
      
      dispatch(updateSelectedSeats(newSelectedSeats));
      const seatTotal = newSelectedSeats.reduce((total, selectedSeat) => {
        const multiplier = selectedSeat.priceMultiplier || 1;
        const basePrice = 150000;
        return total + (basePrice * multiplier);
      }, 0);
      dispatch(setSeatTotal(seatTotal));
      return true;
    }
    
    // 3. Ghế thường (không phải COUPLE)
    if (seat.status !== "AVAILABLE") {
      message.warning("This seat is not available");
      return false;
    }
    
    if (selectedSeats.some(s => s.seatId === seat.seatId)) {
      return false;
    }
    
    if (selectedSeats.length >= 10) {
      message.warning("You can only select up to 10 seats");
      return false;
    }
    
    // Không cho phép chọn ghế thường nếu đã có ghế đôi
    if (selectedSeats.length > 0 && selectedSeats.some(s => isCoupleSeat(s))) {
      message.warning("You cannot combine couple seats with other seat types in one booking.");
      return false;
    }
    
    // Kiểm tra không để ghế trống ở giữa
    const newSelectedSeats = [...selectedSeats, seat];
    const seatNumbers = newSelectedSeats.map(s => extractNumber(s.seatNumber)).sort((a, b) => a - b);
    for (let i = 1; i < seatNumbers.length; i++) {
      if (seatNumbers[i] - seatNumbers[i - 1] > 1) {
        message.warning("You cannot leave a single empty seat between selected seats.");
        return false;
      }
    }
    
    dispatch(updateSelectedSeats(newSelectedSeats));
    const seatTotal = newSelectedSeats.reduce((total, selectedSeat) => {
      const multiplier = selectedSeat.priceMultiplier || 1;
      const basePrice = 150000;
      return total + (basePrice * multiplier);
    }, 0);
    dispatch(setSeatTotal(seatTotal));
    return true;
  }, [selectedSeats, dispatch, seats, isCoupleSeat, findCouplePair, extractNumber]);

  // Bỏ chọn ghế
  const deselectSeat = useCallback((seatId: number) => {
    const seatToRemove = selectedSeats.find(seat => seat.seatId === seatId);
    let newSelectedSeats: Seat[] = [];
    if (seatToRemove && isCoupleSeat(seatToRemove)) {
      // Nếu là ghế đôi, bỏ chọn cả cặp
      const couplePair = findCouplePair(seatToRemove);
      if (couplePair) {
        newSelectedSeats = selectedSeats.filter(seat => 
          !couplePair.some(coupleSeat => coupleSeat.seatId === seat.seatId)
        );
      }
    } else {
      // Nếu là ghế thường, chỉ bỏ chọn ghế đó
      newSelectedSeats = selectedSeats.filter(seat => seat.seatId !== seatId);
    }
    // Kiểm tra không để ghế trống ở giữa sau khi bỏ chọn
    if (newSelectedSeats.length > 1) {
      const seatNumbers = newSelectedSeats.map(s => extractNumber(s.seatNumber)).sort((a, b) => a - b);
      for (let i = 1; i < seatNumbers.length; i++) {
        if (seatNumbers[i] - seatNumbers[i - 1] > 1) {
          message.warning("You cannot deselect seats to create empty seats in between selected seats.");
          return;
        }
      }
    }
    dispatch(updateSelectedSeats(newSelectedSeats));
    const seatTotal = newSelectedSeats.reduce((total, selectedSeat) => {
      const multiplier = selectedSeat.priceMultiplier || 1;
      const basePrice = 150000;
      return total + (basePrice * multiplier);
    }, 0);
    dispatch(setSeatTotal(seatTotal));
    // Không cần thông báo khi bỏ chọn ghế
  }, [selectedSeats, dispatch, isCoupleSeat, findCouplePair, extractNumber]);

  // Bỏ chọn tất cả ghế
  const deselectAllSeats = useCallback(() => {
    dispatch(updateSelectedSeats([]));
    dispatch(setSeatTotal(0));
    // Không cần thông báo khi bỏ chọn tất cả ghế
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
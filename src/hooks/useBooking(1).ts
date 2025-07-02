import { useState, useCallback } from "react";
import { BookingApiService } from "@/api/booking-api";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { decodeJwt } from "./decodeJwt";
import type { Seat } from "@/app/booking/seat-selection/seatType";

export interface BookingSummary {
  bookingId: number;
  bookingCode: string;
  movieTitle: string;
  showtime: string;
  seats: Seat[];
  totalAmount: number;
}

export interface UseBookingOptions {
  scheduleId?: string | null;
  roomId?: string | null;
}

export function useBooking(options: UseBookingOptions = {}) {
  const { scheduleId, roomId } = options;

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useSelector((state: RootState) => state.auth.token);
  const userInfo = decodeJwt(token);
  const userId = userInfo?.accountId;

  const fetchSeatStatus = useCallback(async () => {
    if (!scheduleId || !roomId) return;

    setLoading(true);
    setError(null);
    try {
      // Lấy layout ghế từ room
      const layoutResponse = await BookingApiService.getSeatLayout(roomId);
      const seatLayout = layoutResponse.data;

      // Lấy trạng thái ghế từ schedule
      const statusResponse = await BookingApiService.getSeatStatus(scheduleId);
      const seatStatus = statusResponse.data.seats;

      // Kết hợp dữ liệu: layout + status
      const combinedSeats = seatLayout.map((layoutSeat: Seat) => {
        const statusSeat = seatStatus.find((s: Seat) => s.seatId === layoutSeat.seatId);
        return {
          ...layoutSeat,
          status: statusSeat?.status || layoutSeat.status || "AVAILABLE",
          reservedBySession: statusSeat?.reservedBySession,
          reservationExpiry: statusSeat?.reservationExpiry,
        };
      });

      setSeats(combinedSeats);
    } catch (err: any) {
      console.error("Error fetching seat status:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [scheduleId, roomId]);

  const createBooking = useCallback(
    async (selectedSeatsToBook: Seat[]) => {
      if (!scheduleId || selectedSeatsToBook.length === 0) {
        throw new Error("Please select at least one seat.");
      }

      try {
        const response = await BookingApiService.createBooking({
          scheduleId: Number(scheduleId),
          seatIds: selectedSeatsToBook.map((seat) => seat.seatId),
        });
        return response.data;
      } catch (error) {
        console.error("Error creating booking:", error);
        throw error;
      }
    },
    [scheduleId]
  );

  return {
    seats,
    loading,
    error,
    fetchSeatStatus,
    createBooking,
  };
} 
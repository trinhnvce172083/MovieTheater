"use client";

import { BookingApiService } from "@/api/booking-api";
import ROUTES from "@/constants/routes";
import { decodeJwt } from "@/hooks/decodeJwt";
import { App, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import BookingInfo from "./components/BookingInfo";
import SeatLoading from "./components/SeatLoading";
import TheaterLayout from "./components/theater-layout";
import type { Seat } from "./seatType";
import { useSeatSelection } from "./useSeatSelection";

export default function SeatSelectionPage() {
  const MAX_SEATS = 10;
  const { selectedSeats, selectSeat } = useSeatSelection(MAX_SEATS);
  const [seats, setSeats] = React.useState<Seat[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [scheduleId, setScheduleId] = React.useState<string | null>(null);
  const [roomId, setRoomId] = React.useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();

  // Lấy scheduleId và roomId từ URL params
  useEffect(() => {
    const scheduleIdParam = searchParams.get("scheduleId");
    const roomIdParam = searchParams.get("roomId");
    console.log(
      "URL params - scheduleId:",
      scheduleIdParam,
      "roomId:",
      roomIdParam
    );

    if (scheduleIdParam && roomIdParam) {
      setScheduleId(scheduleIdParam);
      setRoomId(roomIdParam);
      console.log(
        "Setting scheduleId:",
        scheduleIdParam,
        "roomId:",
        roomIdParam
      );
    } else {
      messageApi.error(
        "Schedule or room information not found! Please go back and try again."
      );
      // Không redirect, chỉ báo lỗi
    }
  }, [searchParams, messageApi]);

  // Lấy thông tin suất chiếu
  useEffect(() => {
    if (!scheduleId) return;

    const fetchScheduleInfo = async () => {
      try {
        // Gọi API để lấy thông tin suất chiếu
        const response = await fetch(`/api/schedules/${scheduleId}`);
        if (response.ok) {
          const data = await response.json();
          setScheduleInfo(data);

          // Nếu có movieId, lấy thông tin phim
          if (data.movieId) {
            fetchMovieInfo(data.movieId);
          }
        }
      } catch (error) {
        console.error("Error fetching schedule info:", error);
      }
    };

    fetchScheduleInfo();
  }, [scheduleId]);

  // Lấy thông tin phim
  const fetchMovieInfo = async (movieId: number) => {
    const response = await fetch(`/api/movies/${movieId}`);
    if (response.ok) {
      const data = await response.json();
      setMovieInfo(data);
    }
  };

  // Lấy dữ liệu ghế từ API
  useEffect(() => {
    if (!scheduleId || !roomId) return;

    const fetchSeatData = async () => {
      try {
        setLoading(true);

        // Gọi 2 API song song
        const [statusResponse, layoutResponse] = await Promise.all([
          BookingApiService.getSeatStatus(scheduleId),
          BookingApiService.getSeatLayout(roomId),
        ]);

        console.log("Status Response:", statusResponse);
        console.log("Layout Response:", layoutResponse);

        if (statusResponse.success && layoutResponse.success) {
          const statusData = statusResponse.data;

          interface SeatStatus {
            seatId: number;
            seatNumber: string;
            seatRow: string;
            status: string;
          }

          let seatStatusList: SeatStatus[] = [];

          // Lấy danh sách trạng thái ghế (có thể nằm trong object "seats")
          if (
            statusData &&
            typeof statusData === "object" &&
            "seats" in statusData &&
            Array.isArray((statusData as { seats: unknown[] }).seats)
          ) {
            seatStatusList = (statusData as { seats: SeatStatus[] }).seats;
          } else if (Array.isArray(statusData)) {
            seatStatusList = statusData as unknown as SeatStatus[];
          }

          const seatLayouts = layoutResponse.data;

          // Tạo một Map để tra cứu loại ghế nhanh chóng bằng seatId
          const typeMap = new Map<number, string>();
          seatLayouts.forEach((layoutSeat) => {
            typeMap.set(layoutSeat.seatId, layoutSeat.seatType);
          });

          // Gộp dữ liệu từ 2 API
          const mappedSeats: Seat[] = seatStatusList.map((statusSeat) => {
            const seatId = Number(statusSeat.seatId);
            return {
              id: seatId,
              number: String(statusSeat.seatNumber),
              row: String(statusSeat.seatRow),
              status: String(statusSeat.status || "available").toUpperCase(),
              type: (typeMap.get(seatId) || "STANDARD").toUpperCase(),
            };
          });

          console.log("Final Mapped seats:", mappedSeats);
          setSeats(mappedSeats);
        } else {
          let errorMsg = "";
          if (!statusResponse.success)
            errorMsg += `Error loading seat status: ${statusResponse.message}. `;
          if (!layoutResponse.success)
            errorMsg += `Error loading room layout: ${layoutResponse.message}.`;
          messageApi.error(errorMsg || "Unable to load seat data");
        }
      } catch (error) {
        console.error("Error fetching seat data:", error);
        messageApi.error("Server connection error when loading seat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSeatData();
  }, [scheduleId, roomId, messageApi]);

  const handleSelectSeat = (seat: Seat) => {
    selectSeat(seat, () => {
      messageApi.warning(
        `You can only select a maximum of ${MAX_SEATS} seats!`
      );
    });
  };

  const handleContinue = async () => {
    console.log("handleContinue called");
    console.log("selectedSeats:", selectedSeats);
    console.log("scheduleId:", scheduleId);
    console.log("roomId:", roomId);

    if (selectedSeats.length === 0) {
      messageApi.warning("Please select at least one seat before continuing!");
      return;
    }

    const params = new URLSearchParams({
      scheduleId: scheduleId ?? "",
      roomId: roomId ?? "",
      seats: JSON.stringify(
        selectedSeats.map((seat) => ({
          id: seat.id,
          row: seat.row,
          number: seat.number,
          type: seat.type,
        }))
      ),
    }).toString();

    const targetUrl = `${ROUTES.CORNCHIP}?${params}`;
    console.log("Navigating to:", targetUrl);

    if (!userId) {
      messageApi.error("Invalid user information. Please login again.");
      return;
    }

    try {
      // Tạo booking
      const response = await BookingApiService.createBooking({
        scheduleId: Number(scheduleId),
        seatIds: selectedSeats.map((seat) => seat.id.toString()),
        userId: userId,
      });

      if (response.success) {
        messageApi.success("Booking successful!");
        const params = new URLSearchParams({
          scheduleId: scheduleId ?? "",
          roomId: roomId ?? "",
          seats: JSON.stringify(
            selectedSeats.map((seat) => ({
              id: seat.id,
              row: seat.row,
              number: seat.number,
              type: seat.type,
            }))
          ),
        }).toString();
        router.push(`${ROUTES.CORNCHIP}?${params}`);
      } else {
        messageApi.error(response.message || "Unable to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      messageApi.error("Error when creating booking");
    }
  };

  if (loading) {
    return (
      <App>
        {contextHolder}
        <SeatLoading />
      </App>
    );
  }

  return (
    <App>
      {contextHolder}
      <div className="py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
          {/* Left: Seat layout */}
          <div className="flex-1">
            <TheaterLayout
              seats={seats}
              selectedSeats={selectedSeats}
              onSelectSeat={handleSelectSeat}
            />
          </div>
          {/* Right: Booking information */}
          <div className="w-full md:w-[350px]">
            <BookingInfo
              selectedSeats={selectedSeats}
              loading={loading}
              onBack={() => router.back()}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </div>
    </App>
  );
}

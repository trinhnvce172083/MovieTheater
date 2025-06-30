"use client";

import React, { useState, useEffect } from "react";
import { Card, Typography, Button, message, App } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { BookingApiService } from "@/api/booking-api";
import { decodeJwt } from "@/hooks/decodeJwt";
import { getAuthTokenFromCookies } from "@/utils/authCookies";

// Mở rộng interface Seat để có type
interface Seat {
  id: number;
  row: string;
  number: string;
  status: string;
  type: string; // STANDARD | VIP | COUPLE
}

// Component hiển thị một ghế
const getSeatColor = (seat: Seat) => {
  const type = seat.type?.toUpperCase() || "";
  if (seat.status === "TEMPORARILY_RESERVED") return "bg-orange-200 border-orange-400";
  if (seat.status === "OCCUPIED") return "bg-gray-400 border-gray-600";
  if (type === "VIP") return "bg-yellow-400 border-yellow-600";
  if (type === "COUPLE") return "bg-pink-400 border-pink-600";
  return "bg-gray-200 border-gray-400";
};

const getSeatStyle = (seat: Seat, isSelected: boolean) => {
  const base = "w-10 h-10 rounded-lg flex items-center justify-center font-bold border shadow transition-all duration-200";
  if (isSelected) return `${base} bg-blue-500 text-white border-blue-700 scale-110`;
  if (seat.status === "OCCUPIED") return `${base} bg-gray-400 text-white cursor-not-allowed opacity-60`;
  if (seat.status === "TEMPORARILY_RESERVED") return `${base} bg-orange-200 text-orange-700 border-orange-400 cursor-not-allowed opacity-80`;
  return `${base} ${getSeatColor(seat)} text-gray-800 hover:bg-blue-100 hover:border-blue-400 cursor-pointer`;
};

const SeatComponent: React.FC<{
  seat: Seat;
  isSelected: boolean;
  onSelect: (seat: Seat) => void;
}> = ({ seat, isSelected, onSelect }) => {
  const handleClick = () => {
    if (seat.status === "AVAILABLE") {
      onSelect(seat);
    }
  };
  let tooltip = "";
  if (seat.status === "TEMPORARILY_RESERVED") tooltip = "Seat temporarily reserved";
  else if (seat.status === "OCCUPIED") tooltip = "Seat occupied";
  else if (seat.type?.toUpperCase() === "COUPLE") tooltip = "Couple seat";
  else if (seat.type?.toUpperCase() === "VIP") tooltip = "VIP seat";
  else tooltip = "Standard seat";
  return (
    <button
      className={getSeatStyle(seat, isSelected)}
      onClick={handleClick}
      disabled={seat.status !== "AVAILABLE"}
      title={tooltip}
    >
      {seat.number}
    </button>
  );
};

// Component hiển thị sơ đồ rạp giống CGV
const TheaterLayout: React.FC<{
  seats: Seat[];
  selectedSeats: Seat[];
  onSelectSeat: (seat: Seat) => void;
}> = ({ seats, selectedSeats, onSelectSeat }) => {
  // Group by row
  const rows: Record<string, Seat[]> = {};
  seats.forEach(seat => {
    if (!rows[seat.row]) rows[seat.row] = [];
    rows[seat.row].push(seat);
  });
  const allRows = Object.keys(rows).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="w-3/4 h-8 bg-gray-300 mx-auto mb-8 rounded-lg flex items-center justify-center text-gray-600 font-medium shadow">
        Screen
      </div>
      <div className="space-y-3">
        {allRows.map(row => {
          const rowSeats = rows[row];
          const mid = Math.floor(rowSeats.length / 2);
          const left = rowSeats.slice(0, mid);
          const right = rowSeats.slice(mid);
          return (
            <div key={row} className="flex items-center justify-center gap-2">
              <span className="w-8 text-center font-bold text-lg text-gray-700">{row}</span>
              <div className="flex gap-4">
                <div className="flex gap-2">
                  {left.map(seat => (
                    <SeatComponent
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeats.some(s => s.id === seat.id)}
                      onSelect={onSelectSeat}
                    />
                  ))}
                </div>
                <div className="w-8" /> {/* Lối đi ở giữa */}
                <div className="flex gap-2">
                  {right.map(seat => (
                    <SeatComponent
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeats.some(s => s.id === seat.id)}
                      onSelect={onSelectSeat}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Chú thích */}
      <div className="mt-8 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 border border-gray-400 rounded-lg" />
          <span>Standard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-400 border border-yellow-600 rounded-lg" />
          <span>VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-pink-400 border border-pink-600 rounded-lg" />
          <span>Couple</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 border border-blue-700 rounded-lg" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-400 border border-gray-600 rounded-lg" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-200 border border-orange-400 rounded-lg" />
          <span>Reserved</span>
        </div>
      </div>
    </div>
  );
};

export default function SeatSelectionPage() {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  
  const MAX_SEATS = 10;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();

  // Lấy scheduleId và roomId từ URL params
  useEffect(() => {
    const scheduleIdParam = searchParams.get("scheduleId");
    const roomIdParam = searchParams.get("roomId");

    if (scheduleIdParam && roomIdParam) {
      setScheduleId(scheduleIdParam);
      setRoomId(roomIdParam);
    } else {
      messageApi.error("Schedule or room information not found!");
      router.push("/movies");
    }
  }, [searchParams, router, messageApi]);

  // Lấy dữ liệu ghế từ API
  useEffect(() => {
    if (!scheduleId || !roomId) return;

    const fetchSeatData = async () => {
      try {
        setLoading(true);
        
        // Gọi 2 API song song
        const [statusResponse, layoutResponse] = await Promise.all([
          BookingApiService.getSeatStatus(scheduleId),
          BookingApiService.getSeatLayout(roomId)
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
          if (statusData && typeof statusData === 'object' && 'seats' in statusData && Array.isArray((statusData as { seats: unknown[] }).seats)) {
            seatStatusList = (statusData as { seats: SeatStatus[] }).seats;
          } else if (Array.isArray(statusData)) {
            seatStatusList = statusData as unknown as SeatStatus[];
          }

          const seatLayouts = layoutResponse.data;

          // Tạo một Map để tra cứu loại ghế nhanh chóng bằng seatId
          const typeMap = new Map<number, string>();
          seatLayouts.forEach(layoutSeat => {
            typeMap.set(layoutSeat.seatId, layoutSeat.seatType);
          });

          // Gộp dữ liệu từ 2 API
          const mappedSeats: Seat[] = seatStatusList.map(statusSeat => {
            const seatId = Number(statusSeat.seatId);
            return {
              id: seatId,
              number: String(statusSeat.seatNumber),
              row: String(statusSeat.seatRow),
              status: String(statusSeat.status || 'available').toUpperCase(),
              type: (typeMap.get(seatId) || 'STANDARD').toUpperCase(),
            };
          });

          console.log("Final Mapped seats:", mappedSeats);
          setSeats(mappedSeats);
        } else {
          let errorMsg = "";
          if (!statusResponse.success) errorMsg += `Error loading seat status: ${statusResponse.message}. `;
          if (!layoutResponse.success) errorMsg += `Error loading room layout: ${layoutResponse.message}.`;
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
    const isCurrentlySelected = selectedSeats.some((s) => s.id === seat.id);
    if (isCurrentlySelected) {
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= MAX_SEATS) {
        messageApi.warning(`You can only select a maximum of ${MAX_SEATS} seats!`);
        return;
      }
      setSelectedSeats((prev) => [...prev, { ...seat, status: "selected" as const }]);
    }
  };

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      messageApi.warning("Please select at least one seat!");
      return;
    }

    const token = getAuthTokenFromCookies();
    if (!token) {
      messageApi.error("You need to login to book tickets!");
      router.push("/auth/Login");
      return;
    }

    const decodedToken = decodeJwt(token);
    const userId = decodedToken?.accountId;

    if (!userId) {
      messageApi.error("Invalid user information. Please login again.");
      return;
    }

    try {
      // Tạo booking
      const response = await BookingApiService.createBooking({
        scheduleId: Number(scheduleId),
        seatIds: selectedSeats.map(seat => seat.id.toString()),
        userId: userId,
      });

      if (response.success) {
        messageApi.success("Booking successful!");
        router.push(`/CornChip?bookingId=${response.data.bookingId}`);
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
        <div className="py-8">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-lg">Loading seat information...</p>
            </div>
          </div>
        </div>
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
            <Card className="shadow-lg p-6 bg-white/80 backdrop-blur-sm rounded-2xl">
              <div className="text-center mb-8">
                <Typography.Title level={3} className="text-black">
                  Select Seats
                </Typography.Title>
                <Typography.Text className="text-gray-600">
                  Movie information will be displayed here
                </Typography.Text>
                <br />
                <Typography.Text className="text-gray-600">
                  Showtime: Loading... | Room: Loading...
                </Typography.Text>
              </div>
              
              
              
              <TheaterLayout
                seats={seats}
                selectedSeats={selectedSeats}
                onSelectSeat={handleSelectSeat}
              />
            </Card>
          </div>

          {/* Right: Booking information */}
          <div className="w-full md:w-[350px]">
            <Card className="shadow-lg p-6 bg-white/90 rounded-2xl">
              <div className="mb-4">
                <Typography.Text className="text-black block text-lg font-semibold">
                  Movie Information
                </Typography.Text>
                <Typography.Text className="text-gray-600 block">
                  Showtime: Loading...
                </Typography.Text>
                <Typography.Text className="text-gray-600 block">
                  Room: Loading...
                </Typography.Text>
              </div>
              <div className="mb-4">
                <Typography.Text className="text-black font-medium">
                  Selected Seats:
                </Typography.Text>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSeats.length === 0 ? (
                    <span className="text-gray-600">No seats selected</span>
                  ) : (
                    selectedSeats.map((seat) => (
                      <span
                        key={seat.id}
                        className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        {seat.row}
                        {seat.number}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className="mb-6">
                <Typography.Text className="text-black font-medium">
                  Total Amount:
                </Typography.Text>
                <span className="text-xl text-black font-bold ml-2">
                  {new Intl.NumberFormat("vi-VN").format(0)} VND
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <Button
                  type="default"
                  size="large"
                  className="flex-1 rounded-full bg-white hover:bg-gray-200 text-gray-800 font-semibold h-12 text-lg transition-all"
                  onClick={() => router.back()}
                >
                  <ArrowLeftOutlined />
                </Button>
                <Button
                  type="primary"
                  size="large"
                  className="flex-1 rounded-full bg-[#a084ee] hover:bg-[#7f56d9] text-white font-semibold h-12 text-lg transition-all"
                  onClick={handleContinue}
                  loading={loading}
                >
                  Continue
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </App>
  );
} 
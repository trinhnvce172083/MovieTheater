"use client";

import React, { useState, useEffect } from "react";
import { Card, Typography, Button, message, App } from "antd";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ArrowLeftOutlined } from "@ant-design/icons";

// Định nghĩa kiểu dữ liệu cho ghế
interface Seat {
  id: string;
  row: string;
  number: number;
  type: "standard" | "vip" | "couple";
  status: "available" | "selected" | "occupied";
  price: number;
  coupleId?: string; // Thêm coupleId để liên kết ghế đôi
}

// Component hiển thị một ghế
const SeatComponent: React.FC<{
  seat: Seat;
  onSelect: (seat: Seat) => void;
}> = ({ seat, onSelect }) => {
  const getSeatStyle = () => {
    const baseStyle = "w-8 h-8 m-1 rounded-t-lg cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-medium";
    
    switch (seat.status) {
      case "selected":
        return cn(baseStyle, "bg-blue-500 text-white hover:bg-blue-600");
      case "occupied":
        return cn(baseStyle, "bg-gray-500 text-white cursor-not-allowed");
      default:
        switch (seat.type) {
          case "vip":
            return cn(baseStyle, "bg-purple-500 text-white hover:bg-purple-600");
          case "couple":
            return cn(baseStyle, "bg-pink-500 text-white hover:bg-pink-600");
          default:
            return cn(baseStyle, "bg-gray-200 text-gray-700 hover:bg-gray-300");
        }
    }
  };

  const handleClick = () => {
    if (seat.status !== "occupied") {
      onSelect(seat);
    }
  };

  return (
    <button
      className={getSeatStyle()}
      onClick={handleClick}
      disabled={seat.status === "occupied"}
    >
      {seat.number}
    </button>
  );
};

// Component hiển thị sơ đồ rạp
const TheaterLayout: React.FC<{
  seats: Seat[];
  onSelectSeat: (seat: Seat) => void;
}> = ({ seats, onSelectSeat }) => {
  // Tách ghế thường và ghế đôi
  const standardSeats = seats.filter(seat => seat.type !== "couple");
  const coupleSeats = seats.filter(seat => seat.type === "couple");

  // Nhóm ghế thường theo hàng
  const seatsByRow = standardSeats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      {/* Màn hình */}
      <div className="w-3/4 h-8 bg-gray-300 mx-auto mb-8 rounded-lg flex items-center justify-center text-gray-600 font-medium">
        Screen
      </div>
      
      {/* Ghế thường */}
      <div className="space-y-4">
        {Object.entries(seatsByRow).map(([row, rowSeats]) => (
          <div key={row} className="flex justify-center items-center gap-2">
            <span className="w-6 text-center font-medium">{row}</span>
            <div className="flex flex-wrap justify-center">
              {rowSeats.map((seat) => (
                <SeatComponent
                  key={seat.id}
                  seat={seat}
                  onSelect={onSelectSeat}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Ghế đôi ở hàng cuối */}
      <div className="mt-4">
        <div className="flex justify-center items-center gap-2">
          <span className="w-6 text-center font-medium">CP</span>
          <div className="flex flex-wrap justify-center">
            {coupleSeats.map((seat) => (
              <SeatComponent
                key={seat.id}
                seat={seat}
                onSelect={onSelectSeat}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Chú thích */}
      <div className="mt-8 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded-t-lg" />
          <span>Standard Seat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-500 rounded-t-lg" />
          <span>VIP Seat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-pink-500 rounded-t-lg" />
          <span>Couple Seat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-t-lg" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-500 rounded-t-lg" />
          <span>Occupied</span>
        </div>
      </div>
    </div>
  );
};

export default function SeatSelectionPage() {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const MAX_SEATS = 10; // Max seat limit

  // Dữ liệu mẫu cho ghế
  const [seats, setSeats] = useState<Seat[]>([]);

  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const tempSeats: Seat[] = [];
    
    // Tạo ghế thường và VIP
    rows.forEach((row) => {
      for (let i = 1; i <= 10; i++) {
        let type: "standard" | "vip" | "couple" = "standard";
        let price = 75000; // 75k VND

        // Ghế VIP: D, E, F, G, H
        if (["D", "E", "F", "G", "H"].includes(row)) {
          type = "vip";
          price = 120000; // 120k VND
        }
        // Ghế thường: A, B, C (giữ mặc định)

        tempSeats.push({
          id: `${row}-${i}`,
          row,
          number: i,
          type,
          status: "available",
          price,
        });
      }
    });

    // Tạo ghế đôi ở hàng riêng (CP - Couple)
    for (let i = 1; i <= 10; i += 2) {
      const coupleId = `couple-${i}`;
      tempSeats.push({
        id: `CP-${i}`,
        row: "CP",
        number: i,
        type: "couple",
        status: "available",
        price: 150000, // 150k VND
        coupleId,
      });
      tempSeats.push({
        id: `CP-${i + 1}`,
        row: "CP",
        number: i + 1,
        type: "couple",
        status: "available",
        price: 150000,
        coupleId,
      });
    }

    setSeats(tempSeats);
  }, []);

  const handleSelectSeat = (seat: Seat) => {
    setSelectedSeats((prev) => {
      const isCurrentlySelected = prev.some((s) => s.id === seat.id);

      // Case 1: Deselecting an already selected seat (regardless of MAX_SEATS)
      if (isCurrentlySelected) {
        if (seat.type === "couple") {
          return prev.filter(s => s.coupleId !== seat.coupleId);
        } else {
          return prev.filter((s) => s.id !== seat.id);
        }
      }

      // Case 2: Selecting a new seat (check MAX_SEATS)
      if (prev.length >= MAX_SEATS) {
        messageApi.warning(`You can only select a maximum of ${MAX_SEATS} seats!`);
        return prev; // Do not allow selection if limit reached
      }

      // Special handling for couple seats when selecting
      if (seat.type === "couple") {
          const coupleSeats = seats.filter(s => s.coupleId === seat.coupleId);
          // This check ensures we don't go over limit when selecting a couple seat
          if (prev.length + 2 <= MAX_SEATS) {
              return [...prev, ...coupleSeats.map(s => ({ ...s, status: "selected" as const }))];
          } else {
              messageApi.warning(`You can only select ${MAX_SEATS - prev.length} more seats!`);
              return prev;
          }
      }

      // Standard seat selection
      return [...prev, { ...seat, status: "selected" }];
    });
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      messageApi.warning("Please select at least one seat!");
      return;
    }
    messageApi.success("Seats selected successfully!");
    router.push("/booking/corn-chip");
  };

  const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

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
                  Seat Selection
                </Typography.Title>
                <Typography.Text className="text-gray-600">
                  Doraemon: Nobita&apos;s Earth Symphony
                </Typography.Text>
                <br />
                <Typography.Text className="text-gray-600">
                  Showtime: 19:00 - 21:30 | Theater 1
                </Typography.Text>
              </div>
              <TheaterLayout
                seats={seats.map((seat) => ({
                  ...seat,
                  status: selectedSeats.some((s) => s.id === seat.id)
                    ? "selected"
                    : seat.status,
                }))}
                onSelectSeat={handleSelectSeat}
              />
            </Card>
          </div>

          {/* Right: Booking information */}
          <div className="w-full md:w-[350px]">
            <Card className="shadow-lg p-6 bg-white/90 rounded-2xl">
              <div className="mb-4">
                <Typography.Text className="text-black block text-lg font-semibold">
                  Doraemon: Nobita&apos;s Earth Symphony
                </Typography.Text>
                <Typography.Text className="text-gray-600 block">
                  Showtime: 19:00 - 21:30
                </Typography.Text>
                <Typography.Text className="text-gray-600 block">
                  Screening room: 01
                </Typography.Text>
              </div>
              <div className="mb-4">
                <Typography.Text className="text-black font-medium">
                  Selected Seats:
                </Typography.Text>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSeats.length === 0 ? (
                    <span className="text-gray-600">None selected</span>
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
                  Total Order:
                </Typography.Text>
                <span className="text-xl text-black font-bold ml-2">
                  {new Intl.NumberFormat("en-US").format(totalAmount)} VND
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
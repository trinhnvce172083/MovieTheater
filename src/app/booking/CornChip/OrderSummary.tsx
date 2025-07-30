"use client";

import React from "react";
import { Card, Typography, Button, Space } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const { Title, Text } = Typography;

export default function OrderSummary() {
  const bookingData = useSelector((state: RootState) => state.booking);

  const movieInfo = bookingData.movieInfo;
  const scheduleInfo = bookingData.scheduleInfo;
  const selectedSeats = bookingData.selectedSeats;
  const selectedConcessions = bookingData.selectedConcessions;

  return (
    <Card 
      title="Tóm tắt đơn hàng" 
      className="bg-[#23283a] border-gray-700 text-white"
    >
      {/* Movie Info */}
      <div className="mb-6">
        <div className="flex items-start space-x-3">
          {movieInfo?.posterUrl && (
            <img
              src={movieInfo.posterUrl}
              alt={movieInfo.title}
              className="w-16 h-24 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <Title level={4} className="text-white mb-1">
              {movieInfo?.title || "Movie Title"}
            </Title>
            <Text className="text-gray-400 text-sm block">
              {scheduleInfo?.displayTime} - {scheduleInfo?.displayDate}
            </Text>
            <Text className="text-gray-400 text-sm block">
              {scheduleInfo?.cinemaRoomName}
            </Text>
          </div>
        </div>
      </div>

      {/* Selected Seats */}
      <div className="mb-4">
        <Text className="text-gray-300 font-semibold block mb-2">
          Ghế đã chọn ({selectedSeats.length}):
        </Text>
        <div className="flex flex-wrap gap-1">
          {selectedSeats.map((seat) => (
            <span
              key={seat.seatId}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
            >
              {seat.seatNumber}
            </span>
          ))}
        </div>
      </div>

      {/* Selected Concessions */}
      {selectedConcessions.length > 0 && (
        <div className="mb-4">
          <Text className="text-gray-300 font-semibold block mb-2">
            Đồ ăn đã chọn:
          </Text>
          <div className="space-y-1">
            {selectedConcessions.map((item) => (
              <div key={item.concessionId} className="flex justify-between text-sm">
                <Text className="text-gray-400">
                  {item.concession.name} x{item.quantity}
                </Text>
                <Text className="text-white">
                  {(item.concession.price * item.quantity).toLocaleString()} VND
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="border-t border-gray-600 pt-4 space-y-2">
        <div className="flex justify-between">
          <Text className="text-gray-400">Ghế:</Text>
          <Text className="text-white">{bookingData.seatTotal?.toLocaleString()} VND</Text>
        </div>
        
        <div className="flex justify-between">
          <Text className="text-gray-400">Đồ ăn:</Text>
          <Text className="text-white">{bookingData.concessionsTotal?.toLocaleString()} VND</Text>
        </div>
        
        {bookingData.discountAmount > 0 && (
          <div className="flex justify-between text-red-400">
            <Text>Giảm giá:</Text>
            <Text>-{bookingData.discountAmount?.toLocaleString()} VND</Text>
          </div>
        )}
        
        <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-2">
          <Text className="text-white">Tổng cộng:</Text>
          <Text className="text-yellow-400">{bookingData.finalAmount?.toLocaleString()} VND</Text>
        </div>
      </div>

      {/* Skip Button */}
      <div className="mt-4">
        <Button 
          type="text" 
          block 
          className="text-gray-400 hover:text-white"
        >
          Bỏ qua đồ ăn
        </Button>
      </div>
    </Card>
  );
} 
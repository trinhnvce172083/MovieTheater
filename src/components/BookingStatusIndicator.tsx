"use client";

import React from "react";
import { Card, Button, Tag, Space, Typography, message } from "antd";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { resetBooking } from "@/store/slices/bookingSlice";
import ROUTES from "@/constants/routes";

const { Text, Title } = Typography;

export default function BookingStatusIndicator() {
  const router = useRouter();
  const dispatch = useDispatch();
  const bookingData = useSelector((state: RootState) => state.booking);

  // Helper functions
  const isBookingValid = () => {
    return !!(bookingData.scheduleId && bookingData.roomId);
  };

  const hasSelectedSeats = () => {
    return bookingData.selectedSeats.length > 0;
  };

  const hasSelectedConcessions = () => {
    return bookingData.selectedConcessions.length > 0;
  };

  // Chỉ hiển thị nếu có booking data
  if (!isBookingValid()) {
    return null;
  }

  const getCurrentStep = () => {
    if (!hasSelectedSeats()) return "seat-selection";
    if (!hasSelectedConcessions()) return "concessions";
    return "confirm";
  };

  const getStepName = (step: string) => {
    switch (step) {
      case "seat-selection": return "Chọn ghế";
      case "concessions": return "Đồ ăn & thức uống";
      case "confirm": return "Xác nhận";
      default: return "Không xác định";
    }
  };

  const getNextStepRoute = () => {
    const currentStep = getCurrentStep();
    switch (currentStep) {
      case "seat-selection":
        return `${ROUTES.BOOKING_SEAT_SELECTION}?scheduleId=${bookingData.scheduleId}&roomId=${bookingData.roomId}`;
      case "concessions":
        return ROUTES.BOOKING_CORNCHIP;
      case "confirm":
        return ROUTES.BOOKING_CONFIRM;
      default:
        return ROUTES.HOME;
    }
  };

  const handleContinue = () => {
    router.push(getNextStepRoute());
  };

  const handleReset = () => {
    dispatch(resetBooking());
    message.success("Đã xóa thông tin đặt vé");
  };

  return (
    <Card 
      className="mb-4 border-blue-200 bg-blue-50"
      size="small"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Title level={5} className="m-0 text-blue-800">
              Đang đặt vé
            </Title>
            <Tag color="blue" className="text-xs">
              {bookingData.movieInfo?.title || "Phim"}
            </Tag>
          </div>
          
          <div className="space-y-1">
            <Text className="text-sm text-gray-600">
              <strong>Lịch chiếu:</strong> {bookingData.scheduleInfo?.displayDate} - {bookingData.scheduleInfo?.displayTime}
            </Text>
            
            {hasSelectedSeats() && (
              <Text className="text-sm text-gray-600">
                <strong>Ghế đã chọn:</strong> {bookingData.selectedSeats.length} ghế
              </Text>
            )}
            
            {hasSelectedConcessions() && (
              <Text className="text-sm text-gray-600">
                <strong>Đồ ăn:</strong> {bookingData.selectedConcessions.length} món
              </Text>
            )}
            
            <Text className="text-sm text-gray-600">
              <strong>Bước hiện tại:</strong> {getStepName(getCurrentStep())}
            </Text>
          </div>
        </div>
        
        <Space direction="vertical" size="small">
          <Button 
            type="primary" 
            size="small"
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Tiếp tục
          </Button>
          <Button 
            size="small" 
            danger
            onClick={handleReset}
          >
            Xóa
          </Button>
        </Space>
      </div>
    </Card>
  );
} 
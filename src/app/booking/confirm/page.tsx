"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, message, Space, Tag, Typography, Input, Alert } from "antd";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useBooking } from "@/hooks/booking/useBooking";
import { usePromotion } from "@/hooks/booking/usePromotion";
import ROUTES from "@/constants/routes";

const { Title, Text } = Typography;
const { Search } = Input;

export default function BookingConfirmPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [promotionInput, setPromotionInput] = useState("");
  
  const bookingData = useSelector((state: RootState) => state.booking);
  const { createBooking, getSeatStatus } = useBooking();
  const { 
    appliedPromotion, 
    promotionCode, 
    discountAmount, 
    loading: promotionLoading, 
    error: promotionError,
    applyPromotionCode, 
    removePromotionCode 
  } = usePromotion();

  // Xử lý áp dụng promotion code
  const handleApplyPromotion = async (code: string) => {
    if (!code.trim()) {
      message.warning("Vui lòng nhập mã khuyến mãi");
      return;
    }

    try {
      const result = await applyPromotionCode(code);
      if (result.isValid) {
        message.success(`Áp dụng mã khuyến mãi thành công! Giảm ${result.discountAmount?.toLocaleString()}đ`);
        setPromotionInput("");
      } else {
        message.error(result.message || "Mã khuyến mãi không hợp lệ");
      }
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra khi áp dụng mã khuyến mãi");
    }
  };

  // Xử lý xóa promotion
  const handleRemovePromotion = () => {
    removePromotionCode();
    message.success("Đã xóa mã khuyến mãi");
  };

  const handlePayment = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      // Kiểm tra authentication
      const accessToken = localStorage.getItem("accessToken");
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      
      if (!accessToken || !isLoggedIn) {
        message.error('Vui lòng đăng nhập để đặt vé');
        router.push(ROUTES.LOGIN);
        return;
      }
      
      // Validation
      if (!bookingData.selectedSeats || bookingData.selectedSeats.length === 0) {
        message.error('Please select at least one seat');
        return;
      }
      
      if (!bookingData.scheduleId) {
        message.error('Invalid schedule ID');
        return;
      }

      // Kiểm tra trạng thái ghế trước khi đặt (chỉ khi thực sự cần)
      try {
        const seatStatusResponse = await getSeatStatus(bookingData.scheduleId);
        const selectedSeatIds = bookingData.selectedSeats.map(seat => seat.seatId);
        
        // Kiểm tra xem response có đúng structure không
        if (seatStatusResponse && Array.isArray(seatStatusResponse.seats)) {
          const unavailableSeats = seatStatusResponse.seats.filter((seat: any) => 
            selectedSeatIds.includes(seat.seatId) && seat.status !== 'AVAILABLE'
          );
          
          if (unavailableSeats.length > 0) {
            message.error('Một số ghế đã được đặt. Vui lòng chọn ghế khác.');
            return;
          }
        } else if (Array.isArray(seatStatusResponse)) {
          // Fallback: nếu response trực tiếp là array
          const unavailableSeats = seatStatusResponse.filter((seat: any) => 
            selectedSeatIds.includes(seat.seatId) && seat.status !== 'AVAILABLE'
          );
          
          if (unavailableSeats.length > 0) {
            message.error('Một số ghế đã được đặt. Vui lòng chọn ghế khác.');
            return;
          }
        }
      } catch (error) {
        console.error("Failed to check seat status:", error);
        // Không block booking nếu không thể kiểm tra trạng thái ghế
      }

      // Lấy thông tin user
      const userInfoStr = localStorage.getItem("userInfo");
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

      // Chuẩn bị dữ liệu booking
      const seatIds = bookingData.selectedSeats.map(seat => seat.seatId);
      
      const bookingRequest = {
        scheduleId: Number(bookingData.scheduleId),
        seatIds: seatIds,
        concessions: bookingData.selectedConcessions.length > 0 ? bookingData.selectedConcessions.map((item: any) => ({
          concessionId: item.concessionId,
          quantity: item.quantity
        })) : undefined,
        promotionCode: bookingData.promotionCode || undefined,
        ...(userInfo && {
          customerName: userInfo.userName || userInfo.fullName,
          customerEmail: userInfo.email,
          customerPhone: userInfo.phone,
          isGuestBooking: false
        }),
        ...(!userInfo && {
          isGuestBooking: true
        })
      };

      // Validation chi tiết
      if (!bookingRequest.scheduleId || isNaN(bookingRequest.scheduleId)) {
        message.error('Invalid schedule ID');
        return;
      }
      
      if (!bookingRequest.seatIds || bookingRequest.seatIds.length === 0) {
        message.error('No seats selected');
        return;
      }
      
      if (bookingRequest.seatIds.some(id => !id || isNaN(id))) {
        message.error('Invalid seat IDs');
        return;
      }
      
      // Kiểm tra user info cho guest booking
      if (bookingRequest.isGuestBooking) {
        if (!bookingRequest.customerName || !bookingRequest.customerEmail || !bookingRequest.customerPhone) {
          message.error('Guest booking requires customer information');
          return;
        }
      }

      // Tạo booking
      const bookingResponse = await createBooking(bookingRequest);
      
      if (bookingResponse?.bookingId) {
        // Lưu bookingId vào localStorage
        localStorage.setItem("currentBookingId", bookingResponse.bookingId.toString());
        
        // Chuyển đến trang thanh toán
        router.push(`${ROUTES.BOOKING_PAYMENT}?bookingId=${bookingResponse.bookingId}`);
      } else {
        message.error("Failed to get bookingId from backend!");
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error(
          <div>
            <div>Ghế đã được đặt bởi người khác!</div>
            <Button 
              type="link" 
              size="small" 
              onClick={() => router.push(`/booking/seat-selection?scheduleId=${bookingData.scheduleId}&roomId=${bookingData.roomId}`)}
            >
              Chọn ghế khác
            </Button>
          </div>
        );
      } else {
        message.error("Có lỗi xảy ra khi tạo booking. Vui lòng thử lại.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToSeats = () => {
    router.push(`/booking/seat-selection?scheduleId=${bookingData.scheduleId}&roomId=${bookingData.roomId}`);
  };

  const getSeatStatusDisplay = (seatId: number) => {
    // Vì đã bỏ việc load seat status ngay khi mount, 
    // chúng ta sẽ giả định ghế đã chọn là available
    return {
      available: true,
      status: 'AVAILABLE'
    };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Movie Info */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <div className="flex items-start space-x-4">
              {bookingData.movieInfo?.posterUrl && (
                <img
                  src={bookingData.movieInfo.posterUrl}
                  alt={bookingData.movieInfo.title}
                  className="w-24 h-36 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <Title level={3} className="mb-4">
                  {bookingData.movieInfo?.title || "Movie Title"}
                </Title>
                <div className="space-y-3 text-gray-600">
                  <div className="flex flex-col">
                    <Text className="text-sm font-medium text-gray-500 mb-1">Thời gian chiếu</Text>
                    <Text className="text-base">
                      {bookingData.scheduleInfo?.displayTime} - {bookingData.scheduleInfo?.displayDate}
                    </Text>
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-sm font-medium text-gray-500 mb-1">Phòng chiếu</Text>
                    <Text className="text-base">
                      {bookingData.scheduleInfo?.cinemaRoomName}
                    </Text>
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-sm font-medium text-gray-500 mb-1">Thời lượng</Text>
                    <Text className="text-base">
                      {bookingData.movieInfo?.duration} phút
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Selected Seats */}
          <Card title="Ghế đã chọn" className="mb-6">
            <div className="space-y-4">
              {bookingData.selectedSeats.map((seat) => {
                const seatStatus = getSeatStatusDisplay(seat.seatId);
                return (
                  <div key={seat.seatId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 mb-1">Số ghế</span>
                        <span className="text-xl font-bold text-gray-800">{seat.seatNumber}</span>
                      </div>
                      <Tag color={seatStatus.available ? "green" : "red"} className="text-sm px-3 py-1">
                        {seatStatus.available ? "✓ Available" : "✗ Unavailable"}
                      </Tag>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-gray-500 mb-1">Giá vé</span>
                      <span className="text-xl font-bold text-green-600">
                        {`${180000}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Selected Concessions */}
          {bookingData.selectedConcessions.length > 0 && (
            <Card title="Đồ ăn & thức uống" className="mb-6">
              <div className="space-y-4">
                {bookingData.selectedConcessions.map((item) => (
                  <div key={item.concessionId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 mb-1">Tên món</span>
                        <span className="text-lg font-semibold text-gray-800">{item.concession.name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500 mb-1">Số lượng</span>
                        <span className="text-lg font-semibold text-blue-600">x{item.quantity}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-gray-500 mb-1">Thành tiền</span>
                      <span className="text-xl font-bold text-green-600">
                        {(item.concession.price * item.quantity).toLocaleString()} VND
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Promotion Code Section */}
          <Card title="Mã khuyến mãi" className="mb-6">
            <div className="space-y-4">
              {appliedPromotion ? (
                <Alert
                  message="Mã khuyến mãi đã được áp dụng"
                  description={
                    <div>
                      <p><strong>Mã:</strong> {appliedPromotion.code}</p>
                      <p><strong>Mô tả:</strong> {appliedPromotion.description}</p>
                      <p><strong>Giảm giá:</strong> {discountAmount?.toLocaleString()}đ</p>
                    </div>
                  }
                  type="success"
                  showIcon
                  action={
                    <Button size="small" onClick={handleRemovePromotion}>
                      Xóa
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  <Search
                    placeholder="Nhập mã khuyến mãi"
                    enterButton="Áp dụng"
                    size="large"
                    value={promotionInput}
                    onChange={(e) => setPromotionInput(e.target.value)}
                    onSearch={handleApplyPromotion}
                    loading={promotionLoading}
                  />
                  {promotionError && (
                    <Alert
                      message="Lỗi"
                      description={promotionError}
                      type="error"
                      showIcon
                    />
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="lg:col-span-1">
          <Card title="Tổng thanh toán" className="sticky top-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <Text className="text-gray-600">Ghế:</Text>
                <Text strong className="text-lg">{bookingData.seatTotal?.toLocaleString()} VND</Text>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <Text className="text-gray-600">Đồ ăn:</Text>
                <Text strong className="text-lg">{bookingData.concessionsTotal?.toLocaleString()} VND</Text>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between items-center py-2 text-red-600">
                  <Text>Giảm giá:</Text>
                  <Text strong className="text-lg">-{discountAmount?.toLocaleString()} VND</Text>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <Text className="text-xl font-bold text-gray-800">Tổng cộng:</Text>
                  <Text className="text-2xl font-bold text-green-600">{bookingData.finalAmount?.toLocaleString()} VND</Text>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <Button
                type="primary"
                size="large"
                block
                loading={isProcessing}
                onClick={handlePayment}
                className="bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold"
              >
                Thanh toán ngay
              </Button>
              
              <Button
                size="large"
                block
                onClick={handleBackToSeats}
                className="h-12 text-lg"
              >
                ← Quay lại chọn ghế
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
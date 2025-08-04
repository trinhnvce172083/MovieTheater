"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, message, Space, Tag, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useBooking } from "@/hooks/booking/useBooking";
import ROUTES from "@/constants/routes";
import CustomerInfoForm from "@/components/employee/CustomerInfoForm";
import { Role } from "@/constants/roles";

const { Title, Text } = Typography;

interface CustomerInfo {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth?: string;
  address?: string;
  memberId?: string;
}

export default function BookingConfirmPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [seatStatus, setSeatStatus] = useState<any[]>([]);
  
  // Employee-specific states
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  
  const bookingData = useSelector((state: RootState) => state.booking);
  const authState = useSelector((state: RootState) => state.auth);
  const { createBooking, getSeatStatus } = useBooking();

  // Check if current user is employee
  const isEmployee = authState.userInfo?.Role === Role.EMPLOYEE;

  // Show customer form for employees on first load
  // useEffect(() => {
  //   if (isEmployee && !customerInfo) {
  //     setShowCustomerForm(true);
  //   }
  // }, [isEmployee, customerInfo]);

  // Force show customer form for employees immediately
  // useEffect(() => {
  //   if (isEmployee) {
  //     setShowCustomerForm(true);
  //   }
  // }, [isEmployee]);

  // Load seat status on mount
  useEffect(() => {
    if (bookingData.scheduleId) {
      const loadSeatStatus = async () => {
        try {
          const status = await getSeatStatus(bookingData.scheduleId);
          setSeatStatus(status || []);
        } catch (error) {
          console.error("Failed to load seat status:", error);
        }
      };
      loadSeatStatus();
    }
  }, [bookingData.scheduleId, getSeatStatus]);

  // Handler for customer info form submission (employee only)
  // const handleCustomerInfoSubmit = async (info: CustomerInfo) => {
  //   setCustomerInfo(info);
  //   setShowCustomerForm(false);
  //   message.success("Thông tin khách hàng đã được lưu");
    
  //   // Auto proceed to payment for employees
  //   if (isEmployee) {
  //     // Small delay to show success message
  //     setTimeout(() => {
  //       if (!isProcessing) {
  //         handlePayment();
  //       }
  //     }, 1500);
  //   }
  // };

  const handleBackToCustomerForm = () => {
    setShowCustomerForm(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handlePayment = async () => {
    if (isProcessing) return;
    
    // Check customer info for employees
    // if (isEmployee && !customerInfo) {
    //   message.error("Vui lòng nhập thông tin khách hàng trước khi thanh toán");
    //   setShowCustomerForm(true);
    //   return;
    // }
    
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

      // Kiểm tra trạng thái ghế trước khi đặt
      try {
        const currentSeatStatus = await getSeatStatus(bookingData.scheduleId);
        const selectedSeatIds = bookingData.selectedSeats.map(seat => seat.seatId);
        const unavailableSeats = currentSeatStatus.filter((seat: any) => 
          selectedSeatIds.includes(seat.seatId) && seat.status !== 'AVAILABLE'
        );
        
        if (unavailableSeats.length > 0) {
          message.error('Một số ghế đã được đặt. Vui lòng chọn ghế khác.');
          return;
        }
      } catch (error) {
        console.error("Failed to check seat status:", error);
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
        // Use customer info for employees, user info for regular members
        // ...(isEmployee ? {
        //   // For employees, MUST have customer info
        //   customerName: customerInfo?.fullName || '',
        //   customerEmail: customerInfo?.email || '',
        //   customerPhone: customerInfo?.phoneNumber || '',
        //   isGuestBooking: true  // Employee always creates guest bookings for customers
        // } : userInfo ? {
        //   customerName: userInfo.userName || userInfo.fullName,
        //   customerEmail: userInfo.email,
        //   customerPhone: userInfo.phone,
        //   isGuestBooking: false
        // } : {
        //   isGuestBooking: true
        // })
        ...(userInfo ? {
          customerName: userInfo.userName || userInfo.fullName,
          customerEmail: userInfo.email,
          customerPhone: userInfo.phone,
          isGuestBooking: false
        } : {
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
      
             // Kiểm tra customer info cho employee và guest booking
       // if (isEmployee) {
       //   if (!bookingRequest.customerName || !bookingRequest.customerEmail || !bookingRequest.customerPhone) {
       //     message.error('Vui lòng nhập đầy đủ thông tin khách hàng (Họ tên, Email, SĐT)');
       //     setShowCustomerForm(true);
       //     return;
       //   }
       // } else if (bookingRequest.isGuestBooking) {
       //   if (!bookingRequest.customerName || !bookingRequest.customerEmail || !bookingRequest.customerPhone) {
       //     message.error('Guest booking requires customer information');
       //     return;
       //   }
       // }
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
    const seat = seatStatus.find(s => s.seatId === seatId);
    if (!seat) return { available: true, status: 'Unknown' };
    
    return {
      available: seat.status === 'AVAILABLE',
      status: seat.status
    };
  };

  // Show customer info form for employees
  // if (isEmployee && showCustomerForm) {
  //   return (
  //     <div className="container mx-auto px-4 py-8 max-w-4xl">
  //       <CustomerInfoForm
  //         onSubmit={handleCustomerInfoSubmit}
  //         onBack={handleBack}
  //         loading={isProcessing}
  //       />
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Customer Info Summary for Employee */}
      {/* {isEmployee && customerInfo && (
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Title level={4} className="mb-2">Thông tin khách hàng</Title>
              <div className="space-y-1 text-gray-600">
                <Text><strong>Họ tên:</strong> {customerInfo.fullName}</Text>
                <br />
                <Text><strong>Số điện thoại:</strong> {customerInfo.phoneNumber}</Text>
                <br />
                <Text><strong>Email:</strong> {customerInfo.email}</Text>
                {customerInfo.memberId && (
                  <>
                    <br />
                    <Text><strong>Mã thành viên:</strong> {customerInfo.memberId}</Text>
                  </>
                )}
              </div>
            </div>
            <Button onClick={handleBackToCustomerForm}>
              Chỉnh sửa
            </Button>
          </div>
        </Card>
      )} */}

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
                <Title level={3} className="mb-2">
                  {bookingData.movieInfo?.title || "Movie Title"}
                </Title>
                <div className="space-y-1 text-gray-600">
                  <Text>
                    <strong>Thời gian:</strong> {bookingData.scheduleInfo?.displayTime} - {bookingData.scheduleInfo?.displayDate}
                  </Text>
                  <Text>
                    <strong>Phòng:</strong> {bookingData.scheduleInfo?.cinemaRoomName}
                  </Text>
                  <Text>
                    <strong>Thời lượng:</strong> {bookingData.movieInfo?.duration} phút
                  </Text>
                </div>
              </div>
            </div>
          </Card>

          {/* Selected Seats */}
          <Card title="Ghế đã chọn" className="mb-6">
            <div className="space-y-3">
              {bookingData.selectedSeats.map((seat) => {
                const seatStatus = getSeatStatusDisplay(seat.seatId);
                return (
                  <div key={seat.seatId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold">{seat.seatNumber}</span>
                      <Tag color={seatStatus.available ? "green" : "red"}>
                        {seatStatus.available ? "✓ Available" : "✗ Unavailable"}
                      </Tag>
                    </div>
                    <span className="text-lg font-semibold text-green-600">
                      {`${180000}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} VND
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Selected Concessions */}
          {bookingData.selectedConcessions.length > 0 && (
            <Card title="Đồ ăn & thức uống" className="mb-6">
              <div className="space-y-3">
                {bookingData.selectedConcessions.map((item) => (
                  <div key={item.concessionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold">{item.concession.name}</span>
                      <span className="text-gray-600">x{item.quantity}</span>
                    </div>
                    <span className="text-lg font-semibold text-green-600">
                      {(item.concession.price * item.quantity).toLocaleString()} VND
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Payment Summary */}
        <div className="lg:col-span-1">
          <Card title="Tổng thanh toán" className="sticky top-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Text>Ghế:</Text>
                <Text strong>{bookingData.seatTotal?.toLocaleString()} VND</Text>
              </div>
              
              <div className="flex justify-between">
                <Text>Đồ ăn:</Text>
                <Text strong>{bookingData.concessionsTotal?.toLocaleString()} VND</Text>
              </div>
              
              {bookingData.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <Text>Giảm giá:</Text>
                  <Text strong>-{bookingData.discountAmount?.toLocaleString()} VND</Text>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <Text>Tổng cộng:</Text>
                  <Text className="text-green-600">{bookingData.finalAmount?.toLocaleString()} VND</Text>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                type="primary"
                size="large"
                block
                loading={isProcessing}
                onClick={handlePayment}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Thanh toán ngay
              </Button>
              
              <Button
                size="large"
                block
                onClick={handleBackToSeats}
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
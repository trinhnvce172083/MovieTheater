"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, message, Space, Tag, Typography, Input, Alert } from "antd";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useBooking } from "@/hooks/booking/useBooking";
import { usePromotion } from "@/hooks/booking/usePromotion";
import ROUTES from "@/constants/routes";
import CustomerInfoForm from "@/components/employee/CustomerInfoForm";
import { Role } from "@/constants/roles";

const { Title, Text } = Typography;
const { Search } = Input;

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
  const [promotionInput, setPromotionInput] = useState("");
  const [seatStatus, setSeatStatus] = useState<any[]>([]);
  
  // Employee-specific states
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  
  const bookingData = useSelector((state: RootState) => state.booking);
  const authState = useSelector((state: RootState) => state.auth);
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

  // Check if current user is employee vs member
  const isEmployee = authState.userInfo?.Role === Role.EMPLOYEE;
  const isMember = authState.userInfo && !isEmployee;
  

  
  // Chỉ có 2 flow: MEMBER hoặc EMPLOYEE
  const bookingFlowType = isEmployee ? 'EMPLOYEE' : 'MEMBER';

  // State để lưu user info từ API
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load user info từ API cho MEMBER flow
  useEffect(() => {
    const loadUserInfo = async () => {
      if (bookingFlowType === 'MEMBER' && !userProfile) {
        try {
          // Sử dụng axiosClient để gọi API user profile
          const response = await import('@/api/axiosClient').then(m => m.default.get('/users/profile'));
          
          if (response.data) {
            setUserProfile(response.data);
          }
        } catch (error) {
          // MEMBER flow: Nếu không load được API, báo lỗi nhưng không hiển thị form
          // User cần đăng nhập lại hoặc update profile từ trang profile
        }
      }
    };
    
    loadUserInfo();
  }, [bookingFlowType, userProfile]);

  // Validate schedule time when component mounts
  useEffect(() => {
    const validateScheduleTime = async () => {
      if (bookingData.scheduleId) {
        try {
          const scheduleResponse = await import("@/api/schedule-api").then(m => m.ScheduleApiService.getScheduleById(Number(bookingData.scheduleId)));
          if (scheduleResponse.success && scheduleResponse.data) {
            const schedule = scheduleResponse.data;
            const showDateTime = new Date(`${schedule.showDate}T${schedule.startTime}`);
            const currentTime = new Date();
            
            if (showDateTime <= currentTime) {
              message.error('Lịch chiếu này đã kết thúc. Đang chuyển về trang chủ...');
              setTimeout(() => {
                router.push('/');
              }, 2000);
              return;
            }
          }
        } catch (error) {
          // Ignore validation errors
        }
      }
    };
    
    validateScheduleTime();
  }, [bookingData.scheduleId, router]);

  // Show customer form ONLY for EMPLOYEE flow
  useEffect(() => {
    if (bookingFlowType === 'EMPLOYEE' && !customerInfo) {
      setShowCustomerForm(true);
    }
  }, [bookingFlowType, customerInfo]);

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

  // Xử lý áp dụng promotion
  const handleApplyPromotion = async (code: string) => {
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

  // Build booking request based on flow type
  const buildBookingRequest = () => {
    const userInfo = authState.userInfo;
    
    const seatIds = bookingData.selectedSeats.map((seat: any) => {
      const numericId = Number(seat.seatId);
      if (isNaN(numericId)) {
        throw new Error(`Invalid seat ID: ${seat.seatId}`);
      }
      return numericId;
    });

    const concessionOrders = bookingData.selectedConcessions.length > 0 ? bookingData.selectedConcessions.map((item: any) => ({
      concessionId: item.concessionId,
      quantity: item.quantity,
      notes: item.concession?.name ? `${item.concession.name}` : undefined // Lấy name từ concession object
    })) : undefined;



    const baseRequest = {
      scheduleId: Number(bookingData.scheduleId),
      seatIds: seatIds,
      concessionOrders: concessionOrders,
      promotionCode: bookingData.promotionCode || undefined,
    };

    if (bookingFlowType === 'EMPLOYEE') {
      // Employee flow - use customer info from form
      return {
        ...baseRequest,
        customerName: customerInfo?.fullName || '',
        customerEmail: customerInfo?.email || '',
        customerPhone: customerInfo?.phoneNumber || '',
        isGuestBooking: true,
        employeeBooking: true
      };
    } else {
      // Member flow - backend sẽ tự động lấy thông tin từ account
      const memberRequest = {
        ...baseRequest,
        // Optional: có thể gửi hoặc không, backend sẽ lấy từ account
        customerName: userProfile?.fullName || userProfile?.userName || userProfile?.name,
        customerEmail: userProfile?.email,
        customerPhone: userProfile?.phoneNumber || userProfile?.phone,
        isGuestBooking: false
      };
      
      // Member booking không cần validation - backend sẽ handle
      return memberRequest;
    }
  };

  // Validate booking request based on flow type
  const validateBookingRequest = (bookingRequest: any) => {
    // Common validations
    if (!bookingRequest.scheduleId || isNaN(bookingRequest.scheduleId)) {
      throw new Error('Invalid schedule ID');
    }
    
    if (!bookingRequest.seatIds || bookingRequest.seatIds.length === 0) {
      throw new Error('No seats selected');
    }
    
    if (bookingRequest.seatIds.some((id: number) => !id || isNaN(id))) {
      throw new Error('Invalid seat IDs');
    }

    // Flow-specific validations
    if (bookingFlowType === 'EMPLOYEE') {
      // Employee validation - requires customer info (guest booking)
      if (!customerInfo || !customerInfo.fullName || !customerInfo.email || !customerInfo.phoneNumber) {
        throw new Error('Vui lòng nhập đầy đủ thông tin khách hàng (Họ tên, Email, SĐT)');
      }
    } else {
      // Member validation - chỉ cần đăng nhập, backend sẽ tự lấy thông tin từ account
      if (!authState.userInfo) {
        throw new Error('Vui lòng đăng nhập để đặt vé');
      }
      // Không cần validate customerName, customerEmail, customerPhone cho member
      // Backend sẽ tự động lấy từ account database
    }
  };

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
    
    setIsProcessing(true);
    try {
      // Build booking request based on flow type
      const bookingRequest = buildBookingRequest();
      
      // Validate booking request
      validateBookingRequest(bookingRequest);
      

      
      // Check authentication for member flow
      if (bookingFlowType === 'MEMBER') {
      const accessToken = localStorage.getItem("accessToken");
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      
      if (!accessToken || !isLoggedIn) {
        message.error('Vui lòng đăng nhập để đặt vé');
        router.push(ROUTES.LOGIN);
        return;
      }
      }

      // Kiểm tra trạng thái schedule và ghế trước khi đặt
      try {
        // Kiểm tra thông tin schedule từ API
        try {
          const scheduleResponse = await import("@/api/schedule-api").then(m => m.ScheduleApiService.getScheduleById(Number(bookingData.scheduleId)));
          if (scheduleResponse.success && scheduleResponse.data) {
            const schedule = scheduleResponse.data;
            
            // Kiểm tra thời gian chiếu đã qua chưa
            const showDateTime = new Date(`${schedule.showDate}T${schedule.startTime}`);
            const currentTime = new Date();
            
            if (showDateTime <= currentTime) {
              message.error('Lịch chiếu này đã kết thúc. Vui lòng chọn lịch chiếu khác.');
              setIsProcessing(false);
        return;
      }
      
            // Kiểm tra schedule status
            if (schedule.status !== 'SCHEDULED') {
              message.error('Lịch chiếu này không khả dụng để đặt vé.');
              setIsProcessing(false);
        return;
      }

            // Kiểm tra số ghế còn lại
            if (schedule.availableSeats <= 0) {
              message.error('Lịch chiếu này đã hết ghế.');
              setIsProcessing(false);
              return;
            }
          }
        } catch (scheduleError) {
          message.warning('Không thể kiểm tra thông tin lịch chiếu. Vẫn tiếp tục đặt vé...');
        }

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
      
      // Handle validation errors specifically
      if (error.message && error.message.includes('thông tin khách hàng')) {
        // Chỉ employee mới hiển thị customer form
        setShowCustomerForm(true);
        message.error(error.message);
        return;
      } else if (error.message && error.message.includes('thông tin thành viên')) {
        // Member cần update profile, không hiển thị form
        message.error(error.message);
        return;
      }
      
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
        message.error(error.message || "Có lỗi xảy ra khi tạo booking. Vui lòng thử lại.");
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

  // Show customer info form ONLY for EMPLOYEE flow
  if (showCustomerForm && bookingFlowType === 'EMPLOYEE') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <CustomerInfoForm
          onSubmit={(info) => {
            setCustomerInfo(info);
            setShowCustomerForm(false);
          }}
          onBack={handleBack}
          loading={isProcessing}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Booking Flow Type Indicator */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
                         <Title level={4} className="mb-2">
               Thông tin đặt vé - {
                 bookingFlowType === 'MEMBER' ? 'Thành viên' : 'Nhân viên bán vé'
               }
             </Title>
            {bookingFlowType === 'MEMBER' && (
              <div className="space-y-1 text-gray-600">
                <Text><strong>Họ tên:</strong> {userProfile?.fullName || userProfile?.userName || authState.userInfo?.userName || 'Sẽ lấy từ tài khoản'}</Text>
                <br />
                <Text><strong>Email:</strong> {userProfile?.email || 'Sẽ lấy từ tài khoản'}</Text>
                <br />
                <Text><strong>Số điện thoại:</strong> {userProfile?.phoneNumber || userProfile?.phone || 'Sẽ lấy từ tài khoản'}</Text>
              </div>
            )}
                         {bookingFlowType === 'EMPLOYEE' && customerInfo && (
              <div className="space-y-1 text-gray-600">
                 <Text><strong>Họ tên:</strong> {customerInfo?.fullName}</Text>
                <br />
                 <Text><strong>Số điện thoại:</strong> {customerInfo?.phoneNumber}</Text>
                <br />
                 <Text><strong>Email:</strong> {customerInfo?.email}</Text>
                 {customerInfo?.memberId && (
                  <>
                    <br />
                    <Text><strong>Mã thành viên:</strong> {customerInfo.memberId}</Text>
                  </>
                )}
              </div>
             )}
            </div>
           {bookingFlowType === 'EMPLOYEE' && customerInfo && (
            <Button onClick={handleBackToCustomerForm}>
              Chỉnh sửa
            </Button>
          )}
          </div>
        </Card>

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
                // Tính giá thật: basePrice * priceMultiplier
                const basePrice = bookingData.scheduleInfo?.basePrice || 150000;
                const seatPrice = basePrice * (seat.priceMultiplier || 1);
                
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
                        {seatPrice.toLocaleString()} VND
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
              {bookingFlowType === 'MEMBER' ? (
                // Member flow - giữ nguyên nút "Thanh toán ngay"
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
              ) : (
                // Employee flow - nút xác nhận thanh toán
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={isProcessing}
                  onClick={async () => {
                    if (isProcessing) return;
                    
                    setIsProcessing(true);
                    try {
                      // Build booking request cho employee
                      const bookingRequest = buildBookingRequest();
                      validateBookingRequest(bookingRequest);
                      
                      // Tạo booking trước
                      const bookingResponse = await createBooking(bookingRequest);
                      
                      if (bookingResponse?.bookingId) {
                        // Lưu bookingId vào localStorage
                        localStorage.setItem("currentBookingId", bookingResponse.bookingId.toString());
                        
                        // Gọi API xác nhận thanh toán
                        const paymentMethod = 'CASH';
                        const paymentReference = `CASH-${Date.now()}`;
                        const notes = 'Nhân viên xác nhận đã nhận tiền mặt từ khách hàng';
                        const refundAmount = bookingData.finalAmount || 0;

                        const response = await import('@/api/axiosClient').then(m => m.default.post(`/bookings/${bookingResponse.bookingId}/payment/status`, {
                          paymentStatus: 'SUCCESS',
                          paymentReference,
                          paymentMethod,
                          notes,
                          refundAmount
                        }));

                        if (response.data?.success) {
                          message.success("Đã xác nhận thanh toán thành công!");
                          setTimeout(() => {
                            router.push('/employee');
                          }, 2000);
                        } else {
                          throw new Error(response.data?.message || 'Không thể xác nhận thanh toán');
                        }
                      } else {
                        message.error("Failed to get bookingId from backend!");
                      }
                    } catch (error: any) {
                      if (error.message && error.message.includes('thông tin khách hàng')) {
                        setShowCustomerForm(true);
                        message.error(error.message);
                        return;
                      }
                      message.error(error.message || "Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại.");
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold"
                >
                  Xác nhận thanh toán
                </Button>
              )}
              
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
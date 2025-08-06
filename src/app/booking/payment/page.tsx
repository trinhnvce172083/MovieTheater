"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { usePayment } from "@/hooks/booking/usePayment";
import { useBooking } from "@/hooks/booking/useBooking";
import { message } from "antd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import ROUTES from "@/constants/routes";
import { useSearchParams } from 'next/navigation';
import { Modal } from 'antd';
import CustomerInfoForm from "@/components/employee/CustomerInfoForm";
import { Role } from "@/constants/roles";
import axiosClient from "@/api/axiosClient";

interface CustomerInfo {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth?: string;
  address?: string;
  membershipType: 'guest' | 'existing_member' | 'new_member';
  memberId?: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const bookingData = useSelector((state: RootState) => state.booking);
  const authState = useSelector((state: RootState) => state.auth);
  const { paymentInfo, paymentMethods, createPayment, checkPaymentStatus, loading } = usePayment();
  const { getBookingDetails } = useBooking();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("ONLINE");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalContent, setPaymentModalContent] = useState({
    status: '',
    message: ''
  });

  // Employee-specific states
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  // Check if current user is employee
  const isEmployee = authState.userInfo?.Role === Role.EMPLOYEE;

  useEffect(() => {
    // Show customer form for employees on first load
    if (isEmployee && !customerInfo) {
      setShowCustomerForm(true);
    }
  }, [isEmployee, customerInfo]);

  // Lấy booking ID từ localStorage
  const bookingId = typeof window !== 'undefined' ? localStorage.getItem('currentBookingId') : null;

  // Chỉ load booking details khi cần thiết (không load ngay khi mount)
  const loadBookingDetails = async () => {
    if (!bookingId) {
      message.error("Booking information not found");
      router.push(ROUTES.HOME);
      return;
    }

    try {
      const details = await getBookingDetails(bookingId);
      setBookingDetails(details);
    } catch (error) {
      console.error('Error loading booking details:', error);
      message.error("Failed to load booking details");
    }
  };

  useEffect(() => {
    if (!bookingId) {
      message.error("Booking information not found");
      router.push(ROUTES.HOME);
    }
  }, [bookingId]);

  // Handler for customer info form submission (employee only)
  const handleCustomerInfoSubmit = (info: CustomerInfo) => {
    setCustomerInfo(info);
    setShowCustomerForm(false);
    message.success("Thông tin khách hàng đã được lưu");
  };

  // Handler for going back to customer form (employee only)
  const handleBackToCustomerForm = () => {
    setShowCustomerForm(true);
  };

  // Xử lý thanh toán
  const handlePayment = async () => {
    if (!bookingId) {
      message.error("Missing booking information");
      return;
    }

    // Customer info đã được lưu trong booking, không cần validate lại cho payment

    try {
      const paymentRequest = {
        bookingId: Number(bookingId),
        language: "vn"
      };

      const response = await createPayment(paymentRequest as any);
      
      setPaymentResponse(response);

      if (selectedPaymentMethod === 'WALLET') {
        if (response?.paymentUrl) {
          window.open(response.paymentUrl, '_blank');
          message.success('Redirecting to VNPay...');
        } else {
          message.error('Failed to get VNPay payment link!');
        }
        return;
      }

      if (response.status === 'PENDING') {
        message.success("Payment created successfully. Please complete the payment.");
      }
    } catch (error) {
      message.error("An error occurred while creating payment");
    }
  };

  // Kiểm tra trạng thái thanh toán
  const handleCheckPaymentStatus = async () => {
    if (!paymentResponse?.paymentId) return;

    try {
      const status = await checkPaymentStatus(paymentResponse.paymentId);
      setPaymentResponse(status);

      if (status.status === 'COMPLETED') {
        message.success("Payment successful!");
        // Chuyển đến trang thành công hoặc booking history
        setTimeout(() => {
          router.push(ROUTES.MEMBER_BOOKINGS);
        }, 2000);
      }
      return status; // Return the status for the modal
    } catch (error) {
      console.error('Error checking payment status:', error);
      return null; // Return null for the modal
    }
  };

  // Xác nhận đã nhận tiền (dành cho nhân viên)
  const handleConfirmPayment = async () => {
    if (!bookingDetails?.bookingId) return;

    try {
      const response = await axiosClient.post(`/bookings/${bookingDetails.bookingId}/payment/status`, {
        paymentStatus: 'SUCCESS',
        paymentReference: `CASH-${Date.now()}`,
        paymentMethod: 'CASH',
        notes: 'Nhân viên xác nhận đã nhận tiền mặt từ khách hàng'
      });

      if (response.data?.success) {
        const updatedPayment = {
          ...paymentResponse,
          status: 'COMPLETED' as const,
          transactionId: response.data.data?.paymentReference || `CASH-${Date.now()}`,
          message: 'Thanh toán bằng tiền mặt đã được xác nhận'
        };
        
        setPaymentResponse(updatedPayment);
        message.success("Đã xác nhận thanh toán thành công!");
        
        // Redirect sau 2 giây
        setTimeout(() => {
          router.push(ROUTES.EMPLOYEE_DASHBOARD);
        }, 2000);
      } else {
        throw new Error(response.data?.message || 'Không thể xác nhận thanh toán');
      }
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      const errorMessage = error.response?.data?.message || error.message || "Không thể xác nhận thanh toán";
      message.error(errorMessage);
    }
  };

  // Xử lý quay lại
  const handleBack = () => {
    router.back();
  };



  const searchParams = useSearchParams();

  // Xử lý callback từ VNPay
  useEffect(() => {
    // Nếu URL có các tham số vnp_*, tức là callback từ VNPay
    const hasVnpParams = Array.from(searchParams.keys()).some(key => key.startsWith('vnp_'));
    if (hasVnpParams && bookingId) {
      // Có thể lấy thêm vnp_ResponseCode, vnp_TransactionStatus để show thông báo
      handleCheckPaymentStatus().then((status: any) => {
        if (status?.status === 'COMPLETED') {
          setPaymentModalContent({
            status: 'success',
            message: 'Payment successful! Redirecting to home...'
          });
        } else {
          setPaymentModalContent({
            status: 'error',
            message: 'Payment failed or cancelled! Redirecting to home...'
          });
        }
        setShowPaymentModal(true);
        setTimeout(() => {
          setShowPaymentModal(false);
          router.push(ROUTES.HOME);
        }, 3000);
      });
    }
  }, [searchParams, bookingId]);

  if (!bookingId) {
    return (
      <div className="px-8 pt-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={handleBack} className="text-white">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Payment</h1>
          </div>
          <div className="text-center py-12">
            <p>Booking information not found. Redirecting to home...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show customer info form for employees
  if (isEmployee && showCustomerForm) {
    return (
      <div className="px-8 pt-2">
        <CustomerInfoForm
          onSubmit={handleCustomerInfoSubmit}
          onBack={handleBack}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <>
      <Modal
        open={showPaymentModal}
        footer={null}
        closable={false}
        centered
        styles={{ body:{ textAlign: 'center', padding: 32 }}}
      >
        {paymentModalContent.status === 'success' ? (
          <div>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <div className="text-xl font-bold mb-2">{paymentModalContent.message}</div>
          </div>
        ) : paymentModalContent.status === 'error' ? (
          <div>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <div className="text-xl font-bold mb-2">{paymentModalContent.message}</div>
          </div>
        ) : null}
      </Modal>
      <div className="px-8 pt-2">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={handleBack} className="text-white">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            {paymentResponse?.status === 'PENDING' && (
              <div className="flex gap-2 ml-auto">
                <Button 
                  onClick={handleCheckPaymentStatus}
                  variant="outline"
                  className="text-white border-gray-600"
                >
                  Check Payment Status
                </Button>
                {isEmployee && (
                  <Button 
                    onClick={handleConfirmPayment}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={loading}
                  >
                    {loading ? "Confirming..." : "Confirm Payment Received"}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Customer Info Summary for Employee */}
          {isEmployee && customerInfo && (
            <Card className="bg-[#1a2332] border-[#2d3748] mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span>Thông tin khách hàng</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBackToCustomerForm}
                  >
                    Chỉnh sửa
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Họ tên:</span>
                  <span className="text-white">{customerInfo.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Số điện thoại:</span>
                  <span className="text-white">{customerInfo.phoneNumber}</span>
                </div>
                {customerInfo.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{customerInfo.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Loại khách:</span>
                  <span className="text-white">
                    {customerInfo.membershipType === 'guest' && 'Khách vãng lai'}
                    {customerInfo.membershipType === 'existing_member' && 'Thành viên hiện có'}
                    {customerInfo.membershipType === 'new_member' && 'Thành viên mới'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Status */}
      

              {/* Payment Methods */}
              <Card className="bg-[#1a2332] border-[#2d3748]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CreditCard className="w-5 h-5" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-gray-600 hover:border-gray-500'
                      } ${!method.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => method.isAvailable && setSelectedPaymentMethod(method.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold">{method.name}</h3>
                          <p className="text-sm text-gray-400">{method.description}</p>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              <Card className="bg-[#1a2332] border-[#2d3748] sticky top-4">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Booking ID:</span>
                      <span className="font-mono">{bookingId || 'Loading...'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Movie:</span>
                      <span>{bookingData.movieInfo?.title || 'Loading...'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Show Time:</span>
                      <span>{bookingData.scheduleInfo?.displayTime || 'Loading...'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Seats:</span>
                      <span>{bookingData.selectedSeats?.length || 0} seats</span>
                    </div>
                    
                    <Separator className="bg-gray-600" />
                    
                    {/* Breakdown giá */}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ghế:</span>
                      <span>{bookingData.seatTotal?.toLocaleString() || '0'}đ</span>
                    </div>
                    
                    {bookingData.selectedConcessions && bookingData.selectedConcessions.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Đồ ăn:</span>
                        <span>{bookingData.concessionsTotal?.toLocaleString() || '0'}đ</span>
                      </div>
                    )}
                    
                    {bookingData.discountAmount > 0 && (
                      <div className="flex justify-between text-red-400">
                        <span>Giảm giá:</span>
                        <span>-{bookingData.discountAmount?.toLocaleString()}đ</span>
                      </div>
                    )}
                    
                    <Separator className="bg-gray-600" />
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Amount:</span>
                      <span className="text-lg font-bold text-green-400">
                        {bookingDetails?.finalAmount?.toLocaleString() || bookingData.finalAmount?.toLocaleString() || '0'}đ
                      </span>
                    </div>
                  </div>
                  
                  {!paymentResponse && (
                    <Button 
                      onClick={handlePayment}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      {loading ? "Processing..." : "Pay Now"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
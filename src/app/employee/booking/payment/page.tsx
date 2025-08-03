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
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Clock, User } from "lucide-react";
import ROUTES from "@/constants/routes";
import { useSearchParams } from 'next/navigation';
import { Modal } from 'antd';
import CustomerInfoForm from "@/components/employee/CustomerInfoForm";

interface CustomerInfo {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth?: string;
  address?: string;
  membershipType: 'guest' | 'existing_member' | 'new_member';
  memberId?: string;
}

export default function EmployeePaymentPage() {
  const router = useRouter();
  const bookingData = useSelector((state: RootState) => state.booking);
  const { paymentInfo, paymentMethods, createPayment, checkPaymentStatus, loading } = usePayment();
  const { getBookingDetails } = useBooking();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("CASH");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalContent, setPaymentModalContent] = useState({
    status: '',
    message: ''
  });
  
  // Employee specific states
  const [showCustomerForm, setShowCustomerForm] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  // Lấy booking ID từ localStorage
  const bookingId = typeof window !== 'undefined' ? localStorage.getItem('currentBookingId') : null;

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    } else {
      message.error("Không tìm thấy thông tin booking");
      router.push(ROUTES.HOME);
    }
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      const details = await getBookingDetails(bookingId!);
      setBookingDetails(details);
    } catch (error) {
      console.error('Error loading booking details:', error);
    }
  };

  // Handle customer info submission
  const handleCustomerInfoSubmit = (info: CustomerInfo) => {
    setCustomerInfo(info);
    setShowCustomerForm(false);
    message.success('Thông tin khách hàng đã được lưu!');
  };

  // Edit customer info
  const handleEditCustomerInfo = () => {
    setShowCustomerForm(true);
  };

  // Employee payment methods
  const employeePaymentMethods = [
    {
      id: "CASH",
      name: "Tiền mặt",
      description: "Thanh toán bằng tiền mặt tại quầy",
      icon: "💵",
      isAvailable: true
    },
    {
      id: "CARD",
      name: "Thẻ",
      description: "Thanh toán bằng thẻ ATM/Credit Card",
      icon: "💳",
      isAvailable: true
    },
    {
      id: "WALLET",
      name: "Ví điện tử",
      description: "VNPay, MoMo, ZaloPay",
      icon: "📱",
      isAvailable: true
    }
  ];

  // Xử lý thanh toán
  const handlePayment = async () => {
    if (!bookingId || !bookingDetails || !customerInfo) {
      message.error("Thiếu thông tin booking hoặc khách hàng");
      return;
    }

    try {
      const paymentRequest = {
        bookingId: Number(bookingId),
        amount: bookingDetails.finalAmount,
        paymentMethod: selectedPaymentMethod,
        customerInfo: {
          name: customerInfo.fullName,
          email: customerInfo.email,
          phone: customerInfo.phoneNumber
        },
        // Employee specific fields
        isEmployeeTransaction: true,
        employeeId: bookingData.employeeId, // Sẽ cần thêm vào Redux state
        membershipType: customerInfo.membershipType,
        ...(customerInfo.memberId && { memberId: customerInfo.memberId })
      };

      const response = await createPayment(paymentRequest);
      setPaymentResponse(response);

      if (selectedPaymentMethod === 'CASH') {
        message.success('Thanh toán tiền mặt thành công!');
        setTimeout(() => {
          router.push('/employee/booking-management');
        }, 2000);
      } else if (selectedPaymentMethod === 'WALLET') {
        if (response.paymentUrl) {
          window.open(response.paymentUrl, '_blank');
          message.success('Chuyển hướng đến VNPay...');
        } else {
          message.error('Không thể tạo link thanh toán VNPay!');
        }
      } else {
        message.success("Thanh toán được tạo thành công. Vui lòng hoàn thành thanh toán.");
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      message.error("Có lỗi xảy ra khi tạo thanh toán");
    }
  };

  // Kiểm tra trạng thái thanh toán
  const handleCheckPaymentStatus = async () => {
    if (!paymentResponse?.paymentId) return;

    try {
      const status = await checkPaymentStatus(paymentResponse.paymentId);
      setPaymentResponse(status);

      if (status.status === 'COMPLETED') {
        message.success("Thanh toán thành công!");
        setTimeout(() => {
          router.push('/employee/booking-management');
        }, 2000);
      }
      return status;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return null;
    }
  };

  // Xử lý quay lại
  const handleBack = () => {
    if (showCustomerForm) {
      router.back();
    } else {
      setShowCustomerForm(true);
    }
  };

  // Show customer form
  if (showCustomerForm) {
    return (
      <div className="px-8 pt-2">
        <div className="max-w-4xl mx-auto">
          <CustomerInfoForm
            onSubmit={handleCustomerInfoSubmit}
            onBack={handleBack}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  // Render trạng thái thanh toán
  const renderPaymentStatus = () => {
    if (!paymentResponse) return null;

    const statusConfig = {
      PENDING: { icon: Clock, color: "bg-yellow-500", text: "Đang chờ thanh toán" },
      PROCESSING: { icon: Clock, color: "bg-blue-500", text: "Đang xử lý" },
      COMPLETED: { icon: CheckCircle, color: "bg-green-500", text: "Hoàn thành" },
      FAILED: { icon: XCircle, color: "bg-red-500", text: "Thất bại" }
    };

    const config = statusConfig[paymentResponse.status as keyof typeof statusConfig];
    const IconComponent = config.icon;

    return (
      <Card className="bg-[#1a2332] border-[#2d3748] mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <IconComponent className={`w-5 h-5 ${config.color} rounded-full p-1`} />
            Trạng thái thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Trạng thái:</span>
              <Badge variant="secondary" className={config.color}>
                {config.text}
              </Badge>
            </div>
            
            {paymentResponse.transactionId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Mã giao dịch:</span>
                <span className="text-white font-mono">{paymentResponse.transactionId}</span>
              </div>
            )}

            {paymentResponse.message && (
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-white">{paymentResponse.message}</p>
              </div>
            )}

            {paymentResponse.status === 'PENDING' && selectedPaymentMethod !== 'CASH' && (
              <div className="space-y-3">
                {paymentResponse.qrCode && (
                  <div className="text-center">
                    <p className="text-gray-400 mb-2">Quét mã QR để hoàn thành thanh toán:</p>
                    <img 
                      src={paymentResponse.qrCode} 
                      alt="QR Code" 
                      className="mx-auto w-48 h-48 bg-white p-2 rounded"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!bookingDetails) {
    return (
      <div className="px-8 pt-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={handleBack} className="text-white">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold">Thanh toán</h1>
          </div>
          <div className="text-center py-12">
            <p>Đang tải thông tin booking...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 pt-2">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={handleBack} className="text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Thanh toán</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Customer Info & Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card className="bg-[#1a2332] border-[#2d3748]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="w-5 h-5" />
                  Thông tin khách hàng
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditCustomerInfo}
                    className="ml-auto text-blue-400 hover:text-blue-300"
                  >
                    Chỉnh sửa
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Họ tên:</span>
                  <span className="text-white">{customerInfo?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Số điện thoại:</span>
                  <span className="text-white">{customerInfo?.phoneNumber}</span>
                </div>
                {customerInfo?.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{customerInfo.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Loại khách:</span>
                  <Badge variant="secondary">
                    {customerInfo?.membershipType === 'guest' ? 'Khách vãng lai' :
                     customerInfo?.membershipType === 'existing_member' ? 'Thành viên' :
                     'Thành viên mới'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            {renderPaymentStatus()}

            {/* Payment Methods */}
            <Card className="bg-[#1a2332] border-[#2d3748]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CreditCard className="w-5 h-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employeePaymentMethods.map((method) => (
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
                <CardTitle className="text-white">Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mã booking:</span>
                    <span className="font-mono">{bookingDetails.bookingCode}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phim:</span>
                    <span>{bookingDetails.movie?.title}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Suất chiếu:</span>
                    <span>{bookingDetails.schedule?.formattedShowDateTime}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ghế:</span>
                    <span>{bookingDetails.seats?.length || 0} ghế</span>
                  </div>
                  
                  <Separator className="bg-gray-600" />
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tổng tiền:</span>
                    <span className="text-lg font-bold text-green-400">
                      {bookingDetails.finalAmount?.toLocaleString()}₫
                    </span>
                  </div>
                </div>
                
                {!paymentResponse && (
                  <Button 
                    onClick={handlePayment}
                    disabled={loading || !customerInfo}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    {loading ? "Đang xử lý..." : "Thanh toán ngay"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
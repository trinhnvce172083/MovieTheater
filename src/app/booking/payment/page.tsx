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

export default function PaymentPage() {
  const router = useRouter();
  const bookingData = useSelector((state: RootState) => state.booking);
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

  // Lấy booking ID từ localStorage
  const bookingId = typeof window !== 'undefined' ? localStorage.getItem('currentBookingId') : null;

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    } else {
      message.error("Booking information not found");
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

  // Xử lý thanh toán
  const handlePayment = async () => {
    if (!bookingId || !bookingDetails) {
      message.error("Missing booking information");
      return;
    }

    try {
      const paymentRequest = {
        bookingId: Number(bookingId),
        amount: bookingDetails.finalAmount,
        paymentMethod: selectedPaymentMethod,
        customerInfo: {
          name: bookingDetails.customerName,
          email: bookingDetails.customerEmail,
          phone: bookingDetails.customerPhone
        }
      };

      const response = await createPayment(paymentRequest);
      setPaymentResponse(response);

      if (selectedPaymentMethod === 'WALLET') {
        if (response.paymentUrl) {
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
      console.error('Error creating payment:', error);
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

  // Xử lý quay lại
  const handleBack = () => {
    router.back();
  };

  // Render trạng thái thanh toán
  const renderPaymentStatus = () => {
    if (!paymentResponse) return null;

    const statusConfig = {
      PENDING: { icon: Clock, color: "bg-yellow-500", text: "Pending payment" },
      PROCESSING: { icon: Clock, color: "bg-blue-500", text: "Processing" },
      COMPLETED: { icon: CheckCircle, color: "bg-green-500", text: "Completed" },
      FAILED: { icon: XCircle, color: "bg-red-500", text: "Failed" }
    };

    const config = statusConfig[paymentResponse.status as keyof typeof statusConfig];
    const IconComponent = config.icon;

    return (
      <Card className="bg-[#1a2332] border-[#2d3748] mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <IconComponent className={`w-5 h-5 ${config.color} rounded-full p-1`} />
            Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Status:</span>
              <Badge variant="secondary" className={config.color}>
                {config.text}
              </Badge>
            </div>
            
            {paymentResponse.transactionId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Transaction ID:</span>
                <span className="text-white font-mono">{paymentResponse.transactionId}</span>
              </div>
            )}

            {paymentResponse.message && (
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-white">{paymentResponse.message}</p>
              </div>
            )}

            {paymentResponse.status === 'PENDING' && (
              <div className="space-y-3">
                {paymentResponse.qrCode && (
                  <div className="text-center">
                    <p className="text-gray-400 mb-2">Scan QR code to complete payment:</p>
                    <img 
                      src={paymentResponse.qrCode} 
                      alt="QR Code" 
                      className="mx-auto w-48 h-48 bg-white p-2 rounded"
                    />
                  </div>
                )}
                
                {paymentResponse.paymentUrl && (
                  <Button 
                    onClick={() => window.open(paymentResponse.paymentUrl, '_blank')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Complete Online Payment
                  </Button>
                )}

                <Button 
                  onClick={handleCheckPaymentStatus}
                  variant="outline"
                  className="w-full"
                >
                  Check Payment Status
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
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

  if (!bookingDetails) {
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
            <p>Loading booking information...</p>
          </div>
        </div>
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
            <h1 className="text-2xl font-bold">Payment</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Status */}
              {renderPaymentStatus()}

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
                      <span className="text-gray-400">Booking Code:</span>
                      <span className="font-mono">{bookingDetails.bookingCode}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Movie:</span>
                      <span>{bookingDetails.movie?.title}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Show Time:</span>
                      <span>{bookingDetails.schedule?.formattedShowDateTime}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Seats:</span>
                      <span>{bookingDetails.seats?.length || 0} seats</span>
                    </div>
                    
                    <Separator className="bg-gray-600" />
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Amount:</span>
                      <span className="text-lg font-bold text-green-400">
                        {bookingDetails.finalAmount?.toLocaleString()}đ
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
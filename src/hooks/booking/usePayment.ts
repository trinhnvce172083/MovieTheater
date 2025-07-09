import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setPaymentInfo } from "@/store/slices/bookingSlice";
import { message } from "antd";
import axiosClient from "@/api/axiosClient";

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
}

export interface PaymentRequest {
  bookingId: number;
  amount: number;
  paymentMethod: string;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface PaymentResponse {
  paymentId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  transactionId?: string;
  paymentUrl?: string;
  qrCode?: string;
  message: string;
}

// Thêm hàm gọi API VNPAY
export const PaymentApiService = {
  createVNPayPayment: (data: {
    bookingId: number;
    language?: string;
    bankCode?: string;
    orderInfo?: string;
    returnUrl?: string;
    cancelUrl?: string;
  }) => axiosClient.post("/payment/vnpay/create", data),
};

export function usePayment() {
  const dispatch = useDispatch();
  const { paymentInfo, finalAmount } = useSelector((state: RootState) => state.booking);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Danh sách phương thức thanh toán
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'ONLINE',
      name: 'Thanh toán trực tuyến',
      icon: '💳',
      description: 'Thanh toán bằng thẻ tín dụng/ghi nợ',
      isAvailable: true
    },
    {
      id: 'WALLET',
      name: 'Ví điện tử',
      icon: '📱',
      description: 'Thanh toán qua ví điện tử (MoMo, ZaloPay, VNPay)',
      isAvailable: true
    },
    {
      id: 'CASH',
      name: 'Tiền mặt',
      icon: '💰',
      description: 'Thanh toán tại quầy',
      isAvailable: true
    },
    {
      id: 'CARD',
      name: 'Thẻ ATM',
      icon: '🏦',
      description: 'Thanh toán bằng thẻ ATM nội địa',
      isAvailable: true
    }
  ];

  // Tạo thanh toán
  const createPayment = useCallback(async (paymentRequest: PaymentRequest): Promise<PaymentResponse> => {
    setLoading(true);
    setError(null);
    try {
      if (paymentRequest.paymentMethod === 'WALLET') {
        // Gọi API VNPAY
        const vnpayReq = {
          bookingId: paymentRequest.bookingId,
          language: 'vn',
          // Có thể truyền thêm bankCode, orderInfo, returnUrl, cancelUrl nếu muốn
        };
        const response = await PaymentApiService.createVNPayPayment(vnpayReq);
        const paymentUrl = response?.data?.data?.paymentUrl;
        if (paymentUrl) {
          return {
            paymentId: String(paymentRequest.bookingId),
            status: 'PENDING',
            paymentUrl,
            message: 'Chuyển hướng đến VNPay để thanh toán',
          };
        } else {
          throw new Error('Không lấy được paymentUrl từ backend');
        }
      }
      // TODO: Gọi API thanh toán thực tế
      // const response = await PaymentApiService.createPayment(paymentRequest);
      
      // Mock response cho demo
      const mockResponse: PaymentResponse = {
        paymentId: `PAY-${Date.now()}`,
        status: 'PENDING',
        transactionId: `TXN-${Date.now()}`,
        paymentUrl: 'https://payment-gateway.com/pay',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        message: 'Vui lòng quét mã QR để thanh toán'
      };

      // Cập nhật thông tin payment vào Redux
      dispatch(setPaymentInfo({
        method: paymentRequest.paymentMethod,
        status: mockResponse.status,
        transactionId: mockResponse.transactionId,
        amount: paymentRequest.amount
      }));

      message.success('Đã tạo thanh toán thành công');
      return mockResponse;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể tạo thanh toán";
      setError(errorMessage);
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Kiểm tra trạng thái thanh toán
  const checkPaymentStatus = useCallback(async (paymentId: string): Promise<PaymentResponse> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Gọi API kiểm tra trạng thái thanh toán
      // const response = await PaymentApiService.checkStatus(paymentId);
      
      // Mock response cho demo
      const mockResponse: PaymentResponse = {
        paymentId,
        status: 'COMPLETED',
        transactionId: `TXN-${Date.now()}`,
        message: 'Thanh toán thành công'
      };

      // Cập nhật trạng thái payment vào Redux
      dispatch(setPaymentInfo({
        method: paymentInfo?.method || 'ONLINE',
        status: mockResponse.status,
        transactionId: mockResponse.transactionId,
        amount: finalAmount
      }));

      return mockResponse;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể kiểm tra trạng thái thanh toán";
      setError(errorMessage);
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dispatch, paymentInfo, finalAmount]);

  // Hủy thanh toán
  const cancelPayment = useCallback(async (paymentId: string) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Gọi API hủy thanh toán
      // await PaymentApiService.cancelPayment(paymentId);
      
      // Cập nhật trạng thái payment vào Redux
      dispatch(setPaymentInfo({
        method: paymentInfo?.method || 'ONLINE',
        status: 'FAILED',
        transactionId: paymentInfo?.transactionId,
        amount: finalAmount
      }));

      message.success('Đã hủy thanh toán');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể hủy thanh toán";
      setError(errorMessage);
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dispatch, paymentInfo, finalAmount]);

  // Hoàn tiền
  const refundPayment = useCallback(async (paymentId: string, amount: number) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Gọi API hoàn tiền
      // await PaymentApiService.refundPayment(paymentId, amount);
      
      message.success(`Đã hoàn tiền ${amount.toLocaleString()}đ`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể hoàn tiền";
      setError(errorMessage);
      message.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy phương thức thanh toán theo ID
  const getPaymentMethod = useCallback((methodId: string) => {
    return paymentMethods.find(method => method.id === methodId);
  }, [paymentMethods]);

  // Kiểm tra phương thức thanh toán có khả dụng không
  const isPaymentMethodAvailable = useCallback((methodId: string) => {
    const method = getPaymentMethod(methodId);
    return method?.isAvailable || false;
  }, [getPaymentMethod]);

  return {
    // State
    paymentInfo,
    paymentMethods,
    loading,
    error,

    // Payment actions
    createPayment,
    checkPaymentStatus,
    cancelPayment,
    refundPayment,

    // Utility functions
    getPaymentMethod,
    isPaymentMethodAvailable,
  };
} 
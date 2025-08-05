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
  language: string;
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
  createVNPayPayment: (data: PaymentRequest) => 
    axiosClient.post("/payment/vnpay/create", data),
};

export function usePayment() {
  const dispatch = useDispatch();
  const { paymentInfo, finalAmount } = useSelector((state: RootState) => state.booking);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Danh sách phương thức thanh toán
  const paymentMethods: PaymentMethod[] = [
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
    }
  ];

  // Tạo thanh toán
  const createPayment = useCallback(async (paymentRequest: PaymentRequest): Promise<PaymentResponse> => {
    setLoading(true);
    setError(null);
    try {
      // Sử dụng API VNPay mới
      const response = await PaymentApiService.createVNPayPayment(paymentRequest);
      

      
      // Try different possible response structures
      const paymentUrl = response?.data?.paymentUrl || 
                        response?.data?.url || 
                        response?.data?.data?.paymentUrl ||
                        response?.data?.data?.url;
      
      if (paymentUrl) {
        const paymentResponse = {
          paymentId: String(paymentRequest.bookingId),
          status: 'PENDING' as const,
          paymentUrl: paymentUrl,
          message: 'Chuyển hướng đến VNPay để thanh toán',
        };
        return paymentResponse;
      } else {
        throw new Error('Không lấy được paymentUrl từ backend');
      }
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
      // Gọi API thật
      const response = await axiosClient.get(`/payment/status/${paymentId}`);
      
      if (response.data?.success) {
        const paymentData = response.data.data;
        const result: PaymentResponse = {
          paymentId,
          status: paymentData.status,
          transactionId: paymentData.transactionId,
          message: paymentData.message || 'Payment status updated'
        };

        // Cập nhật trạng thái payment vào Redux
        dispatch(setPaymentInfo({
          method: paymentInfo?.method || 'ONLINE',
          status: result.status,
          transactionId: result.transactionId,
          amount: finalAmount
        }));

        return result;
      } else {
        // Nếu API response không success, throw error với message từ API
        throw new Error(response.data?.message || 'Failed to check payment status');
      }
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
package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.payment.VNPayPaymentRequestDTO;
import org.springframework.lang.NonNull;

import java.util.Map;

/**
 * VNPay Service Interface
 * Interface cho dịch vụ thanh toán VNPay
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public interface VNPayService {
    
    /**
     * Tạo URL thanh toán VNPay
     * 
     * @param requestDTO thông tin yêu cầu thanh toán
     * @param ipAddress địa chỉ IP của khách hàng
     * @return URL thanh toán
     */
    String createPaymentUrl(@NonNull VNPayPaymentRequestDTO requestDTO, @NonNull String ipAddress);
    
    /**
     * Xử lý phản hồi từ VNPay sau thanh toán
     * 
     * @param response phản hồi từ VNPay
     * @return URL redirect
     */
    String processPaymentResponseUpdate(@NonNull Map<String, String> response);
    
    /**
     * Xử lý IPN (Instant Payment Notification) từ VNPay
     * 
     * @param response thông báo từ VNPay
     * @return phản hồi cho VNPay
     */
    Map<String, String> processIPNResponse(@NonNull Map<String, String> response);
} 
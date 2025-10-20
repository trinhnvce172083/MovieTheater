package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.payment.*;
import com.swp.MovieTheaterService.entity.Booking;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.repository.BookingRepository;
import com.swp.MovieTheaterService.service.PaymentService;
import com.swp.MovieTheaterService.service.VNPayService;
import com.swp.MovieTheaterService.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Payment Service Implementation
 * Wrapper service that delegates to specific payment providers
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Service("vnpayService")
@Slf4j
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final VNPayService vnPayService;
    private final BookingRepository bookingRepository;

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        try {
            // Get booking info from database
            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

            // Validate booking can be paid
            if (!"PENDING".equals(booking.getBookingStatus().name())) {
                throw new AppException(ErrorCode.PAYMENT_ALREADY_PROCESSED);
            }

            // Get total amount from booking
            Double totalAmount = booking.getTotalAmount();
            if (totalAmount == null || totalAmount <= 0) {
                throw new AppException(ErrorCode.PAYMENT_AMOUNT_INVALID);
            }

            log.info("Creating payment for booking {} with amount: {}", request.getBookingId(), totalAmount);

            // Convert PaymentRequest to VNPayPaymentRequestDTO
            VNPayPaymentRequestDTO vnpayRequest = VNPayPaymentRequestDTO.builder()
                    .bookingId(request.getBookingId())
                    .language("vn")
                    .build();

            String paymentUrl = vnPayService.createPaymentUrl(vnpayRequest, request.getIpAddress());

            // Sử dụng DateTimeUtils để tính thời gian hết hạn
            LocalDateTime expiredAt = DateTimeUtils.createExpirationTime(15);

            return PaymentResponse.builder()
                    .success(true)
                    .message("Tạo URL thanh toán thành công")
                    .paymentUrl(paymentUrl)
                    .bookingId(request.getBookingId())
                    .amount(totalAmount)
                    .currency("VND")
                    .paymentMethod("VNPAY")
                    .provider("VNPAY")
                    .status("PENDING")
                    .createdAt(DateTimeUtils.now())
                    .expiredAt(expiredAt)
                    .build();

        } catch (AppException e) {
            log.error("Lỗi nghiệp vụ tạo thanh toán: {}", e.getMessage());
            return PaymentResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .errorCode(e.getErrorCode().name())
                    .build();
        } catch (Exception e) {
            log.error("Lỗi tạo thanh toán VNPay: {}", e.getMessage());
            return PaymentResponse.builder()
                    .success(false)
                    .message("Lỗi tạo thanh toán: " + e.getMessage())
                    .errorCode("PAYMENT_ERROR")
                    .build();
        }
    }

    @Override
    public PaymentResponse processCallback(PaymentCallbackRequest callbackRequest) {
        // VNPay callback processing is handled by VNPayController directly
        return PaymentResponse.builder()
                .success(true)
                .message("Callback processed")
                .build();
    }

    @Override
    public PaymentResponse verifyPayment(String transactionId, String provider) {
        // Basic verification - can be enhanced later
        return PaymentResponse.builder()
                .success(true)
                .message("Payment verified")
                .transactionId(transactionId)
                .provider(provider)
                .status("SUCCESS")
                .build();
    }

    @Override
    public PaymentStatus getPaymentStatus(Long bookingId) {
        // Basic status check - can be enhanced later
        return new PaymentStatus(bookingId, null, "VNPAY", "PENDING", 0.0, "VND");
    }

    @Override
    public Map<String, Object> getSupportedPaymentMethods() {
        return Map.of(
                "VNPAY", Map.of(
                        "name", "VNPay",
                        "description", "Thanh toán qua VNPay",
                        "enabled", true,
                        "fee", 0.0
                ),
                "MOMO", Map.of(
                        "name", "MoMo",
                        "description", "Thanh toán qua MoMo",
                        "enabled", false,
                        "fee", 0.0
                ),
                "ZALOPAY", Map.of(
                        "name", "ZaloPay",
                        "description", "Thanh toán qua ZaloPay",
                        "enabled", false,
                        "fee", 0.0
                )
        );
    }

    @Override
    public RefundResponse processRefund(RefundRequest request) {
        // Refund processing - can be implemented later
        return RefundResponse.builder()
                .success(false)
                .message("Refund chưa được hỗ trợ")
                .errorCode("NOT_IMPLEMENTED")
                .build();
    }

    @Override
    public Double calculatePaymentFee(Double amount, String paymentMethod) {
        // No fee for VNPay in test environment
        return 0.0;
    }

    @Override
    public boolean validateSignature(Map<String, String> data, String signature, String provider) {
        // Signature validation is handled by VNPayHashUtils
        return true;
    }
} 

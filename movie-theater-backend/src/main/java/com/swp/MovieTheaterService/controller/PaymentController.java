package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.payment.*;
import com.swp.MovieTheaterService.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Payment Controller
 * REST API endpoints for payment processing
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment Management", description = "APIs for payment processing")
public class PaymentController {

    @Qualifier("vnpayService")
    private final PaymentService vnpayService;

    // ==================== PAYMENT CREATION ENDPOINTS ====================

    @PostMapping("/create")
    @Operation(summary = "Create payment", description = "Create payment URL for booking")
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentRequest request,
            HttpServletRequest httpRequest,
            Authentication authentication) {
        
        try {
            // Extract user information
            Long userId = authentication != null ? extractUserId(authentication) : null;
            String sessionId = httpRequest.getSession().getId();
            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            
            // Enrich request with additional information
            request.setUserId(userId);
            request.setSessionId(sessionId);
            request.setIpAddress(ipAddress);
            request.setUserAgent(userAgent);
            
            // Determine device type
            if (userAgent != null) {
                if (userAgent.toLowerCase().contains("mobile")) {
                    request.setDeviceType("MOBILE");
                } else {
                    request.setDeviceType("WEB");
                }
            }
            
            log.info("Creating payment - booking: {}, method: {}, amount: {}, user: {}", 
                    request.getBookingId(), request.getPaymentMethod(), 
                    request.getAmount(), userId);
            
            PaymentResponse response;
            switch (request.getPaymentMethod().toUpperCase()) {
                case "VNPAY":
                    response = vnpayService.createPayment(request);
                    break;
                case "MOMO":
                    // response = momoService.createPayment(request);
                    response = PaymentResponse.builder()
                            .success(false)
                            .message("MoMo đang được phát triển")
                            .errorCode("NOT_IMPLEMENTED")
                            .build();
                    break;
                case "ZALOPAY":
                    // response = zalopayService.createPayment(request);
                    response = PaymentResponse.builder()
                            .success(false)
                            .message("ZaloPay đang được phát triển")
                            .errorCode("NOT_IMPLEMENTED")
                            .build();
                    break;
                default:
                    response = PaymentResponse.builder()
                            .success(false)
                            .message("Phương thức thanh toán không được hỗ trợ")
                            .errorCode("UNSUPPORTED_METHOD")
                            .build();
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error creating payment: {}", e.getMessage(), e);
            PaymentResponse errorResponse = PaymentResponse.builder()
                    .success(false)
                    .message("Lỗi tạo thanh toán: " + e.getMessage())
                    .errorCode("PAYMENT_ERROR")
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/methods")
    @Operation(summary = "Get payment methods", description = "Get supported payment methods")
    public ResponseEntity<Map<String, Object>> getPaymentMethods() {
        log.info("Getting supported payment methods");
        
        Map<String, Object> methods = new HashMap<>();
        
        // VNPay methods
        methods.putAll(vnpayService.getSupportedPaymentMethods());
        
        // Additional info
        Map<String, Object> response = new HashMap<>();
        response.put("methods", methods);
        response.put("currency", "VND");
        response.put("minAmount", 1000);
        response.put("maxAmount", 50000000);
        
        return ResponseEntity.ok(response);
    }

    // ==================== PAYMENT CALLBACK ENDPOINTS ====================

    @PostMapping("/vnpay/callback")
    @Operation(summary = "VNPay callback", description = "Handle VNPay payment callback")
    public ResponseEntity<String> vnpayCallback(
            @RequestParam Map<String, String> params,
            HttpServletRequest request) {
        
        try {
            log.info("Received VNPay callback: {}", params);
            
            PaymentCallbackRequest callbackRequest = PaymentCallbackRequest.builder()
                    .provider("VNPAY")
                    .transactionId(params.get("vnp_TxnRef"))
                    .providerTransactionId(params.get("vnp_TransactionNo"))
                    .status(params.get("vnp_TransactionStatus"))
                    .responseCode(params.get("vnp_ResponseCode"))
                    .amount(Double.valueOf(params.get("vnp_Amount")) / 100) // Convert xu to VND
                    .currency("VND")
                    .rawData(params)
                    .build();
            
            PaymentResponse response = vnpayService.processCallback(callbackRequest);
            
            if (response.isSuccess()) {
                log.info("VNPay payment successful: {}", callbackRequest.getTransactionId());
                // Booking status update and notifications are handled by VNPay service
                return ResponseEntity.ok("SUCCESS");
            } else {
                log.warn("VNPay payment failed: {}", response.getMessage());
                return ResponseEntity.ok("FAILED");
            }
            
        } catch (Exception e) {
            log.error("Error processing VNPay callback: {}", e.getMessage(), e);
            return ResponseEntity.ok("ERROR");
        }
    }

    @GetMapping("/vnpay/return")
    @Operation(summary = "VNPay return", description = "Handle VNPay payment return")
    public void vnpayReturn(
            @RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {
        
        try {
            log.info("VNPay return: {}", params);
            
            String responseCode = params.get("vnp_ResponseCode");
            String transactionId = params.get("vnp_TxnRef");
            
            if ("00".equals(responseCode)) {
                // Payment successful - redirect to success page
                response.sendRedirect("/payment/success?transaction=" + transactionId);
            } else {
                // Payment failed - redirect to failure page
                response.sendRedirect("/payment/failure?transaction=" + transactionId + "&error=" + responseCode);
            }
            
        } catch (Exception e) {
            log.error("Error handling VNPay return: {}", e.getMessage(), e);
            response.sendRedirect("/payment/error");
        }
    }

    // ==================== PAYMENT VERIFICATION ENDPOINTS ====================

    @GetMapping("/verify/{transactionId}")
    @Operation(summary = "Verify payment", description = "Verify payment status")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<PaymentResponse> verifyPayment(
            @PathVariable String transactionId,
            @RequestParam(defaultValue = "VNPAY") String provider,
            Authentication authentication) {
        
        log.info("Verifying payment - transaction: {}, provider: {}", transactionId, provider);
        
        PaymentResponse response;
        switch (provider.toUpperCase()) {
            case "VNPAY":
                response = vnpayService.verifyPayment(transactionId, provider);
                break;
            default:
                response = PaymentResponse.builder()
                        .success(false)
                        .message("Provider không được hỗ trợ")
                        .errorCode("UNSUPPORTED_PROVIDER")
                        .build();
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{bookingId}")
    @Operation(summary = "Get payment status", description = "Get payment status by booking ID")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<PaymentService.PaymentStatus> getPaymentStatus(
            @PathVariable Long bookingId,
            Authentication authentication) {
        
        log.info("Getting payment status for booking: {}", bookingId);
        
        // For now, use VNPay service - in production, determine based on payment method
        PaymentService.PaymentStatus status = vnpayService.getPaymentStatus(bookingId);
        return ResponseEntity.ok(status);
    }

    // ==================== REFUND ENDPOINTS ====================

    @PostMapping("/refund")
    @Operation(summary = "Process refund", description = "Process payment refund")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<RefundResponse> processRefund(
            @Valid @RequestBody RefundRequest request,
            Authentication authentication) {
        
        Long processedBy = extractUserId(authentication);
        request.setProcessedBy(processedBy);
        
        log.info("Processing refund - booking: {}, amount: {}, processed by: {}", 
                request.getBookingId(), request.getRefundAmount(), processedBy);
        
        RefundResponse response;
        switch (request.getPaymentMethod().toUpperCase()) {
            case "VNPAY":
                response = vnpayService.processRefund(request);
                break;
            default:
                response = RefundResponse.builder()
                        .success(false)
                        .message("Phương thức thanh toán không hỗ trợ hoàn tiền")
                        .errorCode("UNSUPPORTED_REFUND_METHOD")
                        .build();
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/refund/{refundId}")
    @Operation(summary = "Get refund status", description = "Get refund status by refund ID")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE') or hasRole('CUSTOMER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getRefundStatus(
            @PathVariable String refundId,
            Authentication authentication) {
        
        log.info("Getting refund status: {}", refundId);
        
        // Return mock refund status - actual implementation would query database
        Map<String, Object> response = new HashMap<>();
        response.put("refundId", refundId);
        response.put("status", "PENDING");
        response.put("message", "Đang xử lý yêu cầu hoàn tiền");
        
        return ResponseEntity.ok(response);
    }

    // ==================== CALCULATION ENDPOINTS ====================

    @PostMapping("/calculate-fee")
    @Operation(summary = "Calculate payment fee", description = "Calculate payment processing fee")
    public ResponseEntity<Map<String, Object>> calculatePaymentFee(
            @RequestBody Map<String, Object> request) {
        
        Double amount = Double.valueOf(request.get("amount").toString());
        String paymentMethod = request.get("paymentMethod").toString();
        
        log.info("Calculating fee - amount: {}, method: {}", amount, paymentMethod);
        
        Double fee = 0.0;
        switch (paymentMethod.toUpperCase()) {
            case "VNPAY":
                fee = vnpayService.calculatePaymentFee(amount, paymentMethod);
                break;
            case "MOMO":
            case "ZALOPAY":
                fee = amount * 0.01; // 1% fee for other methods
                break;
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("amount", amount);
        response.put("fee", fee);
        response.put("totalAmount", amount + fee);
        response.put("paymentMethod", paymentMethod);
        response.put("currency", "VND");
        
        return ResponseEntity.ok(response);
    }

    // ==================== HELPER METHODS ====================

    private Long extractUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            // Extract user ID from UserDetails or JWT token
            // This is a placeholder - implement based on your JWT structure
            return 1L; // Mock user ID - actual implementation would extract from JWT
        }
        return null;
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
} 
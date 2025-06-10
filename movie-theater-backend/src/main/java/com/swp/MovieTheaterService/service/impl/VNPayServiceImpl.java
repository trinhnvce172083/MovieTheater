package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.payment.*;
import com.swp.MovieTheaterService.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * VNPay Payment Service Implementation
 * Handles VNPay payment integration
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Slf4j
@Service("vnpayService")
public class VNPayServiceImpl implements PaymentService {
    
    @Value("${vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpUrl;
    
    @Value("${vnpay.api.url:https://sandbox.vnpayment.vn/merchant_webapi/api/transaction}")
    private String vnpApiUrl;
    
    @Value("${vnpay.tmn.code:DEMOSHOP}")
    private String vnpTmnCode;
    
    @Value("${vnpay.hash.secret:RAOEXHYVSDDIIENYWSLDIIZTANUBSAWS}")
    private String vnpHashSecret;
    
    @Value("${vnpay.version:2.1.0}")
    private String vnpVersion;
    
    @Value("${vnpay.command:pay}")
    private String vnpCommand;
    
    @Value("${vnpay.currency:VND}")
    private String vnpCurrencyCode;
    
    @Value("${vnpay.locale:vn}")
    private String vnpLocale;
    
    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        try {
            log.info("Creating VNPay payment for booking: {}", request.getBookingId());
            
            // Validate request
            if (request.getAmount() == null || request.getAmount() < 1000) {
                return PaymentResponse.builder()
                        .success(false)
                        .message("Số tiền thanh toán không hợp lệ")
                        .errorCode("INVALID_AMOUNT")
                        .build();
            }
            
            // Create transaction ID
            String transactionId = generateTransactionId(request.getBookingId());
            
            // Prepare VNPay parameters
            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", vnpVersion);
            vnpParams.put("vnp_Command", vnpCommand);
            vnpParams.put("vnp_TmnCode", vnpTmnCode);
            vnpParams.put("vnp_Amount", String.valueOf(request.getAmount().longValue() * 100)); // VNPay uses xu (1/100 VND)
            vnpParams.put("vnp_CurrCode", vnpCurrencyCode);
            vnpParams.put("vnp_TxnRef", transactionId);
            vnpParams.put("vnp_OrderInfo", request.getDescription() != null ? 
                    request.getDescription() : "Thanh toan ve xem phim - Booking " + request.getBookingId());
            vnpParams.put("vnp_OrderType", request.getOrderType());
            vnpParams.put("vnp_Locale", request.getLanguage() != null ? request.getLanguage() : vnpLocale);
            vnpParams.put("vnp_ReturnUrl", request.getReturnUrl());
            vnpParams.put("vnp_IpAddr", request.getIpAddress() != null ? request.getIpAddress() : "127.0.0.1");
            
            // Add create date and expire date
            String createDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
            vnpParams.put("vnp_CreateDate", createDate);
            
            // Add expire date (15 minutes from now)
            Calendar expireDate = Calendar.getInstance();
            expireDate.add(Calendar.MINUTE, request.getExpireMinutes() != null ? request.getExpireMinutes() : 15);
            String expireDateStr = new SimpleDateFormat("yyyyMMddHHmmss").format(expireDate.getTime());
            vnpParams.put("vnp_ExpireDate", expireDateStr);
            
            // Add bank code if specified
            if (request.getBankCode() != null && !request.getBankCode().isEmpty()) {
                vnpParams.put("vnp_BankCode", request.getBankCode());
            }
            
            // Generate payment URL
            String paymentUrl = buildPaymentUrl(vnpParams);
            
            return PaymentResponse.builder()
                    .success(true)
                    .message("Tạo URL thanh toán VNPay thành công")
                    .transactionId(transactionId)
                    .paymentUrl(paymentUrl)
                    .bookingId(request.getBookingId())
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .paymentMethod("VNPAY")
                    .provider("VNPAY")
                    .status("PENDING")
                    .createdAt(LocalDateTime.now())
                    .expiredAt(LocalDateTime.now().plusMinutes(request.getExpireMinutes() != null ? request.getExpireMinutes() : 15))
                    .returnUrl(request.getReturnUrl())
                    .notifyUrl(request.getNotifyUrl())
                    .build();
            
        } catch (Exception e) {
            log.error("Error creating VNPay payment: {}", e.getMessage(), e);
            return PaymentResponse.builder()
                    .success(false)
                    .message("Lỗi tạo thanh toán VNPay: " + e.getMessage())
                    .errorCode("VNPAY_ERROR")
                    .build();
        }
    }
    
    @Override
    public PaymentResponse processCallback(PaymentCallbackRequest callbackRequest) {
        try {
            log.info("Processing VNPay callback for transaction: {}", callbackRequest.getTransactionId());
            
            Map<String, String> vnpParams = callbackRequest.getRawData();
            
            // Validate signature
            if (!validateVNPaySignature(vnpParams)) {
                log.warn("Invalid VNPay signature for transaction: {}", callbackRequest.getTransactionId());
                return PaymentResponse.builder()
                        .success(false)
                        .message("Chữ ký không hợp lệ")
                        .errorCode("INVALID_SIGNATURE")
                        .transactionId(callbackRequest.getTransactionId())
                        .build();
            }
            
            // Check response code
            String responseCode = vnpParams.get("vnp_ResponseCode");
            String transactionStatus = vnpParams.get("vnp_TransactionStatus");
            
            PaymentResponse.PaymentResponseBuilder responseBuilder = PaymentResponse.builder()
                    .transactionId(callbackRequest.getTransactionId())
                    .providerTransactionId(vnpParams.get("vnp_TransactionNo"))
                    .amount(Double.valueOf(vnpParams.get("vnp_Amount")) / 100) // Convert from xu to VND
                    .currency("VND")
                    .paymentMethod("VNPAY")
                    .provider("VNPAY")
                    .paymentStatus(responseCode)
                    .providerResponse(vnpParams.toString());
            
            if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
                // Payment successful
                responseBuilder
                        .success(true)
                        .message("Thanh toán VNPay thành công")
                        .status("SUCCESS")
                        .paidAt(LocalDateTime.now());
            } else {
                // Payment failed
                String errorMessage = getVNPayErrorMessage(responseCode);
                responseBuilder
                        .success(false)
                        .message("Thanh toán VNPay thất bại: " + errorMessage)
                        .status("FAILED")
                        .errorCode(responseCode);
            }
            
            return responseBuilder.build();
            
        } catch (Exception e) {
            log.error("Error processing VNPay callback: {}", e.getMessage(), e);
            return PaymentResponse.builder()
                    .success(false)
                    .message("Lỗi xử lý callback VNPay: " + e.getMessage())
                    .errorCode("CALLBACK_ERROR")
                    .transactionId(callbackRequest.getTransactionId())
                    .build();
        }
    }
    
    @Override
    public PaymentResponse verifyPayment(String transactionId, String provider) {
        // VNPay verification implementation
        log.info("Verifying VNPay payment for transaction: {}", transactionId);
        
        // This would typically make an API call to VNPay to verify the transaction
        // For now, return a basic response
        return PaymentResponse.builder()
                .success(true)
                .message("Xác thực giao dịch VNPay")
                .transactionId(transactionId)
                .provider("VNPAY")
                .build();
    }
    
    @Override
    public RefundResponse processRefund(RefundRequest request) {
        try {
            log.info("Processing VNPay refund for transaction: {}", request.getTransactionId());
            
            // VNPay refund implementation
            // This would involve calling VNPay's refund API
            
            return RefundResponse.builder()
                    .success(true)
                    .message("Yêu cầu hoàn tiền VNPay đã được gửi")
                    .refundId(generateRefundId())
                    .transactionId(request.getTransactionId())
                    .bookingId(request.getBookingId())
                    .refundAmount(request.getRefundAmount())
                    .finalRefundAmount(request.getRefundAmount()) // No fee for demo
                    .status("PENDING")
                    .paymentMethod("VNPAY")
                    .provider("VNPAY")
                    .reason(request.getReason())
                    .requestedAt(LocalDateTime.now())
                    .expectedCompletionDate(LocalDateTime.now().plusDays(3))
                    .processingMethod(request.getIsAutomatic() ? "AUTO" : "MANUAL")
                    .build();
            
        } catch (Exception e) {
            log.error("Error processing VNPay refund: {}", e.getMessage(), e);
            return RefundResponse.builder()
                    .success(false)
                    .message("Lỗi xử lý hoàn tiền VNPay: " + e.getMessage())
                    .errorCode("REFUND_ERROR")
                    .transactionId(request.getTransactionId())
                    .build();
        }
    }
    
    @Override
    public PaymentStatus getPaymentStatus(Long bookingId) {
        return new PaymentStatus(bookingId, null, "VNPAY", "PENDING", 0.0, "VND");
    }
    
    @Override
    public Map<String, Object> getSupportedPaymentMethods() {
        Map<String, Object> methods = new HashMap<>();
        methods.put("VNPAY", Map.of(
                "name", "VNPay",
                "description", "Cổng thanh toán VNPay",
                "fee", "0%",
                "minAmount", 1000,
                "maxAmount", 50000000,
                "supportedBanks", Arrays.asList("VNPAYQR", "VNBANK", "INTCARD")
        ));
        return methods;
    }
    
    @Override
    public Double calculatePaymentFee(Double amount, String paymentMethod) {
        // VNPay typically charges no fee for QR payments
        return 0.0;
    }
    
    @Override
    public boolean validateSignature(Map<String, String> data, String signature, String provider) {
        return validateVNPaySignature(data);
    }
    
    // Private helper methods
    
    private String generateTransactionId(Long bookingId) {
        return "MOVIE_" + bookingId + "_" + System.currentTimeMillis();
    }
    
    private String generateRefundId() {
        return "REFUND_" + System.currentTimeMillis();
    }
    
    private String buildPaymentUrl(Map<String, String> params) throws Exception {
        // Sort parameters
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        
        for (String fieldName : fieldNames) {
            String fieldValue = params.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                // Build hash data
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString()))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                
                if (!fieldName.equals(fieldNames.get(fieldNames.size() - 1))) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }
        
        // Generate secure hash
        String secureHash = hmacSHA512(vnpHashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);
        
        return vnpUrl + "?" + query.toString();
    }
    
    private boolean validateVNPaySignature(Map<String, String> params) {
        try {
            String receivedSignature = params.remove("vnp_SecureHash");
            
            // Sort and build hash data
            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);
            
            StringBuilder hashData = new StringBuilder();
            for (String fieldName : fieldNames) {
                String fieldValue = params.get(fieldName);
                if (fieldValue != null && fieldValue.length() > 0) {
                    hashData.append(fieldName).append('=').append(fieldValue);
                    if (!fieldName.equals(fieldNames.get(fieldNames.size() - 1))) {
                        hashData.append('&');
                    }
                }
            }
            
            String calculatedSignature = hmacSHA512(vnpHashSecret, hashData.toString());
            return calculatedSignature.equals(receivedSignature);
            
        } catch (Exception e) {
            log.error("Error validating VNPay signature: {}", e.getMessage());
            return false;
        }
    }
    
    private String hmacSHA512(String key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(), "HmacSHA512");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes());
        
        StringBuilder result = new StringBuilder();
        for (byte b : hash) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
    
    private String getVNPayErrorMessage(String errorCode) {
        switch (errorCode) {
            case "07": return "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).";
            case "09": return "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.";
            case "10": return "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
            case "11": return "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.";
            case "12": return "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.";
            case "13": return "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).";
            case "24": return "Giao dịch không thành công do: Khách hàng hủy giao dịch";
            case "51": return "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.";
            case "65": return "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.";
            case "75": return "Ngân hàng thanh toán đang bảo trì.";
            case "79": return "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.";
            default: return "Giao dịch thất bại";
        }
    }
} 
package com.swp.MovieTheaterService.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.swp.MovieTheaterService.utils.DateTimeUtils;

/**
 * Payment Response DTO
 * Data Transfer Object for payment responses
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    
    private boolean success;
    private String message;
    private String errorCode;
    
    // Payment information
    private String transactionId;
    private String paymentUrl;
    private String qrCodeUrl;
    private String deepLink; // For mobile app integration
    
    // Booking information
    private Long bookingId;
    private String bookingCode;
    private Double amount;
    private String currency;
    
    // Provider information
    private String paymentMethod;
    private String provider;
    private String providerTransactionId;
    
    // Status information
    private String status; // PENDING, SUCCESS, FAILED, CANCELLED
    private String paymentStatus; // Provider-specific status
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime expiredAt;
    private LocalDateTime paidAt;
    
    // Additional information
    private String description;
    private String returnUrl;
    private String notifyUrl;
    
    // Fee information
    private Double paymentFee;
    private Double totalAmount; // amount + fee
    
    // Provider response data
    private String providerResponse;
    private String signature;
    
    // Helper methods
    public boolean isSuccess() {
        return success && "SUCCESS".equals(status);
    }
    
    public boolean isPending() {
        return "PENDING".equals(status);
    }
    
    public boolean isFailed() {
        return "FAILED".equals(status) || "CANCELLED".equals(status);
    }
    
    public boolean isExpired() {
        return DateTimeUtils.isExpired(expiredAt);
    }

    public long getMinutesUntilExpiration() {
        return DateTimeUtils.getMinutesUntilExpiration(expiredAt);
    }

    public String getFormattedExpirationTime() {
        return DateTimeUtils.formatForDisplay(expiredAt);
    }
    
    public String getDisplayStatus() {
        if (status == null) return "Không xác định";
        
        switch (status) {
            case "PENDING": return "Đang xử lý";
            case "SUCCESS": return "Thành công";
            case "FAILED": return "Thất bại";
            case "CANCELLED": return "Đã hủy";
            default: return status;
        }
    }
    
    public String getFormattedAmount() {
        if (amount == null) return "";
        return String.format("%,.0f %s", amount, currency != null ? currency : "VND");
    }
}
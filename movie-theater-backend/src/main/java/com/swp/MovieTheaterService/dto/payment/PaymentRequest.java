package com.swp.MovieTheaterService.dto.payment;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payment Request DTO
 * Data Transfer Object for payment requests
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    
    @NotNull(message = "Booking ID không được để trống")
    private Long bookingId;
    
    // Amount will be retrieved from booking - optional in request
    @DecimalMin(value = "1000.0", message = "Số tiền thanh toán tối thiểu là 1,000 VND")
    @DecimalMax(value = "50000000.0", message = "Số tiền thanh toán tối đa là 50,000,000 VND")
    private Double amount;
    
    @Builder.Default
    private String currency = "VND";
    
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    @Pattern(regexp = "^(VNPAY|MOMO|ZALOPAY|BANK_TRANSFER)$", 
             message = "Phương thức thanh toán không hợp lệ")
    private String paymentMethod;
    
    // Return URL is optional - will use default if not provided
    @Pattern(regexp = "^https?://.*", message = "URL return phải là HTTP/HTTPS hợp lệ")
    private String returnUrl;
    
    @Pattern(regexp = "^https?://.*", message = "URL notify phải là HTTP/HTTPS hợp lệ")
    private String notifyUrl;
    
    @Size(min = 10, max = 255, message = "Mô tả giao dịch phải từ 10-255 ký tự")
    private String description;
    
    // VNPay specific fields
    @Builder.Default
    private String orderType = "other";
    
    @Pattern(regexp = "^(vn|en)$", message = "Ngôn ngữ chỉ hỗ trợ 'vn' hoặc 'en'")
    @Builder.Default
    private String language = "vn";
    
    // Bank code for direct bank payment
    private String bankCode;
    
    // IP address for security
    @Pattern(regexp = "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$|^::1$|^localhost$", 
             message = "Địa chỉ IP không hợp lệ")
    private String ipAddress;
    
    // Customer information for guest booking
    @Size(max = 100, message = "Họ tên khách hàng không được quá 100 ký tự")
    private String customerName;
    
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", 
             message = "Email không hợp lệ")
    private String customerEmail;
    
    @Pattern(regexp = "^(\\+84|0)[3-9][0-9]{8}$", 
             message = "Số điện thoại Việt Nam không hợp lệ")
    private String customerPhone;
    
    // Expiration settings
    @Min(value = 5, message = "Thời gian hết hạn tối thiểu là 5 phút")
    @Max(value = 60, message = "Thời gian hết hạn tối đa là 60 phút")
    @Builder.Default
    private Integer expireMinutes = 15;
    
    // User ID for authenticated users
    private Long userId;
    
    // Session ID for tracking
    private String sessionId;
    
    // Device information
    private String userAgent;
    private String deviceType; // WEB, MOBILE, APP
    
    // Promotion/discount information
    private String promoCode;
    private Double discountAmount;
    
    // Additional metadata
    private java.util.Map<String, String> metadata;
    
    // Helper methods
    public boolean isGuestPayment() {
        return userId == null;
    }
    
    public boolean hasDiscount() {
        return discountAmount != null && discountAmount > 0;
    }
    
    public Double getFinalAmount() {
        if (hasDiscount()) {
            return Math.max(amount - discountAmount, 1000.0); // Minimum 1,000 VND
        }
        return amount;
    }
    
    public String getFormattedAmount() {
        return String.format("%,.0f %s", getFinalAmount(), currency);
    }
    
    public boolean isVNPayPayment() {
        return "VNPAY".equals(paymentMethod);
    }
    
    public boolean isMobilePayment() {
        return "MOBILE".equals(deviceType);
    }
}
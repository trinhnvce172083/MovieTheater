package com.swp.MovieTheaterService.dto.payment;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Refund Request DTO
 * Data Transfer Object for payment refund requests
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundRequest {
    
    @NotNull(message = "Booking ID không được để trống")
    private Long bookingId;
    
    @NotBlank(message = "Transaction ID không được để trống")
    private String transactionId;
    
    @NotNull(message = "Số tiền hoàn không được để trống")
    @DecimalMin(value = "1000.0", message = "Số tiền hoàn tối thiểu là 1,000 VND")
    private Double refundAmount;
    
    @NotBlank(message = "Lý do hoàn tiền không được để trống")
    @Size(min = 10, max = 500, message = "Lý do hoàn tiền phải từ 10-500 ký tự")
    private String reason;
    
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;
    
    private String currency = "VND";
    
    // Admin information
    private Long processedBy; // Admin/Employee ID
    private String adminNotes;
    
    // Automatic or manual refund
    private Boolean isAutomatic = false;
    
    // Bank information for refund (if needed)
    private String bankAccount;
    private String bankName;
    private String accountHolder;
} 
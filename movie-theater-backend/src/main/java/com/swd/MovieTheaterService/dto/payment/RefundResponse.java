package com.swp.MovieTheaterService.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Refund Response DTO
 * Data Transfer Object for payment refund responses
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundResponse {

    private boolean success;
    private String message;
    private String errorCode;

    // Refund information
    private String refundId;
    private String transactionId;
    private String refundTransactionId;

    // Booking information
    private Long bookingId;
    private String bookingCode;

    // Amount information
    private Double originalAmount;
    private Double refundAmount;
    private Double refundFee;
    private Double finalRefundAmount;

    // Status information
    private String status; // PENDING, SUCCESS, FAILED, PROCESSING
    private String refundStatus; // Provider-specific status

    // Provider information
    private String paymentMethod;
    private String provider;
    private String providerRefundId;

    // Timestamps
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
    private LocalDateTime completedAt;
    private LocalDateTime expectedCompletionDate;

    // Processing information
    private String reason;
    private String adminNotes;
    private Long processedBy;
    private String processingMethod; // AUTO, MANUAL

    // Bank information
    private String bankAccount;
    private String bankName;
    private String accountHolder;

    // Provider response
    private String providerResponse;

    // Helper methods
    public boolean isSuccess() {
        return success && "SUCCESS".equals(status);
    }

    public boolean isPending() {
        return "PENDING".equals(status) || "PROCESSING".equals(status);
    }

    public boolean isFailed() {
        return "FAILED".equals(status);
    }

    public String getDisplayStatus() {
        if (status == null) return "Không xác định";

        switch (status) {
            case "PENDING":
                return "Chờ xử lý";
            case "PROCESSING":
                return "Đang xử lý";
            case "SUCCESS":
                return "Hoàn tiền thành công";
            case "FAILED":
                return "Hoàn tiền thất bại";
            default:
                return status;
        }
    }

    public String getFormattedRefundAmount() {
        if (finalRefundAmount == null) return "";
        return String.format("%,.0f VND", finalRefundAmount);
    }

    public int getEstimatedDays() {
        if (paymentMethod == null) return 7; // Default 7 days

        switch (paymentMethod.toUpperCase()) {
            case "VNPAY":
            case "MOMO":
            case "ZALOPAY":
                return 3; // 3 days for e-wallets
            case "BANK_TRANSFER":
                return 5; // 5 days for bank transfers
            default:
                return 7; // 7 days for others
        }
    }
} 

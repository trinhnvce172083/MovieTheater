package com.swp.MovieTheaterService.enums;

/**
 * PaymentStatus Enum - Payment Status
 * Defines different payment statuses in the system
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public enum PaymentStatus {
    PENDING("Pending", "Chờ thanh toán"),
    PROCESSING("Processing", "Đang xử lý"),
    SUCCESS("Success", "Thành công"),
    FAILED("Failed", "Thất bại"),
    CANCELLED("Cancelled", "Đã hủy"),
    REFUNDED("Refunded", "Đã hoàn tiền"),
    PARTIAL_REFUNDED("Partial Refunded", "Hoàn tiền một phần"),
    EXPIRED("Expired", "Hết hạn");

    private final String code;
    private final String displayName;

    PaymentStatus(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    // Business logic methods
    public boolean isPending() {
        return this == PENDING || this == PROCESSING;
    }

    public boolean isSuccess() {
        return this == SUCCESS;
    }

    public boolean isFailed() {
        return this == FAILED || this == CANCELLED || this == EXPIRED;
    }

    public boolean isRefunded() {
        return this == REFUNDED || this == PARTIAL_REFUNDED;
    }

    public boolean isCompleted() {
        return this == SUCCESS || this == REFUNDED || this == PARTIAL_REFUNDED;
    }

    public boolean canBeRefunded() {
        return this == SUCCESS;
    }

    public boolean canBeCancelled() {
        return this == PENDING || this == PROCESSING;
    }

    // Static helper methods
    public static PaymentStatus fromCode(String code) {
        if (code == null) return null;

        for (PaymentStatus status : values()) {
            if (status.code.equalsIgnoreCase(code)) {
                return status;
            }
        }
        return null;
    }

    public static PaymentStatus fromString(String status) {
        if (status == null) return null;

        try {
            return PaymentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return fromCode(status);
        }
    }

    // Payment method specific logic
    public int getRefundDays(String paymentMethod) {
        if (!canBeRefunded()) return 0;

        if (paymentMethod == null) return 7;

        switch (paymentMethod.toUpperCase()) {
            case "VNPAY":
            case "MOMO":
            case "ZALOPAY":
                return 3; // E-wallets: 3 days
            case "BANK_TRANSFER":
                return 5; // Bank: 5 days  
            case "CREDIT_CARD":
            case "DEBIT_CARD":
                return 7; // Cards: 7 days
            default:
                return 7; // Default: 7 days
        }
    }

    // Color coding for UI
    public String getColorClass() {
        switch (this) {
            case PENDING:
            case PROCESSING:
                return "warning"; // Yellow
            case SUCCESS:
            case REFUNDED:
                return "success"; // Green
            case FAILED:
            case CANCELLED:
            case EXPIRED:
                return "danger"; // Red
            case PARTIAL_REFUNDED:
                return "info"; // Blue
            default:
                return "secondary"; // Gray
        }
    }
} 

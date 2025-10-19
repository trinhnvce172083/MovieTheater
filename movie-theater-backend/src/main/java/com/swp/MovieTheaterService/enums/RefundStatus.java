package com.swp.MovieTheaterService.enums;

/**
 * RefundStatus Enum - Refund Status
 * Defines different refund statuses in the system
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public enum RefundStatus {
    NOT_REQUESTED("Not Requested", "Chưa yêu cầu hoàn tiền"),
    REQUESTED("Requested", "Đã yêu cầu hoàn tiền"),
    PROCESSING("Processing", "Đang xử lý hoàn tiền"),
    APPROVED("Approved", "Đã duyệt hoàn tiền"),
    REJECTED("Rejected", "Từ chối hoàn tiền"),
    COMPLETED("Completed", "Hoàn tiền thành công"),
    FAILED("Failed", "Hoàn tiền thất bại"),
    PARTIAL("Partial", "Hoàn tiền một phần");

    private final String code;
    private final String displayName;

    RefundStatus(String code, String displayName) {
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
    public boolean canRequestRefund() {
        return this == NOT_REQUESTED;
    }

    public boolean canCancelRefund() {
        return this == REQUESTED || this == PROCESSING;
    }

    public boolean isPending() {
        return this == REQUESTED || this == PROCESSING || this == APPROVED;
    }

    public boolean isCompleted() {
        return this == COMPLETED || this == PARTIAL;
    }

    public boolean isFailed() {
        return this == REJECTED || this == FAILED;
    }

    public boolean isProcessing() {
        return this == PROCESSING || this == APPROVED;
    }

    // Static helper methods
    public static RefundStatus fromString(String status) {
        if (status == null) return NOT_REQUESTED;
        
        try {
            return RefundStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            for (RefundStatus refundStatus : values()) {
                if (refundStatus.code.equalsIgnoreCase(status)) {
                    return refundStatus;
                }
            }
            return NOT_REQUESTED;
        }
    }

    // Refund policy calculation
    public double calculateRefundPercentage(long hoursBeforeShow) {
        if (this == REJECTED || this == FAILED) {
            return 0.0;
        }

        // Refund policy based on time before show
        if (hoursBeforeShow >= 24) {
            return 1.0; // 100% refund
        } else if (hoursBeforeShow >= 2) {
            return 0.5; // 50% refund
        } else {
            return 0.0; // No refund
        }
    }

    // UI helpers
    public String getColorClass() {
        switch (this) {
            case NOT_REQUESTED:
                return "secondary"; // Gray
            case REQUESTED:
            case PROCESSING:
            case APPROVED:
                return "warning"; // Yellow
            case COMPLETED:
            case PARTIAL:
                return "success"; // Green
            case REJECTED:
            case FAILED:
                return "danger"; // Red
            default:
                return "secondary";
        }
    }

    public String getIconClass() {
        switch (this) {
            case NOT_REQUESTED:
                return "fa-minus-circle";
            case REQUESTED:
                return "fa-clock";
            case PROCESSING:
                return "fa-spinner fa-spin";
            case APPROVED:
                return "fa-check";
            case REJECTED:
                return "fa-times";
            case COMPLETED:
                return "fa-check-circle";
            case FAILED:
                return "fa-exclamation-triangle";
            case PARTIAL:
                return "fa-check-circle";
            default:
                return "fa-question";
        }
    }

    public String getDescription() {
        switch (this) {
            case NOT_REQUESTED:
                return "Chưa có yêu cầu hoàn tiền";
            case REQUESTED:
                return "Yêu cầu hoàn tiền đang chờ xử lý";
            case PROCESSING:
                return "Đang xử lý yêu cầu hoàn tiền";
            case APPROVED:
                return "Yêu cầu hoàn tiền đã được duyệt";
            case REJECTED:
                return "Yêu cầu hoàn tiền bị từ chối";
            case COMPLETED:
                return "Hoàn tiền thành công";
            case FAILED:
                return "Hoàn tiền thất bại";
            case PARTIAL:
                return "Hoàn tiền một phần thành công";
            default:
                return "";
        }
    }

    // Workflow methods
    public RefundStatus nextStatus() {
        switch (this) {
            case NOT_REQUESTED:
                return REQUESTED;
            case REQUESTED:
                return PROCESSING;
            case PROCESSING:
                return APPROVED;
            case APPROVED:
                return COMPLETED;
            default:
                return this; // No change for terminal states
        }
    }

    public boolean canTransitionTo(RefundStatus newStatus) {
        switch (this) {
            case NOT_REQUESTED:
                return newStatus == REQUESTED;
            case REQUESTED:
                return newStatus == PROCESSING || newStatus == REJECTED;
            case PROCESSING:
                return newStatus == APPROVED || newStatus == REJECTED;
            case APPROVED:
                return newStatus == COMPLETED || newStatus == FAILED || newStatus == PARTIAL;
            default:
                return false; // Terminal states cannot transition
        }
    }
} 

package com.swp.MovieTheaterService.enums;

import java.time.LocalDateTime;

/**
 * CheckInStatus Enum - Check-in Status
 * Defines different check-in statuses for bookings
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public enum CheckInStatus {
    NOT_ELIGIBLE("Not Eligible", "Chưa đủ điều kiện"),
    ELIGIBLE("Eligible", "Có thể check-in"),
    CHECKED_IN("Checked In", "Đã check-in"),
    EXPIRED("Expired", "Hết hạn check-in"),
    CANCELLED("Cancelled", "Đã hủy");

    private final String code;
    private final String displayName;

    CheckInStatus(String code, String displayName) {
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
    public boolean canCheckIn() {
        return this == ELIGIBLE;
    }

    public boolean isCheckedIn() {
        return this == CHECKED_IN;
    }

    public boolean isExpired() {
        return this == EXPIRED;
    }

    public boolean isCancelled() {
        return this == CANCELLED;
    }

    public boolean isActive() {
        return this == ELIGIBLE || this == CHECKED_IN;
    }

    // Static helper methods
    public static CheckInStatus fromBookingState(
            BookingStatus bookingStatus, 
            boolean isCheckedIn, 
            LocalDateTime showDateTime) {
        
        if (bookingStatus == BookingStatus.CANCELLED) {
            return CANCELLED;
        }

        if (isCheckedIn) {
            return CHECKED_IN;
        }

        if (bookingStatus != BookingStatus.PAID) {
            return NOT_ELIGIBLE;
        }

        LocalDateTime now = LocalDateTime.now();
        
        // Check-in window: 30 minutes before show time until show time
        LocalDateTime checkInStart = showDateTime.minusMinutes(30);
        LocalDateTime checkInEnd = showDateTime;

        if (now.isBefore(checkInStart)) {
            return NOT_ELIGIBLE; // Too early
        } else if (now.isAfter(checkInEnd)) {
            return EXPIRED; // Too late
        } else {
            return ELIGIBLE; // Can check-in now
        }
    }

    public static CheckInStatus fromString(String status) {
        if (status == null) return NOT_ELIGIBLE;
        
        try {
            return CheckInStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return NOT_ELIGIBLE;
        }
    }

    // UI helpers
    public String getColorClass() {
        switch (this) {
            case NOT_ELIGIBLE:
                return "secondary"; // Gray
            case ELIGIBLE:
                return "success"; // Green
            case CHECKED_IN:
                return "primary"; // Blue
            case EXPIRED:
                return "warning"; // Yellow
            case CANCELLED:
                return "danger"; // Red
            default:
                return "secondary";
        }
    }

    public String getIconClass() {
        switch (this) {
            case NOT_ELIGIBLE:
                return "fa-clock"; // Clock icon
            case ELIGIBLE:
                return "fa-check-circle"; // Check circle
            case CHECKED_IN:
                return "fa-user-check"; // User checked
            case EXPIRED:
                return "fa-exclamation-triangle"; // Warning
            case CANCELLED:
                return "fa-times-circle"; // X circle
            default:
                return "fa-question";
        }
    }

    // Business rules
    public boolean allowsRefund() {
        return this != CHECKED_IN && this != EXPIRED;
    }

    public boolean allowsCancellation() {
        return this != CHECKED_IN && this != EXPIRED && this != CANCELLED;
    }

    public String getInstructions() {
        switch (this) {
            case NOT_ELIGIBLE:
                return "Check-in sẽ mở 30 phút trước giờ chiếu";
            case ELIGIBLE:
                return "Quét mã QR hoặc nhập mã booking để check-in";
            case CHECKED_IN:
                return "Đã check-in thành công. Vui lòng vào phòng chiếu";
            case EXPIRED:
                return "Đã quá thời gian check-in";
            case CANCELLED:
                return "Booking đã bị hủy";
            default:
                return "";
        }
    }
} 

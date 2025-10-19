package com.swp.MovieTheaterService.enums;

/**
 * BookingStatus Enum - Booking Status
 * Defines different booking statuses in the system
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public enum BookingStatus {
    PENDING("Pending"),
    CONFIRMED("Confirmed"),
    PAID("Paid"),
    CANCELLED("Cancelled"),
    COMPLETED("Completed");

    private final String displayName;

    BookingStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isPending() {
        return this == PENDING;
    }

    public boolean isConfirmed() {
        return this == CONFIRMED;
    }

    public boolean isPaid() {
        return this == PAID;
    }

    public boolean isCancelled() {
        return this == CANCELLED;
    }

    public boolean isCompleted() {
        return this == COMPLETED;
    }

    public boolean isActive() {
        return this == PENDING || this == CONFIRMED || this == PAID;
    }
} 

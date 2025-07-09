package com.swp.MovieTheaterService.entity;

import com.swp.MovieTheaterService.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Booking Entity - Booking Management
 * Represents ticket bookings in the system
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Entity
@Table(name = "movietheater_booking")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Booking extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "booking_code", unique = true, nullable = false, length = 50)
    private String bookingCode;

    @Column(name = "booking_date", nullable = false)
    private LocalDateTime bookingDate;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "discount_amount")
    private Double discountAmount = 0.0;

    @Column(name = "final_amount", nullable = false)
    private Double finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false)
    private BookingStatus bookingStatus = BookingStatus.PENDING;

    @Column(name = "payment_method", length = 20)
    private String paymentMethod; // CASH, CARD, ONLINE, WALLET

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    // Customer information (for guest bookings)
    @Column(name = "customer_name", length = 100)
    private String customerName;

    @Column(name = "customer_email", length = 100)
    private String customerEmail;

    @Column(name = "customer_phone", length = 15)
    private String customerPhone;

    // Booking details
    @Column(name = "seat_count", nullable = false)
    private Integer seatCount;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Cancellation information
    @Column(name = "cancellation_date")
    private LocalDateTime cancellationDate;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "refund_amount")
    private Double refundAmount;

    // QR Code for ticket validation
    @Column(name = "qr_code")
    private String qrCode;

    @Column(name = "is_checked_in", nullable = false)
    private Boolean isCheckedIn = false;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account; // null for guest bookings

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BookingSeat> bookingSeats;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BookingConcession> bookingConcessions;

    @Column(name = "is_active")
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Business methods
    public boolean isPending() {
        return bookingStatus == BookingStatus.PENDING;
    }

    public boolean isConfirmed() {
        return bookingStatus == BookingStatus.CONFIRMED;
    }

    public boolean isPaid() {
        return bookingStatus == BookingStatus.PAID;
    }

    public boolean isCancelled() {
        return bookingStatus == BookingStatus.CANCELLED;
    }

    public boolean isCompleted() {
        return bookingStatus == BookingStatus.COMPLETED;
    }

    public boolean isGuestBooking() {
        return account == null;
    }

    public boolean isMemberBooking() {
        return account != null;
    }

    public String getCustomerDisplayName() {
        if (account != null) {
            return account.getFullName();
        }
        return customerName;
    }

    public String getCustomerDisplayEmail() {
        if (account != null) {
            return account.getEmail();
        }
        return customerEmail;
    }

    public String getCustomerDisplayPhone() {
        if (account != null) {
            return account.getPhoneNumber();
        }
        return customerPhone;
    }

    public boolean canBeCancelled() {
        if (schedule == null || schedule.getShowDateTime() == null) {
            return false;
        }
        return (isPending() || isConfirmed() || isPaid()) &&
                schedule.getShowDateTime().isAfter(LocalDateTime.now().plusHours(2));
    }

    public boolean canBeCheckedIn() {
        if (schedule == null || schedule.getShowDateTime() == null) {
            return false;
        }
        return isPaid() && !isCheckedIn &&
                schedule.getShowDateTime().isAfter(LocalDateTime.now()) &&
                schedule.getShowDateTime().isBefore(LocalDateTime.now().plusMinutes(30));
    }

    public double getDiscountPercentage() {
        if (totalAmount == 0)
            return 0.0;
        return (discountAmount / totalAmount) * 100;
    }

    public void applyDiscount(double discountAmount) {
        this.discountAmount = discountAmount;
        this.finalAmount = this.totalAmount - discountAmount;
        if (this.finalAmount < 0) {
            this.finalAmount = 0.0;
        }
    }

    public void confirmPayment(String paymentMethod, String paymentReference) {
        this.paymentMethod = paymentMethod;
        this.paymentReference = paymentReference;
        this.paymentDate = LocalDateTime.now();
        this.bookingStatus = BookingStatus.PAID;
    }

    public void checkIn() {
        if (canBeCheckedIn()) {
            this.isCheckedIn = true;
            this.checkInTime = LocalDateTime.now();
            this.bookingStatus = BookingStatus.COMPLETED;
        } else {
            throw new IllegalStateException("Cannot check in this booking");
        }
    }

    public void cancel(String reason) {
        if (canBeCancelled()) {
            this.bookingStatus = BookingStatus.CANCELLED;
            this.cancellationDate = LocalDateTime.now();
            this.cancellationReason = reason;

            // Calculate refund amount based on cancellation policy
            calculateRefund();
        } else {
            throw new IllegalStateException("Cannot cancel this booking");
        }
    }

    private void calculateRefund() {
        LocalDateTime showTime = schedule.getShowDateTime();
        LocalDateTime now = LocalDateTime.now();
        long hoursUntilShow = java.time.Duration.between(now, showTime).toHours();

        if (hoursUntilShow >= 24) {
            refundAmount = finalAmount; // Full refund
        } else if (hoursUntilShow >= 2) {
            refundAmount = finalAmount * 0.5; // 50% refund
        } else {
            refundAmount = 0.0; // No refund
        }
    }

    public boolean getIsActive() {
        return isActive;
    }

    public boolean getActive() {
        return isActive;
    }

    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }

    public void setActive(boolean active) {
        this.isActive = active;
    }
}
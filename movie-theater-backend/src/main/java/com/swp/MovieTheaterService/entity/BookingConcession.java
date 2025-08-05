package com.swp.MovieTheaterService.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * BookingConcession Entity - Liên kết đặt vé với đồ ăn/uống đơn giản
 * Represents the relationship between bookings and concession items
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Entity
@Table(name = "movietheater_booking_concession")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingConcession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_concession_id")
    private Long bookingConcessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore  // Prevent circular reference: Booking -> BookingConcession -> Booking
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concession_id", nullable = false)
    private Concession concession;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Business methods

    /**
     * Calculate total price based on quantity and unit price
     */
    @PrePersist
    @PreUpdate
    private void calculateTotalPrice() {
        if (unitPrice != null && quantity != null) {
            totalPrice = unitPrice.multiply(new BigDecimal(quantity));
        }
    }

    public String getTotalPriceDisplay() {
        return String.format("%,.0f VND", totalPrice);
    }

    public String getUnitPriceDisplay() {
        return String.format("%,.0f VND", unitPrice);
    }

    public String getOrderSummary() {
        if (concession == null) return "";
        return String.format("%dx %s - %s", 
            quantity, 
            concession.getFullName(), 
            getTotalPriceDisplay()
        );
    }
} 
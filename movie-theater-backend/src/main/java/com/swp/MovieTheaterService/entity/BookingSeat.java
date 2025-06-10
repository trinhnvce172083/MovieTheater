package com.swp.MovieTheaterService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * BookingSeat Entity - Booking Seat Junction
 * Junction table for many-to-many relationship between Booking and Seat
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Entity
@Table(name = "movietheater_booking_seat",
       uniqueConstraints = @UniqueConstraint(columnNames = {"booking_id", "seat_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BookingSeat extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_seat_id")
    private Long bookingSeatId;

    @Column(name = "seat_price", nullable = false)
    private Double seatPrice;

    @Column(name = "seat_type", length = 20)
    private String seatType; // Copy from seat for historical record

    @Column(name = "seat_number", length = 10)
    private String seatNumber; // Copy from seat for historical record

    @Column(name = "status", length = 20)
    private String status = "BOOKED"; // BOOKED, RESERVED, CANCELLED

    @Column(name = "seat_id_reference") 
    private Long seatId; // Reference to seat ID for direct access

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "is_active")
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    // Business methods
    public String getDisplayInfo() {
        return seatNumber + " (" + seatType + ") - $" + seatPrice;
    }

    public boolean isVIPSeat() {
        return "VIP".equals(seatType);
    }

    public boolean isCoupleSeat() {
        return "COUPLE".equals(seatType);
    }

    public boolean isPremiumSeat() {
        return isVIPSeat() || isCoupleSeat();
    }

    // Getter và setter cho trường is_active
    public boolean getIsActive() {
        return active;
    }
    
    public void setIsActive(boolean isActive) {
        this.active = isActive;
    }
} 
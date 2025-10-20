package com.swp.MovieTheaterService.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.swp.MovieTheaterService.enums.SeatStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Seat Entity - Seat Management
 * Represents seats in cinema rooms
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Entity
@Table(name = "movietheater_seat",
        uniqueConstraints = @UniqueConstraint(columnNames = {"cinema_room_id", "seat_row", "seat_column"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Seat extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    private Long seatId;

    @Column(name = "seat_number", nullable = false, length = 10)
    private String seatNumber; // A1, A2, B1, etc.

    @Column(name = "seat_row", nullable = false)
    private Integer seatRow;

    @Column(name = "seat_column", nullable = false)
    private Integer seatColumn;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_status", nullable = false)
    private SeatStatus seatStatus = SeatStatus.AVAILABLE;

    @Column(name = "seat_type", length = 20)
    private String seatType = "STANDARD"; // STANDARD, VIP, COUPLE, WHEELCHAIR

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Pricing for different seat types
    @Column(name = "price_multiplier", nullable = false)
    private Double priceMultiplier = 1.0;

    // Seat features
    @Column(name = "is_recliner", nullable = false)
    private Boolean isRecliner = false;

    @Column(name = "has_table", nullable = false)
    private Boolean hasTable = false;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinema_room_id", nullable = false)
    private CinemaRoom cinemaRoom;

    @OneToMany(mappedBy = "seat", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // Prevent circular reference: Seat -> BookingSeat -> Seat
    private List<BookingSeat> bookingSeats;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Business methods
    public boolean isAvailable() {
        return seatStatus == SeatStatus.AVAILABLE && isActive;
    }

    public boolean isOccupied() {
        return seatStatus == SeatStatus.OCCUPIED;
    }

    public boolean isTemporarilyReserved() {
        return seatStatus == SeatStatus.TEMPORARILY_RESERVED;
    }

    public boolean isVIP() {
        return "VIP".equals(seatType);
    }

    public boolean isCouple() {
        return "COUPLE".equals(seatType);
    }

    public boolean isWheelchair() {
        return "WHEELCHAIR".equals(seatType);
    }

    public String getRowLetter() {
        // Convert row number to letter (1=A, 2=B, etc.)
        return String.valueOf((char) ('A' + seatRow - 1));
    }

    public String getDisplayName() {
        return getRowLetter() + seatColumn;
    }

    public double calculatePrice(double basePrice) {
        return basePrice * priceMultiplier;
    }

    public boolean isPremium() {
        return isVIP() || isCouple() || isRecliner;
    }

    public String getRowName() {
        return getRowLetter();
    }

    public Integer getColumnNumber() {
        return seatColumn;
    }

    // Get seat price based on default pricing and seat multiplier
    public Double getSeatPrice() {
        // Default base price for standard seat
        double basePrice = 100000.0; // 100,000 VND base price
        return basePrice * priceMultiplier;
    }
} 

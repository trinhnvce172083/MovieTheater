package com.swp.MovieTheaterService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * CinemaRoom Entity - Cinema Room Management
 * Represents cinema rooms in the theater
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Entity
@Table(name = "movietheater_cinema_room")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CinemaRoom extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cinema_room_id")
    private Long cinemaRoomId;

    @Column(name = "cinema_room_name", nullable = false, unique = true, length = 50)
    private String cinemaRoomName;

    @Column(name = "seat_quantity", nullable = false)
    private Integer seatQuantity;

    @Column(name = "room_type", length = 20)
    private String roomType = "STANDARD"; // STANDARD, VIP, IMAX, 4DX

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Room layout configuration - Fixed column names to avoid MySQL reserved keywords
    @Column(name = "row_count", nullable = false)
    private Integer rows;

    @Column(name = "column_count", nullable = false)
    private Integer columns;

    // Room features
    @Column(name = "has_3d", nullable = false)
    private Boolean has3D = false;

    @Column(name = "has_dolby_atmos", nullable = false)
    private Boolean hasDolbyAtmos = false;

    @Column(name = "has_recliner_seats", nullable = false)
    private Boolean hasReclinerSeats = false;

    // Pricing multiplier for different room types
    @Column(name = "price_multiplier", nullable = false)
    private Double priceMultiplier = 1.0;

    // Relationships
    @OneToMany(mappedBy = "cinemaRoom", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Seat> seats;

    @OneToMany(mappedBy = "cinemaRoom", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Schedule> schedules;

    // Business methods
    public boolean isVIP() {
        return "VIP".equals(roomType);
    }

    public boolean isIMAX() {
        return "IMAX".equals(roomType);
    }

    public boolean is4DX() {
        return "4DX".equals(roomType);
    }

    public boolean isPremium() {
        return isVIP() || isIMAX() || is4DX();
    }

    public String getDisplayName() {
        return cinemaRoomName + " (" + roomType + ")";
    }

    public int getAvailableSeats() {
        if (seats == null) return seatQuantity;
        return (int) seats.stream()
                .filter(seat -> seat.getIsActive())
                .count();
    }

    public double calculatePrice(double basePrice) {
        return basePrice * priceMultiplier;
    }
} 

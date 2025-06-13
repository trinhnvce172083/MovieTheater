package com.swp.MovieTheaterService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Schedule Entity - Movie Schedule Management
 * Represents movie schedules in cinema rooms
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Entity
@Table(name = "movietheater_schedule")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Schedule extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    @Column(name = "show_date", nullable = false)
    private LocalDate showDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "time_slot_type", length = 20)
    private String timeSlotType; // MORNING, AFTERNOON, EVENING, LATE_NIGHT

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Schedule status
    @Column(name = "status", length = 20)
    private String status = "SCHEDULED"; // SCHEDULED, ONGOING, COMPLETED, CANCELLED

    // Special features for this schedule
    @Column(name = "is_3d", nullable = false)
    private Boolean is3D = false;

    @Column(name = "is_imax", nullable = false)
    private Boolean isIMAX = false;

    @Column(name = "is_4dx", nullable = false)
    private Boolean is4DX = false;

    @Column(name = "subtitle_language", length = 50)
    private String subtitleLanguage;

    @Column(name = "audio_language", length = 50)
    private String audioLanguage;

    // Booking information
    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;

    @Column(name = "booked_seats", nullable = false)
    private Integer bookedSeats = 0;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinema_room_id", nullable = false)
    private CinemaRoom cinemaRoom;

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Booking> bookings;

    // Business methods
    public boolean isScheduled() {
        return "SCHEDULED".equals(status);
    }

    public boolean isOngoing() {
        return "ONGOING".equals(status);
    }

    public boolean isCompleted() {
        return "COMPLETED".equals(status);
    }

    public boolean isCancelled() {
        return "CANCELLED".equals(status);
    }

    public LocalDateTime getShowDateTime() {
        return LocalDateTime.of(showDate, startTime);
    }

    public LocalDateTime getEndDateTime() {
        return LocalDateTime.of(showDate, endTime);
    }

    public boolean isToday() {
        return showDate.equals(LocalDate.now());
    }

    public boolean isPast() {
        return getEndDateTime().isBefore(LocalDateTime.now());
    }

    public boolean isFuture() {
        return getShowDateTime().isAfter(LocalDateTime.now());
    }

    public boolean isBookable() {
        return isActive && isScheduled() && isFuture() && availableSeats > 0;
    }

    public double getOccupancyRate() {
        if (availableSeats + bookedSeats == 0)
            return 0.0;
        return (double) bookedSeats / (availableSeats + bookedSeats) * 100;
    }

    public void bookSeats(int seatCount) {
        if (availableSeats >= seatCount) {
            availableSeats -= seatCount;
            bookedSeats += seatCount;
        } else {
            throw new IllegalStateException("Not enough available seats");
        }
    }

    public void cancelSeats(int seatCount) {
        if (bookedSeats >= seatCount) {
            bookedSeats -= seatCount;
            availableSeats += seatCount;
        }
    }

    public String getDisplayTime() {
        return startTime.toString() + " - " + endTime.toString();
    }

    public boolean hasSpecialFeatures() {
        return is3D || isIMAX || is4DX;
    }

    public String getSpecialFeaturesText() {
        StringBuilder features = new StringBuilder();
        if (is3D)
            features.append("3D ");
        if (isIMAX)
            features.append("IMAX ");
        if (is4DX)
            features.append("4DX ");
        return features.toString().trim();
    }

    public String getTimeSlotTypeDisplay() {
        if (timeSlotType == null)
            return "Không xác định";

        switch (timeSlotType) {
            case "MORNING":
                return "Buổi sáng";
            case "AFTERNOON":
                return "Buổi chiều";
            case "EVENING":
                return "Buổi tối";
            case "LATE_NIGHT":
                return "Đêm khuya";
            default:
                return timeSlotType;
        }
    }

    public boolean isMorningSlot() {
        return "MORNING".equals(timeSlotType);
    }

    public boolean isAfternoonSlot() {
        return "AFTERNOON".equals(timeSlotType);
    }

    public boolean isEveningSlot() {
        return "EVENING".equals(timeSlotType);
    }

    public boolean isLateNightSlot() {
        return "LATE_NIGHT".equals(timeSlotType);
    }
}
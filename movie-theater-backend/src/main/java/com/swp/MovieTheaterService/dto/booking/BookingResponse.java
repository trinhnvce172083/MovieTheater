package com.swp.MovieTheaterService.dto.booking;

import com.swp.MovieTheaterService.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Booking Response DTO
 * Data transfer object for booking responses
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long bookingId;
    private String bookingCode;
    private LocalDateTime bookingDate;
    private Double totalAmount;
    private Double discountAmount;
    private Double finalAmount;
    private BookingStatus bookingStatus;
    private String paymentMethod;
    private LocalDateTime paymentDate;
    private String paymentReference;
    private Integer seatCount;
    private String notes;
    private LocalDateTime cancellationDate;
    private String cancellationReason;
    private Double refundAmount;
    private String qrCode;
    private Boolean isCheckedIn;
    private LocalDateTime checkInTime;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Customer information
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Boolean isGuestBooking;

    // Account information (for member bookings)
    private Long accountId;
    private String accountFullName;
    private String accountEmail;
    private String accountPhone;

    // Schedule information
    private Long scheduleId;
    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Double schedulePrice;
    private String scheduleStatus;
    private Boolean is3D;
    private Boolean isIMAX;
    private Boolean is4DX;

    // Movie information
    private Long movieId;
    private String movieName;
    private String moviePoster;
    private Integer movieDuration;
    private String movieRating;
    private String movieGenre;

    // Cinema room information
    private Long cinemaRoomId;
    private String cinemaRoomName;
    private String roomType;
    private Integer totalSeats;

    // Promotion information
    private Long promotionId;
    private String promotionName;
    private String promotionCode;
    private Double promotionDiscount;

    // Booked seats information
    private List<BookedSeatInfo> bookedSeats;

    // Computed fields
    private LocalDateTime showDateTime;
    private String displayBookingDate;
    private String displayShowDate;
    private String displayShowTime;
    private String statusDisplay;
    private String paymentMethodDisplay;
    private Boolean canBeCancelled;
    private Boolean canBeCheckedIn;
    private Boolean isPaid;
    private Boolean isCompleted;
    private Boolean isCancelled;
    private String totalAmountDisplay;
    private String finalAmountDisplay;
    private String discountPercentage;
    private String movieDurationDisplay;
    private String specialFeatures;
    private Integer hoursUntilShow;
    private Boolean isUpcoming;
    private Boolean isPast;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookedSeatInfo {
        private Long seatId;
        private String seatNumber;
        private String seatType;
        private Double seatPrice;
        private String seatPriceDisplay;
        private String rowName;
        private Integer columnNumber;
        private Boolean isVIP;
        private Boolean isCouple;
    }
} 
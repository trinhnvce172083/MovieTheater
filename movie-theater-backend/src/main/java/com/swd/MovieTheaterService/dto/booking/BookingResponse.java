package com.swp.MovieTheaterService.dto.booking;

import com.swp.MovieTheaterService.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Booking Response DTO
 * Data Transfer Object for booking information
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long bookingId;
    private String bookingCode;
    private LocalDateTime bookingDate;
    private BookingStatus bookingStatus;

    // Amounts
    private Double totalAmount;
    private Double discountAmount;
    private Double finalAmount;
    private Double refundAmount;

    // Customer information
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Boolean isGuestBooking;

    // Schedule and movie information
    private ScheduleInfo schedule;
    private MovieInfo movie;
    private CinemaInfo cinema;

    // Seat information
    private List<SeatInfo> seats;
    private Integer seatCount;

    // Payment information
    private String paymentMethod;
    private LocalDateTime paymentDate;
    private String paymentReference;

    // Promotion information
    private PromotionInfo promotion;

    // Concession information
    private List<ConcessionInfo> concessions;
    private Double concessionAmount;
    private Integer concessionCount;

    // Additional information
    private String notes;
    private String qrCode;
    private Boolean isCheckedIn;
    private LocalDateTime checkInTime;

    // Cancellation information
    private LocalDateTime cancellationDate;
    private String cancellationReason;

    // Status flags
    private Boolean canBeCancelled;
    private Boolean canBeCheckedIn;
    private Boolean isExpired;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Formatted values for display
    private String formattedBookingDate;
    private String formattedShowDateTime;
    private String statusDisplayName;
    private String refundPolicy;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScheduleInfo {
        private Long scheduleId;
        private LocalDateTime showDateTime;
        private String formattedShowDateTime;
        private String language;
        private Boolean isSubtitled;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovieInfo {
        private Long movieId;
        private String title;
        private String originalTitle;
        private Integer duration;
        private String rating;
        private String genres;
        private String director;
        private String posterUrl;
        private String formattedDuration;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CinemaInfo {
        private Long cinemaRoomId;
        private String cinemaRoomName;
        private String cinemaLocation;
        private String address;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatInfo {
        private Long seatId;
        private String seatNumber;
        private String seatRow;
        private Integer seatColumn;
        private String seatType;
        private Double seatPrice;
        private Boolean isVIP;
        private Boolean isCouple;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookedSeatInfo {
        private Long seatId;
        private String seatNumber;
        private String seatRow;
        private Integer seatColumn;
        private String seatType;
        private Double seatPrice;
        private Boolean isVIP;
        private Boolean isCouple;
        private String status; // BOOKED, RESERVED, AVAILABLE

        // Booking-specific information
        private Long bookingSeatId;
        private LocalDateTime bookedAt;
        private String seatLabel; // Combined row + number (e.g., "A12")

        // Helper methods
        public String getSeatLabel() {
            if (seatRow != null && seatNumber != null) {
                return seatRow + seatNumber;
            }
            return seatNumber != null ? seatNumber : "";
        }

        public String getFormattedPrice() {
            if (seatPrice != null) {
                return String.format("%,.0f VND", seatPrice);
            }
            return "";
        }

        public String getSeatTypeDisplay() {
            if (seatType == null) return "Thường";

            switch (seatType.toUpperCase()) {
                case "VIP":
                    return "VIP";
                case "COUPLE":
                    return "Đôi";
                case "PREMIUM":
                    return "Cao cấp";
                default:
                    return "Thường";
            }
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromotionInfo {
        private Long promotionId;
        private String promotionCode;
        private String promotionName;
        private com.swp.MovieTheaterService.enums.DiscountType discountType;
        private Double discountValue;
        private Double appliedDiscount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConcessionInfo {
        private Long concessionId;
        private String concessionName;
        private String description;
        private String category;
        private Double price;
        private Integer quantity;
        private Double totalPrice;
        private String imageUrl;

        // Helper methods
        public Double getTotalPrice() {
            if (price != null && quantity != null) {
                return price * quantity;
            }
            return totalPrice != null ? totalPrice : 0.0;
        }

        public String getFormattedPrice() {
            if (price != null) {
                return String.format("%,.0f VND", price);
            }
            return "";
        }

        public String getFormattedTotalPrice() {
            return String.format("%,.0f VND", getTotalPrice());
        }
    }

    // Helper methods
    public String getFormattedBookingDate() {
        if (bookingDate != null) {
            return bookingDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        }
        return "";
    }

    public String getFormattedShowDateTime() {
        if (schedule != null && schedule.getShowDateTime() != null) {
            return schedule.getShowDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        }
        return "";
    }

    public String getStatusDisplayName() {
        if (bookingStatus == null) return "";

        switch (bookingStatus) {
            case PENDING:
                return "Chờ thanh toán";
            case CONFIRMED:
                return "Đã xác nhận";
            case PAID:
                return "Đã thanh toán";
            case COMPLETED:
                return "Hoàn thành";
            case CANCELLED:
                return "Đã hủy";
            default:
                return bookingStatus.name();
        }
    }

    public Double getDiscountPercentage() {
        if (totalAmount == null || totalAmount == 0 || discountAmount == null) {
            return 0.0;
        }
        return (discountAmount / totalAmount) * 100;
    }

    public String getRefundPolicy() {
        if (schedule == null || schedule.getShowDateTime() == null) {
            return "Không có thông tin";
        }

        LocalDateTime showTime = schedule.getShowDateTime();
        LocalDateTime now = LocalDateTime.now();
        long hoursUntilShow = java.time.Duration.between(now, showTime).toHours();

        if (hoursUntilShow >= 24) {
            return "Hoàn tiền 100% nếu hủy trước 24h";
        } else if (hoursUntilShow >= 2) {
            return "Hoàn tiền 50% nếu hủy trước 2h";
        } else {
            return "Không hoàn tiền nếu hủy trong 2h tới";
        }
    }

    public Boolean getCanBeCancelled() {
        if (bookingStatus == null || schedule == null || schedule.getShowDateTime() == null) {
            return false;
        }

        return (bookingStatus == BookingStatus.PENDING ||
                bookingStatus == BookingStatus.CONFIRMED ||
                bookingStatus == BookingStatus.PAID) &&
                schedule.getShowDateTime().isAfter(LocalDateTime.now().plusHours(2));
    }

    public Boolean getCanBeCheckedIn() {
        if (bookingStatus == null || schedule == null || schedule.getShowDateTime() == null) {
            return false;
        }

        return bookingStatus == BookingStatus.PAID &&
                (isCheckedIn == null || !isCheckedIn) &&
                schedule.getShowDateTime().isAfter(LocalDateTime.now()) &&
                schedule.getShowDateTime().isBefore(LocalDateTime.now().plusMinutes(30));
    }

    public Boolean getIsExpired() {
        if (schedule == null || schedule.getShowDateTime() == null) {
            return false;
        }

        return schedule.getShowDateTime().isBefore(LocalDateTime.now()) &&
                (bookingStatus == BookingStatus.PENDING || bookingStatus == BookingStatus.CONFIRMED);
    }
} 

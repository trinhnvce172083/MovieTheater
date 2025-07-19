package com.swp.MovieTheaterService.dto.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Booking Summary Response DTO
 * Comprehensive booking information including seats and concessions
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Tóm tắt thông tin booking đầy đủ")
public class BookingSummaryResponse {

    // Basic booking info
    @Schema(description = "ID booking", example = "1")
    private Long bookingId;

    @Schema(description = "Mã booking", example = "BK123456789")
    private String bookingCode;

    @Schema(description = "Trạng thái booking", example = "PENDING")
    private String bookingStatus;

    @Schema(description = "Thời gian đặt vé")
    private LocalDateTime bookingDate;

    // Movie and schedule info
    @Schema(description = "Tên phim", example = "Avatar: The Way of Water")
    private String movieTitle;

    @Schema(description = "Thời gian chiếu")
    private LocalDateTime showDateTime;

    @Schema(description = "Tên phòng chiếu", example = "Phòng 1")
    private String cinemaRoomName;

    // Customer info
    @Schema(description = "Tên khách hàng", example = "Nguyễn Văn A")
    private String customerName;

    @Schema(description = "Email khách hàng", example = "customer@email.com")
    private String customerEmail;

    @Schema(description = "Số điện thoại", example = "0901234567")
    private String customerPhone;

    // Seat information
    @Schema(description = "Số lượng ghế", example = "2")
    private Integer seatCount;

    @Schema(description = "Danh sách ghế đã đặt")
    private List<SeatSummary> seats = new ArrayList<>();

    @Schema(description = "Tổng tiền ghế", example = "160000")
    private Double seatAmount;

    // Concession information
    @Schema(description = "Số món đồ ăn/uống", example = "3")
    private Integer concessionItems;

    @Schema(description = "Danh sách đồ ăn/uống")
    private List<BookingConcessionResponse> concessions = new ArrayList<>();

    @Schema(description = "Tổng tiền đồ ăn/uống", example = "135000")
    private Double concessionAmount;

    // Payment information
    @Schema(description = "Tổng tiền trước giảm giá", example = "295000")
    private Double totalAmount;

    @Schema(description = "Số tiền giảm giá", example = "15000")
    private Double discountAmount;

    @Schema(description = "Tổng tiền cuối cùng", example = "280000")
    private Double finalAmount;

    @Schema(description = "Phương thức thanh toán", example = "ONLINE")
    private String paymentMethod;

    @Schema(description = "Thời gian thanh toán")
    private LocalDateTime paymentDate;

    // Additional info
    @Schema(description = "Ghi chú")
    private String notes;

    @Schema(description = "Mã QR")
    private String qrCode;

    @Schema(description = "Đã check-in", example = "false")
    private Boolean isCheckedIn;

    @Schema(description = "Thời gian check-in")
    private LocalDateTime checkInTime;

    // Inner class for seat summary
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatSummary {
        @Schema(description = "ID ghế", example = "1")
        private Long seatId;

        @Schema(description = "Số ghế", example = "A1")
        private String seatNumber;

        @Schema(description = "Loại ghế", example = "STANDARD")
        private String seatType;

        @Schema(description = "Giá ghế", example = "80000")
        private Double seatPrice;

        @Schema(description = "Có phải ghế VIP", example = "false")
        private Boolean isVIP;

        @Schema(description = "Có phải ghế đôi", example = "false")
        private Boolean isCouple;

        public String getFormattedPrice() {
            if (seatPrice != null) {
                return String.format("%,.0f VND", seatPrice);
            }
            return "";
        }

        public String getSeatLabel() {
            return seatNumber != null ? seatNumber : "";
        }
    }

    // Helper methods
    public String getFormattedTotalAmount() {
        if (totalAmount != null) {
            return String.format("%,.0f VND", totalAmount);
        }
        return "";
    }

    public String getFormattedFinalAmount() {
        if (finalAmount != null) {
            return String.format("%,.0f VND", finalAmount);
        }
        return "";
    }

    public String getFormattedSeatAmount() {
        if (seatAmount != null) {
            return String.format("%,.0f VND", seatAmount);
        }
        return "";
    }

    public String getFormattedConcessionAmount() {
        if (concessionAmount != null) {
            return String.format("%,.0f VND", concessionAmount);
        }
        return "";
    }

    public String getFormattedDiscountAmount() {
        if (discountAmount != null) {
            return String.format("%,.0f VND", discountAmount);
        }
        return "";
    }

    public Double getDiscountPercentage() {
        if (totalAmount != null && totalAmount > 0 && discountAmount != null) {
            return (discountAmount / totalAmount) * 100;
        }
        return 0.0;
    }

    public boolean hasDiscount() {
        return discountAmount != null && discountAmount > 0;
    }

    public boolean hasConcessions() {
        return concessions != null && !concessions.isEmpty();
    }

    public String getSeatSummary() {
        if (seats == null || seats.isEmpty()) {
            return "Không có ghế";
        }

        return seats.stream()
                .map(SeatSummary::getSeatLabel)
                .reduce((s1, s2) -> s1 + ", " + s2)
                .orElse("Không có ghế");
    }

    public String getConcessionSummary() {
        if (concessions == null || concessions.isEmpty()) {
            return "Không có đồ ăn/uống";
        }

        return concessions.stream()
                .map(BookingConcessionResponse::getOrderSummary)
                .reduce((s1, s2) -> s1 + "; " + s2)
                .orElse("Không có đồ ăn/uống");
    }
}
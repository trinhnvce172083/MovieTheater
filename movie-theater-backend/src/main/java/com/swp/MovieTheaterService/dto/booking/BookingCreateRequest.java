package com.swp.MovieTheaterService.dto.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Booking Create Request DTO
 * Data Transfer Object for creating new bookings
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu tạo booking mới")
public class BookingCreateRequest {

    @NotNull(message = "Schedule ID không được để trống")
    @Schema(description = "ID lịch chiếu phim", example = "1", required = true)
    private Long scheduleId;

    @NotEmpty(message = "Danh sách ghế không được trống")
    @Size(min = 1, max = 10, message = "Số lượng ghế phải từ 1-10")
    @Schema(description = "Danh sách ID ghế", example = "[1, 2]", required = true)
    private List<@NotNull Long> seatIds;

    @NotBlank(message = "Session ID không được để trống")
    @Schema(description = "Session ID để tránh duplicate booking", example = "SESSION-20241212-143015", required = true)
    private String sessionId;

    // Customer information for guest bookings
    @Size(min = 2, max = 100, message = "Tên khách hàng phải từ 2-100 ký tự")
    @Schema(description = "Tên khách hàng (bắt buộc cho guest booking)", example = "Nguyễn Văn A")
    private String customerName;

    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    @Schema(description = "Email khách hàng (bắt buộc cho guest booking)", example = "customer@example.com")
    private String customerEmail;

    @Pattern(regexp = "^(\\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$", message = "Số điện thoại không hợp lệ")
    @Schema(description = "Số điện thoại khách hàng (bắt buộc cho guest booking)", example = "0901234567")
    private String customerPhone;

    // Promotion and payment
    @Schema(description = "ID khuyến mãi (optional)", example = "1")
    private Long promotionId;

    @Pattern(regexp = "^(CASH|CARD|ONLINE|WALLET)$", message = "Phương thức thanh toán không hợp lệ")
    @Schema(description = "Phương thức thanh toán", example = "ONLINE", allowableValues = { "CASH", "CARD", "ONLINE",
            "WALLET" })
    private String paymentMethod = "ONLINE";

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    @Schema(description = "Ghi chú thêm", example = "Booking cho gia đình có trẻ em")
    private String notes;

    // Concession orders
    @Valid
    @Schema(description = "Danh sách đồ ăn/uống đặt kèm", example = """
            [
                {
                    "concessionId": 1,
                    "quantity": 2,
                    "unitPrice": 45000,
                    "notes": "Extra butter"
                },
                {
                    "concessionId": 3,
                    "quantity": 2,
                    "unitPrice": 35000,
                    "notes": "No ice"
                }
            ]
            """)
    private List<ConcessionOrderRequest> concessionOrders = new ArrayList<>();

    // Business validation flags
    @Schema(description = "Có phải booking khách vãng lai", example = "true")
    private Boolean isGuestBooking = false;

    @Schema(description = "Sử dụng điểm tích lũy", example = "false")
    private Boolean useRewardPoints = false;

    @Schema(description = "Số điểm tích lũy muốn sử dụng", example = "0")
    private Integer rewardPointsToUse = 0;

    // Special requirements
    @Schema(description = "Cần hỗ trợ xe lăn", example = "false")
    private Boolean needsWheelchairAccess = false;

    @Schema(description = "Có trẻ em đi cùng", example = "false")
    private Boolean hasChildren = false;

    // Validation methods
    public boolean isValidGuestBooking() {
        if (isGuestBooking) {
            return customerName != null && !customerName.trim().isEmpty() &&
                    customerEmail != null && !customerEmail.trim().isEmpty() &&
                    customerPhone != null && !customerPhone.trim().isEmpty();
        }
        return true;
    }

    public boolean isValidRewardPointsUsage() {
        if (useRewardPoints && rewardPointsToUse != null) {
            return rewardPointsToUse > 0 && rewardPointsToUse <= 10000; // Max 10k points per booking
        }
        return true;
    }

    public boolean isValidConcessionOrders() {
        if (concessionOrders == null || concessionOrders.isEmpty()) {
            return true; // Concession is optional
        }

        return concessionOrders.stream().allMatch(ConcessionOrderRequest::isValidOrder);
    }

    public int getTotalConcessionItems() {
        if (concessionOrders == null)
            return 0;
        return concessionOrders.stream()
                .mapToInt(ConcessionOrderRequest::getQuantity)
                .sum();
    }

    /**
     * Inner class for seat selection details
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatSelectionRequest {
        @NotNull(message = "Seat ID không được để trống")
        private Long seatId;

        @NotNull(message = "Giá ghế không được để trống")
        @DecimalMin(value = "0.0", message = "Giá ghế phải lớn hơn 0")
        private Double seatPrice;

        @NotBlank(message = "Số ghế không được để trống")
        private String seatNumber;

        private String seatRow;
        private Integer seatColumn;
        private String seatType;
        private Boolean isVIP = false;
        private Boolean isCouple = false;

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

        public boolean isPremiumSeat() {
            return isVIP || isCouple || "PREMIUM".equals(seatType);
        }
    }
}
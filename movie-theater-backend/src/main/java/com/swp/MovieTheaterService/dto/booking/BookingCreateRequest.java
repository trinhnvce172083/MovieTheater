package com.swp.MovieTheaterService.dto.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    @Schema(description = "ID lịch chiếu phim", example = "1")
    private Long scheduleId;
    
    @NotEmpty(message = "Danh sách ghế không được trống")
    @Size(min = 1, max = 10, message = "Số lượng ghế phải từ 1-10")
    private List<@NotNull Long> seatIds;
    
    @NotBlank(message = "Session ID không được để trống")
    private String sessionId;
    
    // Customer information for guest bookings
    @Size(min = 2, max = 100, message = "Tên khách hàng phải từ 2-100 ký tự")
    private String customerName;
    
    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String customerEmail;
    
    @Pattern(regexp = "^(\\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$", 
             message = "Số điện thoại không hợp lệ")
    private String customerPhone;
    
    // Promotion and payment
    private Long promotionId;
    
    @Pattern(regexp = "^(CASH|CARD|ONLINE|WALLET)$", 
             message = "Phương thức thanh toán không hợp lệ")
    private String paymentMethod = "ONLINE";
    
    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String notes;
    
    // Business validation flags
    private Boolean isGuestBooking = false;
    private Boolean useRewardPoints = false;
    private Integer rewardPointsToUse = 0;
    
    // Special requirements
    private Boolean needsWheelchairAccess = false;
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
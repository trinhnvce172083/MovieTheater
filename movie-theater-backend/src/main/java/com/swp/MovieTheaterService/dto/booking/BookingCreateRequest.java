package com.swp.MovieTheaterService.dto.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Booking Create Request DTO
 * Data transfer object for creating new bookings
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingCreateRequest {

    @NotNull(message = "ID lịch chiếu không được để trống")
    private Long scheduleId;

    @NotEmpty(message = "Danh sách ghế không được để trống")
    @Valid
    private List<SeatSelectionRequest> selectedSeats;

    // Customer information (required for guest bookings)
    @Size(max = 100, message = "Tên khách hàng không được vượt quá 100 ký tự")
    private String customerName;

    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String customerEmail;

    @Pattern(regexp = "^[0-9+\\-\\s()]{10,15}$", message = "Số điện thoại không hợp lệ")
    private String customerPhone;

    // Promotion code (optional)
    @Size(max = 20, message = "Mã khuyến mãi không được vượt quá 20 ký tự")
    private String promotionCode;

    // Notes (optional)
    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String notes;

    // Payment method preference
    @Pattern(regexp = "^(CASH|CARD|ONLINE|WALLET)$", 
             message = "Phương thức thanh toán không hợp lệ (CASH, CARD, ONLINE, WALLET)")
    private String preferredPaymentMethod = "CASH";

    // Validation methods
    public boolean isGuestBooking() {
        return customerName != null || customerEmail != null || customerPhone != null;
    }

    public boolean hasValidCustomerInfo() {
        if (isGuestBooking()) {
            return customerName != null && !customerName.trim().isEmpty() &&
                   customerEmail != null && !customerEmail.trim().isEmpty() &&
                   customerPhone != null && !customerPhone.trim().isEmpty();
        }
        return true; // For member bookings, customer info is from account
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatSelectionRequest {
        
        @NotNull(message = "ID ghế không được để trống")
        private Long seatId;
        
        @NotNull(message = "Giá ghế không được để trống")
        @DecimalMin(value = "0.0", inclusive = false, message = "Giá ghế phải lớn hơn 0")
        private Double seatPrice;
        
        // Optional: Override seat type for special pricing
        @Size(max = 20, message = "Loại ghế không được vượt quá 20 ký tự")
        private String seatType;
    }
} 
package com.swp.MovieTheaterService.dto.booking;

import com.swp.MovieTheaterService.enums.BookingStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Booking Update Request DTO
 * Data transfer object for updating bookings
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingUpdateRequest {

    // Customer information updates
    @Size(max = 100, message = "Tên khách hàng không được vượt quá 100 ký tự")
    private String customerName;

    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String customerEmail;

    @Pattern(regexp = "^[0-9+\\-\\s()]{10,15}$", message = "Số điện thoại không hợp lệ")
    private String customerPhone;

    // Booking status update
    private BookingStatus bookingStatus;

    // Payment information
    @Pattern(regexp = "^(CASH|CARD|ONLINE|WALLET)$", 
             message = "Phương thức thanh toán không hợp lệ (CASH, CARD, ONLINE, WALLET)")
    private String paymentMethod;

    @Size(max = 100, message = "Mã tham chiếu thanh toán không được vượt quá 100 ký tự")
    private String paymentReference;

    // Discount amount
    @DecimalMin(value = "0.0", message = "Số tiền giảm giá phải >= 0")
    private Double discountAmount;

    // Notes update
    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String notes;

    // Cancellation information
    @Size(max = 500, message = "Lý do hủy không được vượt quá 500 ký tự")
    private String cancellationReason;

    // Active status
    private Boolean isActive;

    // Validation methods
    public boolean hasPaymentInfo() {
        return paymentMethod != null && paymentReference != null;
    }

    public boolean isCancellationRequest() {
        return bookingStatus == BookingStatus.CANCELLED && cancellationReason != null;
    }

    public boolean isStatusUpdate() {
        return bookingStatus != null;
    }
}
package com.swp.MovieTheaterService.dto.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Booking Create Request DTO
 * Data Transfer Object for creating new bookings
 *
 * @author Ngo Viet Trinh
 * @version 3.0.0 - Simplified schema without reward points
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
    @Schema(description = "Danh sách ID ghế", example = "[5, 6]", required = true)
    private List<@NotNull Long> seatIds;

    @Schema(description = "Session ID để tránh duplicate booking (tự động tạo nếu không có)", example = "SESSION-20241212-143020")
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

    // Promotion - Only use promotion code
    @Size(max = 50, message = "Mã khuyến mãi không được vượt quá 50 ký tự")
    @Schema(description = "Mã khuyến mãi (optional)", example = "WELCOME10")
    private String promotionCode;

    @Pattern(regexp = "^(CASH|CARD|ONLINE|WALLET)$", message = "Phương thức thanh toán không hợp lệ")
    @Schema(description = "Phương thức thanh toán (sẽ được xử lý bởi frontend Redux)", example = "ONLINE", allowableValues = {"CASH", "CARD", "ONLINE",
            "WALLET"})
    private String paymentMethod;

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    @Schema(description = "Ghi chú thêm", example = "Member booking")
    private String notes;

    // Concession orders with full information
    @Valid
    @Schema(description = "Danh sách đồ ăn/uống đặt kèm với thông tin đầy đủ")
    private List<ConcessionOrderRequest> concessionOrders = new ArrayList<>();

    // Business validation flags
    @Schema(description = "Có phải booking khách vãng lai", example = "false")
    private Boolean isGuestBooking = false;


    // Auto-calculated fields (will be set by service)
    @Schema(description = "Tổng tiền ghế (tự động tính)", example = "288000", accessMode = Schema.AccessMode.READ_ONLY)
    private Double seatAmount;

    @Schema(description = "Tổng tiền đồ ăn/uống (tự động tính)", example = "90000", accessMode = Schema.AccessMode.READ_ONLY)
    private Double concessionAmount;

    @Schema(description = "Tổng tiền trước giảm giá (tự động tính)", example = "378000", accessMode = Schema.AccessMode.READ_ONLY)
    private Double totalAmount;

    @Schema(description = "Số tiền giảm giá (tự động tính)", example = "37800", accessMode = Schema.AccessMode.READ_ONLY)
    private Double discountAmount;

    @Schema(description = "Số tiền cuối cùng (tự động tính)", example = "340200", accessMode = Schema.AccessMode.READ_ONLY)
    private Double finalAmount;

    // Validation methods
    public boolean isValidGuestBooking() {
        if (Boolean.TRUE.equals(isGuestBooking)) {
            return customerName != null && !customerName.trim().isEmpty() &&
                    customerEmail != null && !customerEmail.trim().isEmpty() &&
                    customerPhone != null && !customerPhone.trim().isEmpty();
        }
        return true;
    }

    /**
     * Check if this is a valid member booking (customer info can be auto-populated from account)
     */
    public boolean isValidMemberBooking() {
        // For member bookings, customer info is optional as it will be auto-populated
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

    public BigDecimal getTotalConcessionAmount() {
        if (concessionOrders == null)
            return BigDecimal.ZERO;
        // Note: Total price calculation is now handled in service layer
        // This method returns 0 as price will be calculated from database
        return BigDecimal.ZERO;
    }

    // Helper methods for service layer
    public boolean hasPromotionCode() {
        return promotionCode != null && !promotionCode.trim().isEmpty();
    }

    public boolean hasConcessionOrders() {
        return concessionOrders != null && !concessionOrders.isEmpty();
    }

    public boolean isOnlinePayment() {
        return "ONLINE".equals(paymentMethod);
    }

    public boolean isCashPayment() {
        return "CASH".equals(paymentMethod);
    }

    public boolean isCardPayment() {
        return "CARD".equals(paymentMethod);
    }

    public boolean isWalletPayment() {
        return "WALLET".equals(paymentMethod);
    }

    // Auto-generate sessionId if empty
    public void ensureSessionId() {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            sessionId = generateSessionId();
        }
    }

    private String generateSessionId() {
        return "SESSION-" + System.currentTimeMillis() + "-" +
                java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // Validation for complete booking request
    public void validateForBooking() {
        if (scheduleId == null) {
            throw new IllegalArgumentException("Schedule ID không được để trống");
        }

        if (seatIds == null || seatIds.isEmpty()) {
            throw new IllegalArgumentException("Phải chọn ít nhất một ghế");
        }

        if (seatIds.size() > 10) {
            throw new IllegalArgumentException("Không thể đặt quá 10 ghế trong một lần");
        }

        if (Boolean.TRUE.equals(isGuestBooking) && !isValidGuestBooking()) {
            throw new IllegalArgumentException("Thông tin khách hàng không hợp lệ cho đặt vé khách");
        }

        // For member bookings, customer info validation is handled in service layer
        if (!Boolean.TRUE.equals(isGuestBooking) && !isValidMemberBooking()) {
            throw new IllegalArgumentException("Thông tin booking không hợp lệ cho thành viên");
        }

        if (hasConcessionOrders() && !isValidConcessionOrders()) {
            throw new IllegalArgumentException("Đơn hàng đồ ăn/uống không hợp lệ");
        }

        // Payment method is optional, will be handled by frontend Redux
        if (paymentMethod != null && !paymentMethod.trim().isEmpty() &&
                !paymentMethod.matches("^(CASH|CARD|ONLINE|WALLET)$")) {
            throw new IllegalArgumentException("Phương thức thanh toán không hợp lệ");
        }
    }
}

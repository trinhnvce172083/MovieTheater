package com.swp.MovieTheaterService.dto.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Booking Concession Response DTO
 * Data Transfer Object for booking concession responses
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response thông tin đồ ăn/uống trong booking")
public class BookingConcessionResponse {

    @Schema(description = "ID booking concession", example = "1")
    private Long bookingConcessionId;

    @Schema(description = "ID booking", example = "1")
    private Long bookingId;

    @Schema(description = "ID concession", example = "1")
    private Long concessionId;

    @Schema(description = "Tên concession", example = "Bắp rang bơ (Lớn)")
    private String concessionName;

    @Schema(description = "Loại concession", example = "POPCORN")
    private String concessionCategory;

    @Schema(description = "Hình ảnh concession")
    private String concessionImageUrl;

    @Schema(description = "Số lượng", example = "2")
    private Integer quantity;

    @Schema(description = "Giá đơn vị", example = "45000")
    private BigDecimal unitPrice;

    @Schema(description = "Tổng giá", example = "90000")
    private BigDecimal totalPrice;

    @Schema(description = "Ghi chú", example = "Ít đường")
    private String notes;

    @Schema(description = "Thời gian tạo")
    private LocalDateTime createdAt;

    // Helper methods
    public String getFormattedUnitPrice() {
        if (unitPrice != null) {
            return String.format("%,.0f VND", unitPrice);
        }
        return "";
    }

    public String getFormattedTotalPrice() {
        if (totalPrice != null) {
            return String.format("%,.0f VND", totalPrice);
        }
        return "";
    }

    public String getOrderSummary() {
        return String.format("%dx %s - %s",
                quantity,
                concessionName,
                getFormattedTotalPrice());
    }
}

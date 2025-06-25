package com.swp.MovieTheaterService.dto.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Concession Order Request DTO
 * Data Transfer Object for ordering concessions within a booking
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu đặt đồ ăn/uống")
public class ConcessionOrderRequest {

    @NotNull(message = "Concession ID không được để trống")
    @Schema(description = "ID món đồ ăn/uống", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long concessionId;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải ít nhất là 1")
    @Max(value = 20, message = "Số lượng không được vượt quá 20")
    @Schema(description = "Số lượng", example = "2", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer quantity;

    @DecimalMin(value = "0.0", message = "Giá phải lớn hơn 0")
    @Schema(description = "Giá đơn vị (tự động lấy từ database nếu không có)", example = "45000", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private BigDecimal unitPrice;

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    @Schema(description = "Ghi chú đặc biệt", example = "Ít đường")
    private String notes;

    // Helper methods
    public BigDecimal getTotalPrice() {
        if (unitPrice != null && quantity != null) {
            return unitPrice.multiply(new BigDecimal(quantity));
        }
        return BigDecimal.ZERO;
    }

    public String getFormattedUnitPrice() {
        if (unitPrice != null) {
            return String.format("%,.0f VND", unitPrice);
        }
        return "";
    }

    public String getFormattedTotalPrice() {
        BigDecimal total = getTotalPrice();
        return String.format("%,.0f VND", total);
    }

    public boolean isValidOrder() {
        return concessionId != null &&
                quantity != null && quantity > 0;
    }
}
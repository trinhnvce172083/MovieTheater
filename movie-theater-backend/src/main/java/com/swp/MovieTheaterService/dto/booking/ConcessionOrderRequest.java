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
 * @author Ngo Viet Trinh
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

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    @Schema(description = "Ghi chú đặc biệt", example = "Ít đường")
    private String notes;

    // Helper methods for validation

    /**
     * Check if the order request is valid
     */
    public boolean isValidOrder() {
        return concessionId != null &&
                quantity != null && quantity > 0;
    }

    /**
     * Get order summary for logging
     */
    public String getOrderSummary() {
        return String.format("Concession ID: %d, Quantity: %d", concessionId, quantity);
    }
}
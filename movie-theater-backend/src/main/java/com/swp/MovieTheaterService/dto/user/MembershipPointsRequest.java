package com.swp.MovieTheaterService.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Membership Points Request DTO
 * Data Transfer Object for updating membership points
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Membership points adjustment request")
public class MembershipPointsRequest {

    @Schema(description = "Points to add/subtract (positive to add, negative to subtract)", example = "100", required = true)
    @NotNull(message = "Points không được để trống")
    private Integer points;

    @Schema(description = "Reason for points adjustment", example = "Admin bonus for loyal customer", required = true)
    @NotBlank(message = "Lý do điều chỉnh points không được để trống")
    private String reason;

    @Schema(description = "Additional notes", example = "Bonus for birthday month")
    private String notes;

    @Schema(description = "Transaction type", example = "ADMIN_ADJUSTMENT")
    private String transactionType = "ADMIN_ADJUSTMENT";

    @Schema(description = "Reference ID (optional)", example = "PROMO_001")
    private String referenceId;
}

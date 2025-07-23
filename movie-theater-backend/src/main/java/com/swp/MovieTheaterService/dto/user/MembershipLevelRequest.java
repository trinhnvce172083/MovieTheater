package com.swp.MovieTheaterService.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Membership Level Request DTO
 * Data Transfer Object for updating membership level
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Membership level update request")
public class MembershipLevelRequest {

    @Schema(description = "New membership level", example = "GOLD", allowableValues = { "BRONZE", "SILVER", "GOLD",
            "PLATINUM" }, required = true)
    @NotBlank(message = "Membership level không được để trống")
    @Pattern(regexp = "^(BRONZE|SILVER|GOLD|PLATINUM)$", message = "Membership level phải là: BRONZE, SILVER, GOLD, hoặc PLATINUM")
    private String level;

    @Schema(description = "Reason for level change", example = "Admin upgrade for VIP customer", required = true)
    @NotBlank(message = "Lý do thay đổi level không được để trống")
    private String reason;

    @Schema(description = "Additional notes", example = "Special promotion upgrade")
    private String notes;

    @Schema(description = "Override automatic level calculation", example = "true")
    private Boolean overrideAutoCalculation = false;

    @Schema(description = "Effective date (leave null for immediate)", example = "2024-01-01")
    private String effectiveDate;
}
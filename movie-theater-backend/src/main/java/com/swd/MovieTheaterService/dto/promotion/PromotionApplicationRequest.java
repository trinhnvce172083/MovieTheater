package com.swp.MovieTheaterService.dto.promotion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Promotion Application Request DTO
 * Data transfer object for applying promotions to bookings
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionApplicationRequest {

    @NotBlank(message = "Promotion code is required")
    private String code;

    @NotNull(message = "Booking ID is required")
    private Long bookingId;
} 

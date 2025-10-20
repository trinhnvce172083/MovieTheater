package com.swp.MovieTheaterService.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * VNPay Payment Request DTO
 * DTO cho yêu cầu thanh toán VNPay
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VNPayPaymentRequestDTO {

    @NotNull(message = "Booking ID không được để trống")
    private Long bookingId;

    private String bankCode;

    @NotNull(message = "Ngôn ngữ không được để trống")
    @Builder.Default
    private String language = "vn";

    private String orderInfo;

    private String returnUrl;

    private String cancelUrl;
} 

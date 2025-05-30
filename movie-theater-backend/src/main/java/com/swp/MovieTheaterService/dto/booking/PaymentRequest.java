package com.swp.MovieTheaterService.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;

/**
 * Payment Request DTO
 * Data transfer object for payment processing
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // CASH, CREDIT_CARD, BANK_TRANSFER, E_WALLET

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", message = "Amount must be positive")
    private Double amount;

    private String cardNumber;
    private String cardHolderName;
    private String expiryDate;
    private String cvv;
    private String bankCode;
    private String transactionId;
} 
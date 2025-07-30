package com.swp.MovieTheaterService.dto.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Loyalty Transaction Response DTO
 * Data transfer object for loyalty transaction responses
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyTransactionResponse {

    private String message;
    private String status;
    private Long transactionId;
    private Long bookingId;
    private String transactionType;
    private Integer points;
    private String description;
    private Integer newBalance;
    private LocalDateTime transactionDate;
    private String earnRate;
    private String redeemRate;
    private Integer discountAmount;
    private Integer amountSpent;
} 
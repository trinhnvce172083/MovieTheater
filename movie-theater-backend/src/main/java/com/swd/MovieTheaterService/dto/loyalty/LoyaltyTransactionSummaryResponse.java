package com.swp.MovieTheaterService.dto.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Loyalty Transaction Summary Response DTO
 * Data transfer object for loyalty transaction summaries
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyTransactionSummaryResponse {

    private Long id;
    private String type;
    private Integer points;
    private String description;
    private LocalDateTime transactionDate;
    private Boolean isExpiring;
} 

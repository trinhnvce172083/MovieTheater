package com.swp.MovieTheaterService.dto.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Loyalty Leaderboard Response DTO
 * Data transfer object for loyalty leaderboard
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyLeaderboardResponse {

    private Integer rank;
    private String userName;
    private Integer points;
    private String tier;
}
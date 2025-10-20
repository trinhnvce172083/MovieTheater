package com.swp.MovieTheaterService.dto.movie;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Movie Summary Response DTO
 * Lightweight DTO for movie list responses
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieSummaryResponse {

    private Long movieId;
    private String title;
    private String genre;
    private Integer duration;
    private String formattedDuration;
    private LocalDate releaseDate;
    private String rating;
    private String posterUrl;
    private String backdropUrl;
    private Double price;
    private String status;
    private Double imdbRating;
    private Boolean isFeatured;
    private Boolean isAdultContent;
} 

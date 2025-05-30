package com.swp.MovieTheaterService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Movie Entity - Movie Management
 * Represents movies in the theater system
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Entity
@Table(name = "movietheater_movie")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Movie extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movie_id")
    private Long movieId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "original_title")
    private String originalTitle;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration", nullable = false)
    private Integer duration; // in minutes

    @Column(name = "genres", length = 100)
    private String genres;

    @Column(name = "director", length = 100)
    private String director;

    @Column(name = "cast", columnDefinition = "TEXT")
    private String cast;

    @Column(name = "language", length = 50)
    private String language;

    @Column(name = "country", length = 50)
    private String country;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "rating", length = 10)
    private String rating; // G, PG, PG-13, R, NC-17

    @Column(name = "poster_url")
    private String posterUrl;

    @Column(name = "backdrop_url")
    private String backdropUrl;

    @Column(name = "trailer_url")
    private String trailerUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;

    @Column(name = "price", nullable = false)
    private Double price;

    // Movie status
    @Column(name = "status", length = 20)
    private String status = "COMING_SOON"; // COMING_SOON, NOW_SHOWING, ENDED

    // Additional movie information
    @Column(name = "imdb_rating")
    private Double imdbRating;

    @Column(name = "production_company", length = 100)
    private String productionCompany;

    @Column(name = "budget")
    private Long budget;

    @Column(name = "box_office")
    private Long boxOffice;

    // Relationships
    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Schedule> schedules;

    // Business methods
    public boolean isNowShowing() {
        return "NOW_SHOWING".equals(status);
    }

    public boolean isComingSoon() {
        return "COMING_SOON".equals(status);
    }

    public boolean isEnded() {
        return "ENDED".equals(status);
    }

    public String getFormattedDuration() {
        if (duration == null) return "N/A";
        int hours = duration / 60;
        int minutes = duration % 60;
        if (hours > 0) {
            return hours + "h " + minutes + "m";
        }
        return minutes + "m";
    }

    public boolean isAdultContent() {
        return "R".equals(rating) || "NC-17".equals(rating);
    }

    public String getMovieName() {
        return title;
    }

    public String getPoster() {
        return posterUrl;
    }
} 
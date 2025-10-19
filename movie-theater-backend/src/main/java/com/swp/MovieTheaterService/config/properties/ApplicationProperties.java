package com.swp.MovieTheaterService.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Application Configuration Properties
 * Central place for all application configuration properties
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Component
@ConfigurationProperties(prefix = "app")
public class ApplicationProperties {

    private String name = "Movie Theater Management System";
    private String version = "1.0.0";
    private String description = "A comprehensive movie theater management system";
    
    private FileConfig file = new FileConfig();
    private BookingConfig booking = new BookingConfig();
    private PaginationConfig pagination = new PaginationConfig();

    @Data
    public static class FileConfig {
        private String uploadDir = "uploads/";
        private String maxSize = "10MB";
        private String allowedTypes = "jpg,jpeg,png,gif,pdf";
    }

    @Data
    public static class BookingConfig {
        private int maxSeatsPerBooking = 8;
        private int bookingDeadlineHours = 2; // Hours before showtime
    }

    @Data
    public static class PaginationConfig {
        private int defaultPageSize = 20;
        private int maxPageSize = 100;
    }
} 

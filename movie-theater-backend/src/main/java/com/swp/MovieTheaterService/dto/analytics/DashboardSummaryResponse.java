package com.swp.MovieTheaterService.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Dashboard Summary Response DTO
 * Thông tin tổng quan dashboard admin
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    
    // Overview metrics
    private OverviewMetrics overview;
    
    // Revenue metrics
    private RevenueMetrics revenue;
    
    // Booking metrics
    private BookingMetrics bookings;
    
    // Movie performance
    private List<MoviePerformance> topMovies;
    
    // Recent activities
    private List<RecentActivity> recentActivities;
    
    // Charts data
    private ChartsData charts;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverviewMetrics {
        private Long totalCustomers;
        private Long totalBookings;
        private Double totalRevenue;
        private Long totalMovies;
        private Long activeMovies;
        private Long totalShows;
        private Double averageRating;
        private Integer occupancyRate; // Tỷ lệ lấp đầy (%)
        
        // Growth percentages compared to previous period
        private Double customerGrowth;
        private Double bookingGrowth;
        private Double revenueGrowth;
        private Double showGrowth;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueMetrics {
        private Double todayRevenue;
        private Double weeklyRevenue;
        private Double monthlyRevenue;
        private Double yearlyRevenue;
        
        private Double avgRevenuePerBooking;
        private Double avgRevenuePerCustomer;
        
        // Revenue by payment method
        private Map<String, Double> revenueByPaymentMethod;
        
        // Revenue growth
        private Double dailyGrowth;
        private Double weeklyGrowth;
        private Double monthlyGrowth;
        
        // Target vs actual
        private Double monthlyTarget;
        private Double monthlyProgress; // Percentage
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingMetrics {
        private Long totalBookings;
        private Long pendingBookings;
        private Long confirmedBookings;
        private Long cancelledBookings;
        private Long completedBookings;
        
        private Double cancellationRate;
        private Double showRate; // Tỷ lệ khách đến xem
        
        // Time-based bookings
        private Long todayBookings;
        private Long weeklyBookings;
        private Long monthlyBookings;
        
        // Peak times
        private List<PeakTime> peakBookingTimes;
        private List<PeakTime> peakShowTimes;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MoviePerformance {
        private Long movieId;
        private String movieTitle;
        private String posterUrl;
        private Integer totalBookings;
        private Double totalRevenue;
        private Double averageRating;
        private Integer totalShows;
        private Integer soldSeats;
        private Integer totalSeats;
        private Double occupancyRate;
        private String genre;
        private String director;
        private Integer duration;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String type; // BOOKING, PAYMENT, CANCELLATION, REVIEW, MOVIE_ADDED
        private String title;
        private String description;
        private String customerName;
        private String movieTitle;
        private Double amount;
        private LocalDate activityDate;
        private String status;
        private String displayIcon;
        private String displayColor;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartsData {
        private List<ChartPoint> revenueChart; // 30 days
        private List<ChartPoint> bookingChart; // 30 days
        private List<ChartPoint> customerChart; // 12 months
        private List<GenrePerformance> genreChart;
        private List<ChartPoint> hourlyBookings; // 24 hours
        private List<ChartPoint> weeklyBookings; // 7 days
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartPoint {
        private String label; // Date, time, or category
        private Double value;
        private Integer count; // Optional count value
        private String color; // Optional color for charts
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenrePerformance {
        private String genre;
        private Integer movieCount;
        private Integer totalBookings;
        private Double totalRevenue;
        private Double averageRating;
        private String color;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeakTime {
        private String timeLabel; // "09:00-10:00" or "Thứ 2"
        private Integer hour; // 0-23 for hourly, 1-7 for daily
        private Integer bookingCount;
        private Double revenue;
        private Double percentage;
    }
    
    // Helper methods
    public String getRevenueGrowthDisplay() {
        if (revenue != null && revenue.getMonthlyGrowth() != null) {
            double growth = revenue.getMonthlyGrowth();
            return String.format("%+.1f%%", growth);
        }
        return "0%";
    }
    
    public String getOccupancyRateDisplay() {
        if (overview != null && overview.getOccupancyRate() != null) {
            return overview.getOccupancyRate() + "%";
        }
        return "0%";
    }
    
    public String getFormattedRevenue() {
        if (revenue != null && revenue.getMonthlyRevenue() != null) {
            return String.format("%,.0f VND", revenue.getMonthlyRevenue());
        }
        return "0 VND";
    }
    
    public String getMonthlyProgressDisplay() {
        if (revenue != null && revenue.getMonthlyProgress() != null) {
            return String.format("%.1f%%", revenue.getMonthlyProgress());
        }
        return "0%";
    }
} 

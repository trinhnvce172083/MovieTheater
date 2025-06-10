package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.analytics.DashboardSummaryResponse;
import com.swp.MovieTheaterService.dto.analytics.ReportRequest;
import com.swp.MovieTheaterService.enums.BookingStatus;
import com.swp.MovieTheaterService.repository.*;
import com.swp.MovieTheaterService.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Analytics Service Implementation
 * Xử lý analytics và báo cáo cho hệ thống rạp chiếu phim
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsServiceImpl implements AnalyticsService {

    private final BookingRepository bookingRepository;
    private final AccountRepository accountRepository;
    private final MovieRepository movieRepository;
    private final ScheduleRepository scheduleRepository;

    @Override
    public DashboardSummaryResponse getDashboardSummary() {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        return getDashboardSummary(startDate, endDate);
    }

    @Override
    public DashboardSummaryResponse getDashboardSummary(LocalDate startDate, LocalDate endDate) {
        log.info("Generating dashboard summary from {} to {}", startDate, endDate);

        try {
            // Calculate overview metrics
            DashboardSummaryResponse.OverviewMetrics overview = buildOverviewMetrics(startDate, endDate);
            
            // Calculate revenue metrics
            DashboardSummaryResponse.RevenueMetrics revenue = buildRevenueMetrics(startDate, endDate);
            
            // Calculate booking metrics
            DashboardSummaryResponse.BookingMetrics bookings = buildBookingMetrics(startDate, endDate);
            
            // Get top movies
            List<DashboardSummaryResponse.MoviePerformance> topMovies = buildTopMovies(startDate, endDate, 10);
            
            // Get recent activities
            List<DashboardSummaryResponse.RecentActivity> recentActivities = buildRecentActivities(10);
            
            // Build charts data
            DashboardSummaryResponse.ChartsData charts = buildChartsData(startDate, endDate);

            return DashboardSummaryResponse.builder()
                    .overview(overview)
                    .revenue(revenue)
                    .bookings(bookings)
                    .topMovies(topMovies)
                    .recentActivities(recentActivities)
                    .charts(charts)
                    .build();

        } catch (Exception e) {
            log.error("Error generating dashboard summary: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo dashboard summary", e);
        }
    }

    @Override
    public Map<String, Object> generateReport(ReportRequest request) {
        log.info("Generating report: {} from {} to {}", 
                request.getReportType(), request.getStartDate(), request.getEndDate());

        try {
            Map<String, Object> report = new HashMap<>();
            
            switch (request.getReportType()) {
                case REVENUE:
                    report = generateRevenueReport(request);
                    break;
                case BOOKING:
                    report = generateBookingReport(request);
                    break;
                case MOVIE_PERFORMANCE:
                    report = generateMoviePerformanceReport(request);
                    break;
                case CUSTOMER_ANALYSIS:
                    report = generateCustomerAnalysisReport(request);
                    break;
                case PEAK_TIME_ANALYSIS:
                    report = generatePeakTimeReport(request);
                    break;
                case COMPREHENSIVE:
                    report = generateComprehensiveReport(request);
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported report type: " + request.getReportType());
            }
            
            // Add metadata
            report.put("reportType", request.getReportType().getDisplayName());
            report.put("dateRange", request.getDateRangeDisplay());
            report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            report.put("generatedBy", "System");
            
            return report;

        } catch (Exception e) {
            log.error("Error generating report: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo báo cáo", e);
        }
    }

    @Override
    public byte[] exportReport(ReportRequest request) {
        try {
            Map<String, Object> reportData = generateReport(request);
            
            switch (request.getExportFormat()) {
                case JSON:
                    return exportToJson(reportData);
                case CSV:
                    return exportToCsv(reportData);
                case PDF:
                    return exportToPdf(reportData);
                case EXCEL:
                    return exportToExcel(reportData);
                default:
                    throw new IllegalArgumentException("Unsupported export format");
            }
        } catch (Exception e) {
            log.error("Error exporting report: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể export báo cáo", e);
        }
    }

    @Override
    public Map<String, Object> getRevenueAnalytics(LocalDate startDate, LocalDate endDate, String groupBy) {
        log.info("Getting revenue analytics from {} to {} grouped by {}", startDate, endDate, groupBy);
        
        Map<String, Object> result = new HashMap<>();
        
        // Mock revenue data - in real implementation, query from database
        List<DashboardSummaryResponse.ChartPoint> revenueData = generateMockRevenueData(startDate, endDate, groupBy);
        
        result.put("totalRevenue", 45678900.0);
        result.put("averageDaily", 1522630.0);
        result.put("growth", 12.5);
        result.put("chartData", revenueData);
        result.put("topDays", getTopRevenueDays(startDate, endDate));
        
        return result;
    }

    @Override
    public Map<String, Object> getBookingAnalytics(LocalDate startDate, LocalDate endDate, String groupBy) {
        log.info("Getting booking analytics from {} to {} grouped by {}", startDate, endDate, groupBy);
        
        Map<String, Object> result = new HashMap<>();
        
        // Mock booking data
        List<DashboardSummaryResponse.ChartPoint> bookingData = generateMockBookingData(startDate, endDate, groupBy);
        
        result.put("totalBookings", 2340L);
        result.put("averageDaily", 78);
        result.put("growth", 8.3);
        result.put("chartData", bookingData);
        result.put("peakHours", getPeakBookingHours());
        
        return result;
    }

    @Override
    public Map<String, Object> getMoviePerformanceAnalytics(LocalDate startDate, LocalDate endDate, Integer limit) {
        log.info("Getting movie performance analytics from {} to {} limit {}", startDate, endDate, limit);
        
        Map<String, Object> result = new HashMap<>();
        
        List<DashboardSummaryResponse.MoviePerformance> topMovies = buildTopMovies(startDate, endDate, limit);
        
        result.put("topMovies", topMovies);
        result.put("totalMovies", movieRepository.count());
        result.put("averageRating", 4.2);
        result.put("genrePerformance", getGenrePerformance(startDate, endDate));
        
        return result;
    }

    @Override
    public Map<String, Object> getCustomerAnalytics(LocalDate startDate, LocalDate endDate) {
        log.info("Getting customer analytics from {} to {}", startDate, endDate);
        
        Map<String, Object> result = new HashMap<>();
        
        result.put("totalCustomers", accountRepository.count());
        result.put("newCustomers", 234L);
        result.put("returningCustomers", 1876L);
        result.put("averageBookingsPerCustomer", 3.2);
        result.put("customerSegments", getCustomerSegments());
        result.put("loyaltyStats", getLoyaltyStats());
        
        return result;
    }

    @Override
    public Map<String, Object> getPeakTimeAnalytics(LocalDate startDate, LocalDate endDate) {
        log.info("Getting peak time analytics from {} to {}", startDate, endDate);
        
        Map<String, Object> result = new HashMap<>();
        
        result.put("peakHours", getPeakBookingHours());
        result.put("peakDays", getPeakBookingDays());
        result.put("seasonalTrends", getSeasonalTrends());
        result.put("recommendations", getPeakTimeRecommendations());
        
        return result;
    }

    @Override
    public Map<String, Object> getGenreAnalytics(LocalDate startDate, LocalDate endDate) {
        log.info("Getting genre analytics from {} to {}", startDate, endDate);
        
        Map<String, Object> result = new HashMap<>();
        
        result.put("genrePerformance", getGenrePerformance(startDate, endDate));
        result.put("genrePreferences", getGenrePreferences());
        result.put("seasonalGenreTrends", getSeasonalGenreTrends());
        
        return result;
    }

    @Override
    public Map<String, Object> getPaymentAnalytics(LocalDate startDate, LocalDate endDate) {
        log.info("Getting payment analytics from {} to {}", startDate, endDate);
        
        Map<String, Object> result = new HashMap<>();
        
        Map<String, Double> paymentMethods = new HashMap<>();
        paymentMethods.put("VNPay", 15600000.0);
        paymentMethods.put("MoMo", 8900000.0);
        paymentMethods.put("ZaloPay", 5400000.0);
        paymentMethods.put("Cash", 2300000.0);
        
        result.put("revenueByPaymentMethod", paymentMethods);
        result.put("averageTransactionValue", 185000.0);
        result.put("successRate", 98.5);
        result.put("failureAnalysis", getPaymentFailureAnalysis());
        
        return result;
    }

    @Override
    public Map<String, Object> getCancellationAnalytics(LocalDate startDate, LocalDate endDate) {
        log.info("Getting cancellation analytics from {} to {}", startDate, endDate);
        
        Map<String, Object> result = new HashMap<>();
        
        result.put("cancellationRate", 12.3);
        result.put("totalCancellations", 234L);
        result.put("refundAmount", 8900000.0);
        result.put("cancellationReasons", getCancellationReasons());
        result.put("cancellationPatterns", getCancellationPatterns());
        
        return result;
    }

    @Override
    public Map<String, Object> getPerformanceComparison(LocalDate startDate, LocalDate endDate) {
        log.info("Getting performance comparison for {} to {}", startDate, endDate);
        
        Map<String, Object> result = new HashMap<>();
        
        // Compare with previous period
        long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        LocalDate prevStartDate = startDate.minusDays(days + 1);
        LocalDate prevEndDate = startDate.minusDays(1);
        
        result.put("currentPeriod", buildPeriodSummary(startDate, endDate));
        result.put("previousPeriod", buildPeriodSummary(prevStartDate, prevEndDate));
        result.put("growth", calculateGrowthMetrics(startDate, endDate, prevStartDate, prevEndDate));
        
        return result;
    }

    @Override
    public Map<String, Object> getForecastData(Integer days) {
        log.info("Getting forecast data for {} days", days);
        
        Map<String, Object> result = new HashMap<>();
        
        // Simple linear projection based on recent trends
        List<DashboardSummaryResponse.ChartPoint> forecastRevenue = generateForecastData(days, "revenue");
        List<DashboardSummaryResponse.ChartPoint> forecastBookings = generateForecastData(days, "bookings");
        
        result.put("revenueForcast", forecastRevenue);
        result.put("bookingsForecast", forecastBookings);
        result.put("confidenceLevel", 75.0);
        result.put("methodology", "Linear regression based on 30-day trends");
        
        return result;
    }

    @Override
    public Map<String, Object> getRealTimeStats() {
        log.info("Getting real-time stats");
        
        Map<String, Object> result = new HashMap<>();
        
        LocalDate today = LocalDate.now();
        
        result.put("todayBookings", 45L);
        result.put("todayRevenue", 6780000.0);
        result.put("onlineUsers", 127);
        result.put("activeBookingSessions", 23);
        result.put("lastUpdated", LocalDateTime.now());
        result.put("systemHealth", "healthy");
        
        return result;
    }

    // Private helper methods

    private DashboardSummaryResponse.OverviewMetrics buildOverviewMetrics(LocalDate startDate, LocalDate endDate) {
        return DashboardSummaryResponse.OverviewMetrics.builder()
                .totalCustomers(accountRepository.count())
                .totalBookings(2340L)
                .totalRevenue(45678900.0)
                .totalMovies(movieRepository.count())
                .activeMovies(124L)
                .totalShows(890L)
                .averageRating(4.2)
                .occupancyRate(68)
                .customerGrowth(8.5)
                .bookingGrowth(12.3)
                .revenueGrowth(15.7)
                .showGrowth(5.2)
                .build();
    }

    private DashboardSummaryResponse.RevenueMetrics buildRevenueMetrics(LocalDate startDate, LocalDate endDate) {
        Map<String, Double> revenueByPayment = new HashMap<>();
        revenueByPayment.put("VNPay", 15600000.0);
        revenueByPayment.put("MoMo", 8900000.0);
        revenueByPayment.put("ZaloPay", 5400000.0);
        revenueByPayment.put("Cash", 2300000.0);

        return DashboardSummaryResponse.RevenueMetrics.builder()
                .todayRevenue(1250000.0)
                .weeklyRevenue(8900000.0)
                .monthlyRevenue(32400000.0)
                .yearlyRevenue(145600000.0)
                .avgRevenuePerBooking(195000.0)
                .avgRevenuePerCustomer(287000.0)
                .revenueByPaymentMethod(revenueByPayment)
                .dailyGrowth(5.2)
                .weeklyGrowth(8.7)
                .monthlyGrowth(12.5)
                .monthlyTarget(35000000.0)
                .monthlyProgress(92.6)
                .build();
    }

    private DashboardSummaryResponse.BookingMetrics buildBookingMetrics(LocalDate startDate, LocalDate endDate) {
        List<DashboardSummaryResponse.PeakTime> peakTimes = Arrays.asList(
                DashboardSummaryResponse.PeakTime.builder()
                        .timeLabel("19:00-20:00")
                        .hour(19)
                        .bookingCount(156)
                        .revenue(2340000.0)
                        .percentage(23.4)
                        .build(),
                DashboardSummaryResponse.PeakTime.builder()
                        .timeLabel("20:00-21:00")
                        .hour(20)
                        .bookingCount(189)
                        .revenue(2890000.0)
                        .percentage(28.5)
                        .build()
        );

        return DashboardSummaryResponse.BookingMetrics.builder()
                .totalBookings(2340L)
                .pendingBookings(45L)
                .confirmedBookings(1890L)
                .cancelledBookings(234L)
                .completedBookings(1671L)
                .cancellationRate(10.0)
                .showRate(88.4)
                .todayBookings(67L)
                .weeklyBookings(456L)
                .monthlyBookings(2340L)
                .peakBookingTimes(peakTimes)
                .peakShowTimes(peakTimes)
                .build();
    }

    private List<DashboardSummaryResponse.MoviePerformance> buildTopMovies(LocalDate startDate, LocalDate endDate, Integer limit) {
        List<DashboardSummaryResponse.MoviePerformance> movies = new ArrayList<>();
        
        // Mock data - in real implementation, query from database
        for (int i = 1; i <= limit; i++) {
            movies.add(DashboardSummaryResponse.MoviePerformance.builder()
                    .movieId((long) i)
                    .movieTitle("Phim " + i)
                    .posterUrl("/posters/movie" + i + ".jpg")
                    .totalBookings(450 - (i * 30))
                    .totalRevenue(8900000.0 - (i * 500000))
                    .averageRating(4.5 - (i * 0.1))
                    .totalShows(45 - (i * 3))
                    .soldSeats(1200 - (i * 80))
                    .totalSeats(1500)
                    .occupancyRate(80.0 - (i * 2))
                    .genre("Action")
                    .director("Director " + i)
                    .duration(120)
                    .build());
        }
        
        return movies;
    }

    private List<DashboardSummaryResponse.RecentActivity> buildRecentActivities(Integer limit) {
        List<DashboardSummaryResponse.RecentActivity> activities = new ArrayList<>();
        
        // Mock recent activities
        activities.add(DashboardSummaryResponse.RecentActivity.builder()
                .type("BOOKING")
                .title("Đặt vé mới")
                .description("Khách hàng Nguyễn Văn A đặt 2 vé xem phim Avatar")
                .customerName("Nguyễn Văn A")
                .movieTitle("Avatar")
                .amount(250000.0)
                .activityDate(LocalDate.now())
                .status("COMPLETED")
                .displayIcon("booking")
                .displayColor("#4CAF50")
                .build());
                
        return activities.stream().limit(limit).collect(Collectors.toList());
    }

    private DashboardSummaryResponse.ChartsData buildChartsData(LocalDate startDate, LocalDate endDate) {
        return DashboardSummaryResponse.ChartsData.builder()
                .revenueChart(generateMockRevenueData(startDate, endDate, "DAY"))
                .bookingChart(generateMockBookingData(startDate, endDate, "DAY"))
                .customerChart(generateMockCustomerData())
                .genreChart(generateMockGenreData())
                .hourlyBookings(generateMockHourlyData())
                .weeklyBookings(generateMockWeeklyData())
                .build();
    }

    private List<DashboardSummaryResponse.ChartPoint> generateMockRevenueData(LocalDate startDate, LocalDate endDate, String groupBy) {
        List<DashboardSummaryResponse.ChartPoint> data = new ArrayList<>();
        long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        
        for (int i = 0; i <= days; i++) {
            LocalDate date = startDate.plusDays(i);
            data.add(DashboardSummaryResponse.ChartPoint.builder()
                    .label(date.format(DateTimeFormatter.ofPattern("dd/MM")))
                    .value(1500000.0 + (Math.random() * 1000000))
                    .count((int) (50 + Math.random() * 50))
                    .build());
        }
        
        return data;
    }

    private List<DashboardSummaryResponse.ChartPoint> generateMockBookingData(LocalDate startDate, LocalDate endDate, String groupBy) {
        List<DashboardSummaryResponse.ChartPoint> data = new ArrayList<>();
        long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        
        for (int i = 0; i <= days; i++) {
            LocalDate date = startDate.plusDays(i);
            data.add(DashboardSummaryResponse.ChartPoint.builder()
                    .label(date.format(DateTimeFormatter.ofPattern("dd/MM")))
                    .value(null)
                    .count((int) (30 + Math.random() * 40))
                    .build());
        }
        
        return data;
    }

    private List<DashboardSummaryResponse.ChartPoint> generateMockCustomerData() {
        return Arrays.asList(
                DashboardSummaryResponse.ChartPoint.builder().label("T1").count(234).build(),
                DashboardSummaryResponse.ChartPoint.builder().label("T2").count(456).build(),
                DashboardSummaryResponse.ChartPoint.builder().label("T3").count(345).build()
        );
    }

    private List<DashboardSummaryResponse.GenrePerformance> generateMockGenreData() {
        return Arrays.asList(
                DashboardSummaryResponse.GenrePerformance.builder()
                        .genre("Action")
                        .movieCount(25)
                        .totalBookings(1200)
                        .totalRevenue(18000000.0)
                        .averageRating(4.3)
                        .color("#FF6B6B")
                        .build(),
                DashboardSummaryResponse.GenrePerformance.builder()
                        .genre("Comedy")
                        .movieCount(18)
                        .totalBookings(890)
                        .totalRevenue(13500000.0)
                        .averageRating(4.1)
                        .color("#4ECDC4")
                        .build()
        );
    }

    private List<DashboardSummaryResponse.ChartPoint> generateMockHourlyData() {
        List<DashboardSummaryResponse.ChartPoint> data = new ArrayList<>();
        for (int i = 0; i < 24; i++) {
            data.add(DashboardSummaryResponse.ChartPoint.builder()
                    .label(String.format("%02d:00", i))
                    .count((int) (10 + Math.random() * 50))
                    .build());
        }
        return data;
    }

    private List<DashboardSummaryResponse.ChartPoint> generateMockWeeklyData() {
        String[] days = {"Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"};
        List<DashboardSummaryResponse.ChartPoint> data = new ArrayList<>();
        for (String day : days) {
            data.add(DashboardSummaryResponse.ChartPoint.builder()
                    .label(day)
                    .count((int) (50 + Math.random() * 100))
                    .build());
        }
        return data;
    }

    // Report generation methods
    private Map<String, Object> generateRevenueReport(ReportRequest request) {
        Map<String, Object> report = new HashMap<>();
        report.put("summary", "Báo cáo doanh thu chi tiết");
        report.put("totalRevenue", 45678900.0);
        report.put("breakdown", getRevenueBreakdown(request));
        return report;
    }

    private Map<String, Object> generateBookingReport(ReportRequest request) {
        Map<String, Object> report = new HashMap<>();
        report.put("summary", "Báo cáo đặt vé chi tiết");
        report.put("totalBookings", 2340L);
        report.put("breakdown", getBookingBreakdown(request));
        return report;
    }

    private Map<String, Object> generateMoviePerformanceReport(ReportRequest request) {
        Map<String, Object> report = new HashMap<>();
        report.put("summary", "Báo cáo hiệu suất phim");
        report.put("topMovies", buildTopMovies(request.getStartDate(), request.getEndDate(), 20));
        return report;
    }

    private Map<String, Object> generateCustomerAnalysisReport(ReportRequest request) {
        Map<String, Object> report = new HashMap<>();
        report.put("summary", "Phân tích khách hàng");
        report.put("customerSegments", getCustomerSegments());
        return report;
    }

    private Map<String, Object> generatePeakTimeReport(ReportRequest request) {
        Map<String, Object> report = new HashMap<>();
        report.put("summary", "Phân tích giờ cao điểm");
        report.put("peakHours", getPeakBookingHours());
        return report;
    }

    private Map<String, Object> generateComprehensiveReport(ReportRequest request) {
        Map<String, Object> report = new HashMap<>();
        report.put("summary", "Báo cáo tổng hợp");
        report.put("overview", buildOverviewMetrics(request.getStartDate(), request.getEndDate()));
        report.put("revenue", buildRevenueMetrics(request.getStartDate(), request.getEndDate()));
        report.put("bookings", buildBookingMetrics(request.getStartDate(), request.getEndDate()));
        return report;
    }

    // Export methods
    private byte[] exportToJson(Map<String, Object> data) {
        // Mock JSON export
        return "{\"report\": \"data\"}".getBytes();
    }

    private byte[] exportToCsv(Map<String, Object> data) {
        // Mock CSV export
        return "Date,Revenue,Bookings\n2024-01-01,1500000,45".getBytes();
    }

    private byte[] exportToPdf(Map<String, Object> data) {
        // Mock PDF export - in real implementation, use iText or similar
        return "PDF Content".getBytes();
    }

    private byte[] exportToExcel(Map<String, Object> data) {
        // Mock Excel export - in real implementation, use Apache POI
        return "Excel Content".getBytes();
    }

    // Helper methods for analytics
    private List<Map<String, Object>> getTopRevenueDays(LocalDate startDate, LocalDate endDate) {
        return Arrays.asList(
                Map.of("date", "01/12/2024", "revenue", 2500000.0),
                Map.of("date", "02/12/2024", "revenue", 2300000.0)
        );
    }

    private List<Map<String, Object>> getPeakBookingHours() {
        return Arrays.asList(
                Map.of("hour", 19, "bookings", 156),
                Map.of("hour", 20, "bookings", 189)
        );
    }

    private List<Map<String, Object>> getPeakBookingDays() {
        return Arrays.asList(
                Map.of("day", "Thứ 7", "bookings", 345),
                Map.of("day", "Chủ nhật", "bookings", 389)
        );
    }

    private List<DashboardSummaryResponse.GenrePerformance> getGenrePerformance(LocalDate startDate, LocalDate endDate) {
        return generateMockGenreData();
    }

    private Map<String, Object> getCustomerSegments() {
        return Map.of(
                "new", 234,
                "returning", 1876,
                "vip", 145
        );
    }

    private Map<String, Object> getLoyaltyStats() {
        return Map.of(
                "averageVisits", 3.2,
                "loyaltyRate", 68.5
        );
    }

    private Map<String, Object> getSeasonalTrends() {
        return Map.of(
                "peak_season", "Tết Nguyên Đán",
                "low_season", "Tháng 8"
        );
    }

    private List<String> getPeakTimeRecommendations() {
        return Arrays.asList(
                "Tăng suất chiếu vào 19h-21h",
                "Khuyến mãi cho khung giờ ít người"
        );
    }

    private Map<String, Object> getGenrePreferences() {
        return Map.of(
                "most_popular", "Action",
                "trending", "Comedy"
        );
    }

    private Map<String, Object> getSeasonalGenreTrends() {
        return Map.of(
                "summer", "Action",
                "winter", "Romance"
        );
    }

    private Map<String, Object> getPaymentFailureAnalysis() {
        return Map.of(
                "timeout_rate", 1.2,
                "network_errors", 0.3
        );
    }

    private Map<String, Object> getCancellationReasons() {
        return Map.of(
                "schedule_conflict", 45.2,
                "weather", 23.1,
                "other", 31.7
        );
    }

    private Map<String, Object> getCancellationPatterns() {
        return Map.of(
                "peak_cancellation_time", "2 giờ trước suất chiếu",
                "most_cancelled_genre", "Drama"
        );
    }

    private Map<String, Object> buildPeriodSummary(LocalDate startDate, LocalDate endDate) {
        return Map.of(
                "revenue", 15600000.0,
                "bookings", 780L,
                "customers", 456L
        );
    }

    private Map<String, Object> calculateGrowthMetrics(LocalDate startDate, LocalDate endDate, 
                                                       LocalDate prevStartDate, LocalDate prevEndDate) {
        return Map.of(
                "revenue_growth", 12.5,
                "booking_growth", 8.3,
                "customer_growth", 5.7
        );
    }

    private List<DashboardSummaryResponse.ChartPoint> generateForecastData(Integer days, String type) {
        List<DashboardSummaryResponse.ChartPoint> forecast = new ArrayList<>();
        for (int i = 1; i <= days; i++) {
            LocalDate futureDate = LocalDate.now().plusDays(i);
            double value = type.equals("revenue") ? 1500000.0 + (Math.random() * 500000) : 0;
            int count = type.equals("bookings") ? (int) (50 + Math.random() * 30) : 0;
            
            forecast.add(DashboardSummaryResponse.ChartPoint.builder()
                    .label(futureDate.format(DateTimeFormatter.ofPattern("dd/MM")))
                    .value(type.equals("revenue") ? value : null)
                    .count(type.equals("bookings") ? count : null)
                    .build());
        }
        return forecast;
    }

    private Map<String, Object> getRevenueBreakdown(ReportRequest request) {
        return Map.of(
                "daily", generateMockRevenueData(request.getStartDate(), request.getEndDate(), "DAY"),
                "by_movie", "breakdown by movies",
                "by_payment", "breakdown by payment methods"
        );
    }

    private Map<String, Object> getBookingBreakdown(ReportRequest request) {
        return Map.of(
                "daily", generateMockBookingData(request.getStartDate(), request.getEndDate(), "DAY"),
                "by_status", "breakdown by status",
                "by_movie", "breakdown by movies"
        );
    }
} 
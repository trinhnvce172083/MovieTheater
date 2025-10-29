package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.analytics.DashboardSummaryResponse;
import com.swp.MovieTheaterService.dto.analytics.ReportRequest;
import com.swp.MovieTheaterService.dto.response.ApiResponse;
import com.swp.MovieTheaterService.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * Analytics Controller
 * REST API endpoints cho analytics và báo cáo
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Analytics & Reporting", description = "APIs for analytics dashboard and reporting")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // ==================== DASHBOARD ENDPOINTS ====================

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard summary", description = "Get overall dashboard metrics and statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        
        log.info("Getting dashboard summary for period: {} to {}", startDate, endDate);
        
        DashboardSummaryResponse dashboard;
        if (startDate != null && endDate != null) {
            dashboard = analyticsService.getDashboardSummary(startDate, endDate);
        } else {
            dashboard = analyticsService.getDashboardSummary();
        }

        ApiResponse<DashboardSummaryResponse> apiResponse = ApiResponse.<DashboardSummaryResponse>builder()
                .success(true)
                .message("Lấy thống kê tổng quan thành công")
                .data(dashboard)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/dashboard/real-time")
    @Operation(summary = "Get real-time stats", description = "Get current real-time statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRealTimeStats() {
        
        log.info("Getting real-time statistics");
        
        Map<String, Object> stats = analyticsService.getRealTimeStats();

        ApiResponse<Map<String, Object>> apiResponse = ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Lấy thống kê thời gian thực thành công")
                .data(stats)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    // ==================== REVENUE ANALYTICS ====================

    @GetMapping("/revenue")
    @Operation(summary = "Get revenue analytics", description = "Get detailed revenue analysis")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenueAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "DAY") String groupBy,
            Authentication authentication) {
        
        log.info("Getting revenue analytics from {} to {} grouped by {}", startDate, endDate, groupBy);
        
        Map<String, Object> analytics = analyticsService.getRevenueAnalytics(startDate, endDate, groupBy);

        ApiResponse<Map<String, Object>> apiResponse = ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Lấy phân tích doanh thu thành công")
                .data(analytics)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    // ==================== BOOKING ANALYTICS ====================

    @GetMapping("/bookings")
    @Operation(summary = "Get booking analytics", description = "Get detailed booking analysis")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getBookingAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "DAY") String groupBy,
            Authentication authentication) {
        
        log.info("Getting booking analytics from {} to {} grouped by {}", startDate, endDate, groupBy);
        
        Map<String, Object> analytics = analyticsService.getBookingAnalytics(startDate, endDate, groupBy);
        return ResponseEntity.ok(analytics);
    }

    // ==================== MOVIE PERFORMANCE ====================

    @GetMapping("/movies/performance")
    @Operation(summary = "Get movie performance", description = "Get movie performance analytics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getMoviePerformance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "20") Integer limit,
            Authentication authentication) {
        
        log.info("Getting movie performance from {} to {} limit {}", startDate, endDate, limit);
        
        Map<String, Object> performance = analyticsService.getMoviePerformanceAnalytics(startDate, endDate, limit);
        return ResponseEntity.ok(performance);
    }

    // ==================== CUSTOMER ANALYTICS ====================

    @GetMapping("/customers")
    @Operation(summary = "Get customer analytics", description = "Get customer behavior analysis")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getCustomerAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        
        log.info("Getting customer analytics from {} to {}", startDate, endDate);
        
        Map<String, Object> analytics = analyticsService.getCustomerAnalytics(startDate, endDate);
        return ResponseEntity.ok(analytics);
    }

    // ==================== PEAK TIME ANALYTICS ====================

    @GetMapping("/peak-times")
    @Operation(summary = "Get peak time analytics", description = "Get peak time and pattern analysis")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getPeakTimeAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        
        log.info("Getting peak time analytics from {} to {}", startDate, endDate);
        
        Map<String, Object> analytics = analyticsService.getPeakTimeAnalytics(startDate, endDate);
        return ResponseEntity.ok(analytics);
    }

    // ==================== GENRE ANALYTICS ====================

    @GetMapping("/genres")
    @Operation(summary = "Get genre analytics", description = "Get genre performance and preferences")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getGenreAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        
        log.info("Getting genre analytics from {} to {}", startDate, endDate);
        
        Map<String, Object> analytics = analyticsService.getGenreAnalytics(startDate, endDate);
        return ResponseEntity.ok(analytics);
    }

    // ==================== PAYMENT ANALYTICS ====================

    @GetMapping("/payments")
    @Operation(summary = "Get payment analytics", description = "Get payment method and transaction analysis")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getPaymentAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        
        log.info("Getting payment analytics from {} to {}", startDate, endDate);
        
        Map<String, Object> analytics = analyticsService.getPaymentAnalytics(startDate, endDate);
        return ResponseEntity.ok(analytics);
    }

    // ==================== CANCELLATION ANALYTICS ====================

    @GetMapping("/cancellations")
    @Operation(summary = "Get cancellation analytics", description = "Get booking cancellation analysis")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getCancellationAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        
        log.info("Getting cancellation analytics from {} to {}", startDate, endDate);
        
        Map<String, Object> analytics = analyticsService.getCancellationAnalytics(startDate, endDate);
        return ResponseEntity.ok(analytics);
    }

    // ==================== PERFORMANCE COMPARISON ====================

    @GetMapping("/performance/comparison")
    @Operation(summary = "Get performance comparison", description = "Compare performance with previous period")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getPerformanceComparison(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        
        log.info("Getting performance comparison for {} to {}", startDate, endDate);
        
        Map<String, Object> comparison = analyticsService.getPerformanceComparison(startDate, endDate);
        return ResponseEntity.ok(comparison);
    }

    // ==================== FORECAST ====================

    @GetMapping("/forecast")
    @Operation(summary = "Get forecast data", description = "Get future performance predictions")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getForecastData(
            @RequestParam(defaultValue = "30") Integer days,
            Authentication authentication) {
        
        log.info("Getting forecast data for {} days", days);
        
        Map<String, Object> forecast = analyticsService.getForecastData(days);
        return ResponseEntity.ok(forecast);
    }

    // ==================== REPORTS ====================

    @PostMapping("/reports/generate")
    @Operation(summary = "Generate report", description = "Generate custom report based on criteria")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> generateReport(
            @Valid @RequestBody ReportRequest request,
            Authentication authentication) {
        
        log.info("Generating report: {} for period {} to {}", 
                request.getReportType(), request.getStartDate(), request.getEndDate());
        
        // Validate request
        if (!request.isValidDateRange()) {
            return ResponseEntity.badRequest().build();
        }
        
        if (!request.isValidGroupBy()) {
            return ResponseEntity.badRequest().build();
        }
        
        Map<String, Object> report = analyticsService.generateReport(request);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/reports/export")
    @Operation(summary = "Export report", description = "Export report to file format")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<byte[]> exportReport(
            @Valid @RequestBody ReportRequest request,
            Authentication authentication) {
        
        log.info("Exporting report: {} as {} for period {} to {}", 
                request.getReportType(), request.getExportFormat(), 
                request.getStartDate(), request.getEndDate());
        
        // Validate request
        if (!request.isValidDateRange()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            byte[] reportData = analyticsService.exportReport(request);
            
            String filename = generateFilename(request);
            MediaType mediaType = getMediaType(request.getExportFormat());
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(mediaType)
                    .body(reportData);
                    
        } catch (Exception e) {
            log.error("Error exporting report: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== REPORT TEMPLATES ====================

    @GetMapping("/reports/templates")
    @Operation(summary = "Get report templates", description = "Get available report templates")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getReportTemplates() {
        
        Map<String, Object> templates = Map.of(
                "reportTypes", ReportRequest.ReportType.values(),
                "groupByOptions", ReportRequest.GroupBy.values(),
                "sortByOptions", ReportRequest.SortBy.values(),
                "exportFormats", ReportRequest.ExportFormat.values()
        );
        
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/reports/presets")
    @Operation(summary = "Get report presets", description = "Get predefined report configurations")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getReportPresets() {
        
        Map<String, Object> presets = Map.of(
                "dailyRevenue", Map.of(
                        "reportType", "REVENUE",
                        "groupBy", "DAY",
                        "description", "Báo cáo doanh thu hàng ngày"
                ),
                "monthlyBookings", Map.of(
                        "reportType", "BOOKING",
                        "groupBy", "MONTH",
                        "description", "Báo cáo đặt vé hàng tháng"
                ),
                "moviePerformance", Map.of(
                        "reportType", "MOVIE_PERFORMANCE",
                        "sortBy", "REVENUE",
                        "description", "Báo cáo hiệu suất phim"
                ),
                "comprehensive", Map.of(
                        "reportType", "COMPREHENSIVE",
                        "includeCharts", true,
                        "includeSummary", true,
                        "description", "Báo cáo tổng hợp đầy đủ"
                )
        );
        
        return ResponseEntity.ok(presets);
    }

    // ==================== HELPER METHODS ====================

    private String generateFilename(ReportRequest request) {
        String dateRange = request.getStartDate().toString() + "_to_" + request.getEndDate().toString();
        String reportType = request.getReportType().name().toLowerCase();
        String extension = getFileExtension(request.getExportFormat());
        
        return String.format("report_%s_%s.%s", reportType, dateRange, extension);
    }

    private String getFileExtension(ReportRequest.ExportFormat format) {
        switch (format) {
            case PDF: return "pdf";
            case EXCEL: return "xlsx";
            case CSV: return "csv";
            case JSON: return "json";
            default: return "txt";
        }
    }

    private MediaType getMediaType(ReportRequest.ExportFormat format) {
        switch (format) {
            case PDF: return MediaType.APPLICATION_PDF;
            case EXCEL: return MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            case CSV: return MediaType.parseMediaType("text/csv");
            case JSON: return MediaType.APPLICATION_JSON;
            default: return MediaType.TEXT_PLAIN;
        }
    }
}
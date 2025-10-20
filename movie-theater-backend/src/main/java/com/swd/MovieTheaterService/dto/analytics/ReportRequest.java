package com.swp.MovieTheaterService.dto.analytics;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Report Request DTO
 * Thông tin yêu cầu tạo báo cáo
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {

    @NotNull(message = "Loại báo cáo không được để trống")
    private ReportType reportType;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;

    // Filter options
    private List<Long> movieIds; // Lọc theo phim cụ thể
    private List<Long> cinemaIds; // Lọc theo rạp cụ thể
    private List<String> genres; // Lọc theo thể loại
    private List<String> paymentMethods; // Lọc theo phương thức thanh toán
    private String bookingStatus; // Lọc theo trạng thái booking

    // Grouping options
    private GroupBy groupBy;
    private SortBy sortBy;
    private SortOrder sortOrder;

    // Export options
    private ExportFormat exportFormat;
    private Boolean includeCharts;
    private Boolean includeSummary;
    private Boolean includeDetails;

    /**
     * Report Types
     */
    public enum ReportType {
        REVENUE("Báo cáo doanh thu"),
        BOOKING("Báo cáo đặt vé"),
        MOVIE_PERFORMANCE("Báo cáo hiệu suất phim"),
        CUSTOMER_ANALYSIS("Phân tích khách hàng"),
        CINEMA_PERFORMANCE("Báo cáo hiệu suất rạp"),
        PAYMENT_ANALYSIS("Phân tích thanh toán"),
        CANCELLATION_ANALYSIS("Phân tích hủy vé"),
        PEAK_TIME_ANALYSIS("Phân tích giờ cao điểm"),
        COMPREHENSIVE("Báo cáo tổng hợp");

        private final String displayName;

        ReportType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * Group By Options
     */
    public enum GroupBy {
        DAY("Theo ngày"),
        WEEK("Theo tuần"),
        MONTH("Theo tháng"),
        QUARTER("Theo quý"),
        YEAR("Theo năm"),
        MOVIE("Theo phim"),
        GENRE("Theo thể loại"),
        CINEMA("Theo rạp"),
        PAYMENT_METHOD("Theo phương thức thanh toán"),
        HOUR("Theo giờ"),
        DAY_OF_WEEK("Theo thứ trong tuần");

        private final String displayName;

        GroupBy(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * Sort By Options
     */
    public enum SortBy {
        DATE("Ngày"),
        REVENUE("Doanh thu"),
        BOOKING_COUNT("Số lượng đặt vé"),
        MOVIE_TITLE("Tên phim"),
        CUSTOMER_COUNT("Số khách hàng"),
        RATING("Đánh giá"),
        OCCUPANCY_RATE("Tỷ lệ lấp đầy");

        private final String displayName;

        SortBy(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * Sort Order
     */
    public enum SortOrder {
        ASC("Tăng dần"),
        DESC("Giảm dần");

        private final String displayName;

        SortOrder(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * Export Formats
     */
    public enum ExportFormat {
        PDF("PDF"),
        EXCEL("Excel"),
        CSV("CSV"),
        JSON("JSON");

        private final String displayName;

        ExportFormat(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // Validation methods
    public boolean isValidDateRange() {
        return startDate != null && endDate != null &&
                !startDate.isAfter(endDate) &&
                !startDate.isAfter(LocalDate.now());
    }

    public boolean isValidGroupBy() {
        if (groupBy == null) return true;

        // Check if groupBy is compatible with date range
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);

        switch (groupBy) {
            case DAY:
                return daysBetween <= 365; // Max 1 year for daily grouping
            case WEEK:
                return daysBetween <= 730; // Max 2 years for weekly grouping
            case MONTH:
                return daysBetween <= 1095; // Max 3 years for monthly grouping
            default:
                return true;
        }
    }

    // Helper methods
    public String getDateRangeDisplay() {
        if (startDate != null && endDate != null) {
            return startDate.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) +
                    " - " +
                    endDate.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }
        return "";
    }

    public int getDaysBetween() {
        if (startDate != null && endDate != null) {
            return (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        }
        return 0;
    }

    public boolean isCurrentMonth() {
        LocalDate now = LocalDate.now();
        return startDate != null && endDate != null &&
                startDate.getYear() == now.getYear() &&
                startDate.getMonth() == now.getMonth() &&
                endDate.getYear() == now.getYear() &&
                endDate.getMonth() == now.getMonth();
    }

    public boolean isCurrentWeek() {
        LocalDate now = LocalDate.now();
        LocalDate startOfWeek = now.minusDays(now.getDayOfWeek().getValue() - 1);
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        return startDate != null && endDate != null &&
                startDate.equals(startOfWeek) && endDate.equals(endOfWeek);
    }
} 

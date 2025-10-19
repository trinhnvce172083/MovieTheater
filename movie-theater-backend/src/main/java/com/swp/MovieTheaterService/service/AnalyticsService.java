package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.analytics.DashboardSummaryResponse;
import com.swp.MovieTheaterService.dto.analytics.ReportRequest;

import java.time.LocalDate;
import java.util.Map;

/**
 * Analytics Service Interface
 * Xử lý analytics và báo cáo
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public interface AnalyticsService {
    
    /**
     * Lấy thông tin tổng quan dashboard
     * 
     * @return dashboard summary data
     */
    DashboardSummaryResponse getDashboardSummary();
    
    /**
     * Lấy thông tin tổng quan dashboard theo khoảng thời gian
     * 
     * @param startDate ngày bắt đầu
     * @param endDate ngày kết thúc
     * @return dashboard summary data
     */
    DashboardSummaryResponse getDashboardSummary(LocalDate startDate, LocalDate endDate);
    
    /**
     * Tạo báo cáo theo yêu cầu
     * 
     * @param request thông tin yêu cầu báo cáo
     * @return dữ liệu báo cáo
     */
    Map<String, Object> generateReport(ReportRequest request);
    
    /**
     * Export báo cáo ra file
     * 
     * @param request thông tin yêu cầu báo cáo
     * @return đường dẫn file hoặc byte array
     */
    byte[] exportReport(ReportRequest request);
    
    /**
     * Lấy dữ liệu doanh thu theo thời gian
     * 
     * @param startDate ngày bắt đầu
     * @param endDate ngày kết thúc
     * @param groupBy nhóm theo (DAY, WEEK, MONTH)
     * @return dữ liệu doanh thu
     */
    Map<String, Object> getRevenueAnalytics(LocalDate startDate, LocalDate endDate, String groupBy);
    
    /**
     * Lấy thống kê booking theo thời gian
     * 
     * @param startDate ngày bắt đầu
     * @param endDate ngày kết thúc
     * @param groupBy nhóm theo (DAY, WEEK, MONTH)
     * @return thống kê booking
     */
    Map<String, Object> getBookingAnalytics(LocalDate startDate, LocalDate endDate, String groupBy);
    
    /**
     * Phân tích hiệu suất phim
     * 
     * @param startDate ngày bắt đầu
     * @param endDate ngày kết thúc
     * @param limit số lượng phim top
     * @return danh sách phim có hiệu suất tốt nhất
     */
    Map<String, Object> getMoviePerformanceAnalytics(LocalDate startDate, LocalDate endDate, Integer limit);
    
    /**
     * Phân tích khách hàng
     * 
     * @param startDate ngày bắt đầu
     * @param endDate ngày kết thúc
     * @return thống kê khách hàng
     */
    Map<String, Object> getCustomerAnalytics(LocalDate startDate, LocalDate endDate);
    
    /**
     * Phân tích giờ cao điểm
     * 
     * @param startDate ngày bắt đầu
     * @param endDate ngày kết thúc
     * @return thống kê giờ cao điểm
     */
    Map<String, Object> getPeakTimeAnalytics(LocalDate startDate, LocalDate endDate);
    
    /**
     * Thống kê theo thể loại phim
     * 
     * @param startDate ngày bắt đầu
     * @param endDate ngày kết thúc
     * @return thống kê theo thể loại
     */
    Map<String, Object> getGenreAnalytics(LocalDate startDate, LocalDate endDate);
    
    /**
     * Phân tích phương thức thanh toán
     * 
     * @param startDate ngày bắt đầu
     * @param endDate ngày kết thúc
     * @return thống kê thanh toán
     */
    Map<String, Object> getPaymentAnalytics(LocalDate startDate, LocalDate endDate);
    
    /**
     * Phân tích tỷ lệ hủy vé
     * 
     * @param startDate ngày bắt đầu
     * @param endDate ngày kết thúc
     * @return thống kê hủy vé
     */
    Map<String, Object> getCancellationAnalytics(LocalDate startDate, LocalDate endDate);
    
    /**
     * So sánh hiệu suất với kỳ trước
     * 
     * @param startDate ngày bắt đầu kỳ hiện tại
     * @param endDate ngày kết thúc kỳ hiện tại
     * @return dữ liệu so sánh
     */
    Map<String, Object> getPerformanceComparison(LocalDate startDate, LocalDate endDate);
    
    /**
     * Dự đoán xu hướng
     * 
     * @param days số ngày dự đoán
     * @return dữ liệu dự đoán
     */
    Map<String, Object> getForecastData(Integer days);
    
    /**
     * Thống kê real-time
     * 
     * @return dữ liệu thời gian thực
     */
    Map<String, Object> getRealTimeStats();
} 

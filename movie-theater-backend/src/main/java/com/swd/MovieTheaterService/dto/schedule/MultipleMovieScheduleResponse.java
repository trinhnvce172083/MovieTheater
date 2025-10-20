package com.swp.MovieTheaterService.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO response cho kết quả tạo lịch chiếu nhiều phim
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MultipleMovieScheduleResponse {

    /**
     * Thông tin tổng quan
     */
    private BatchSummary summary;

    /**
     * Chi tiết kết quả cho từng phim
     */
    private List<MovieScheduleResult> movieResults;

    /**
     * Thống kê phân bổ theo phòng
     */
    private Map<String, Integer> roomDistribution;

    /**
     * Thống kê phân bổ theo thời gian
     */
    private Map<String, Integer> timeSlotDistribution;

    /**
     * Danh sách cảnh báo (nếu có)
     */
    private List<String> warnings;

    /**
     * Danh sách lỗi (nếu có)
     */
    private List<String> errors;

    /**
     * Thời gian bắt đầu xử lý
     */
    private LocalDateTime processingStartTime;

    /**
     * Thời gian kết thúc xử lý
     */
    private LocalDateTime processingEndTime;

    /**
     * Thời gian xử lý (milliseconds)
     */
    private Long processingDurationMs;

    /**
     * Lớp con: Thông tin tổng quan
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BatchSummary {
        private Integer totalMoviesProcessed;
        private Integer totalSchedulesCreated;
        private Integer successfulMovies;
        private Integer failedMovies;
        private Integer totalRoomsUsed;
        private Integer totalDaysScheduled;
        private Double averageSchedulesPerMovie;
        private String status; // SUCCESS, PARTIAL_SUCCESS, FAILED
    }

    /**
     * Lớp con: Kết quả cho từng phim
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MovieScheduleResult {
        private Long movieId;
        private String movieTitle;
        private String movieGenre;
        private Double movieRating;
        private Integer schedulesCreated;
        private Integer schedulesRequested;
        private Double successRate;
        private List<String> assignedRooms;
        private List<String> assignedTimeSlots;
        private String status; // SUCCESS, PARTIAL, FAILED
        private String errorMessage;
        private Map<String, Integer> dailyScheduleCount;
    }

    /**
     * Tính toán thống kê tổng hợp
     */
    public void calculateSummaryStats() {
        if (movieResults == null || movieResults.isEmpty()) {
            return;
        }

        int totalSchedules = movieResults.stream()
                .mapToInt(MovieScheduleResult::getSchedulesCreated)
                .sum();

        int successfulMovies = (int) movieResults.stream()
                .filter(result -> "SUCCESS".equals(result.getStatus()))
                .count();

        int failedMovies = (int) movieResults.stream()
                .filter(result -> "FAILED".equals(result.getStatus()))
                .count();

        double avgSchedulesPerMovie = movieResults.isEmpty() ? 0.0 : (double) totalSchedules / movieResults.size();

        this.summary = BatchSummary.builder()
                .totalMoviesProcessed(movieResults.size())
                .totalSchedulesCreated(totalSchedules)
                .successfulMovies(successfulMovies)
                .failedMovies(failedMovies)
                .averageSchedulesPerMovie(Math.round(avgSchedulesPerMovie * 100.0) / 100.0)
                .status(determineOverallStatus())
                .build();
    }

    /**
     * Xác định trạng thái tổng thể
     */
    private String determineOverallStatus() {
        if (movieResults == null || movieResults.isEmpty()) {
            return "FAILED";
        }

        long successCount = movieResults.stream()
                .filter(result -> "SUCCESS".equals(result.getStatus()))
                .count();

        if (successCount == movieResults.size()) {
            return "SUCCESS";
        } else if (successCount > 0) {
            return "PARTIAL_SUCCESS";
        } else {
            return "FAILED";
        }
    }

    /**
     * Tính thời gian xử lý
     */
    public void calculateProcessingDuration() {
        if (processingStartTime != null && processingEndTime != null) {
            this.processingDurationMs = java.time.Duration.between(
                    processingStartTime, processingEndTime).toMillis();
        }
    }
}

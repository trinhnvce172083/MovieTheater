package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.service.AutoScheduleService;
import com.swp.MovieTheaterService.service.AutoScheduleService.AutoScheduleResult;
import com.swp.MovieTheaterService.service.AutoScheduleService.AutoRoomCreationResult;
import com.swp.MovieTheaterService.service.AutoScheduleService.AutoScheduleStatistics;
import com.swp.MovieTheaterService.service.AutoScheduleService.StandardShowtime;
import com.swp.MovieTheaterService.service.AutoScheduleService.DatabaseStatusResponse;
import com.swp.MovieTheaterService.dto.schedule.MultipleMovieScheduleRequest;
import com.swp.MovieTheaterService.dto.schedule.MultipleMovieScheduleResponse;
import com.swp.MovieTheaterService.service.impl.AutoScheduleServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * Auto Schedule Controller
 * REST API endpoints cho tự động tạo lịch chiếu phim
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/auto-schedule")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Tự động tạo lịch chiếu", description = "APIs cho hệ thống tự động tạo lịch chiếu phim")
public class AutoScheduleController {

    private final AutoScheduleService autoScheduleService;
    private final AutoScheduleServiceImpl autoScheduleServiceImpl;

    @PostMapping("/generate-next-3-days")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo lịch chiếu cho 3 ngày tiếp theo", description = "Tự động tạo lịch chiếu cho tất cả phim NOW_SHOWING trong 3 ngày tiếp theo")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<AutoScheduleResult> generateSchedulesForNext3Days() {
        log.info("API: Tạo lịch chiếu tự động cho 3 ngày tiếp theo");

        AutoScheduleResult result = autoScheduleService.generateSchedulesForNext3Days();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/generate-for-date")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo lịch chiếu cho ngày cụ thể", description = "Tự động tạo lịch chiếu cho một ngày cụ thể")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<AutoScheduleResult> generateSchedulesForDate(
            @Parameter(description = "Ngày cần tạo lịch chiếu (yyyy-MM-dd)", example = "2024-12-25") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("API: Tạo lịch chiếu cho ngày: {}", date);

        AutoScheduleResult result = autoScheduleService.generateSchedulesForDate(date);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/generate-for-movie")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo lịch chiếu cho phim cụ thể", description = "Tự động tạo lịch chiếu cho một phim trong khoảng thời gian")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<AutoScheduleResult> generateSchedulesForMovie(
            @Parameter(description = "ID của phim", example = "1") @RequestParam Long movieId,
            @Parameter(description = "Ngày bắt đầu (yyyy-MM-dd)", example = "2024-12-25") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Ngày kết thúc (yyyy-MM-dd)", example = "2024-12-30") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("API: Tạo lịch chiếu cho phim ID: {} từ {} đến {}", movieId, startDate, endDate);

        AutoScheduleResult result = autoScheduleService.generateSchedulesForMovie(movieId, startDate, endDate);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/create-additional-rooms")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo thêm phòng chiếu nếu cần", description = "Tự động tạo thêm phòng chiếu để đáp ứng nhu cầu")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<AutoRoomCreationResult> createAdditionalRoomsIfNeeded() {
        log.info("API: Tạo thêm phòng chiếu tự động");

        AutoRoomCreationResult result = autoScheduleService.createAdditionalRoomsIfNeeded();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/daily-generation")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Chạy tác vụ tạo lịch hàng ngày", description = "Chạy tác vụ tự động tạo lịch chiếu hàng ngày (thường được gọi bởi scheduler)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<AutoScheduleResult> dailyScheduleGeneration() {
        log.info("API: Chạy tác vụ tạo lịch hàng ngày");

        AutoScheduleResult result = autoScheduleService.dailyScheduleGeneration();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thống kê tạo lịch tự động", description = "Lấy thống kê về việc tạo lịch chiếu tự động")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<AutoScheduleStatistics> getAutoScheduleStatistics() {
        log.info("API: Lấy thống kê tạo lịch tự động");

        AutoScheduleStatistics statistics = autoScheduleService.getAutoScheduleStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/standard-showtimes")
    @Operation(summary = "Lấy giờ chiếu chuẩn", description = "Lấy danh sách giờ chiếu chuẩn theo các rạp lớn")
    public ResponseEntity<List<StandardShowtime>> getStandardShowtimes() {
        log.info("API: Lấy giờ chiếu chuẩn");

        List<StandardShowtime> showtimes = autoScheduleService.getStandardShowtimes();
        return ResponseEntity.ok(showtimes);
    }

    @GetMapping("/dates-need-schedules")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ngày cần tạo lịch chiếu", description = "Lấy danh sách ngày cần tạo lịch chiếu mới")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<LocalDate>> getDatesThatNeedSchedules() {
        log.info("API: Lấy ngày cần tạo lịch chiếu");

        List<LocalDate> dates = autoScheduleService.getDatesThatNeedSchedules();
        return ResponseEntity.ok(dates);
    }

    @GetMapping("/status")
    @Operation(summary = "Trạng thái hệ thống tự động", description = "Kiểm tra trạng thái của hệ thống tạo lịch tự động")
    public ResponseEntity<String> getSystemStatus() {
        log.info("API: Kiểm tra trạng thái hệ thống");

        try {
            AutoScheduleStatistics stats = autoScheduleService.getAutoScheduleStatistics();
            List<LocalDate> needDates = autoScheduleService.getDatesThatNeedSchedules();

            String status = String.format(
                    "Hệ thống hoạt động bình thường. " +
                            "Tổng lịch chiếu: %d, " +
                            "Phim đang chiếu: %d, " +
                            "Số ngày cần tạo lịch: %d, " +
                            "Tỷ lệ lấp đầy trung bình: %.1f%%",
                    stats.getTotalSchedulesGenerated(),
                    stats.getNowShowingMovies(),
                    needDates.size(),
                    stats.getAverageOccupancyRate());

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra trạng thái hệ thống: {}", e.getMessage());
            return ResponseEntity.ok("Hệ thống gặp lỗi: " + e.getMessage());
        }
    }

    @GetMapping("/check-database-status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Kiểm tra trạng thái database", description = "Kiểm tra phim NOW_SHOWING và lịch chiếu hiện có trong database")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DatabaseStatusResponse> checkDatabaseStatus() {
        log.info("API: Kiểm tra trạng thái database");

        DatabaseStatusResponse status = autoScheduleService.checkDatabaseStatus();
        return ResponseEntity.ok(status);
    }

    /**
     * 🚀 API MỚI: Tạo lịch chiếu cho NHIỀU PHIM cùng lúc
     * Phân bổ thông minh và đồng đều giữa các phim
     */
    @PostMapping("/generate-for-multiple-movies")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "🎬 Tạo lịch chiếu cho NHIỀU PHIM cùng lúc", description = "Tự động tạo lịch chiếu cho nhiều phim trong khoảng thời gian với thuật toán phân bổ thông minh và đồng đều")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MultipleMovieScheduleResponse> generateSchedulesForMultipleMovies(
            @Valid @RequestBody MultipleMovieScheduleRequest request) {

        log.info("🎬 API Mới: Tạo lịch chiếu cho {} phim từ {} đến {}",
                request.getMovieIds().size(), request.getStartDate(), request.getEndDate());

        try {
            MultipleMovieScheduleResponse response = autoScheduleServiceImpl
                    .generateSchedulesForMultipleMovies(request);

            // Log kết quả
            if (response.getSummary() != null) {
                log.info("✅ Hoàn thành tạo lịch: {} phim, {} suất chiếu, thời gian: {}ms",
                        response.getSummary().getTotalMoviesProcessed(),
                        response.getSummary().getTotalSchedulesCreated(),
                        response.getProcessingDurationMs());
            }

            // Trả về response code phù hợp - với null check an toàn
            String responseStatus = response.getSummary() != null ? response.getSummary().getStatus() : "FAILED";

            if ("SUCCESS".equals(responseStatus)) {
                return ResponseEntity.ok(response);
            } else if ("PARTIAL_SUCCESS".equals(responseStatus)) {
                return ResponseEntity.status(206).body(response); // 206 Partial Content
            } else {
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            log.error("❌ Lỗi không xác định trong API: {}", e.getMessage(), e);

            // Tạo error response
            MultipleMovieScheduleResponse errorResponse = MultipleMovieScheduleResponse.builder()
                    .processingStartTime(java.time.LocalDateTime.now())
                    .processingEndTime(java.time.LocalDateTime.now())
                    .errors(List.of("Lỗi hệ thống: " + e.getMessage()))
                    .movieResults(new ArrayList<>())
                    .roomDistribution(new HashMap<>())
                    .timeSlotDistribution(new HashMap<>())
                    .warnings(new ArrayList<>())
                    .summary(MultipleMovieScheduleResponse.BatchSummary.builder()
                            .status("FAILED")
                            .totalMoviesProcessed(0)
                            .totalSchedulesCreated(0)
                            .successfulMovies(0)
                            .failedMovies(0)
                            .totalRoomsUsed(0)
                            .totalDaysScheduled(0)
                            .averageSchedulesPerMovie(0.0)
                            .build())
                    .build();

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
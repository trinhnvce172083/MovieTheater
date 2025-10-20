package com.swp.MovieTheaterService.scheduler;

import com.swp.MovieTheaterService.service.AutoScheduleService;
import com.swp.MovieTheaterService.service.AutoScheduleService.AutoScheduleResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Auto Schedule Task
 * Tác vụ tự động tạo lịch chiếu phim hàng ngày
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.scheduler.auto-schedule.enabled", havingValue = "true", matchIfMissing = true)
public class AutoScheduleTask {

    private final AutoScheduleService autoScheduleService;

    /**
     * Chạy tác vụ tạo lịch chiếu tự động hàng ngày vào lúc 1:00 AM
     * Cron expression: 0 0 1 * * * (giây phút giờ ngày tháng năm)
     */
    @Scheduled(cron = "0 0 1 * * *", zone = "Asia/Ho_Chi_Minh")
    public void dailyScheduleGeneration() {
        log.info("=== BẮT ĐẦU TÁC VỤ TẠO LỊCH CHIẾU TỰ ĐỘNG HÀNG NGÀY ===");

        try {
            AutoScheduleResult result = autoScheduleService.dailyScheduleGeneration();

            if (result.isSuccess()) {
                log.info("✅ Tác vụ tự động thành công: {}", result.getMessage());
                log.info("📊 Thống kê: {} lịch chiếu cho {} phim, sử dụng {} phòng",
                        result.getTotalSchedulesCreated(),
                        result.getMoviesProcessed(),
                        result.getRoomsUsed());
            } else {
                log.warn("⚠️ Tác vụ tự động có vấn đề: {}", result.getMessage());
                if (result.getErrors() != null && !result.getErrors().isEmpty()) {
                    log.warn("Lỗi chi tiết: {}", String.join(", ", result.getErrors()));
                }
            }

        } catch (Exception e) {
            log.error("❌ Lỗi nghiêm trọng trong tác vụ tạo lịch tự động: {}", e.getMessage(), e);
        }

        log.info("=== KẾT THÚC TÁC VỤ TẠO LỊCH CHIẾU TỰ ĐỘNG ===");
    }

    /**
     * Kiểm tra và tạo thêm phòng chiếu nếu cần thiết
     * Chạy vào lúc 2:00 AM mỗi ngày
     */
    @Scheduled(cron = "0 0 2 * * *", zone = "Asia/Ho_Chi_Minh")
    public void checkAndCreateAdditionalRooms() {
        log.info("=== BẮT ĐẦU KIỂM TRA VÀ TẠO THÊM PHÒNG CHIẾU ===");

        try {
            var result = autoScheduleService.createAdditionalRoomsIfNeeded();

            if (result.isSuccess()) {
                if (result.getRoomsCreated() > 0) {
                    log.info("✅ Đã tạo thêm {} phòng chiếu: {}",
                            result.getRoomsCreated(),
                            String.join(", ", result.getRoomNames()));
                } else {
                    log.info("ℹ️ Không cần tạo thêm phòng chiếu: {}", result.getMessage());
                }
            } else {
                log.warn("⚠️ Có vấn đề khi tạo phòng: {}", result.getMessage());
                if (result.getErrors() != null && !result.getErrors().isEmpty()) {
                    log.warn("Lỗi chi tiết: {}", String.join(", ", result.getErrors()));
                }
            }

        } catch (Exception e) {
            log.error("❌ Lỗi khi kiểm tra và tạo phòng chiếu: {}", e.getMessage(), e);
        }

        log.info("=== KẾT THÚC KIỂM TRA VÀ TẠO PHÒNG CHIẾU ===");
    }

    /**
     * Tạo lịch chiếu cho 3 ngày tiếp theo (backup)
     * Chạy vào lúc 3:00 AM chỉ vào Chủ nhật hàng tuần
     */
    @Scheduled(cron = "0 0 3 * * SUN", zone = "Asia/Ho_Chi_Minh")
    public void weeklyScheduleGeneration() {
        log.info("=== BẮT ĐẦU TÁC VỤ TẠO LỊCH CHIẾU HÀNG TUẦN (BACKUP) ===");

        try {
            AutoScheduleResult result = autoScheduleService.generateSchedulesForNext3Days();

            if (result.isSuccess()) {
                log.info("✅ Tác vụ hàng tuần thành công: {}", result.getMessage());
                log.info("📊 Thống kê: {} lịch chiếu cho {} phim",
                        result.getTotalSchedulesCreated(),
                        result.getMoviesProcessed());
            } else {
                log.warn("⚠️ Tác vụ hàng tuần có vấn đề: {}", result.getMessage());
            }

        } catch (Exception e) {
            log.error("❌ Lỗi trong tác vụ hàng tuần: {}", e.getMessage(), e);
        }

        log.info("=== KẾT THÚC TÁC VỤ HÀNG TUẦN ===");
    }

    /**
     * Log thống kê hệ thống mỗi 6 giờ
     */
    @Scheduled(fixedRate = 21600000, initialDelay = 3600000) // 6 hours = 21600000ms, delay 1 hour
    public void logSystemStatistics() {
        try {
            var stats = autoScheduleService.getAutoScheduleStatistics();
            var needDates = autoScheduleService.getDatesThatNeedSchedules();

            log.info("📈 THỐNG KÊ HỆ THỐNG TỰ ĐỘNG:");
            log.info("   • Tổng lịch chiếu: {}", stats.getTotalSchedulesGenerated());
            log.info("   • Lịch chiếu 7 ngày qua: {}", stats.getSchedulesLast7Days());
            log.info("   • Trung bình/ngày: {}", stats.getAverageSchedulesPerDay());
            log.info("   • Phim đang chiếu: {}", stats.getNowShowingMovies());
            log.info("   • Tổng phòng chiếu: {}", stats.getTotalRoomsCreated());
            log.info("   • Tỷ lệ lấp đầy TB: {:.1f}%", stats.getAverageOccupancyRate());
            log.info("   • Ngày cần tạo lịch: {}", needDates.size());

            if (!needDates.isEmpty()) {
                log.info("   • Các ngày cần tạo lịch: {}", needDates);
            }

        } catch (Exception e) {
            log.error("Lỗi khi lấy thống kê hệ thống: {}", e.getMessage());
        }
    }
}

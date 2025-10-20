package com.swp.MovieTheaterService.dto.schedule;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for creating schedules for multiple movies
 * Request để tạo lịch chiếu cho nhiều phim cùng lúc
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MultipleMovieScheduleRequest {

    /**
     * Danh sách ID các phim cần tạo lịch chiếu
     */
    @NotEmpty(message = "Danh sách phim không được trống")
    private List<Long> movieIds;

    /**
     * Ngày bắt đầu tạo lịch chiếu
     */
    @NotNull(message = "Ngày bắt đầu không được null")
    private LocalDate startDate;

    /**
     * Ngày kết thúc tạo lịch chiếu
     */
    @NotNull(message = "Ngày kết thúc không được null")
    private LocalDate endDate;

    /**
     * Số suất chiếu tối thiểu cho mỗi phim mỗi ngày (mặc định: 2)
     */
    @Min(value = 1, message = "Số suất chiếu tối thiểu phải >= 1")
    @Max(value = 10, message = "Số suất chiếu tối đa phải <= 10")
    private Integer minShowsPerMoviePerDay = 2;

    /**
     * Số suất chiếu tối đa cho mỗi phim mỗi ngày (mặc định: 4)
     */
    @Min(value = 1, message = "Số suất chiếu tối đa phải >= 1")
    @Max(value = 15, message = "Số suất chiếu tối đa phải <= 15")
    private Integer maxShowsPerMoviePerDay = 4;

    /**
     * Có ưu tiên phim nổi bật không (mặc định: true)
     */
    private Boolean prioritizeFeaturedMovies = true;

    /**
     * Có phân bổ đồng đều giữa các phòng không (mặc định: true)
     */
    private Boolean evenRoomDistribution = true;

    /**
     * Có tự động điều chỉnh dựa trên rating IMDB không (mặc định: true)
     */
    private Boolean adjustByRating = true;

    /**
     * Ghi chú cho batch tạo lịch
     */
    private String notes;

    /**
     * Validate logic của request
     */
    public boolean isValid() {
        if (movieIds == null || movieIds.isEmpty()) {
            return false;
        }

        if (startDate == null || endDate == null) {
            return false;
        }

        // Kiểm tra ngày bắt đầu không được trong quá khứ (trừ hôm nay)
        if (startDate.isBefore(LocalDate.now())) {
            return false;
        }

        // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
        if (startDate.isAfter(endDate)) {
            return false;
        }

        // Kiểm tra khoảng thời gian không quá dài (tối đa 30 ngày)
        if (getTotalDays() > 30) {
            return false;
        }

        if (minShowsPerMoviePerDay != null && maxShowsPerMoviePerDay != null) {
            return minShowsPerMoviePerDay <= maxShowsPerMoviePerDay;
        }

        return true;
    }

    /**
     * Tính tổng số ngày trong khoảng thời gian
     */
    public long getTotalDays() {
        if (startDate == null || endDate == null) {
            return 0;
        }
        return startDate.until(endDate).getDays() + 1;
    }

    /**
     * Ước tính tổng số lịch chiếu sẽ được tạo
     */
    public long getEstimatedTotalSchedules() {
        if (!isValid()) {
            return 0;
        }

        long totalDays = getTotalDays();
        int avgShowsPerMovie = (minShowsPerMoviePerDay + maxShowsPerMoviePerDay) / 2;

        return movieIds.size() * totalDays * avgShowsPerMovie;
    }
}

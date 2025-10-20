package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.schedule.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Auto Schedule Service Interface
 * Dịch vụ tự động tạo lịch chiếu phim
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public interface AutoScheduleService {

    /**
     * Tự động tạo lịch chiếu cho tất cả phim NOW_SHOWING trong 3 ngày tiếp theo
     */
    AutoScheduleResult generateSchedulesForNext3Days();

    /**
     * Tự động tạo lịch chiếu cho một ngày cụ thể
     */
    AutoScheduleResult generateSchedulesForDate(LocalDate date);

    /**
     * Tự động tạo lịch chiếu cho một phim cụ thể
     */
    AutoScheduleResult generateSchedulesForMovie(Long movieId, LocalDate startDate, LocalDate endDate);

    /**
     * Tự động tạo thêm phòng chiếu nếu cần thiết
     */
    AutoRoomCreationResult createAdditionalRoomsIfNeeded();

    /**
     * Kiểm tra và tạo lịch chiếu hàng ngày (cho scheduled task)
     */
    AutoScheduleResult dailyScheduleGeneration();

    /**
     * Lấy thống kê về việc tạo lịch tự động
     */
    AutoScheduleStatistics getAutoScheduleStatistics();

    /**
     * Cấu hình giờ chiếu chuẩn theo các rạp lớn
     */
    List<StandardShowtime> getStandardShowtimes();

    /**
     * Kiểm tra xem ngày nào cần tạo lịch chiếu mới
     */
    List<LocalDate> getDatesThatNeedSchedules();

    /**
     * Tạo lịch chiếu từ ngày mai
     */
    AutoScheduleResult generateSchedulesFromTomorrow();

    /**
     * Kiểm tra trạng thái database
     */
    DatabaseStatusResponse checkDatabaseStatus();

    /**
     * Inner classes cho response
     */
    class AutoScheduleResult {
        private boolean success;
        private String message;
        private int totalSchedulesCreated;
        private int moviesProcessed;
        private int roomsUsed;
        private List<String> errors;
        private List<ScheduleResponse> createdSchedules;

        // Constructors
        public AutoScheduleResult() {
        }

        public AutoScheduleResult(boolean success, String message, int totalSchedulesCreated,
                                  int moviesProcessed, int roomsUsed, List<String> errors) {
            this.success = success;
            this.message = message;
            this.totalSchedulesCreated = totalSchedulesCreated;
            this.moviesProcessed = moviesProcessed;
            this.roomsUsed = roomsUsed;
            this.errors = errors;
        }

        // Getters and Setters
        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public int getTotalSchedulesCreated() {
            return totalSchedulesCreated;
        }

        public void setTotalSchedulesCreated(int totalSchedulesCreated) {
            this.totalSchedulesCreated = totalSchedulesCreated;
        }

        public int getMoviesProcessed() {
            return moviesProcessed;
        }

        public void setMoviesProcessed(int moviesProcessed) {
            this.moviesProcessed = moviesProcessed;
        }

        public int getRoomsUsed() {
            return roomsUsed;
        }

        public void setRoomsUsed(int roomsUsed) {
            this.roomsUsed = roomsUsed;
        }

        public List<String> getErrors() {
            return errors;
        }

        public void setErrors(List<String> errors) {
            this.errors = errors;
        }

        public List<ScheduleResponse> getCreatedSchedules() {
            return createdSchedules;
        }

        public void setCreatedSchedules(List<ScheduleResponse> createdSchedules) {
            this.createdSchedules = createdSchedules;
        }
    }

    class AutoRoomCreationResult {
        private boolean success;
        private String message;
        private int roomsCreated;
        private List<String> roomNames;
        private List<String> errors;

        // Constructors
        public AutoRoomCreationResult() {
        }

        public AutoRoomCreationResult(boolean success, String message, int roomsCreated,
                                      List<String> roomNames, List<String> errors) {
            this.success = success;
            this.message = message;
            this.roomsCreated = roomsCreated;
            this.roomNames = roomNames;
            this.errors = errors;
        }

        // Getters and Setters
        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public int getRoomsCreated() {
            return roomsCreated;
        }

        public void setRoomsCreated(int roomsCreated) {
            this.roomsCreated = roomsCreated;
        }

        public List<String> getRoomNames() {
            return roomNames;
        }

        public void setRoomNames(List<String> roomNames) {
            this.roomNames = roomNames;
        }

        public List<String> getErrors() {
            return errors;
        }

        public void setErrors(List<String> errors) {
            this.errors = errors;
        }
    }

    class AutoScheduleStatistics {
        private long totalSchedulesGenerated;
        private long schedulesLast7Days;
        private long averageSchedulesPerDay;
        private long totalRoomsCreated;
        private long nowShowingMovies;
        private double averageOccupancyRate;
        private LocalDate lastGenerationDate;
        private LocalDate nextGenerationDate;

        // Constructors
        public AutoScheduleStatistics() {
        }

        public AutoScheduleStatistics(long totalSchedulesGenerated, long schedulesLast7Days,
                                      long averageSchedulesPerDay, long totalRoomsCreated,
                                      long nowShowingMovies, double averageOccupancyRate,
                                      LocalDate lastGenerationDate, LocalDate nextGenerationDate) {
            this.totalSchedulesGenerated = totalSchedulesGenerated;
            this.schedulesLast7Days = schedulesLast7Days;
            this.averageSchedulesPerDay = averageSchedulesPerDay;
            this.totalRoomsCreated = totalRoomsCreated;
            this.nowShowingMovies = nowShowingMovies;
            this.averageOccupancyRate = averageOccupancyRate;
            this.lastGenerationDate = lastGenerationDate;
            this.nextGenerationDate = nextGenerationDate;
        }

        // Getters and Setters
        public long getTotalSchedulesGenerated() {
            return totalSchedulesGenerated;
        }

        public void setTotalSchedulesGenerated(long totalSchedulesGenerated) {
            this.totalSchedulesGenerated = totalSchedulesGenerated;
        }

        public long getSchedulesLast7Days() {
            return schedulesLast7Days;
        }

        public void setSchedulesLast7Days(long schedulesLast7Days) {
            this.schedulesLast7Days = schedulesLast7Days;
        }

        public long getAverageSchedulesPerDay() {
            return averageSchedulesPerDay;
        }

        public void setAverageSchedulesPerDay(long averageSchedulesPerDay) {
            this.averageSchedulesPerDay = averageSchedulesPerDay;
        }

        public long getTotalRoomsCreated() {
            return totalRoomsCreated;
        }

        public void setTotalRoomsCreated(long totalRoomsCreated) {
            this.totalRoomsCreated = totalRoomsCreated;
        }

        public long getNowShowingMovies() {
            return nowShowingMovies;
        }

        public void setNowShowingMovies(long nowShowingMovies) {
            this.nowShowingMovies = nowShowingMovies;
        }

        public double getAverageOccupancyRate() {
            return averageOccupancyRate;
        }

        public void setAverageOccupancyRate(double averageOccupancyRate) {
            this.averageOccupancyRate = averageOccupancyRate;
        }

        public LocalDate getLastGenerationDate() {
            return lastGenerationDate;
        }

        public void setLastGenerationDate(LocalDate lastGenerationDate) {
            this.lastGenerationDate = lastGenerationDate;
        }

        public LocalDate getNextGenerationDate() {
            return nextGenerationDate;
        }

        public void setNextGenerationDate(LocalDate nextGenerationDate) {
            this.nextGenerationDate = nextGenerationDate;
        }
    }

    class StandardShowtime {
        private String timeSlot;
        private String startTime;
        private String endTime;
        private String description;
        private double priceMultiplier;

        // Constructors
        public StandardShowtime() {
        }

        public StandardShowtime(String timeSlot, String startTime, String endTime,
                                String description, double priceMultiplier) {
            this.timeSlot = timeSlot;
            this.startTime = startTime;
            this.endTime = endTime;
            this.description = description;
            this.priceMultiplier = priceMultiplier;
        }

        // Getters and Setters
        public String getTimeSlot() {
            return timeSlot;
        }

        public void setTimeSlot(String timeSlot) {
            this.timeSlot = timeSlot;
        }

        public String getStartTime() {
            return startTime;
        }

        public void setStartTime(String startTime) {
            this.startTime = startTime;
        }

        public String getEndTime() {
            return endTime;
        }

        public void setEndTime(String endTime) {
            this.endTime = endTime;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public double getPriceMultiplier() {
            return priceMultiplier;
        }

        public void setPriceMultiplier(double priceMultiplier) {
            this.priceMultiplier = priceMultiplier;
        }
    }

    // Database Status Response class
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    class DatabaseStatusResponse {
        private int nowShowingMoviesCount;
        private List<String> nowShowingMovieTitles;
        private int totalSchedulesCount;
        private int schedulesForNext3Days;
        private List<LocalDate> datesWithSchedules;
        private List<LocalDate> datesNeedingSchedules;
        private boolean hasSchedulesForTomorrow;
        private boolean hasSchedulesForDayAfterTomorrow;
        private boolean hasSchedulesFor3DaysLater;
        private String systemStatus;
        private List<String> recommendations;
    }
}

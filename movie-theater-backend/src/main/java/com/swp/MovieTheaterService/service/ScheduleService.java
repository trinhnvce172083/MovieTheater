package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.schedule.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Schedule Service Interface
 * Business logic for schedule management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public interface ScheduleService {

    /**
     * Create a new schedule
     */
    ScheduleResponse createSchedule(ScheduleCreateRequest request);

    /**
     * Update an existing schedule
     */
    ScheduleResponse updateSchedule(Long scheduleId, ScheduleUpdateRequest request);

    /**
     * Get schedule by ID
     */
    ScheduleResponse getScheduleById(Long scheduleId);

    /**
     * Get all active schedules with pagination
     */
    Page<ScheduleResponse> getAllSchedules(Pageable pageable);

    /**
     * Get all schedules summary with pagination
     */
    Page<ScheduleSummaryResponse> getAllSchedulesSummary(Pageable pageable);

    /**
     * Get schedules by movie
     */
    List<ScheduleResponse> getSchedulesByMovie(Long movieId);
    Page<ScheduleResponse> getSchedulesByMovie(Long movieId, Pageable pageable);

    /**
     * Get schedules by cinema room
     */
    List<ScheduleResponse> getSchedulesByCinemaRoom(Long cinemaRoomId);
    Page<ScheduleResponse> getSchedulesByCinemaRoom(Long cinemaRoomId, Pageable pageable);

    /**
     * Get schedules by date (for internal use with ScheduleResponse)
     */
    Page<ScheduleResponse> getSchedulesByDate(LocalDate showDate, Pageable pageable);

    /**
     * Get schedules by date range
     */
    List<ScheduleResponse> getSchedulesByDateRange(LocalDate startDate, LocalDate endDate);
    Page<ScheduleResponse> getSchedulesByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable);

    /**
     * Get schedules by date range summary
     */
    Page<ScheduleSummaryResponse> getSchedulesByDateRangeSummary(LocalDate startDate, LocalDate endDate, Pageable pageable);

    /**
     * Get schedules by status
     */
    List<ScheduleResponse> getSchedulesByStatus(String status);
    Page<ScheduleResponse> getSchedulesByStatus(String status, Pageable pageable);

    /**
     * Get schedules by movie and date
     */
    List<ScheduleResponse> getSchedulesByMovieAndDate(Long movieId, LocalDate showDate);

    /**
     * Get schedules by cinema room and date
     */
    List<ScheduleResponse> getSchedulesByCinemaRoomAndDate(Long cinemaRoomId, LocalDate showDate);

    /**
     * Search schedules by keyword
     */
    Page<ScheduleResponse> searchSchedules(String keyword, Pageable pageable);

    /**
     * Get available schedules for booking
     */
    List<ScheduleResponse> getAvailableSchedules();
    Page<ScheduleResponse> getAvailableSchedules(Pageable pageable);

    /**
     * Get schedules by special features
     */
    List<ScheduleResponse> get3DSchedules();
    List<ScheduleResponse> getIMAXSchedules();
    List<ScheduleResponse> get4DXSchedules();

    /**
     * Get schedules by time range
     */
    List<ScheduleResponse> getSchedulesByTimeRange(LocalDate showDate, LocalTime startTime, LocalTime endTime);

    /**
     * Get today's schedules
     */
    List<ScheduleResponse> getTodaySchedules();

    /**
     * Get upcoming schedules
     */
    List<ScheduleResponse> getUpcomingSchedules();
    Page<ScheduleResponse> getUpcomingSchedules(Pageable pageable);

    /**
     * Get past schedules
     */
    List<ScheduleResponse> getPastSchedules();
    Page<ScheduleResponse> getPastSchedules(Pageable pageable);

    /**
     * Get schedules by price range
     */
    List<ScheduleResponse> getSchedulesByPriceRange(Double minPrice, Double maxPrice);

    /**
     * Get popular schedules (high booking rate)
     */
    List<ScheduleResponse> getPopularSchedules(Double minOccupancyRate);

    /**
     * Get schedules by language
     */
    List<ScheduleResponse> getSchedulesBySubtitleLanguage(String language);
    List<ScheduleResponse> getSchedulesByAudioLanguage(String language);

    /**
     * Cancel schedule
     */
    ScheduleResponse cancelSchedule(Long scheduleId);

    /**
     * Complete schedule
     */
    ScheduleResponse completeSchedule(Long scheduleId);

    /**
     * Start schedule (set to ongoing)
     */
    ScheduleResponse startSchedule(Long scheduleId);

    /**
     * Soft delete schedule
     */
    void deleteSchedule(Long scheduleId);

    /**
     * Restore deleted schedule
     */
    ScheduleResponse restoreSchedule(Long scheduleId);

    /**
     * Check for schedule conflicts
     */
    boolean hasScheduleConflict(Long cinemaRoomId, LocalDate showDate, LocalTime startTime, LocalTime endTime);
    boolean hasScheduleConflict(Long cinemaRoomId, LocalDate showDate, LocalTime startTime, LocalTime endTime, Long excludeScheduleId);

    /**
     * Book seats in schedule
     */
    ScheduleResponse bookSeats(Long scheduleId, Integer seatCount);

    /**
     * Cancel seat booking in schedule
     */
    ScheduleResponse cancelSeatBooking(Long scheduleId, Integer seatCount);

    /**
     * Get schedule statistics
     */
    ScheduleStatistics getScheduleStatistics();

    /**
     * Get schedule statistics by date range
     */
    ScheduleStatistics getScheduleStatistics(LocalDate startDate, LocalDate endDate);

    /**
     * Get revenue by date range
     */
    Double getRevenue(LocalDate startDate, LocalDate endDate);

    /**
     * Get average occupancy rate
     */
    Double getAverageOccupancyRate();

    /**
     * Bulk create schedules for a movie
     */
    List<ScheduleResponse> bulkCreateSchedules(BulkScheduleCreateRequest request);

    /**
     * Get available schedules summary
     */
    Page<ScheduleSummaryResponse> getAvailableSchedulesSummary(Pageable pageable);

    /**
     * Get schedules by movie with date range
     */
    List<ScheduleSummaryResponse> getSchedulesByMovieId(Long movieId, LocalDate startDate, LocalDate endDate);

    /**
     * Get schedules by room with date range
     */
    List<ScheduleSummaryResponse> getSchedulesByRoomId(Long roomId, LocalDate startDate, LocalDate endDate);

    /**
     * Get today's schedules summary
     */
    List<ScheduleSummaryResponse> getTodaySchedulesSummary();

    /**
     * Search schedules summary
     */
    Page<ScheduleSummaryResponse> searchSchedulesSummary(String keyword, Pageable pageable);

    /**
     * Get available seats for schedule
     */
    SeatAvailabilityResponse getAvailableSeats(Long scheduleId);

    /**
     * Get upcoming schedules with limits
     */
    List<ScheduleSummaryResponse> getUpcomingSchedules(int page, int size);

    /**
     * Get popular showtimes
     */
    List<PopularShowtimeResponse> getPopularShowtimes();

    /**
     * Get schedules by date summary (for API responses with ScheduleSummaryResponse)  
     */
    List<ScheduleSummaryResponse> getSchedulesByDateSummary(LocalDate showDate);

    /**
     * Inner class for schedule statistics
     */
    class ScheduleStatistics {
        private Long totalSchedules;
        private Long scheduledCount;
        private Long ongoingCount;
        private Long completedCount;
        private Long cancelledCount;
        private Long totalBookedSeats;
        private Long totalAvailableSeats;
        private Double averageOccupancyRate;
        private Double totalRevenue;
        private Long schedules3D;
        private Long schedulesIMAX;
        private Long schedules4DX;
        private Double averagePrice;

        // Constructors, getters, setters
        public ScheduleStatistics() {}

        public ScheduleStatistics(Long totalSchedules, Long scheduledCount, Long ongoingCount, 
                                 Long completedCount, Long cancelledCount, Long totalBookedSeats, 
                                 Long totalAvailableSeats, Double averageOccupancyRate, Double totalRevenue,
                                 Long schedules3D, Long schedulesIMAX, Long schedules4DX, Double averagePrice) {
            this.totalSchedules = totalSchedules;
            this.scheduledCount = scheduledCount;
            this.ongoingCount = ongoingCount;
            this.completedCount = completedCount;
            this.cancelledCount = cancelledCount;
            this.totalBookedSeats = totalBookedSeats;
            this.totalAvailableSeats = totalAvailableSeats;
            this.averageOccupancyRate = averageOccupancyRate;
            this.totalRevenue = totalRevenue;
            this.schedules3D = schedules3D;
            this.schedulesIMAX = schedulesIMAX;
            this.schedules4DX = schedules4DX;
            this.averagePrice = averagePrice;
        }

        // Getters and setters
        public Long getTotalSchedules() { return totalSchedules; }
        public void setTotalSchedules(Long totalSchedules) { this.totalSchedules = totalSchedules; }

        public Long getScheduledCount() { return scheduledCount; }
        public void setScheduledCount(Long scheduledCount) { this.scheduledCount = scheduledCount; }

        public Long getOngoingCount() { return ongoingCount; }
        public void setOngoingCount(Long ongoingCount) { this.ongoingCount = ongoingCount; }

        public Long getCompletedCount() { return completedCount; }
        public void setCompletedCount(Long completedCount) { this.completedCount = completedCount; }

        public Long getCancelledCount() { return cancelledCount; }
        public void setCancelledCount(Long cancelledCount) { this.cancelledCount = cancelledCount; }

        public Long getTotalBookedSeats() { return totalBookedSeats; }
        public void setTotalBookedSeats(Long totalBookedSeats) { this.totalBookedSeats = totalBookedSeats; }

        public Long getTotalAvailableSeats() { return totalAvailableSeats; }
        public void setTotalAvailableSeats(Long totalAvailableSeats) { this.totalAvailableSeats = totalAvailableSeats; }

        public Double getAverageOccupancyRate() { return averageOccupancyRate; }
        public void setAverageOccupancyRate(Double averageOccupancyRate) { this.averageOccupancyRate = averageOccupancyRate; }

        public Double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }

        public Long getSchedules3D() { return schedules3D; }
        public void setSchedules3D(Long schedules3D) { this.schedules3D = schedules3D; }

        public Long getSchedulesIMAX() { return schedulesIMAX; }
        public void setSchedulesIMAX(Long schedulesIMAX) { this.schedulesIMAX = schedulesIMAX; }

        public Long getSchedules4DX() { return schedules4DX; }
        public void setSchedules4DX(Long schedules4DX) { this.schedules4DX = schedules4DX; }

        public Double getAveragePrice() { return averagePrice; }
        public void setAveragePrice(Double averagePrice) { this.averagePrice = averagePrice; }
    }
} 
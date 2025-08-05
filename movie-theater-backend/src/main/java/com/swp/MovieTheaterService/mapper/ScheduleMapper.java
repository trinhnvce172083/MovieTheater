package com.swp.MovieTheaterService.mapper;

import com.swp.MovieTheaterService.dto.schedule.ScheduleCreateRequest;
import com.swp.MovieTheaterService.dto.schedule.ScheduleResponse;
import com.swp.MovieTheaterService.dto.schedule.ScheduleSummaryResponse;
import com.swp.MovieTheaterService.dto.schedule.ScheduleUpdateRequest;
import com.swp.MovieTheaterService.entity.Schedule;
import org.springframework.stereotype.Component;

import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Schedule Mapper
 * Maps between Schedule entity and DTOs
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Component
public class ScheduleMapper {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final NumberFormat CURRENCY_FORMATTER = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

    /**
     * Convert ScheduleCreateRequest to Schedule entity
     */
    public Schedule toEntity(ScheduleCreateRequest request) {
        if (request == null) {
            return null;
        }

        Schedule schedule = new Schedule();
        schedule.setShowDate(request.getShowDate());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setPrice(request.getPrice());
        schedule.setStatus(request.getStatus() != null ? request.getStatus() : "SCHEDULED");
        schedule.setIs3D(request.getIs3D() != null ? request.getIs3D() : false);
        schedule.setIsIMAX(request.getIsIMAX() != null ? request.getIsIMAX() : false);
        schedule.setIs4DX(request.getIs4DX() != null ? request.getIs4DX() : false);
        schedule.setSubtitleLanguage(
                request.getSubtitleLanguage() != null ? request.getSubtitleLanguage() : "Vietnamese");
        schedule.setAudioLanguage(request.getAudioLanguage() != null ? request.getAudioLanguage() : "Vietnamese");
        schedule.setIsActive(true);
        schedule.setCreatedAt(LocalDateTime.now());
        schedule.setUpdatedAt(LocalDateTime.now());

        return schedule;
    }

    /**
     * Update Schedule entity from ScheduleUpdateRequest
     */
    public void updateEntity(Schedule schedule, ScheduleUpdateRequest request) {
        if (schedule == null || request == null) {
            return;
        }

        if (request.getShowDate() != null) {
            schedule.setShowDate(request.getShowDate());
        }
        if (request.getStartTime() != null) {
            schedule.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            schedule.setEndTime(request.getEndTime());
        }
        if (request.getPrice() != null) {
            schedule.setPrice(request.getPrice());
        }
        if (request.getStatus() != null) {
            schedule.setStatus(request.getStatus());
        }
        if (request.getIs3D() != null) {
            schedule.setIs3D(request.getIs3D());
        }
        if (request.getIsIMAX() != null) {
            schedule.setIsIMAX(request.getIsIMAX());
        }
        if (request.getIs4DX() != null) {
            schedule.setIs4DX(request.getIs4DX());
        }
        if (request.getSubtitleLanguage() != null) {
            schedule.setSubtitleLanguage(request.getSubtitleLanguage());
        }
        if (request.getAudioLanguage() != null) {
            schedule.setAudioLanguage(request.getAudioLanguage());
        }
        if (request.getIsActive() != null) {
            schedule.setIsActive(request.getIsActive());
        }

        schedule.setUpdatedAt(LocalDateTime.now());
    }

    /**
     * Convert Schedule entity to ScheduleResponse
     */
    public ScheduleResponse toResponse(Schedule schedule) {
        if (schedule == null) {
            return null;
        }

        ScheduleResponse response = new ScheduleResponse();
        response.setScheduleId(schedule.getScheduleId());
        response.setShowDate(schedule.getShowDate());
        response.setStartTime(schedule.getStartTime());
        response.setEndTime(schedule.getEndTime());
        response.setPrice(schedule.getMovie().getPrice());
        response.setTimeSlotType(schedule.getTimeSlotType());
        response.setIsActive(schedule.getIsActive());
        response.setStatus(schedule.getStatus());
        response.setIs3D(schedule.getIs3D());
        response.setIsIMAX(schedule.getIsIMAX());
        response.setIs4DX(schedule.getIs4DX());
        response.setSubtitleLanguage(schedule.getSubtitleLanguage());
        response.setAudioLanguage(schedule.getAudioLanguage());
        response.setAvailableSeats(schedule.getAvailableSeats());
        response.setBookedSeats(schedule.getBookedSeats());
        response.setCreatedAt(schedule.getCreatedAt());
        response.setUpdatedAt(schedule.getUpdatedAt());

        // Movie information
        if (schedule.getMovie() != null) {
            response.setMovieId(schedule.getMovie().getMovieId());
            response.setMovieName(schedule.getMovie().getMovieName());
            response.setMoviePoster(schedule.getMovie().getPoster());
            response.setMovieDuration(schedule.getMovie().getDuration());
            response.setMovieRating(schedule.getMovie().getRating());
            response.setMovieGenre(schedule.getMovie().getGenre());
        }

        // Cinema room information
        if (schedule.getCinemaRoom() != null) {
            response.setCinemaRoomId(schedule.getCinemaRoom().getCinemaRoomId());
            response.setCinemaRoomName(schedule.getCinemaRoom().getCinemaRoomName());
            response.setRoomType(schedule.getCinemaRoom().getRoomType());
            response.setTotalSeats(schedule.getCinemaRoom().getSeatQuantity());
            response.setRoomHas3D(schedule.getCinemaRoom().getHas3D());
            response.setRoomHasDolbyAtmos(schedule.getCinemaRoom().getHasDolbyAtmos());
            response.setRoomHasReclinerSeats(schedule.getCinemaRoom().getHasReclinerSeats());
            response.setRoomPriceMultiplier(schedule.getCinemaRoom().getPriceMultiplier());
        }

        // Set computed fields
        setComputedFields(response, schedule);

        return response;
    }

    /**
     * Convert Schedule entity to ScheduleSummaryResponse
     */
    public ScheduleSummaryResponse toSummaryResponse(Schedule schedule) {
        if (schedule == null) {
            return null;
        }

        ScheduleSummaryResponse response = new ScheduleSummaryResponse();
        response.setScheduleId(schedule.getScheduleId());
        response.setShowDate(schedule.getShowDate());
        response.setStartTime(schedule.getStartTime());
        response.setEndTime(schedule.getEndTime());
        response.setPrice(schedule.getMovie().getPrice());
        response.setStatus(schedule.getStatus());
        response.setIs3D(schedule.getIs3D());
        response.setIsIMAX(schedule.getIsIMAX());
        response.setIs4DX(schedule.getIs4DX());
        response.setAvailableSeats(schedule.getAvailableSeats());
        response.setBookedSeats(schedule.getBookedSeats());

        // Basic movie info
        if (schedule.getMovie() != null) {
            response.setMovieId(schedule.getMovie().getMovieId());
            response.setMovieName(schedule.getMovie().getMovieName());
            response.setMoviePoster(schedule.getMovie().getPoster());
            response.setMovieDuration(schedule.getMovie().getDuration());
            response.setMovieRating(schedule.getMovie().getRating());
        }

        // Basic cinema room info
        if (schedule.getCinemaRoom() != null) {
            response.setCinemaRoomId(schedule.getCinemaRoom().getCinemaRoomId());
            response.setCinemaRoomName(schedule.getCinemaRoom().getCinemaRoomName());
            response.setRoomType(schedule.getCinemaRoom().getRoomType());
        }

        // Set computed fields for summary
        response.setDisplayTime(schedule.getDisplayTime());
        response.setDisplayDate(schedule.getShowDate().format(DATE_FORMATTER));
        response.setIsBookable(schedule.isBookable());
        response.setOccupancyRate(schedule.getOccupancyRate());
        response.setSpecialFeatures(schedule.getSpecialFeaturesText());
        response.setPriceDisplay(CURRENCY_FORMATTER.format(schedule.getMovie().getPrice()));

        return response;
    }

    /**
     * Set computed fields for ScheduleResponse
     */
    private void setComputedFields(ScheduleResponse response, Schedule schedule) {
        response.setShowDateTime(schedule.getShowDateTime());
        response.setEndDateTime(schedule.getEndDateTime());
        response.setDisplayTime(schedule.getDisplayTime());
        response.setDisplayDate(schedule.getShowDate().format(DATE_FORMATTER));
        response.setTimeSlotTypeDisplay(schedule.getTimeSlotTypeDisplay());
        response.setIsToday(schedule.isToday());
        response.setIsPast(schedule.isPast());
        response.setIsFuture(schedule.isFuture());
        response.setIsBookable(schedule.isBookable());
        response.setOccupancyRate(schedule.getOccupancyRate());
        response.setTotalCapacity(schedule.getAvailableSeats() + schedule.getBookedSeats());
        response.setSpecialFeatures(schedule.getSpecialFeaturesText());
        response.setHasSpecialFeatures(schedule.hasSpecialFeatures());
        response.setStatusDisplay(getStatusDisplay(schedule.getStatus()));
        response.setCanCancel(canCancel(schedule));
        response.setCanUpdate(canUpdate(schedule));
        response.setCanDelete(canDelete(schedule));
        response.setPriceDisplay(CURRENCY_FORMATTER.format(schedule.getMovie().getPrice()));

        if (schedule.getMovie() != null && schedule.getMovie().getDuration() != null) {
            response.setDurationDisplay(formatDuration(schedule.getMovie().getDuration()));
        }
    }

    /**
     * Get status display text in Vietnamese
     */
    private String getStatusDisplay(String status) {
        switch (status) {
            case "SCHEDULED":
                return "Đã lên lịch";
            case "ONGOING":
                return "Đang chiếu";
            case "COMPLETED":
                return "Đã hoàn thành";
            case "CANCELLED":
                return "Đã hủy";
            default:
                return status;
        }
    }

    /**
     * Check if schedule can be cancelled
     */
    private Boolean canCancel(Schedule schedule) {
        return schedule.isScheduled() && schedule.isFuture();
    }

    /**
     * Check if schedule can be updated
     */
    private Boolean canUpdate(Schedule schedule) {
        return schedule.isScheduled() && schedule.isFuture();
    }

    /**
     * Check if schedule can be deleted
     */
    private Boolean canDelete(Schedule schedule) {
        return (schedule.isScheduled() || schedule.isCancelled()) && schedule.getBookedSeats() == 0;
    }

    /**
     * Format duration in minutes to hours and minutes
     */
    private String formatDuration(Integer durationMinutes) {
        if (durationMinutes == null)
            return "";

        int hours = durationMinutes / 60;
        int minutes = durationMinutes % 60;

        if (hours > 0) {
            return String.format("%d giờ %d phút", hours, minutes);
        } else {
            return String.format("%d phút", minutes);
        }
    }
}
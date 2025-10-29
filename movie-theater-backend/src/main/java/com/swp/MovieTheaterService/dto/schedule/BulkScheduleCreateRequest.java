package com.swp.MovieTheaterService.dto.schedule;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Bulk Schedule Create Request DTO
 * Data transfer object for creating multiple schedules at once
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkScheduleCreateRequest {

    @NotNull(message = "ID phim không được để trống")
    private Long movieId;

    @NotEmpty(message = "Danh sách lịch chiếu không được để trống")
    @Valid
    private List<ScheduleTimeSlot> timeSlots;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScheduleTimeSlot {
        
        @NotNull(message = "ID phòng chiếu không được để trống")
        private Long cinemaRoomId;
        
        @NotNull(message = "Ngày chiếu không được để trống")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate showDate;
        
        @NotNull(message = "Giờ bắt đầu không được để trống")
        @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
        private LocalTime startTime;
        
        @NotNull(message = "Giờ kết thúc không được để trống")
        @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
        private LocalTime endTime;
        
        @NotNull(message = "Giá vé không được để trống")
        private Double price;
        
        private Boolean is3D = false;
        private Boolean isIMAX = false;
        private Boolean is4DX = false;
        private String subtitleLanguage = "Vietnamese";
        private String audioLanguage = "Vietnamese";
    }
}
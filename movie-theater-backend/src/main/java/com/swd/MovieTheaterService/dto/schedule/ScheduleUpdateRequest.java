package com.swp.MovieTheaterService.dto.schedule;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Schedule Update Request DTO
 * Data transfer object for updating movie schedules
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleUpdateRequest {

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate showDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime startTime;

    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime endTime;

    @DecimalMin(value = "0.0", inclusive = false, message = "Giá vé phải lớn hơn 0")
    @DecimalMax(value = "1000000.0", message = "Giá vé không được vượt quá 1,000,000")
    private Double price;

    @Pattern(regexp = "^(SCHEDULED|ONGOING|COMPLETED|CANCELLED)$", message = "Trạng thái không hợp lệ (SCHEDULED, ONGOING, COMPLETED, CANCELLED)")
    private String status;

    private Boolean is3D;

    private Boolean isIMAX;

    private Boolean is4DX;

    @Size(max = 50, message = "Ngôn ngữ phụ đề không được vượt quá 50 ký tự")
    private String subtitleLanguage;

    @Size(max = 50, message = "Ngôn ngữ âm thanh không được vượt quá 50 ký tự")
    private String audioLanguage;

    private Boolean isActive;

    // Custom validation method
    public boolean isTimeValid() {
        if (startTime != null && endTime != null) {
            // Cho phép phim chiếu qua đêm (endTime có thể nhỏ hơn startTime)
            // Ví dụ: 22:00 - 01:13 (qua đêm)
            if (endTime.isBefore(startTime)) {
                // Kiểm tra xem có phải trường hợp qua đêm hợp lý không
                // Chỉ cho phép nếu startTime >= 20:00 và endTime <= 06:00
                return startTime.getHour() >= 20 && endTime.getHour() <= 6;
            }
            // Trường hợp bình thường: endTime sau startTime trong cùng ngày
            return endTime.isAfter(startTime);
        }
        return true; // Let other validations handle null cases
    }

    // Check if schedule date is valid for update
    public boolean isValidScheduleDate() {
        if (showDate != null) {
            return !showDate.isBefore(LocalDate.now());
        }
        return true;
    }
}

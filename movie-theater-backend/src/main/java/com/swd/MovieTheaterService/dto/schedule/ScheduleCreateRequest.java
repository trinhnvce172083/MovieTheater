package com.swp.MovieTheaterService.dto.schedule;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Schedule Create Request DTO
 * Data transfer object for creating new movie schedules
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleCreateRequest {

    @NotNull(message = "ID phim không được để trống")
    private Long movieId;

    @NotNull(message = "ID phòng chiếu không được để trống")
    private Long cinemaRoomId;

    @NotNull(message = "Ngày chiếu không được để trống")
    @Future(message = "Ngày chiếu phải là ngày trong tương lai")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate showDate;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime startTime;

    @NotNull(message = "Giờ kết thúc không được để trống")
    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime endTime;

    @NotNull(message = "Giá vé không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá vé phải lớn hơn 0")
    @DecimalMax(value = "1000000.0", message = "Giá vé không được vượt quá 1,000,000")
    private Double price;

    @Pattern(regexp = "^(MORNING|AFTERNOON|EVENING|LATE_NIGHT)$", message = "Loại khung giờ không hợp lệ (MORNING, AFTERNOON, EVENING, LATE_NIGHT)")
    private String timeSlotType;

    @Pattern(regexp = "^(SCHEDULED|ONGOING|COMPLETED|CANCELLED)$", message = "Trạng thái không hợp lệ (SCHEDULED, ONGOING, COMPLETED, CANCELLED)")
    private String status = "SCHEDULED";

    private Boolean is3D = false;

    private Boolean isIMAX = false;

    private Boolean is4DX = false;

    @Size(max = 50, message = "Ngôn ngữ phụ đề không được vượt quá 50 ký tự")
    private String subtitleLanguage = "Vietnamese";

    @Size(max = 50, message = "Ngôn ngữ âm thanh không được vượt quá 50 ký tự")
    private String audioLanguage = "Vietnamese";

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

    // Check if schedule is for today or future
    public boolean isValidScheduleDate() {
        if (showDate != null) {
            return !showDate.isBefore(LocalDate.now());
        }
        return true;
    }
}

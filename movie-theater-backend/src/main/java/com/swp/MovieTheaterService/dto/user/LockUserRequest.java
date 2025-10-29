package com.swp.MovieTheaterService.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lock User Request DTO
 * Data Transfer Object for locking user account
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Lock user request payload")
public class LockUserRequest {

    @Schema(description = "Lý do khóa tài khoản", example = "Vi phạm quy định sử dụng dịch vụ", required = true)
    @NotBlank(message = "Lý do khóa tài khoản không được để trống")
    private String reason;

    @Schema(description = "Thời gian khóa (tính theo giờ)", example = "24", required = true)
    @NotNull(message = "Thời gian khóa không được để trống")
    @Positive(message = "Thời gian khóa phải lớn hơn 0")
    private Integer lockHours;

    @Schema(description = "Có gửi email thông báo không", example = "true")
    private Boolean sendNotificationEmail = true;

    @Schema(description = "Ghi chú thêm (tùy chọn)", example = "Khóa do spam booking")
    private String notes;
}
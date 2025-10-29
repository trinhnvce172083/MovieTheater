package com.swp.MovieTheaterService.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * User Profile Update Request DTO
 * Request for updating user profile information
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User profile update request")
public class UserProfileUpdateRequest {

    @Schema(description = "Email address", example = "john@example.com")
    @Email(message = "Email phải có định dạng hợp lệ")
    private String email;

    @Schema(description = "Full name", example = "John Doe")
    @Size(min = 2, max = 100, message = "Họ tên phải từ 2-100 ký tự")
    private String fullName;

    @Schema(description = "Phone number", example = "0901234567")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại phải có 10-11 chữ số")
    private String phoneNumber;

    @Schema(description = "Date of birth", example = "1990-01-01")
    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    private LocalDate dateOfBirth;

    @Schema(description = "Address", example = "123 Main St, District 1, Ho Chi Minh City")
    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;

    @Schema(description = "Accept marketing emails", example = "true")
    private Boolean acceptMarketing;
}
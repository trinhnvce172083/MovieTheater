package com.swp.MovieTheaterService.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Login Request DTO
 * Data transfer object for login requests
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Login request payload")
public class LoginRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Schema(description = "User email address", example = "lumieretest@example.com")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    @Schema(description = "User password", example = "Test123456")
    private String password;

    @Schema(description = "Remember me option", example = "true")
    private Boolean rememberMe = false;

    /**
     * Check if the input is an email format
     * 
     * @return true if input looks like email, false otherwise
     */
    public boolean isEmail() {
        return email != null && email.contains("@");
    }
} 
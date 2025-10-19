package com.swp.MovieTheaterService.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
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
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Login request payload")
public class LoginRequest {

    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    @Schema(description = "Username for login", example = "lumieretest")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    @Schema(description = "User password", example = "Test123456")
    private String password;

    @Schema(description = "Remember me option", example = "true")
    private Boolean rememberMe = false;
} 

package com.swp.MovieTheaterService.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.swp.MovieTheaterService.validator.PasswordMatching;
import com.swp.MovieTheaterService.validator.ValidAge;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

/**
 * Register Request DTO - Lombok Pattern from Working Code
 * Following exact pattern from AuthenticationRequest that works
 *
 * @author Ngo Viet Trinh
 * @version 2.4.0 - Lombok Pattern (Working)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIgnoreProperties(ignoreUnknown = true)
@PasswordMatching(password = "password", confirmPassword = "confirmPassword")
@Schema(description = "Yêu cầu đăng ký tài khoản mới")
public class RegisterRequest {

    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    @Schema(description = "Username for login", example = "gundneit")
    String username;

    @NotBlank(message = "Tên đầy đủ không được để trống")
    @Size(min = 2, max = 100, message = "Tên đầy đủ phải từ 2-100 ký tự")
    @Pattern(regexp = "^[\\p{L}\\s.'-]+$", message = "Tên chỉ được chứa chữ cái, khoảng trắng và các ký tự đặc biệt như dấu chấm, dấu nháy")
    @Schema(description = "Họ và tên đầy đủ", example = "Nguyễn Tiến Dũng")
    String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ", regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    @Schema(description = "Địa chỉ email", example = "gundneit@gmail.com")
    String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, max = 128, message = "Mật khẩu phải từ 8-128 ký tự")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", message = "Mật khẩu phải chứa ít nhất 8 ký tự bao gồm: 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt (@$!%*?&)")
    @Schema(description = "Mật khẩu", example = "12345Aa!")
    String password;

    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    @Schema(description = "Xác nhận mật khẩu", example = "12345Aa!")
    String confirmPassword;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(\\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$", message = "Số điện thoại không hợp lệ (định dạng Việt Nam)")
    @Schema(description = "Số điện thoại", example = "0399927256")
    String phoneNumber;

    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    @ValidAge(min = 13, max = 120, message = "Tuổi phải từ 13 đến 120")
    @Schema(description = "Ngày sinh", example = "2001-09-30")
    LocalDate dateOfBirth;

    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    @Schema(description = "Địa chỉ", example = "123 Đường Lê Lợi, Quận 1, TP.HCM")
    String address;

    @NotNull(message = "Bạn phải đồng ý với điều khoản sử dụng")
    @AssertTrue(message = "Bạn phải đồng ý với điều khoản sử dụng")
    Boolean agreeToTerms;

    @Builder.Default
    Boolean acceptMarketing = false;

    @Override
    public String toString() {
        return "RegisterRequest{" +
                "username='" + username + '\'' +
                ", fullName='" + fullName + '\'' +
                ", email='" + email + '\'' +
                ", password='[PROTECTED]'" +
                ", confirmPassword='[PROTECTED]'" +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", dateOfBirth=" + dateOfBirth +
                ", address='" + address + '\'' +
                ", agreeToTerms=" + agreeToTerms +
                ", acceptMarketing=" + acceptMarketing +
                '}';
    }
}

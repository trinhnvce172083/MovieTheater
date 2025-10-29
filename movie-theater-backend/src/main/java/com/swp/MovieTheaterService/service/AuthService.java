package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.request.ForgotPasswordRequest;
import com.swp.MovieTheaterService.dto.request.LoginRequest;
import com.swp.MovieTheaterService.dto.request.RefreshTokenRequest;
import com.swp.MovieTheaterService.dto.request.RegisterRequest;
import com.swp.MovieTheaterService.dto.request.ResetPasswordRequest;
import com.swp.MovieTheaterService.dto.request.UserProfileUpdateRequest;
import com.swp.MovieTheaterService.dto.response.AuthResponse;
import com.swp.MovieTheaterService.dto.response.UserProfileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Authentication Service Interface
 * Business logic for authentication operations
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public interface AuthService {

    /**
     * Register a new member account
     * 
     * @param registerRequest registration data
     * @return registration response with account details
     */
    AuthResponse register(RegisterRequest registerRequest);

    /**
     * Login with username/email and password
     * 
     * @param loginRequest login credentials
     * @return login response with JWT tokens
     */
    AuthResponse login(LoginRequest loginRequest);

    /**
     * Refresh access token using refresh token
     * 
     * @param refreshTokenRequest refresh token request
     * @return new login response with fresh tokens
     */
    AuthResponse refreshToken(String refreshToken);

    /**
     * Logout user and invalidate tokens
     * 
     * @param accessToken current access token
     * @return logout success message
     */
    void logout(String accessToken);

    /**
     * Verify email with verification token
     * 
     * @param token verification token
     * @return success message
     */
    void verifyEmail(String token);

    /**
     * Resend verification email
     * 
     * @param email user email
     * @return success message
     */
    void resendVerificationEmail(String email);

    /**
     * Send forgot password email
     * 
     * @param forgotPasswordRequest forgot password request
     */
    void forgotPassword(ForgotPasswordRequest forgotPasswordRequest);

    /**
     * Reset password with token
     * 
     * @param resetPasswordRequest reset password request
     */
    void resetPassword(ResetPasswordRequest resetPasswordRequest);

    /**
     * Check if username is available
     * 
     * @param username username to check
     * @return true if available, false if taken
     */
    boolean isUsernameAvailable(String username);

    /**
     * Check if email is available
     * 
     * @param email email to check
     * @return true if available, false if taken
     */
    boolean isEmailAvailable(String email);

    // ==================== PROFILE MANAGEMENT ====================

    /**
     * Lấy thông tin profile của user
     * 
     * @param username username của user hiện tại
     * @return thông tin profile đầy đủ
     */
    UserProfileResponse getUserProfile(String username);

    /**
     * Cập nhật thông tin profile của user
     * 
     * @param username username của user hiện tại
     * @param request thông tin cần cập nhật
     * @return thông tin profile đã cập nhật
     */
    UserProfileResponse updateUserProfile(String username, UserProfileUpdateRequest request);

    /**
     * Upload avatar cho user hiện tại
     * 
     * @param username username của user hiện tại
     * @param file file avatar cần upload
     * @return thông tin kết quả upload
     */
    Map<String, Object> uploadUserAvatar(String username, MultipartFile file);

    /**
     * Xóa avatar của user hiện tại
     * 
     * @param username username của user hiện tại
     * @return thông tin kết quả xóa
     */
    Map<String, Object> deleteUserAvatar(String username);

    /**
     * Cập nhật profile và avatar cùng lúc
     * 
     * @param username username của user hiện tại
     * @param profileDataJson JSON string của profile data
     * @param avatarFile file avatar (optional)
     * @return thông tin profile đã cập nhật
     */
    UserProfileResponse updateProfileWithAvatar(String username, String profileDataJson, MultipartFile avatarFile);
}
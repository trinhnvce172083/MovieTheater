package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.request.ForgotPasswordRequest;
import com.swp.MovieTheaterService.dto.request.LoginRequest;
import com.swp.MovieTheaterService.dto.request.RefreshTokenRequest;
import com.swp.MovieTheaterService.dto.request.RegisterRequest;
import com.swp.MovieTheaterService.dto.request.ResetPasswordRequest;
import com.swp.MovieTheaterService.dto.response.AuthResponse;

/**
 * Authentication Service Interface
 * Business logic for authentication operations
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public interface AuthService {

    /**
     * Register a new customer account
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
} 
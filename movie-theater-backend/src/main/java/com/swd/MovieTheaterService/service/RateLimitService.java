package com.swp.MovieTheaterService.service;

/**
 * Rate Limiting Service Interface
 * Handles rate limiting for sensitive operations
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public interface RateLimitService {

    /**
     * Check if registration is allowed for this IP
     *
     * @param ipAddress client IP address
     * @return true if allowed, false if rate limited
     */
    boolean isRegistrationAllowed(String ipAddress);

    /**
     * Check if login is allowed for this IP
     *
     * @param ipAddress client IP address
     * @return true if allowed, false if rate limited
     */
    boolean isLoginAllowed(String ipAddress);

    /**
     * Check if email sending is allowed for this email
     *
     * @param email user email
     * @return true if allowed, false if rate limited
     */
    boolean isEmailSendingAllowed(String email);

    /**
     * Record a registration attempt
     *
     * @param ipAddress client IP address
     */
    void recordRegistrationAttempt(String ipAddress);

    /**
     * Record a login attempt
     *
     * @param ipAddress client IP address
     */
    void recordLoginAttempt(String ipAddress);

    /**
     * Record an email sending attempt
     *
     * @param email user email
     */
    void recordEmailSendingAttempt(String email);

    /**
     * Clear rate limit for IP (admin function)
     *
     * @param ipAddress client IP address
     */
    void clearRateLimit(String ipAddress);
} 

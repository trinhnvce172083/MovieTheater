package com.swp.MovieTheaterService.service;

/**
 * Token Blacklist Service Interface
 * Handles JWT token blacklisting for logout functionality
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public interface TokenBlacklistService {

    /**
     * Add token to blacklist
     *
     * @param token JWT token to blacklist
     */
    void blacklistToken(String token);

    /**
     * Check if token is blacklisted
     *
     * @param token JWT token to check
     * @return true if token is blacklisted
     */
    boolean isTokenBlacklisted(String token);

    /**
     * Clean up expired tokens from blacklist
     */
    void cleanupExpiredTokens();

    /**
     * Get blacklist size (for monitoring)
     *
     * @return number of blacklisted tokens
     */
    int getBlacklistSize();
} 

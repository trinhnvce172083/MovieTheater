package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.entity.Account;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Date;
import java.util.Map;

/**
 * JWT Service Interface
 * Service for JWT token operations
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public interface JwtService {

    /**
     * Generate access token for user
     * 
     * @param account user account
     * @return JWT access token
     */
    String generateAccessToken(Account account);

    /**
     * Generate refresh token for user
     * 
     * @param account user account
     * @return JWT refresh token
     */
    String generateRefreshToken(Account account);

    /**
     * Generate token with extra claims
     * 
     * @param extraClaims additional claims
     * @param userDetails user details
     * @param expiration token expiration time
     * @return JWT token
     */
    String generateToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration);

    /**
     * Extract username from token
     * 
     * @param token JWT token
     * @return username
     */
    String extractUsername(String token);

    /**
     * Extract account ID from token
     * 
     * @param token JWT token
     * @return account ID
     */
    Long extractAccountId(String token);

    /**
     * Extract expiration date from token
     * 
     * @param token JWT token
     * @return expiration date
     */
    Date extractExpiration(String token);

    /**
     * Check if token is valid
     * 
     * @param token JWT token
     * @param userDetails user details
     * @return true if valid, false otherwise
     */
    boolean isTokenValid(String token, UserDetails userDetails);

    /**
     * Check if token is expired
     * 
     * @param token JWT token
     * @return true if expired, false otherwise
     */
    boolean isTokenExpired(String token);

    /**
     * Extract all claims from token
     * 
     * @param token JWT token
     * @return claims map
     */
    Map<String, Object> extractAllClaims(String token);

    String generateToken(UserDetails userDetails);
    
    Long getExpirationTime();
} 
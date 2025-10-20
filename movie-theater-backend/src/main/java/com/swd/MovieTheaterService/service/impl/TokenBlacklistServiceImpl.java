package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.service.JwtService;
import com.swp.MovieTheaterService.service.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Token Blacklist Service Implementation
 * Uses in-memory cache for token blacklisting
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TokenBlacklistServiceImpl implements TokenBlacklistService {

    private final JwtService jwtService;

    // In-memory storage for blacklisted tokens
    // Key: token, Value: expiry time
    private final ConcurrentMap<String, LocalDateTime> blacklistedTokens = new ConcurrentHashMap<>();

    @Override
    public void blacklistToken(String token) {
        if (token == null || token.isEmpty()) {
            return;
        }

        try {
            // Get token expiry time from JWT
            LocalDateTime expiryTime = jwtService.getTokenExpiryTime(token);
            blacklistedTokens.put(token, expiryTime);
            log.info("Token blacklisted successfully. Blacklist size: {}", blacklistedTokens.size());
        } catch (Exception e) {
            log.warn("Failed to blacklist token: {}", e.getMessage());
            // Fallback: blacklist for 24 hours
            blacklistedTokens.put(token, LocalDateTime.now().plusHours(24));
        }
    }

    @Override
    public boolean isTokenBlacklisted(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }

        LocalDateTime expiryTime = blacklistedTokens.get(token);
        if (expiryTime == null) {
            return false;
        }

        // Check if blacklist entry has expired
        if (expiryTime.isBefore(LocalDateTime.now())) {
            blacklistedTokens.remove(token);
            return false;
        }

        return true;
    }

    @Override
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        int sizeBefore = blacklistedTokens.size();

        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue().isBefore(now));

        int sizeAfter = blacklistedTokens.size();
        if (sizeBefore != sizeAfter) {
            log.info("Cleaned up {} expired tokens from blacklist. Remaining: {}",
                    sizeBefore - sizeAfter, sizeAfter);
        }
    }

    @Override
    public int getBlacklistSize() {
        return blacklistedTokens.size();
    }
} 

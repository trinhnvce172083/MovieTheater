package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.service.RateLimitService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Rate Limiting Service Implementation
 * Uses in-memory cache for rate limiting
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Slf4j
@Service
public class RateLimitServiceImpl implements RateLimitService {

    // Rate limit configurations
    private static final int REGISTRATION_LIMIT_PER_IP = 500; // 5 registrations per hour
    private static final int LOGIN_LIMIT_PER_IP = 1000; // 10 login attempts per hour
    private static final int EMAIL_LIMIT_PER_EMAIL = 300; // 3 emails per hour

    private static final long RATE_LIMIT_WINDOW_HOURS = 100;

    // In-memory storage for rate limiting
    private final ConcurrentMap<String, RateLimitData> registrationAttempts = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, RateLimitData> loginAttempts = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, RateLimitData> emailAttempts = new ConcurrentHashMap<>();

    @Override
    public boolean isRegistrationAllowed(String ipAddress) {
        return isAllowed(registrationAttempts, ipAddress, REGISTRATION_LIMIT_PER_IP);
    }

    @Override
    public boolean isLoginAllowed(String ipAddress) {
        return isAllowed(loginAttempts, ipAddress, LOGIN_LIMIT_PER_IP);
    }

    @Override
    public boolean isEmailSendingAllowed(String email) {
        return isAllowed(emailAttempts, email, EMAIL_LIMIT_PER_EMAIL);
    }

    @Override
    public void recordRegistrationAttempt(String ipAddress) {
        recordAttempt(registrationAttempts, ipAddress);
        log.info("Recorded registration attempt from IP: {}", ipAddress);
    }

    @Override
    public void recordLoginAttempt(String ipAddress) {
        recordAttempt(loginAttempts, ipAddress);
        log.info("Recorded login attempt from IP: {}", ipAddress);
    }

    @Override
    public void recordEmailSendingAttempt(String email) {
        recordAttempt(emailAttempts, email);
        log.info("Recorded email sending attempt for: {}", email);
    }

    @Override
    public void clearRateLimit(String ipAddress) {
        registrationAttempts.remove(ipAddress);
        loginAttempts.remove(ipAddress);
        log.info("Cleared rate limits for IP: {}", ipAddress);
    }

    private boolean isAllowed(ConcurrentMap<String, RateLimitData> attempts, String key, int limit) {
        RateLimitData data = attempts.get(key);

        if (data == null) {
            return true;
        }

        // Clean up old attempts
        data.cleanupOldAttempts();

        return data.getAttemptCount() < limit;
    }

    private void recordAttempt(ConcurrentMap<String, RateLimitData> attempts, String key) {
        attempts.compute(key, (k, data) -> {
            if (data == null) {
                data = new RateLimitData();
            }
            data.addAttempt();
            return data;
        });
    }

    /**
     * Internal class to track rate limit data
     */
    private static class RateLimitData {
        private final ConcurrentMap<LocalDateTime, Integer> attemptsByTime = new ConcurrentHashMap<>();

        public void addAttempt() {
            LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
            attemptsByTime.merge(now, 1, Integer::sum);
            cleanupOldAttempts();
        }

        public int getAttemptCount() {
            cleanupOldAttempts();
            return attemptsByTime.values().stream().mapToInt(Integer::intValue).sum();
        }

        public void cleanupOldAttempts() {
            LocalDateTime cutoff = LocalDateTime.now().minusHours(RATE_LIMIT_WINDOW_HOURS);
            attemptsByTime.entrySet().removeIf(entry -> entry.getKey().isBefore(cutoff));
        }
    }
} 

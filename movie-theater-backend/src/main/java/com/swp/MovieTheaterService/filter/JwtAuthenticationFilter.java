package com.swp.MovieTheaterService.filter;

import com.swp.MovieTheaterService.service.JwtService;
import com.swp.MovieTheaterService.service.TokenBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * JWT Authentication Filter - Comprehensive Version
 * Validates JWT tokens, checks blacklist, and handles public paths
 * 
 * Features:
 * - TokenBlacklistService integration for security
 * - Public paths support for guest access
 * - Comprehensive error handling
 * - Guest booking support
 * 
 * @author Dũng_Solo
 * @version 2.0.0 (Merged)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    /**
     * Public paths that don't require authentication
     * Essential for guest booking and public movie browsing
     */
    private static final List<String> PUBLIC_PATHS = Arrays.asList(
            // Authentication endpoints (PUBLIC)
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh-token",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/auth/verify-email",
            "/api/auth/resend-verification",
            "/api/auth/check-email",
            "/api/auth/check-username",
            "/auth/**",

            // Test endpoints
            "/test/**",
            "/api/test/**",

            // Movie endpoints (public read access)
            "/api/movies",
            "/api/movies/public/**",
            "/api/movies/now-showing",
            "/api/movies/coming-soon",
            "/api/movies/search",
            "/api/movies/*", // for /api/movies/{movieId}
            "/api/movies/popular",
            "/api/movies/by-genre",
            "/api/movies/filter",

            // Schedule endpoints (public read access)
            "/api/schedules",
            "/api/schedules/public/**",
            "/api/schedules/*", // for /api/schedules/{scheduleId}
            "/api/schedules/by-movie/**",
            "/api/schedules/by-cinema-room/**",
            "/api/schedules/by-date",
            "/api/schedules/available-dates",
            "/api/schedules/available-times",
            "/api/schedules/filter",

            // Cinema Room endpoints (public read access)
            "/api/cinema-rooms",
            "/api/cinema-rooms/public/**",
            "/api/cinema-rooms/*", // for /api/cinema-rooms/{cinemaRoomId}
            "/api/cinema-rooms/*/seats", // for /api/cinema-rooms/{cinemaRoomId}/seats
            "/api/cinema-rooms/layout/**",

            // Booking endpoints (guest booking support)
            "/api/bookings/guest",
            "/api/bookings/guest/**",
            "/api/bookings/check-booking",
            "/api/bookings/schedule/*/check-seats", // for /api/bookings/schedule/{scheduleId}/check-seats
            "/api/bookings/*/generate-qr",
            "/api/bookings/validate-qr",
            "/api/bookings/payment/guest",
            "/api/bookings/guest-search",

            // Seat reservation endpoints (guest access)
            "/api/seats/reserve-temporarily",
            "/api/seats/release-reservation",
            "/api/seats/status/*",

            // Promotion endpoints (public access)
            "/api/promotions",
            "/api/promotions/active",
            "/api/promotions/*", // for /api/promotions/{promotionId}
            "/api/promotions/validate",
            "/api/promotions/public/**",

            // Loyalty endpoints (public info)
            "/api/loyalty/info",

            // Payment endpoints (guest payment)
            "/api/payments/create",
            "/api/payments/methods",
            "/api/payments/vnpay/callback",
            "/api/payment/vnpay/return",
            "/api/payment/vnpay/ipn",
            "/api/payments/calculate-fee",

            // Documentation & API
            "/v3/api-docs/**",
            "/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/docs",
            "/swagger-resources/**",
            "/webjars/**",

            // Static resources
            "/static/**",
            "/css/**",
            "/js/**",
            "/images/**",
            "/favicon.ico",

            // Health & Monitoring
            "/actuator/**",

            // Root endpoints
            "/",
            "/index",
            "/home");

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String requestPath = request.getServletPath();
        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        log.debug("Processing request: {} {} - Path: {}", method, requestURI, requestPath);

        // Check if path is public (no authentication required)
        if (isPublicPath(requestPath)) {
            log.debug("Public path detected, skipping authentication: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // Skip if no Authorization header or doesn't start with Bearer
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No valid Authorization header found for protected path: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        // Check if token is blacklisted (Security Enhancement)
        if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
            log.warn("Attempted access with blacklisted token from IP: {}", getClientIP(request));
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\": \"Token đã bị vô hiệu hóa\", \"code\": \"TOKEN_BLACKLISTED\"}");
            return;
        }

        try {
            username = jwtService.extractUsername(jwt);

            // Authenticate if username exists and no current authentication
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("User authenticated successfully: {}", username);
                } else {
                    log.warn("Invalid JWT token for user: {} from IP: {}", username, getClientIP(request));
                }
            }
        } catch (Exception e) {
            log.error("Error processing JWT token from IP: {} - Error: {}", getClientIP(request), e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Check if request path is public (doesn't require authentication)
     */
    private boolean isPublicPath(String requestPath) {
        return PUBLIC_PATHS.stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, requestPath));
    }

    /**
     * Get client IP address for logging and security
     */
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
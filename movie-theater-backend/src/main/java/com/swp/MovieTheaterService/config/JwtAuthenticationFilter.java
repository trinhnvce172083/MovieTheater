package com.swp.MovieTheaterService.config;

import com.swp.MovieTheaterService.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    
    private static final List<String> PUBLIC_PATHS = Arrays.asList(
        // Auth endpoints
        "/api/auth/**",
        "/auth/**",
        
        // Test endpoints (cho phép truy cập để test)
        "/test/**",
        "/api/test/**",
        
        // Movie endpoints (đọc thông tin phim công khai)
        "/movies",
        "/movies/public",
        "/movies/now-showing",
        "/movies/coming-soon",
        "/movies/search",
        "/movies/*", // Để bao gồm /movies/{movieId}
        "/movies/popular",
        "/movies/by-genre",
        
        // Schedule endpoints (đọc lịch chiếu công khai)
        "/schedules",
        "/schedules/public",
        "/schedules/*", // Để bao gồm /schedules/{scheduleId}
        "/schedules/by-movie/**",
        "/schedules/by-cinema-room/**",
        "/schedules/by-date",
        "/schedules/available-dates",
        "/schedules/available-times",
        
        // Cinema Room endpoints (đọc thông tin phòng chiếu công khai)
        "/cinema-rooms",
        "/cinema-rooms/public",
        "/cinema-rooms/*", // Để bao gồm /cinema-rooms/{cinemaRoomId}
        "/cinema-rooms/*/seats", // Để bao gồm /cinema-rooms/{cinemaRoomId}/seats
        "/cinema-rooms/layout/**",
        
        // Booking endpoints (public cho guest booking)
        "/api/bookings/guest",
        "/api/bookings/*", // Để bao gồm /api/bookings/{bookingCode}
        "/api/bookings/check-booking",
        "/api/bookings/schedule/*/check-seats", // Để bao gồm /api/bookings/schedule/{scheduleId}/check-seats
        "/api/bookings/*/generate-qr", // Để bao gồm /api/bookings/{bookingId}/generate-qr
        "/api/bookings/validate-qr",
        "/api/bookings/payment/guest",
        
        // Promotion endpoints (đọc khuyến mãi công khai)
        "/api/promotions",
        "/api/promotions/active",
        "/api/promotions/*", // Để bao gồm /api/promotions/{promotionId}
        "/api/promotions/validate",
        
        // Loyalty endpoints (public info)
        "/api/loyalty/info",
        
        // Swagger & OpenAPI documentation
        "/v3/api-docs/**",
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/api-docs/**",
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
        "/home"
    );

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        String requestPath = request.getServletPath();
        String contextPath = request.getContextPath();
        
        log.debug("Request path: {}, Context path: {}", requestPath, contextPath);
        
        // Kiểm tra nếu đường dẫn nằm trong danh sách public
        if (isPublicPath(requestPath)) {
            log.debug("Public path detected: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        userEmail = jwtService.extractUsername(jwt);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.debug("User authenticated: {}", userEmail);
            }
        }

        filterChain.doFilter(request, response);
    }
    
    private boolean isPublicPath(String requestPath) {
        return PUBLIC_PATHS.stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, requestPath));
    }
} 
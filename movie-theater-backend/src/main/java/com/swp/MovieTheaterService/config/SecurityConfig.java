package com.swp.MovieTheaterService.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Security Configuration
 * Updated to include all endpoints for Swagger whitelist
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    private static final String[] WHITE_LIST_URL = {
            // Auth endpoints
            "/auth/**",
            "/api/auth/**",
            
            // Test endpoints (cho phép truy cập để test)
            "/test/**",
            "/api/test/**",
            
            // Movie endpoints (đọc thông tin phim công khai)
            "/movies",
            "/movies/public",
            "/movies/now-showing",
            "/movies/coming-soon",
            "/movies/search",
            "/movies/{movieId}",
            "/movies/popular",
            "/movies/by-genre",
            
            // Schedule endpoints (đọc lịch chiếu công khai)
            "/schedules",
            "/schedules/public",
            "/schedules/{scheduleId}",
            "/schedules/by-movie/**",
            "/schedules/by-cinema-room/**",
            "/schedules/by-date",
            "/schedules/available-dates",
            "/schedules/available-times",
            
            // Cinema Room endpoints (đọc thông tin phòng chiếu công khai)
            "/cinema-rooms",
            "/cinema-rooms/public",
            "/cinema-rooms/{cinemaRoomId}",
            "/cinema-rooms/{cinemaRoomId}/seats",
            "/cinema-rooms/layout/**",
            
            // Booking endpoints (public cho guest booking)
            "/api/bookings/guest",
            "/api/bookings/{bookingCode}",
            "/api/bookings/check-booking",
            "/api/bookings/schedule/{scheduleId}/check-seats",
            "/api/bookings/{bookingId}/generate-qr",
            "/api/bookings/validate-qr",
            "/api/bookings/payment/guest",
            
            // Promotion endpoints (đọc khuyến mãi công khai)
            "/api/promotions",
            "/api/promotions/active",
            "/api/promotions/{promotionId}",
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
            "/actuator/health",
            "/actuator/info",
            
            // Root endpoints
            "/",
            "/index",
            "/home"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(req -> 
                        req.requestMatchers(WHITE_LIST_URL)
                                .permitAll()
                                .anyRequest()
                                .authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
} 
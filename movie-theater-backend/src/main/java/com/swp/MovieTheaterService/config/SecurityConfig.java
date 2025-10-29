package com.swp.MovieTheaterService.config;

import com.swp.MovieTheaterService.filter.JwtAuthenticationFilter;
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
import org.springframework.http.HttpMethod;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security Configuration for Movie Theater System v2.1.0 (Optimized)
 *
 * ROLES:
 * - ADMIN: Full system access - CRUD all modules
 * - EMPLOYEE: Ticket sales, booking management, member search
 * - MEMBER: Customer privileges + booking, account management
 * - CUSTOMER: Public access - view movies, promotions, prices
 *
 * @author Ngo Viet Trinh
 * @version 2.1.0 (Optimized)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(this::configureAuthorization)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /**
     * Configure authorization rules in a more organized way
     */
    private void configureAuthorization(org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry authz) {
        authz
                // Public endpoints - no authentication required
                .requestMatchers(combineArrays(
                        Endpoints.PUBLIC_AUTH,
                        Endpoints.PUBLIC_CONTENT,
                        Endpoints.PUBLIC_PAYMENT,
                        Endpoints.DOCUMENTATION,
                        Endpoints.TEST_ENDPOINTS
                )).permitAll()

                // Public read access for content
                .requestMatchers(HttpMethod.GET,
                        "/api/schedules", "/api/schedules/**",
                        "/api/cinema-rooms", "/api/cinema-rooms/**",
                        "/api/concessions", "/api/concessions/**"
                ).permitAll()

                // TEMPORARY: Enable all promotion endpoints for debugging
                .requestMatchers("/api/promotions/**").permitAll()

                // Admin-only endpoints
                .requestMatchers(Endpoints.ADMIN_MANAGEMENT).hasRole("ADMIN")

                // TEMPORARY: Enable all movie endpoints for debugging
                .requestMatchers("/api/movies/**").permitAll()

                // Admin content management (excluding movies and promotions for now)
                .requestMatchers(HttpMethod.POST, "/api/schedules/**",
                        "/api/cinema-rooms/**", "/api/concessions/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/schedules/**",
                        "/api/cinema-rooms/**", "/api/concessions/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/schedules/**",
                        "/api/cinema-rooms/**", "/api/concessions/**").hasRole("ADMIN")

                // Booking endpoints - Specific rules FIRST to override general authenticated rules
                .requestMatchers(HttpMethod.POST, "/api/bookings").hasAnyRole("MEMBER", "EMPLOYEE", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/bookings/guest").hasAnyRole("EMPLOYEE", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/bookings/search").hasAnyRole("EMPLOYEE", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/bookings/{bookingId}").hasAnyRole("MEMBER", "EMPLOYEE", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/bookings/schedules/*/seats").hasAnyRole("MEMBER", "EMPLOYEE", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/bookings/schedules/*/seats/reserve").hasAnyRole("MEMBER", "EMPLOYEE", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/bookings/{bookingId}/confirm").hasAnyRole("EMPLOYEE", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/bookings/{bookingId}/checkin").hasAnyRole("EMPLOYEE", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/bookings/{bookingId}/cancel").hasAnyRole("EMPLOYEE", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/bookings/{bookingId}/payment/status").hasAnyRole("EMPLOYEE", "ADMIN")

                // Employee operations
                .requestMatchers(Endpoints.EMPLOYEE_OPERATIONS).hasAnyRole("EMPLOYEE", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/concessions/*/stock").hasAnyRole("EMPLOYEE", "ADMIN")

                // Member operations
                .requestMatchers(Endpoints.MEMBER_OPERATIONS).hasAnyRole("MEMBER", "ADMIN")

                // General authenticated endpoints (AFTER specific rules)
                .requestMatchers(Endpoints.AUTHENTICATED_OPERATIONS).authenticated()

                // File and Image endpoints - Admin and authenticated users
                .requestMatchers(HttpMethod.GET, "/api/images/**").permitAll() // Public read access for images
                .requestMatchers(HttpMethod.POST, "/api/files/**", "/api/images/**").hasAnyRole("ADMIN", "EMPLOYEE")
                .requestMatchers(HttpMethod.PUT, "/api/files/**", "/api/images/**").hasAnyRole("ADMIN", "EMPLOYEE")
                .requestMatchers(HttpMethod.DELETE, "/api/files/**", "/api/images/**").hasRole("ADMIN")

                // Email endpoints - Admin and Marketing roles
                .requestMatchers(Endpoints.EMAIL_OPERATIONS).hasAnyRole("ADMIN", "MARKETING")

                // Loyalty endpoints - Members and Admin
                .requestMatchers("/api/loyalty/**").hasAnyRole("MEMBER", "ADMIN")

                // Default - require authentication
                .anyRequest().authenticated();
    }

    /**
     * Optimized CORS configuration
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Use applyPermitDefaultValues for common settings
        configuration.applyPermitDefaultValues();

        // Override with specific settings
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",
                "http://localhost:8080",
                "https://*.vercel.app"
        ));

        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "X-Requested-With",
                "Accept", "Origin", "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));

        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization"));

        // Cache preflight requests for better performance
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
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

    /**
     * Utility method to combine string arrays
     */
    private String[] combineArrays(String[]... arrays) {
        return Arrays.stream(arrays)
                .flatMap(Arrays::stream)
                .toArray(String[]::new);
    }

    // Constants for better maintainability
    private static final class Endpoints {
        // Public endpoints
        static final String[] PUBLIC_AUTH = {
                "/api/auth/login", "/api/auth/register", "/api/auth/refresh-token",
                "/api/auth/forgot-password", "/api/auth/reset-password", "/api/auth/verify-email",
                "/api/auth/resend-verification", "/api/auth/check-email", "/api/auth/check-username"
        };

        static final String[] PUBLIC_CONTENT = {
                "/api/movies/public/**", "/api/schedules/public/**",
                "/api/cinema-rooms/public/**", "/api/promotions/public/**"
        };

        static final String[] PUBLIC_PAYMENT = {
                "/api/payments/methods", "/api/payments/vnpay/callback",
                "/api/payment/vnpay/return", "/api/payment/vnpay/ipn", "/api/payments/calculate-fee"
        };

        static final String[] DOCUMENTATION = {
                "/v3/api-docs/**", "/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
                "/swagger-resources/**", "/webjars/**", "/actuator/health", "/actuator/info"
        };

        static final String[] TEST_ENDPOINTS = {
                "/api/test/**", "/api/test/echo", "/api/test/auth"
        };

        // Admin endpoints
        static final String[] ADMIN_MANAGEMENT = {
                "/api/admin/**", "/api/employees/management/**", "/api/users/admin/**",
                "/api/reports/**", "/api/analytics/**", "/api/auto-schedule/**"
        };

                // Employee endpoints
        static final String[] EMPLOYEE_OPERATIONS = {
            "/api/staff/**", "/api/employees/ticket-selling/**", "/api/employees/booking-management/**",
            "/api/employees/members/**", "/api/checkin/**", "/api/payment/staff/**"
        };

        // Member endpoints
        static final String[] MEMBER_OPERATIONS = {
                "/api/members/**", "/api/user/profile/**", "/api/loyalty/**", "/api/payment/members/**"
        };

        // General authenticated endpoints
        static final String[] AUTHENTICATED_OPERATIONS = {
                "/api/user/**", "/api/auth/profile/**", "/api/auth/change-password/**",
                "/api/auth/logout", "/api/bookings/**", "/api/payments/create",
                "/api/payments/verify/**", "/api/payments/status/**"
        };

        // File and Image endpoints
        static final String[] FILE_IMAGE_OPERATIONS = {
                "/api/files/**", "/api/images/**"
        };

        // Email endpoints
        static final String[] EMAIL_OPERATIONS = {
                "/api/emails/**"
        };
    }
}
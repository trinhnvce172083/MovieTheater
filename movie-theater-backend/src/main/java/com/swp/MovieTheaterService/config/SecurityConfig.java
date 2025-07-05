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
 * Security Configuration for Movie Theater System v2.0.0 (SRS Compliant)
 * Role-Based Access Control theo Software Requirements Specification
 *
 * ROLES theo SRS:
 * - ADMIN: Quyền cao nhất - CRUD tất cả modules
 * - EMPLOYEE: Quản lý bán vé, đặt vé, tìm kiếm thành viên
 * - MEMBER: Customer + đặt vé, quản lý tài khoản
 * - CUSTOMER: Xem phim, khuyến mãi, giá vé, đăng ký (không cần auth)
 *
 * @author Dũng_Solo
 * @version 2.0.0 (SRS Compliant)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final UserDetailsService userDetailsService;

        /**
         * Configure Security Filter Chain với Role-Based Access theo SRS
         */
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                return http
                        .csrf(AbstractHttpConfigurer::disable)
                        .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                        .authorizeHttpRequests(authz -> authz
                                // =================== PUBLIC ENDPOINTS (CUSTOMER không cần auth)
                                // ===================
                                // Theo SRS: Customer có thể xem movie list, promotions, ticket prices,
                                // showtimes
                                .requestMatchers(
                                        // Authentication endpoints
                                        "/api/auth/login",
                                        "/api/auth/register",
                                        "/api/auth/refresh-token",
                                        "/api/auth/forgot-password",
                                        "/api/auth/reset-password",
                                        "/api/auth/verify-email",
                                        "/api/auth/resend-verification",
                                        "/api/auth/check-email",
                                        "/api/auth/check-username",
                                        "/api/auth/test*", // Test endpoints

                                        // Public movie information
                                        "/api/movies/public/**", // View movie list
                                        "/api/schedules/public/**", // View showtimes
                                        "/api/cinema-rooms/public/**", // View ticket prices
                                        "/api/promotions/public/**", // View promotions

                                        // Documentation & monitoring
                                        "/v3/api-docs/**",
                                        "/api-docs/**",
                                        "/swagger-ui/**",
                                        "/swagger-ui.html",
                                        "/swagger-resources/**",
                                        "/webjars/**",
                                        "/actuator/health",
                                        "/actuator/info",

                                        // Payment public endpoints
                                        "/api/payments/methods", // Get payment methods
                                        "/api/payments/vnpay/callback", // VNPay callback
                                        "/api/payment/vnpay/return", // VNPay return (correct URL)
                                        "/api/payment/vnpay/ipn", // VNPay IPN
                                        "/api/payments/calculate-fee", // Calculate payment fee

                                        // Promotion validation (public access) - Moved to PUBLIC POST ACCESS

                                        // Test endpoints
                                        "/api/test/**",
                                        "/api/test/echo",
                                        "/api/test/auth")
                                .permitAll()

                                // =================== PUBLIC READ ACCESS ===================
                                // GET operations for movies, schedules, cinema-rooms (public read)
                                .requestMatchers(HttpMethod.GET,
                                        "/api/movies/**", // GET movies (public read)
                                        "/api/schedules/**", // GET schedules (public read)
                                        "/api/cinema-rooms/**", // GET cinema-rooms (public read)
                                        "/api/concessions/**", // GET concessions (public read)
                                        "/api/promotions/**", // GET promotions (public read)
                                        "/api/promotions/active", // GET active promotions
                                        "/api/promotions/code/*", // GET promotion by code
                                        "/api/promotions/type/*", // GET promotions by type
                                        "/api/promotions/movie/*", // GET movie promotions
                                        "/api/promotions/point-based", // GET point-based promotions
                                        "/api/promotions/*/banner", // GET promotion banner URL (public)
                                        "/api/promotions/*/banner/exists" // GET check if banner exists (public)
                                ).permitAll()

                                // =================== PUBLIC POST ACCESS ===================
                                // Public POST operations that don't require authentication
                                .requestMatchers(HttpMethod.POST,
                                        "/api/promotions/validate", // POST - Validate promotion code (public)
                                        "/api/promotions/validate-code" // POST - Validate unique code (public)
                                ).permitAll()

                                // =================== ADMIN ENDPOINTS ===================
                                // Theo SRS: Admin có quyền cao nhất - add, edit, delete all modules
                                .requestMatchers(
                                        // Employee Management (SRS 3.1.7)
                                        "/api/admin/employees/**", // Employee CRUD
                                        "/api/employees/management/**", // Employee management

                                        // User Management
                                        "/api/admin/users/**", // User management
                                        "/api/users/admin/**", // User administration

                                        // System Analytics & Reports
                                        "/api/admin/analytics/**", // System analytics
                                        "/api/reports/**", // Business reports
                                        "/api/analytics/**", // Analytics dashboard
                                        
                                        // Auto Schedule Management (Admin only)
                                        "/api/auto-schedule/**" // Auto Schedule Controller - all operations

                                        // Concession Management (Admin CRUD) - Moved to ADMIN CONCESSION MANAGEMENT section
                                ).hasRole("ADMIN")

                                // =================== ADMIN MOVIE MANAGEMENT ===================
                                .requestMatchers(HttpMethod.POST, "/api/movies/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/movies/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/movies/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/movies/statistics").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/movies/status-update-stats").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.POST, "/api/movies/auto-update-status").hasRole("ADMIN")

                                // =================== ADMIN SCHEDULE MANAGEMENT ===================
                                .requestMatchers(HttpMethod.POST, "/api/schedules/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/schedules/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/schedules/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/schedules/statistics").hasRole("ADMIN")

                                // =================== ADMIN CINEMA ROOM MANAGEMENT ===================
                                .requestMatchers(HttpMethod.POST, "/api/cinema-rooms/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/cinema-rooms/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/cinema-rooms/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/cinema-rooms/statistics").hasRole("ADMIN")

                                // =================== ADMIN CONCESSION MANAGEMENT ===================
                                .requestMatchers(HttpMethod.POST,
                                        "/api/concessions", // POST - Create concession
                                        "/api/concessions/*/image", // POST - Upload concession image
                                        "/api/concessions/with-image" // POST - Create with image
                                ).hasRole("ADMIN")

                                .requestMatchers(HttpMethod.PUT,
                                        "/api/concessions/*", // PUT - Update concession
                                        "/api/concessions/*/image", // PUT - Update concession image
                                        "/api/concessions/*/with-image" // PUT - Update with image
                                ).hasRole("ADMIN")

                                .requestMatchers(HttpMethod.DELETE,
                                        "/api/concessions/*", // DELETE - Delete concession
                                        "/api/concessions/*/image" // DELETE - Delete concession image
                                ).hasRole("ADMIN")

                                // =================== ADMIN PROMOTION MANAGEMENT ===================
                                .requestMatchers(HttpMethod.POST,
                                        "/api/promotions", // POST - Create promotion
                                        "/api/promotions/*/activate", // POST - Activate promotion
                                        "/api/promotions/*/deactivate", // POST - Deactivate promotion
                                        "/api/promotions/*/banner" // POST - Upload promotion banner
                                ).hasRole("ADMIN")
                                
                                .requestMatchers(HttpMethod.PUT,
                                        "/api/promotions/*", // PUT - Update promotion
                                        "/api/promotions/*/banner" // PUT - Update promotion banner
                                ).hasRole("ADMIN")
                                
                                .requestMatchers(HttpMethod.DELETE,
                                        "/api/promotions/*", // DELETE - Delete promotion
                                        "/api/promotions/*/banner" // DELETE - Delete promotion banner
                                ).hasRole("ADMIN")
                                
                                .requestMatchers(HttpMethod.GET,
                                        "/api/promotions/usage/*", // GET - Promotion usage stats (Admin only)
                                        "/api/promotions/expiring" // GET - Expiring promotions (Admin only)
                                ).hasRole("ADMIN")

                                // =================== EMPLOYEE ENDPOINTS ===================
                                // Theo SRS: Employee quản lý ticket selling, booking, search members
                                .requestMatchers(
                                        // Ticket Selling Management (SRS 3.1.5)
                                        "/api/staff/ticket-selling/**", // Ticket selling
                                        "/api/employees/ticket-selling/**", // Selling
                                        // management

                                        // Ticket Booking Management (SRS 3.1.6)
                                        "/api/staff/ticket-booking/**", // Booking management
                                        "/api/employees/booking-management/**", // Booking
                                        // operations

                                        // Member Management/Search (SRS 3.1.2.3)
                                        "/api/staff/members/**", // Member search & view
                                        "/api/employees/members/**", // Member management

                                        // Check-in Operations
                                        "/api/staff/checkin/**", // Ticket validation
                                        "/api/checkin/**", // Check-in system

                                        // Payment Processing
                                        "/api/staff/payment/**", // Payment handling
                                        "/api/payment/staff/**", // Staff payment ops
                                        
                                        // Concession Stock Management
                                        "/api/concessions/*/stock" // PATCH - Update stock
                                ).hasAnyRole("EMPLOYEE", "ADMIN")

                                // =================== MEMBER ENDPOINTS ===================
                                // Theo SRS: Member có tất cả quyền Customer + booking, account
                                // management
                                .requestMatchers(
                                        // Account Management (SRS 3.1.3)
                                        "/api/members/account/**", // Account management
                                        "/api/members/profile/**", // Profile management
                                        "/api/user/profile/**", // User profile

                                        // Booking History & Management (SRS 3.1.3.1)
                                        "/api/members/booking-history/**", // Booking history
                                        "/api/members/tickets/**", // Ticket management

                                        // Score/Loyalty Management (SRS 3.1.3.2)
                                        "/api/members/loyalty/**", // Loyalty points
                                        "/api/loyalty/**", // Loyalty system

                                        // Payment for Members
                                        "/api/payment/members/**", // Member payments
                                        "/api/members/payment/**", // Payment history
                                        
                                        // Promotion for Members
                                        "/api/promotions/apply", // Apply promotion to booking
                                        "/api/promotions/user-eligible" // Get eligible promotions
                                ).hasAnyRole("MEMBER", "ADMIN")

                                // =================== GENERAL AUTHENTICATED ENDPOINTS
                                // ===================
                                // Endpoints cần authentication nhưng không phân biệt role cụ thể
                                .requestMatchers(
                                        "/api/user/**", // General user operations
                                        "/api/auth/profile/**", // Auth profile
                                        "/api/auth/change-password/**", // Password change
                                        "/api/auth/logout", // Logout endpoint
                                        
                                        // Booking Ticket (SRS 3.1.4) - Allow all authenticated users
                                        "/api/bookings", // Ticket booking for all authenticated users
                                        "/api/bookings/*", // Specific booking operations
                                        "/api/bookings/*/concessions", // Booking concessions
                                        "/api/bookings/*/concessions/*", // Concession management
                                        "/api/bookings/*/summary", // Booking summary
                                        "/api/members/bookings/**", // Member booking
                                        
                                        // Payment endpoints for authenticated users
                                        "/api/payments/create", // Create payment
                                        "/api/payments/verify/**", // Verify payment
                                        "/api/payments/status/**", // Get payment status
                                        
                                        // Promotion endpoints for authenticated users
                                        "/api/promotions/purchase", // POST - Purchase point-based promotion
                                        "/api/promotions/my-codes", // GET - Get user's promotion codes

                                        // Test endpoints for authenticated users
                                        "/api/test/test-admin", // Test admin access
                                        "/api/test/test-member", // Test member access
                                        "/api/test/test-employee" // Test employee access
                                ).authenticated()

                                // =================== DEFAULT ===================
                                // Tất cả requests khác cần authentication
                                .anyRequest().authenticated())

                        .sessionManagement(session -> session
                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                        .authenticationProvider(authenticationProvider())

                        // Add JWT filter before UsernamePasswordAuthenticationFilter
                        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                        .build();
        }

        /**
         * CORS Configuration for Frontend integration
         */
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // Allow frontend origins
                configuration.setAllowedOriginPatterns(Arrays.asList(
                        "http://localhost:3000", // NextJS development
                        // "http://localhost:3001", // Alternative port
                        // "https://movie-theater-frontend.vercel.app", // Production frontend
                        // "https://*.vercel.app", // Vercel deployments
                        "http://localhost:8080" // Backend for testing
                ));

                // Allow necessary HTTP methods
                configuration.setAllowedMethods(Arrays.asList(
                        "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

                // Allow necessary headers
                configuration.setAllowedHeaders(Arrays.asList(
                        "Authorization",
                        "Content-Type",
                        "X-Requested-With",
                        "Accept",
                        "Origin",
                        "Access-Control-Request-Method",
                        "Access-Control-Request-Headers"));

                // Allow credentials (cookies, authorization headers)
                configuration.setAllowCredentials(true);

                // Expose Authorization header để frontend đọc token
                configuration.setExposedHeaders(List.of("Authorization"));

                // Apply to all paths
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);

                return source;
        }

        /**
         * Password Encoder Bean
         */
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder(12); // Strength 12 for better security
        }

        /**
         * Authentication Provider Bean
         */
        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
                authProvider.setUserDetailsService(userDetailsService);
                authProvider.setPasswordEncoder(passwordEncoder());
                return authProvider;
        }

        /**
         * Authentication Manager Bean
         */
        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }
}
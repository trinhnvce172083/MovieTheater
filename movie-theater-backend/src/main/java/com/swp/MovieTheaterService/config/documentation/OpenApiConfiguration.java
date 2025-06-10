package com.swp.MovieTheaterService.config.documentation;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.examples.Example;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI Configuration v2.1.0 (SRS Compliant - Optimized)
 * Role-based API documentation theo Software Requirements Specification
 * 
 * @author Dũng_Solo
 * @version 2.1.0 (SRS Compliant - Optimized)
 */
@Configuration
public class OpenApiConfiguration {

    @Value("${server.servlet.context-path:/cinema}")
    private String contextPath;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("🎬 Movie Theater Management API v2.1.0 (SRS Compliant)")
                        .description("""
                                API documentation for Movie Theater Management System
                                
                                📋 **Role-Based Access Control theo SRS:**
                                
                                🔴 **ADMIN**: Quyền cao nhất - CRUD tất cả modules
                                - Employee Management (SRS 3.1.7)
                                - Movie Management (SRS 3.1.9) 
                                - Cinema Room Management (SRS 3.1.8)
                                - Promotion Management (SRS 3.1.10)
                                - System Analytics & Reports
                                
                                🟡 **EMPLOYEE**: Quản lý bán vé, đặt vé, tìm kiếm thành viên
                                - Ticket Selling Management (SRS 3.1.5)
                                - Ticket Booking Management (SRS 3.1.6)
                                - Member Search & Management (SRS 3.1.2.3)
                                
                                🟢 **MEMBER**: Customer + đặt vé, quản lý tài khoản
                                - Booking Ticket (SRS 3.1.4)
                                - Account Management (SRS 3.1.3)
                                - Booked Ticket Management (SRS 3.1.3.1)
                                - Score History (SRS 3.1.3.2)
                                
                                🔵 **PUBLIC**: Xem phim, khuyến mãi, giá vé (không cần auth)
                                - View movie list, promotions, ticket prices
                                - Register account, login (SRS 3.1.1, 3.1.2)
                                
                                🔧 **Tech Stack:** Spring Boot 3.4.2, JWT 0.12.6, MySQL, OpenAPI 2.7.0
                                """)
                        .version("2.1.0")
                        .contact(new Contact()
                                .name("Movie Theater Development Team")
                                .email("dev@movietheater.com")
                                .url("https://github.com/movie-theater/backend"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080" + contextPath)
                                .description("🔧 Local Development Server"),
                        new Server()
                                .url("https://api.movietheater.com" + contextPath)
                                .description("🚀 Production Server")
                ))
                .components(createComponents())
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }

    // =================== 1. PUBLIC APIS (No Authentication Required) ===================
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("01-public-apis")
                .displayName("🔵 Public APIs (SRS 3.1.1, 3.1.2)")
                .pathsToMatch(
                        "/api/auth/login",
                        "/api/auth/register", 
                        "/api/auth/forgot-password",
                        "/api/auth/reset-password",
                        "/api/movies/public/**", 
                        "/api/schedules/public/**",
                        "/api/cinema-rooms/public/**",
                        "/api/promotions/public/**",
                        "/api/movies/search/**"
                )
                .build();
    }

    // =================== 2. MEMBER APIS (Customer Features) ===================
    @Bean
    public GroupedOpenApi memberApi() {
        return GroupedOpenApi.builder()
                .group("02-member-apis")
                .displayName("🟢 Member APIs (SRS 3.1.3, 3.1.4)")
                .pathsToMatch(
                        "/api/bookings/**",
                        "/api/members/**",
                        "/api/user/profile/**",
                        "/api/loyalty/**",
                        "/api/payment/members/**",
                        "/api/auth/change-password",
                        "/api/auth/logout"
                )
                .build();
    }

    // =================== 3. EMPLOYEE APIS (Staff Operations) ===================
    @Bean
    public GroupedOpenApi employeeApi() {
        return GroupedOpenApi.builder()
                .group("03-employee-apis")
                .displayName("🟡 Employee APIs (SRS 3.1.5, 3.1.6)")
                .pathsToMatch(
                        "/api/staff/**",
                        "/api/employees/**",
                        "/api/checkin/**",
                        "/api/payment/staff/**",
                        "/api/tickets/sell/**",
                        "/api/bookings/staff/**"
                )
                .build();
    }

    // =================== 4. ADMIN APIS (Management & Analytics) ===================
    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("04-admin-apis")
                .displayName("🔴 Admin APIs (SRS 3.1.7, 3.1.8, 3.1.9, 3.1.10)")
                .pathsToMatch(
                        "/api/admin/**",
                        "/api/movies/admin/**",
                        "/api/schedules/admin/**",
                        "/api/cinema-rooms/admin/**",
                        "/api/promotions/admin/**",
                        "/api/reports/**",
                        "/api/analytics/**",
                        "/api/employees/admin/**",
                        "/api/users/admin/**"
                )
                .build();
    }

    // =================== 5. DEVELOPER VIEW (All APIs for Testing) ===================
    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("99-developer-view")
                .displayName("📚 All APIs (Developer View)")
                .pathsToMatch("/**")
                .packagesToScan("com.swp.MovieTheaterService.controller")
                .build();
    }

    /**
     * Create OpenAPI Components with examples
     */
    private Components createComponents() {
        return new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""))
                .addExamples("RegisterRequest", new Example()
                        .summary("Đăng ký tài khoản mới")
                        .description("Ví dụ về yêu cầu đăng ký tài khoản mới với đầy đủ thông tin bao gồm username")
                        .value("""
                        {
                          "username": "lumieretest2025",
                          "fullName": "Nguyễn Văn Nam",
                          "email": "nguyenvannam@example.com",
                          "password": "SecurePassword123!",
                          "confirmPassword": "SecurePassword123!",
                          "phoneNumber": "0901234567",
                          "dateOfBirth": "1995-05-15",
                          "address": "123 Đường Lê Lợi, Quận 1, TP.HCM",
                          "agreeToTerms": true,
                          "acceptMarketing": false
                        }
                        """))
                .addExamples("LoginRequest", new Example()
                        .summary("Đăng nhập hệ thống")
                        .description("Thông tin đăng nhập với email và mật khẩu")
                        .value("""
                        {
                          "email": "nguyenvannam@example.com",
                          "password": "SecurePassword123!"
                        }
                        """))
                .addExamples("BookingCreateRequest", new Example()
                        .summary("Tạo booking mới")
                        .description("Đặt vé xem phim cho khách hàng")
                        .value("""
                        {
                          "scheduleId": 1,
                          "seatIds": [15, 16],
                          "customerName": "Trần Thị Mai",
                          "customerEmail": "tranthimai@example.com",
                          "customerPhone": "0987654321",
                          "promotionId": null,
                          "notes": "Đặt vé cho 2 người, ghế đôi"
                        }
                        """))
                .addExamples("MovieCreateRequest", new Example()
                        .summary("Thêm phim mới")
                        .description("Thông tin phim mới cần thêm vào hệ thống")
                        .value("""
                        {
                          "title": "Spider-Man: No Way Home",
                          "originalTitle": "Spider-Man: No Way Home",
                          "description": "Peter Parker's secret identity is revealed to the entire world...",
                          "duration": 148,
                          "releaseDate": "2021-12-15",
                          "endDate": "2022-03-15",
                          "language": "English",
                          "subtitle": "Vietnamese",
                          "country": "United States",
                          "director": "Jon Watts",
                          "cast": "Tom Holland, Zendaya, Benedict Cumberbatch",
                          "genres": "Action, Adventure, Sci-Fi",
                          "rating": "T13",
                          "trailerUrl": "https://youtube.com/watch?v=JfVOs4VSpmA",
                          "posterUrl": "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
                          "bannerUrl": "https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
                          "status": "NOW_SHOWING",
                          "ticketPrice": 120000.0
                        }
                        """))
                .addExamples("SuccessResponse", new Example()
                        .summary("Phản hồi thành công")
                        .description("Cấu trúc phản hồi khi thao tác thành công")
                        .value("""
                        {
                          "success": true,
                          "message": "Thao tác thành công",
                          "data": {
                            "id": 123,
                            "createdAt": "2025-06-06T12:00:00"
                          }
                        }
                        """))
                .addExamples("ErrorResponse", new Example()
                        .summary("Phản hồi lỗi")
                        .description("Cấu trúc phản hồi khi có lỗi")
                        .value("""
                        {
                          "success": false,
                          "message": "Dữ liệu không hợp lệ",
                          "errorCode": "VALIDATION_ERROR",
                          "errors": [
                            {
                              "field": "email",
                              "message": "Email không đúng định dạng"
                            },
                            {
                              "field": "password",
                              "message": "Mật khẩu phải có ít nhất 8 ký tự"
                            }
                          ],
                          "timestamp": "2025-06-06T12:00:00"
                        }
                        """));
    }
} 
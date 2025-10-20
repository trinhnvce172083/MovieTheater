package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Test Echo Controller
 * Simple controller for testing API echo functions
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/test")
@Tag(name = "test-controller", description = "Test APIs for echo and info")
public class TestEchoController {

    @PostMapping("/echo")
    @Operation(summary = "Echo endpoint", description = "Returns whatever is sent to it")
    public ResponseEntity<ApiResponse<Map<String, Object>>> echo(@RequestBody Map<String, Object> request) {
        log.debug("Echo endpoint accessed with data: {}", request);
        return ResponseEntity.ok(ApiResponse.success(request));
    }

    @GetMapping("/info")
    @Operation(summary = "Info endpoint", description = "Returns system information")
    public ResponseEntity<ApiResponse<Map<String, Object>>> info() {
        Map<String, Object> info = Map.of(
                "name", "Movie Theater API",
                "version", "1.0.0",
                "status", "running",
                "environment", "development"
        );
        return ResponseEntity.ok(ApiResponse.success(info));
    }

    @GetMapping("/hello")
    @Operation(summary = "Hello endpoint", description = "Returns a simple hello message")
    public ResponseEntity<ApiResponse<String>> hello() {
        return ResponseEntity.ok(ApiResponse.success("Hello from Movie Theater API!"));
    }

    @GetMapping("/health")
    @Operation(summary = "Health endpoint", description = "Returns the health status of the API")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("API is healthy"));
    }

    @GetMapping("/auth-test")
    @Operation(summary = "Auth test endpoint", description = "Test endpoint for authentication")
    public ResponseEntity<ApiResponse<String>> authTest() {
        return ResponseEntity.ok(ApiResponse.success("Authentication test endpoint"));
    }

    @GetMapping("/test-auth")
    @Operation(summary = "Test authentication", description = "Test if authentication is working")
    public ResponseEntity<Map<String, Object>> testAuth() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Authentication test successful");
        response.put("timestamp", LocalDateTime.now());
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test-admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Test admin access", description = "Test admin role access")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> testAdmin() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Admin access test successful");
        response.put("timestamp", LocalDateTime.now());
        response.put("role", "ADMIN");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test-member")
    @PreAuthorize("hasRole('MEMBER')")
    @Operation(summary = "Test member access", description = "Test member role access")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> testMember() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Member access test successful");
        response.put("timestamp", LocalDateTime.now());
        response.put("role", "MEMBER");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test-employee")
    @PreAuthorize("hasRole('EMPLOYEE')")
    @Operation(summary = "Test employee access", description = "Test employee role access")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> testEmployee() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Employee access test successful");
        response.put("timestamp", LocalDateTime.now());
        response.put("role", "EMPLOYEE");
        return ResponseEntity.ok(response);
    }
} 

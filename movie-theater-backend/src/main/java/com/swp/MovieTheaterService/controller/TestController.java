package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Test Controller
 * Simple controller for testing API without authentication
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/test")
@Tag(name = "Test", description = "Test APIs for authentication")
public class TestController {

    @GetMapping("/public")
    @Operation(summary = "Public endpoint", description = "Test public endpoint")
    public ResponseEntity<ApiResponse<String>> publicEndpoint() {
        log.debug("Public endpoint accessed");
        return ResponseEntity.ok(ApiResponse.success("Public endpoint accessed successfully"));
    }

    @GetMapping("/protected")
    @Operation(summary = "Protected endpoint", description = "Test protected endpoint")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<String>> protectedEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        log.debug("Protected endpoint accessed by: {}", username);
        return ResponseEntity.ok(ApiResponse.success("Protected endpoint works! User: " + username));
    }

    @GetMapping("/admin")
    @Operation(summary = "Admin endpoint", description = "Test admin endpoint")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> adminEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        log.debug("Admin endpoint accessed by: {}", username);
        return ResponseEntity.ok(ApiResponse.success("Admin endpoint works! User: " + username));
    }

    @GetMapping("/customer")
    @Operation(summary = "Customer endpoint", description = "Test customer endpoint")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> customerEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        log.debug("Customer endpoint accessed by: {}", username);
        return ResponseEntity.ok(ApiResponse.success("Customer endpoint works! User: " + username));
    }
} 
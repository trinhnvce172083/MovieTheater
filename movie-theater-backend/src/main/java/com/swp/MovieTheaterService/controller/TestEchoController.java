package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Test Echo Controller
 * Simple controller for testing API echo functions
 * 
 * @author Dũng_Solo
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
} 
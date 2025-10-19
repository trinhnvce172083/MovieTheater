package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.loyalty.*;
import com.swp.MovieTheaterService.dto.response.ApiResponse;
import com.swp.MovieTheaterService.service.LoyaltyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Loyalty Controller
 * REST API endpoints for loyalty program management
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Loyalty Program", description = "APIs for managing customer loyalty program")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    @GetMapping("/user/{userId}/points")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user loyalty points", description = "Get loyalty points for a specific user (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<LoyaltyPointsResponse>> getUserLoyaltyPoints(@PathVariable Long userId) {
        log.info("Fetching loyalty points for user ID: {}", userId);
        
        LoyaltyPointsResponse response = new LoyaltyPointsResponse();
        int availablePoints = loyaltyService.getAvailablePoints(userId);
        response.setCurrentPoints(availablePoints);

        ApiResponse<LoyaltyPointsResponse> apiResponse = ApiResponse.<LoyaltyPointsResponse>builder()
                .success(true)
                .message("Lấy thông tin điểm tích lũy thành công")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }


} 

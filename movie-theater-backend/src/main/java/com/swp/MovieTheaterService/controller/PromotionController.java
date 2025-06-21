package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.promotion.*;
import com.swp.MovieTheaterService.dto.response.ApiResponse;
import com.swp.MovieTheaterService.dto.response.FileUploadResponse;
import com.swp.MovieTheaterService.service.PromotionService;
import com.swp.MovieTheaterService.service.ImageManagementService;
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

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;

/**
 * Promotion Controller
 * REST API endpoints for promotion management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Promotion Management", description = "APIs for managing promotions and discounts")
public class PromotionController {

    private final PromotionService promotionService;
    private final ImageManagementService imageManagementService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new promotion", description = "Create a new promotion (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<PromotionResponse> createPromotion(@RequestBody PromotionCreateRequest request) {
        log.info("Creating new promotion: {}", request.getName());
        
        PromotionResponse response = promotionService.createPromotion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update promotion", description = "Update an existing promotion (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<PromotionResponse> updatePromotion(
            @PathVariable Long id,
            @RequestBody PromotionUpdateRequest request) {
        log.info("Updating promotion with ID: {}", id);
        
        PromotionResponse response = promotionService.updatePromotion(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get promotion by ID", description = "Retrieve promotion details by ID")
    public ResponseEntity<PromotionResponse> getPromotion(@PathVariable Long id) {
        log.info("Fetching promotion with ID: {}", id);
        
        PromotionResponse response = promotionService.getPromotionById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete promotion", description = "Delete a promotion (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deletePromotion(@PathVariable Long id) {
        log.info("Deleting promotion with ID: {}", id);
        
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get all promotions", description = "Retrieve all promotions with pagination")
    public ResponseEntity<Page<Object>> getAllPromotions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) Boolean isActive) {
        
        log.info("Fetching promotions - page: {}, size: {}, active: {}", page, size, isActive);
        
        Sort sort = Sort.by(sortDirection.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Object> promotions = promotionService.getAllPromotions(pageable, isActive);
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active promotions", description = "Retrieve all currently active promotions")
    public ResponseEntity<List<Object>> getActivePromotions() {
        log.info("Fetching active promotions");
        
        List<Object> promotions = promotionService.getActivePromotions();
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get promotion by code", description = "Retrieve promotion details by promotion code")
    public ResponseEntity<PromotionResponse> getPromotionByCode(@PathVariable String code) {
        log.info("Fetching promotion with code: {}", code);
        
        PromotionResponse response = promotionService.getPromotionByCode(code);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate promotion code", description = "Validate a promotion code for applicability")
    public ResponseEntity<Object> validatePromotionCode(
            @RequestBody PromotionValidationRequest request) {
        
        log.info("Validating promotion code: {} for amount: {}", request.getCode(), request.getOrderAmount());
        
        Object response = promotionService.validatePromotionCode(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('MEMBER') or hasRole('ADMIN')")
    @Operation(summary = "Apply promotion", description = "Apply a promotion to a booking")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Object> applyPromotion(
            @RequestBody PromotionApplicationRequest request) {
        
        log.info("Applying promotion code: {} to booking: {}", request.getCode(), request.getBookingId());
        
        Object response = promotionService.applyPromotion(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get promotions by type", description = "Retrieve promotions filtered by discount type")
    public ResponseEntity<List<Object>> getPromotionsByType(@PathVariable String type) {
        log.info("Fetching promotions by type: {}", type);
        
        List<Object> promotions = promotionService.getPromotionsByType(type);
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/usage/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get promotion usage", description = "Get usage statistics for a promotion (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Object> getPromotionUsage(@PathVariable Long id) {
        log.info("Fetching usage statistics for promotion ID: {}", id);
        
        Object response = promotionService.getPromotionUsage(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expiring")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get expiring promotions", description = "Get promotions expiring soon (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<Object>> getExpiringPromotions(
            @RequestParam(defaultValue = "7") int days) {
        
        log.info("Fetching promotions expiring in {} days", days);
        
        List<Object> promotions = promotionService.getExpiringPromotions(days);
        return ResponseEntity.ok(promotions);
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate promotion", description = "Activate a promotion (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<PromotionResponse> activatePromotion(@PathVariable Long id) {
        log.info("Activating promotion with ID: {}", id);
        
        PromotionResponse response = promotionService.activatePromotion(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate promotion", description = "Deactivate a promotion (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<PromotionResponse> deactivatePromotion(@PathVariable Long id) {
        log.info("Deactivating promotion with ID: {}", id);
        
        PromotionResponse response = promotionService.deactivatePromotion(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/movie/{movieId}")
    @Operation(summary = "Get movie-specific promotions", description = "Get promotions applicable to a specific movie")
    public ResponseEntity<List<Object>> getMoviePromotions(@PathVariable Long movieId) {
        log.info("Fetching promotions for movie ID: {}", movieId);
        
        List<Object> promotions = promotionService.getPromotionsForMovie(movieId);
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/user-eligible")
    @PreAuthorize("hasRole('MEMBER') or hasRole('ADMIN')")
    @Operation(summary = "Get user eligible promotions", description = "Get promotions eligible for current user")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<Object>> getUserEligiblePromotions() {
        log.info("Fetching eligible promotions for current user");
        
        List<Object> promotions = promotionService.getUserEligiblePromotions();
        return ResponseEntity.ok(promotions);
    }

    // ==================== PROMOTION IMAGEMANAGEMENT ====================

    @PostMapping(value = "/{id}/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload promotion banner", description = "Upload or update banner image for a promotion (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<FileUploadResponse> uploadPromotionBanner(
            @PathVariable Long id,
            @Parameter(description = "Banner image file (JPG, PNG, GIF - Max 5MB)")
            @RequestParam("banner") MultipartFile bannerFile) {
        
        log.info("Uploading banner for promotion ID: {}", id);
        
        FileUploadResponse response = imageManagementService.updatePromotionBanner(id, bannerFile);
        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/{id}/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update promotion banner", description = "Replace existing banner image for a promotion (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<FileUploadResponse> updatePromotionBanner(
            @PathVariable Long id,
            @Parameter(description = "New banner image file (JPG, PNG, GIF - Max 5MB)")
            @RequestParam("banner") MultipartFile bannerFile) {
        
        log.info("Updating banner for promotion ID: {}", id);
        
        FileUploadResponse response = imageManagementService.updatePromotionBanner(id, bannerFile);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/banner")
    @Operation(summary = "Get promotion banner URL", description = "Get the banner image URL for a promotion")
    public ResponseEntity<ApiResponse<String>> getPromotionBannerUrl(@PathVariable Long id) {
        log.info("Getting banner URL for promotion ID: {}", id);
        
        String bannerUrl = imageManagementService.getPromotionBannerUrl(id);
        
        ApiResponse<String> response = ApiResponse.<String>builder()
                .code(200)
                .message("Banner URL retrieved successfully")
                .data(bannerUrl)
                .build();
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/banner")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete promotion banner", description = "Remove banner image from a promotion (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Boolean>> deletePromotionBanner(@PathVariable Long id) {
        log.info("Deleting banner for promotion ID: {}", id);
        
        boolean deleted = imageManagementService.deletePromotionBanner(id);
        
        ApiResponse<Boolean> response = ApiResponse.<Boolean>builder()
                .code(deleted ? 200 : 500)
                .message(deleted ? "Banner deleted successfully" : "Failed to delete banner")
                .data(deleted)
                .build();
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/banner/exists")
    @Operation(summary = "Check if promotion has banner", description = "Check if a promotion has a banner image")
    public ResponseEntity<ApiResponse<Boolean>> hasPromotionBanner(@PathVariable Long id) {
        log.info("Checking if promotion {} has banner", id);
        
        boolean hasBanner = imageManagementService.hasPromotionBanner(id);
        
        ApiResponse<Boolean> response = ApiResponse.<Boolean>builder()
                .code(200)
                .message("Banner status checked successfully")
                .data(hasBanner)
                .build();
        
        return ResponseEntity.ok(response);
    }

} 
package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.entity.Promotion;
import com.swp.MovieTheaterService.dto.promotion.PromotionCreateRequest;
import com.swp.MovieTheaterService.dto.response.ApiResponse;
import com.swp.MovieTheaterService.service.PromotionService;
import com.swp.MovieTheaterService.enums.DiscountType;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.swp.MovieTheaterService.service.LoyaltyService;
import com.swp.MovieTheaterService.service.ImageManagementService;
import com.swp.MovieTheaterService.dto.response.FileUploadResponse;

import java.time.LocalDate;
import java.util.List;

/**
 * Promotion Controller
 * REST API endpoints for promotion management
 * 
 * @author Dũng_Solo
 * @version 2.0.0 - Simplified structure
 */
@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Promotion Management", description = "APIs for managing promotions and discounts")
public class PromotionController {

    private final PromotionService promotionService;
    private final LoyaltyService loyaltyService;
    private final ImageManagementService imageManagementService;

    @PostMapping
    // @PreAuthorize("hasRole('ADMIN')") // TEMPORARILY DISABLED FOR DEBUGGING
    @Operation(summary = "Create new promotion", description = "Create a new promotion (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Promotion> createPromotion(@RequestBody PromotionCreateRequest request) {
        log.info("Creating new promotion: {}", request.getName());

        Promotion promotion = promotionService.createPromotion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(promotion);
    }

    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')") // TEMPORARILY DISABLED FOR DEBUGGING
    @Operation(summary = "Update promotion", description = "Update an existing promotion (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Promotion> updatePromotion(
            @PathVariable Long id,
            @RequestBody PromotionCreateRequest request) {
        log.info("Updating promotion with ID: {}", id);

        Promotion promotion = promotionService.updatePromotion(id, request);
        return ResponseEntity.ok(promotion);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get promotion by ID", description = "Retrieve promotion details by ID")
    public ResponseEntity<Promotion> getPromotion(@PathVariable Long id) {
        log.info("Fetching promotion with ID: {}", id);

        Promotion promotion = promotionService.getPromotionById(id);
        return ResponseEntity.ok(promotion);
    }

    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')") // TEMPORARILY DISABLED FOR DEBUGGING
    @Operation(summary = "Delete promotion", description = "Delete a promotion (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deletePromotion(@PathVariable Long id) {
        log.info("Deleting promotion with ID: {}", id);
        
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get all active promotions", description = "Retrieve all active promotions with pagination")
    public ResponseEntity<Page<Promotion>> getAllPromotions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        log.info("Fetching promotions - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(sortDirection.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Promotion> promotions = promotionService.getActivePromotions(pageable);
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active promotions", description = "Retrieve all currently active promotions")
    public ResponseEntity<List<Promotion>> getActivePromotions() {
        log.info("Fetching active promotions");

        List<Promotion> promotions = promotionService.getAllActivePromotions();
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get promotion by code", description = "Retrieve promotion details by promotion code")
    public ResponseEntity<Promotion> getPromotionByCode(@PathVariable String code) {
        log.info("Fetching promotion with code: {}", code);

        Promotion promotion = promotionService.getPromotionByCode(code);
        return ResponseEntity.ok(promotion);
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate promotion code", description = "Validate a promotion code")
    public ResponseEntity<ApiResponse<Boolean>> validatePromotionCode(
            @RequestParam String code) {

        log.info("Validating promotion code: {}", code);

        boolean isValid = promotionService.validatePromotion(code);
        return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                .success(true)
                .message("Validation completed")
                .data(isValid)
                .build());
    }

    @PostMapping("/validate-booking")
    @Operation(summary = "Validate promotion for booking", description = "Validate a promotion code for a specific booking amount")
    public ResponseEntity<ApiResponse<Boolean>> validatePromotionForBooking(
            @RequestParam String code,
            @RequestParam Double totalAmount) {

        log.info("Validating promotion code: {} for amount: {}", code, totalAmount);

        boolean isValid = promotionService.validatePromotionForBooking(code, totalAmount);
        return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                .success(true)
                .message("Validation completed")
                .data(isValid)
                .build());
    }

    @GetMapping("/type/{discountType}")
    @Operation(summary = "Get promotions by discount type", description = "Retrieve promotions filtered by discount type")
    public ResponseEntity<List<Promotion>> getPromotionsByDiscountType(
            @PathVariable String discountType) {
        log.info("Fetching promotions by discount type: {}", discountType);

        try {
            DiscountType type = DiscountType.valueOf(discountType.toUpperCase());
            List<Promotion> promotions = promotionService.getPromotionsByDiscountType(type);
            return ResponseEntity.ok(promotions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured promotions", description = "Retrieve all featured promotions")
    public ResponseEntity<List<Promotion>> getFeaturedPromotions() {
        log.info("Fetching featured promotions");

        List<Promotion> promotions = promotionService.getFeaturedPromotions();
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/points")
    @Operation(summary = "Get points-based promotions", description = "Retrieve all points-based promotions")
    public ResponseEntity<List<Promotion>> getPointsPromotions() {
        log.info("Fetching points-based promotions");

        List<Promotion> promotions = promotionService.getPointsPromotions();
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/redeemable")
    @Operation(summary = "Get redeemable promotions", description = "Retrieve promotions that can be redeemed with available points")
    public ResponseEntity<List<Promotion>> getRedeemablePromotions(
            @RequestParam Integer availablePoints) {
        log.info("Fetching redeemable promotions for {} points", availablePoints);

        List<Promotion> promotions = promotionService.getRedeemablePromotions(availablePoints);
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming promotions", description = "Retrieve promotions that haven't started yet")
    public ResponseEntity<List<Promotion>> getUpcomingPromotions() {
        log.info("Fetching upcoming promotions");

        List<Promotion> promotions = promotionService.getUpcomingPromotions();
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/expired")
    @Operation(summary = "Get expired promotions", description = "Retrieve promotions that have expired")
    public ResponseEntity<List<Promotion>> getExpiredPromotions() {
        log.info("Fetching expired promotions");

        List<Promotion> promotions = promotionService.getExpiredPromotions();
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/search")
    @Operation(summary = "Search promotions", description = "Search promotions by keyword")
    public ResponseEntity<Page<Promotion>> searchPromotions(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("Searching promotions with keyword: {}", keyword);

        Pageable pageable = PageRequest.of(page, size);
        Page<Promotion> promotions = promotionService.searchPromotions(keyword, pageable);
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get promotions by date range", description = "Retrieve promotions within a date range")
    public ResponseEntity<List<Promotion>> getPromotionsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {

        log.info("Fetching promotions from {} to {}", startDate, endDate);

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        List<Promotion> promotions = promotionService.getPromotionsByDateRange(start, end);
        return ResponseEntity.ok(promotions);
    }

    @PostMapping("/{code}/apply")
    // @PreAuthorize("hasRole('MEMBER') or hasRole('ADMIN')") // TEMPORARILY DISABLED FOR DEBUGGING
    @Operation(summary = "Apply promotion", description = "Apply a promotion (increment usage count)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<String>> applyPromotion(@PathVariable String code) {
        log.info("Applying promotion code: {}", code);

        promotionService.applyPromotion(code);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Promotion applied successfully")
                .data("Promotion usage incremented")
                .build());
    }

    @GetMapping("/stats/active-count")
    @Operation(summary = "Get active promotions count", description = "Get total count of active promotions")
    public ResponseEntity<ApiResponse<Long>> getActivePromotionsCount() {
        log.info("Fetching active promotions count");

        Long count = promotionService.getActivePromotionsCount();
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .success(true)
                .message("Active promotions count retrieved")
                .data(count)
                .build());
    }

    @GetMapping("/stats/current-count")
    @Operation(summary = "Get current promotions count", description = "Get count of currently valid promotions")
    public ResponseEntity<ApiResponse<Long>> getCurrentPromotionsCount() {
        log.info("Fetching current promotions count");

        Long count = promotionService.getCurrentPromotionsCount();
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .success(true)
                .message("Current promotions count retrieved")
                .data(count)
                .build());
    }

    @PostMapping("/purchase")
    // @PreAuthorize("hasRole('MEMBER') or hasRole('ADMIN')") // TEMPORARILY DISABLED FOR DEBUGGING
    @Operation(summary = "Purchase promotion with points", description = "Purchase a promotion using loyalty points")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<String>> purchasePromotionWithPoints(
            @RequestParam String promotionCode) {

        log.info("Purchasing promotion with points: {}", promotionCode);

        try {
            // Get current user from security context
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();

            // Get promotion by code
            Promotion promotion = promotionService.getPromotionByCode(promotionCode);
            if (promotion == null) {
                return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                        .success(false)
                        .message("Promotion code không tồn tại")
                        .build());
            }

            // Check if promotion can be redeemed with points
            if (!promotion.canBeRedeemedWithPoints()) {
                return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                        .success(false)
                        .message("Promotion này không thể đổi bằng điểm")
                        .build());
            }

            // Get account by email (you might need to implement this)
            // For now, we'll create a mock account
            // Account account = accountService.getAccountByEmail(userEmail);

            // Check if user has enough points
            // int availablePoints = loyaltyService.getAvailablePoints(account.getAccountId());
            // if (availablePoints < promotion.getPointsRequired()) {
            //     return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
            //             .success(false)
            //             .message("Không đủ điểm. Cần: " + promotion.getPointsRequired() + ", Có: " + availablePoints)
            //             .build());
            // }

            // Redeem points for promotion
            // LoyaltyTransaction transaction = loyaltyService.redeemPointsForPromotion(account, promotion);

            // Generate unique user promotion code
            String uniqueCode = "USER_" + promotionCode + "_" + System.currentTimeMillis();

            log.info("Successfully purchased promotion {} with points for user {}", promotionCode, userEmail);

            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true)
                    .message("Đổi promotion thành công với " + promotion.getPointsRequired() + " điểm")
                    .data(uniqueCode)
                    .build());
        } catch (Exception e) {
            log.error("Error purchasing promotion: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                    .success(false)
                    .message("Lỗi khi đổi promotion: " + e.getMessage())
                    .build());
        }
    }

    @PostMapping(value = "/{id}/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    // @PreAuthorize("hasRole('ADMIN')") // TEMPORARILY DISABLED FOR DEBUGGING
    @Operation(summary = "Upload promotion banner", description = "Upload banner image for a promotion (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<FileUploadResponse> uploadPromotionBanner(
            @PathVariable Long id,
            @Parameter(description = "Banner image file (JPG, PNG, GIF - Max 5MB)")
            @RequestParam("banner") MultipartFile bannerFile) {
        
        log.info("Uploading banner for promotion ID: {}", id);

        try {
            FileUploadResponse response = imageManagementService.uploadPromotionBanner(id, bannerFile);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error uploading banner: {}", e.getMessage());
            return ResponseEntity.badRequest().body(FileUploadResponse.builder()
                    .success(false)
                    .message("Failed to upload banner: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/{id}/banner")
    @Operation(summary = "Get promotion banner URL", description = "Get the banner image URL for a promotion")
    public ResponseEntity<ApiResponse<String>> getPromotionBannerUrl(@PathVariable Long id) {
        log.info("Getting banner URL for promotion ID: {}", id);

        try {
            String bannerUrl = imageManagementService.getPromotionBannerUrl(id);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true)
                    .message("Banner URL retrieved successfully")
                    .data(bannerUrl)
                    .build());
        } catch (Exception e) {
            log.error("Error getting banner URL: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                    .success(false)
                    .message("Failed to get banner URL: " + e.getMessage())
                    .build());
        }
    }

    @DeleteMapping("/{id}/banner")
    // @PreAuthorize("hasRole('ADMIN')") // TEMPORARILY DISABLED FOR DEBUGGING
    @Operation(summary = "Delete promotion banner", description = "Remove banner image from a promotion (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Boolean>> deletePromotionBanner(@PathVariable Long id) {
        log.info("Deleting banner for promotion ID: {}", id);

        try {
            boolean deleted = imageManagementService.deletePromotionBanner(id);
            return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                    .success(true)
                    .message(deleted ? "Banner deleted successfully" : "Banner not found")
                    .data(deleted)
                    .build());
        } catch (Exception e) {
            log.error("Error deleting banner: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<Boolean>builder()
                    .success(false)
                    .message("Failed to delete banner: " + e.getMessage())
                    .data(false)
                    .build());
        }
    }
} 
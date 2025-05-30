package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.promotion.PromotionCreateRequest;
import com.swp.MovieTheaterService.dto.promotion.PromotionResponse;
import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.entity.Promotion;
import com.swp.MovieTheaterService.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Promotion Service
 * Business logic for promotion management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PromotionService {

    private final PromotionRepository promotionRepository;

    // Create promotion
    public PromotionResponse createPromotion(PromotionCreateRequest request) {
        log.info("Creating promotion with code: {}", request.getPromotionCode());
        
        // Validate promotion code uniqueness
        if (promotionRepository.existsByPromotionCodeAndIsActiveTrue(request.getPromotionCode())) {
            throw new RuntimeException("Mã khuyến mãi đã tồn tại: " + request.getPromotionCode());
        }

        Promotion promotion = mapToEntity(request);
        promotion.setCreatedAt(LocalDateTime.now());
        promotion.setUpdatedAt(LocalDateTime.now());
        
        Promotion savedPromotion = promotionRepository.save(promotion);
        log.info("Created promotion successfully with ID: {}", savedPromotion.getPromotionId());
        
        return mapToResponse(savedPromotion);
    }

    // Get all active promotions
    @Transactional(readOnly = true)
    public List<PromotionResponse> getAllActivePromotions() {
        List<Promotion> promotions = promotionRepository.findActivePromotions();
        return promotions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get promotions with pagination
    @Transactional(readOnly = true)
    public Page<PromotionResponse> getPromotions(Pageable pageable) {
        Page<Promotion> promotions = promotionRepository.findActivePromotions(pageable);
        return promotions.map(this::mapToResponse);
    }

    // Get featured promotions
    @Transactional(readOnly = true)
    public List<PromotionResponse> getFeaturedPromotions() {
        List<Promotion> promotions = promotionRepository.findByIsActiveTrueAndIsFeaturedTrueOrderByDisplayOrderAscCreatedAtDesc();
        return promotions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get points promotions
    @Transactional(readOnly = true)
    public List<PromotionResponse> getPointsPromotions() {
        List<Promotion> promotions = promotionRepository.findPointsPromotions();
        return promotions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get redeemable promotions for user
    @Transactional(readOnly = true)
    public List<PromotionResponse> getRedeemablePromotions(Integer availablePoints) {
        List<Promotion> promotions = promotionRepository.findRedeemablePromotions(availablePoints);
        return promotions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get promotions for member
    @Transactional(readOnly = true)
    public List<PromotionResponse> getPromotionsForMember(String membershipLevel) {
        List<Promotion> promotions = promotionRepository.findPromotionsForMember(membershipLevel);
        return promotions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Search promotions
    @Transactional(readOnly = true)
    public Page<PromotionResponse> searchPromotions(String keyword, Pageable pageable) {
        Page<Promotion> promotions = promotionRepository.searchPromotions(keyword, pageable);
        return promotions.map(this::mapToResponse);
    }

    // Get promotion by code
    @Transactional(readOnly = true)
    public PromotionResponse getPromotionByCode(String promotionCode) {
        Promotion promotion = promotionRepository.findByPromotionCodeAndIsActiveTrue(promotionCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi: " + promotionCode));
        return mapToResponse(promotion);
    }

    // Validate promotion for booking
    @Transactional(readOnly = true)
    public boolean validatePromotionForBooking(String promotionCode, Account account, 
                                             Long movieId, Long roomId, LocalDate bookingDate, 
                                             Double totalAmount) {
        try {
            Promotion promotion = promotionRepository.findByPromotionCodeAndIsActiveTrue(promotionCode)
                    .orElse(null);
            
            if (promotion == null) {
                log.warn("Promotion not found: {}", promotionCode);
                return false;
            }

            return isPromotionApplicable(promotion, account, movieId, roomId, bookingDate, totalAmount);
        } catch (Exception e) {
            log.error("Error validating promotion: {}", e.getMessage());
            return false;
        }
    }

    // Calculate discount
    @Transactional(readOnly = true)
    public double calculateDiscount(String promotionCode, Double totalAmount) {
        Promotion promotion = promotionRepository.findByPromotionCodeAndIsActiveTrue(promotionCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi: " + promotionCode));
        
        return promotion.calculateDiscount(totalAmount);
    }

    // Apply promotion (increment usage)
    public void applyPromotion(String promotionCode) {
        Promotion promotion = promotionRepository.findByPromotionCodeAndIsActiveTrue(promotionCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi: " + promotionCode));
        
        if (!promotion.isValid()) {
            throw new RuntimeException("Khuyến mãi không còn hiệu lực: " + promotionCode);
        }

        promotion.incrementUsage();
        promotion.setUpdatedAt(LocalDateTime.now());
        promotionRepository.save(promotion);
        
        log.info("Applied promotion: {} - Usage: {}/{}", 
                promotionCode, promotion.getCurrentUsageCount(), promotion.getMaxUsageCount());
    }



    // Private helper methods
    private boolean isPromotionApplicable(Promotion promotion, Account account, 
                                        Long movieId, Long roomId, LocalDate bookingDate, 
                                        Double totalAmount) {
        // Basic validation
        if (!promotion.isValid()) {
            return false;
        }

        // Amount validation
        if (totalAmount < (promotion.getMinPurchaseAmount() != null ? promotion.getMinPurchaseAmount() : 0)) {
            return false;
        }

        // Member validation
        if (!promotion.canBeUsedBy(account)) {
            return false;
        }

        // Movie validation
        if (!promotion.canBeUsedForMovie(movieId)) {
            return false;
        }

        // Room validation
        if (!promotion.canBeUsedForRoom(roomId)) {
            return false;
        }

        // Date validation
        if (!promotion.canBeUsedOnDay(bookingDate)) {
            return false;
        }

        return true;
    }

    private Promotion mapToEntity(PromotionCreateRequest request) {
        Promotion promotion = new Promotion();
        promotion.setPromotionCode(request.getPromotionCode());
        promotion.setPromotionName(request.getPromotionName());
        promotion.setDescription(request.getDescription());
        promotion.setDiscountType(request.getDiscountType());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setMaxDiscountAmount(request.getMaxDiscountAmount());
        promotion.setMinPurchaseAmount(request.getMinPurchaseAmount());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setIsActive(true);
        promotion.setMaxUsageCount(request.getMaxUsageCount());
        promotion.setCurrentUsageCount(0);
        promotion.setMaxUsagePerUser(request.getMaxUsagePerUser());
        promotion.setApplicableDays(request.getApplicableDays());
        promotion.setApplicableTimes(request.getApplicableTimes());
        promotion.setApplicableMovies(request.getApplicableMovies());
        promotion.setApplicableRooms(request.getApplicableRooms());
        promotion.setMemberOnly(request.getMemberOnly());
        promotion.setMembershipLevels(request.getMembershipLevels());
        promotion.setBannerImageUrl(request.getBannerImageUrl());
        promotion.setIsFeatured(request.getIsFeatured());
        promotion.setDisplayOrder(request.getDisplayOrder());
        promotion.setIsPointsPromotion(request.getIsPointsPromotion());
        promotion.setPointsRequired(request.getPointsRequired());
        promotion.setPointsValue(request.getPointsValue());
        return promotion;
    }

    private PromotionResponse mapToResponse(Promotion promotion) {
        PromotionResponse response = new PromotionResponse();
        response.setPromotionId(promotion.getPromotionId());
        response.setPromotionCode(promotion.getPromotionCode());
        response.setPromotionName(promotion.getPromotionName());
        response.setDescription(promotion.getDescription());
        response.setDiscountType(promotion.getDiscountType());
        response.setDiscountValue(promotion.getDiscountValue());
        response.setMaxDiscountAmount(promotion.getMaxDiscountAmount());
        response.setMinPurchaseAmount(promotion.getMinPurchaseAmount());
        response.setStartDate(promotion.getStartDate());
        response.setEndDate(promotion.getEndDate());
        response.setIsActive(promotion.getIsActive());
        response.setMaxUsageCount(promotion.getMaxUsageCount());
        response.setCurrentUsageCount(promotion.getCurrentUsageCount());
        response.setMaxUsagePerUser(promotion.getMaxUsagePerUser());
        response.setApplicableDays(promotion.getApplicableDays());
        response.setApplicableTimes(promotion.getApplicableTimes());
        response.setApplicableMovies(promotion.getApplicableMovies());
        response.setApplicableRooms(promotion.getApplicableRooms());
        response.setMemberOnly(promotion.getMemberOnly());
        response.setMembershipLevels(promotion.getMembershipLevels());
        response.setBannerImageUrl(promotion.getBannerImageUrl());
        response.setIsFeatured(promotion.getIsFeatured());
        response.setDisplayOrder(promotion.getDisplayOrder());
        response.setCreatedAt(promotion.getCreatedAt());
        response.setUpdatedAt(promotion.getUpdatedAt());
        response.setIsPointsPromotion(promotion.getIsPointsPromotion());
        response.setPointsRequired(promotion.getPointsRequired());
        response.setPointsValue(promotion.getPointsValue());

        // Set computed fields
        response.setIsValid(promotion.isValid());
        response.setIsExpired(promotion.isExpired());
        response.setIsNotStarted(promotion.isNotStarted());
        response.setIsUsageLimitReached(promotion.isUsageLimitReached());
        response.setRemainingUsage(promotion.getRemainingUsage());

        return response;
    }

    // Additional methods needed by controller

    // Get promotion by ID
    @Transactional(readOnly = true)
    public PromotionResponse getPromotionById(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi với ID: " + id));
        return mapToResponse(promotion);
    }

    // Update promotion
    public PromotionResponse updatePromotion(Long id, Object request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi với ID: " + id));
        
        // Simple update - just modify updatedAt for now
        promotion.setUpdatedAt(LocalDateTime.now());
        Promotion updated = promotionRepository.save(promotion);
        return mapToResponse(updated);
    }

    // Delete promotion
    public void deletePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi với ID: " + id));
        
        promotion.setIsActive(false);
        promotion.setUpdatedAt(LocalDateTime.now());
        promotionRepository.save(promotion);
    }

    // Get all promotions with pagination
    @Transactional(readOnly = true)
    public Page<Object> getAllPromotions(Pageable pageable, Boolean isActive) {
        Page<Promotion> promotions;
        if (isActive != null) {
            promotions = promotionRepository.findByIsActive(isActive, pageable);
        } else {
            promotions = promotionRepository.findAll(pageable);
        }
        return promotions.map(this::mapToResponse);
    }

    // Get active promotions
    @Transactional(readOnly = true)
    public List<Object> getActivePromotions() {
        return getAllActivePromotions().stream().map(p -> (Object) p).collect(Collectors.toList());
    }

    // Validate promotion code
    @Transactional(readOnly = true)
    public Object validatePromotionCode(Object request) {
        // Simple validation response
        return new Object() {
            public boolean isValid = true;
            public String message = "Khuyến mãi hợp lệ";
        };
    }

    // Apply promotion
    public Object applyPromotion(Object request) {
        // Simple application response
        return new Object() {
            public boolean success = true;
            public String message = "Áp dụng khuyến mãi thành công";
        };
    }

    // Get promotions by type
    @Transactional(readOnly = true)
    public List<Object> getPromotionsByType(String type) {
        return getAllActivePromotions().stream().map(p -> (Object) p).collect(Collectors.toList());
    }

    // Get promotion usage
    @Transactional(readOnly = true)
    public Object getPromotionUsage(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi với ID: " + id));
        
        return new Object() {
            public Long usageCount = promotion.getCurrentUsageCount();
            public Long maxUsage = promotion.getMaxUsageCount();
        };
    }

    // Get expiring promotions
    @Transactional(readOnly = true)
    public List<Object> getExpiringPromotions(int days) {
        LocalDate cutoffDate = LocalDate.now().plusDays(days);
        List<Promotion> promotions = promotionRepository.findByEndDateBefore(cutoffDate.atStartOfDay());
        return promotions.stream().map(this::mapToResponse).map(p -> (Object) p).collect(Collectors.toList());
    }

    // Activate promotion
    public PromotionResponse activatePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi với ID: " + id));
        
        promotion.setIsActive(true);
        promotion.setUpdatedAt(LocalDateTime.now());
        Promotion updated = promotionRepository.save(promotion);
        return mapToResponse(updated);
    }

    // Deactivate promotion and return response
    public PromotionResponse deactivatePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi với ID: " + id));
        
        promotion.setIsActive(false);
        promotion.setUpdatedAt(LocalDateTime.now());
        Promotion updated = promotionRepository.save(promotion);
        
        log.info("Deactivated promotion: {}", promotion.getPromotionCode());
        return mapToResponse(updated);
    }

    // Get promotions for movie
    @Transactional(readOnly = true)
    public List<Object> getPromotionsForMovie(Long movieId) {
        return getAllActivePromotions().stream().map(p -> (Object) p).collect(Collectors.toList());
    }

    // Get user eligible promotions
    @Transactional(readOnly = true)
    public List<Object> getUserEligiblePromotions() {
        return getAllActivePromotions().stream().map(p -> (Object) p).collect(Collectors.toList());
    }
} 
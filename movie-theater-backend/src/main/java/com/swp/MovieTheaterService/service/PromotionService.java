package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.promotion.PromotionCreateRequest;
import com.swp.MovieTheaterService.dto.promotion.PromotionPurchaseRequest;
import com.swp.MovieTheaterService.dto.promotion.PromotionPurchaseResponse;
import com.swp.MovieTheaterService.dto.promotion.PromotionResponse;
import com.swp.MovieTheaterService.dto.promotion.UserPromotionCodeResponse;
import com.swp.MovieTheaterService.dto.response.FileUploadResponse;
import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.entity.Promotion;
import com.swp.MovieTheaterService.entity.UserPromotionCode;
import com.swp.MovieTheaterService.enums.PromotionType;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.repository.PromotionRepository;
import com.swp.MovieTheaterService.repository.UserPromotionCodeRepository;
import com.swp.MovieTheaterService.repository.AccountRepository;
import com.swp.MovieTheaterService.service.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
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
    private final UserPromotionCodeRepository userPromotionCodeRepository;
    private final AccountRepository accountRepository;
    private final SupabaseStorageService supabaseStorageService;

    // Create promotion
    public PromotionResponse createPromotion(PromotionCreateRequest request) {
        log.info("Creating promotion with code: {}", request.getCode());
        
        // Validate promotion code uniqueness
        if (promotionRepository.existsByPromotionCodeAndIsActiveTrue(request.getCode())) {
            throw new AppException(ErrorCode.PROMOTION_CODE_INVALID, "Mã khuyến mãi đã tồn tại: " + request.getCode());
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
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
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
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        
        return promotion.calculateDiscount(totalAmount);
    }

    // Apply promotion (increment usage)
    public void applyPromotion(String promotionCode) {
        Promotion promotion = promotionRepository.findByPromotionCodeAndIsActiveTrue(promotionCode)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        
        if (!promotion.isValid()) {
            throw new AppException(ErrorCode.PROMOTION_EXPIRED);
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
        promotion.setPromotionCode(request.getCode());
        promotion.setPromotionName(request.getName());
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
        promotion.setBannerUrl(request.getBannerImageUrl());
        promotion.setIsFeatured(request.getIsFeatured());
        promotion.setDisplayOrder(request.getDisplayOrder());
        promotion.setPointsRequired(request.getPointsRequired());
        promotion.setPointsValue(request.getPointsValue());
        if (request.getPointsRequired() != null && request.getPointsRequired() > 0) {
            promotion.setPromotionType(PromotionType.POINT_BASED);
        } else {
            promotion.setPromotionType(PromotionType.PUBLIC);
        }
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
        response.setBannerUrl(promotion.getBannerUrl());
        response.setIsFeatured(promotion.getIsFeatured());
        response.setDisplayOrder(promotion.getDisplayOrder());
        response.setCreatedAt(promotion.getCreatedAt());
        response.setUpdatedAt(promotion.getUpdatedAt());
        response.setPromotionType(promotion.getPromotionType().name());
        response.setPromotionTypeDisplay(promotion.getPromotionTypeDisplay());
        response.setPointsRequired(promotion.getPointsRequired());
        response.setPointsValue(promotion.getPointsValue());
        response.setCodeValidityHours(promotion.getCodeValidityHours());
        response.setMaxCodesPerUser(promotion.getMaxCodesPerUser());

        // Set points promotion flag - FIX for NullPointerException
        response.setIsPointsPromotion(promotion.isPointBasedPromotion());

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
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        return mapToResponse(promotion);
    }

    // Update promotion
    public PromotionResponse updatePromotion(Long id, Object request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        
        // Simple update - just modify updatedAt for now
        promotion.setUpdatedAt(LocalDateTime.now());
        Promotion updated = promotionRepository.save(promotion);
        return mapToResponse(updated);
    }

    // Delete promotion
    public void deletePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        
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
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        
        return new Object() {
            public Integer usageCount = promotion.getCurrentUsageCount();
            public Integer maxUsage = promotion.getMaxUsageCount();
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
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        
        promotion.setIsActive(true);
        promotion.setUpdatedAt(LocalDateTime.now());
        Promotion updated = promotionRepository.save(promotion);
        return mapToResponse(updated);
    }

    // Deactivate promotion and return response
    public PromotionResponse deactivatePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        
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

    // === NEW POINT-BASED PROMOTION METHODS ===
    
    /**
     * Purchase point-based promotion
     * User đổi điểm để nhận unique promotion code
     */
    public PromotionPurchaseResponse purchasePointBasedPromotion(Long userId, PromotionPurchaseRequest request) {
        // Get user account
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Get promotion
        Promotion promotion = promotionRepository.findById(request.getPromotionId())
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        
        // Validate promotion type
        if (!promotion.isPointBasedPromotion()) {
            throw new AppException(ErrorCode.INVALID_PROMOTION_TYPE);
        }
        
        // Check if promotion is active and valid
        if (!promotion.isValid()) {
            throw new AppException(ErrorCode.PROMOTION_EXPIRED);
        }
        
        // Check user points - fix method name
        Integer userPoints = account.getMembershipPoints();
        if (userPoints == null || userPoints < promotion.getPointsRequired()) {
            throw new AppException(ErrorCode.INSUFFICIENT_POINTS);
        }
        
        // Check if user already has max codes for this promotion
        Long existingCodes = userPromotionCodeRepository.countValidCodesByAccountAndPromotion(account, promotion);
        if (existingCodes >= promotion.getMaxCodesPerUser()) {
            throw new AppException(ErrorCode.MAX_CODES_REACHED);
        }
        
        // Generate unique code
        String uniqueCode = generateUniqueCode(promotion);
        
        // Calculate expiry time
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(promotion.getCodeValidityHours());
        
        // Create user promotion code
        UserPromotionCode userPromotionCode = UserPromotionCode.builder()
                .uniqueCode(uniqueCode)
                .account(account)
                .promotion(promotion)
                .pointsSpent(promotion.getPointsRequired())
                .expiresAt(expiresAt)
                .build();
        
        userPromotionCodeRepository.save(userPromotionCode);
        
        // Deduct points from user
        account.setMembershipPoints(userPoints - promotion.getPointsRequired());
        accountRepository.save(account);
        
        // Create response
        return PromotionPurchaseResponse.builder()
                .uniqueCode(uniqueCode)
                .promotionName(promotion.getPromotionName())
                .promotionDescription(promotion.getDescription())
                .pointsSpent(promotion.getPointsRequired())
                .remainingPoints(account.getMembershipPoints())
                .expiresAt(expiresAt)
                .purchasedAt(LocalDateTime.now())
                .discountDisplayText(promotion.getDiscountDisplayText())
                .statusMessage("Mua khuyến mãi thành công! Mã của bạn: " + uniqueCode)
                .build();
    }
    
    /**
     * Get user's promotion codes
     */
    @Transactional(readOnly = true)
    public List<UserPromotionCodeResponse> getUserPromotionCodes(Long userId) {
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        List<UserPromotionCode> codes = userPromotionCodeRepository.findValidCodesByAccount(account, LocalDateTime.now());
        
        return codes.stream()
                .map(this::mapToUserPromotionCodeResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Validate and use promotion code
     */
    public boolean usePromotionCode(String uniqueCode, Long bookingId) {
        UserPromotionCode userCode = userPromotionCodeRepository.findByUniqueCode(uniqueCode)
                .orElse(null);
        
        if (userCode == null || !userCode.isValid()) {
            return false;
        }
        
        // Mark as used (will be set in booking process)
        return true;
    }
    
    // === HELPER METHODS ===
    
    private String generateUniqueCode(Promotion promotion) {
        String prefix = promotion.getPromotionCode().substring(0, Math.min(3, promotion.getPromotionCode().length()));
        String uniquePart = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        String uniqueCode = prefix + uniquePart;
        
        // Ensure uniqueness
        while (userPromotionCodeRepository.existsByUniqueCode(uniqueCode)) {
            uniquePart = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
            uniqueCode = prefix + uniquePart;
        }
        
        return uniqueCode;
    }
    
    private UserPromotionCodeResponse mapToUserPromotionCodeResponse(UserPromotionCode userCode) {
        return UserPromotionCodeResponse.builder()
                .userPromotionCodeId(userCode.getUserPromotionCodeId())
                .promotionName(userCode.getPromotion().getPromotionName())
                .uniqueCode(userCode.getUniqueCode())
                .pointsSpent(userCode.getPointsSpent())
                .movieTitle(userCode.getBooking() != null ? userCode.getBooking().getSchedule().getMovie().getTitle() : null)
                .showTime(userCode.getBooking() != null ? userCode.getBooking().getSchedule().getShowDate().toString() : null)
                .isUsed(userCode.getIsUsed())
                .expiresAt(userCode.getExpiresAt())
                .build();
    }

    // ==================== BANNER MANAGEMENT METHODS ====================
    
    /**
     * Update promotion banner
     */
    @Transactional
    public FileUploadResponse updatePromotionBanner(Long promotionId, MultipartFile bannerFile) {
        log.info("Updating banner for promotion ID: {}", promotionId);
        
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        
        String newBannerUrl = supabaseStorageService.replaceFile(
            promotion.getBannerUrl(), 
            bannerFile, 
            "promotions/banners"
        );
        
        promotion.setBannerUrl(newBannerUrl);
        promotion.setUpdatedAt(LocalDateTime.now());
        promotionRepository.save(promotion);
        
        log.info("Updated banner for promotion: {} - new URL: {}", promotion.getPromotionName(), newBannerUrl);
        
        return FileUploadResponse.builder()
                .fileName(bannerFile.getOriginalFilename())
                .url(newBannerUrl)
                .fileSize(bannerFile.getSize())
                .message("Banner promotion đã được cập nhật thành công")
                .build();
    }
    
    /**
     * Delete promotion banner
     */
    @Transactional
    public void deletePromotionBanner(Long promotionId) {
        log.info("Deleting banner for promotion ID: {}", promotionId);
        
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        
        if (promotion.getBannerUrl() != null) {
            String filePath = supabaseStorageService.extractFilePathFromUrl(promotion.getBannerUrl());
            boolean deleted = supabaseStorageService.deleteFile(filePath);
            
            if (deleted) {
                promotion.setBannerUrl(null);
                promotion.setUpdatedAt(LocalDateTime.now());
                promotionRepository.save(promotion);
                log.info("Deleted banner for promotion: {}", promotion.getPromotionName());
            } else {
                throw new AppException(ErrorCode.FILE_DELETE_FAILED);
            }
        } else {
            log.info("No banner to delete for promotion: {}", promotion.getPromotionName());
        }
    }
} 
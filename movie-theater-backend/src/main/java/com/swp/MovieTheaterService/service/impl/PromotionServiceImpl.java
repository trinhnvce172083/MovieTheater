package com.swp.MovieTheaterService.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

import com.swp.MovieTheaterService.entity.Promotion;
import com.swp.MovieTheaterService.repository.PromotionRepository;
import com.swp.MovieTheaterService.service.PromotionService;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.utils.ValidationUtils;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.dto.promotion.PromotionCreateRequest;
import com.swp.MovieTheaterService.enums.DiscountType;

@Slf4j
@Service
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;

    public PromotionServiceImpl(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    @Override
    public Promotion createPromotion(PromotionCreateRequest request) {
        log.info("Creating new promotion: {}", request.getCode());

        // DTO đã validate rồi, chỉ cần business logic validation
        log.info("Validating promotion creation for code: {}", request.getCode());

        // Validate promotion code uniqueness (business logic validation)
        if (promotionRepository.existsByPromotionCode(request.getCode())) {
            throw new AppException(ErrorCode.PROMOTION_CODE_EXISTS);
        }

        Promotion promotion = mapToEntity(request);
        promotion.setCurrentUsageCount(0);
        promotion.setIsActive(true);

        Promotion savedPromotion = promotionRepository.save(promotion);
        log.info("Created promotion with ID: {}", savedPromotion.getPromotionId());

        return savedPromotion;
    }

    @Override
    public Promotion updatePromotion(Long promotionId, PromotionCreateRequest request) {
        log.info("Updating promotion ID: {}", promotionId);

        Promotion existingPromotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        // Check if code is being changed and if it's unique
        if (!existingPromotion.getPromotionCode().equals(request.getCode()) &&
                promotionRepository.existsByPromotionCode(request.getCode())) {
            throw new AppException(ErrorCode.PROMOTION_CODE_EXISTS);
        }

        // Update fields
        existingPromotion.setPromotionCode(request.getCode());
        existingPromotion.setPromotionName(request.getName());
        existingPromotion.setDescription(request.getDescription());
        existingPromotion.setDiscountType(request.getDiscountType());
        existingPromotion.setDiscountValue(request.getDiscountValue());
        existingPromotion.setMaxDiscountAmount(request.getMaxDiscountAmount());
        existingPromotion.setMinPurchaseAmount(request.getMinPurchaseAmount());
        existingPromotion.setStartDate(LocalDate.parse(request.getStartDate()));
        existingPromotion.setEndDate(LocalDate.parse(request.getEndDate()));
        existingPromotion.setMaxUsageCount(request.getMaxUsageCount());
        existingPromotion.setMaxUsagePerUser(request.getMaxUsagePerUser());
        existingPromotion.setIsFeatured(request.getIsFeatured());
        existingPromotion.setBannerImageUrl(request.getBannerImageUrl());
        existingPromotion.setPointsRequired(request.getPointsRequired());
        existingPromotion.setCodeValidityHours(request.getCodeValidityHour());

        Promotion updatedPromotion = promotionRepository.save(existingPromotion);
        log.info("Updated promotion ID: {}", updatedPromotion.getPromotionId());

        return updatedPromotion;
    }

    @Override
    public void deletePromotion(Long promotionId) {
        log.info("Deleting promotion ID: {}", promotionId);

        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        promotion.setIsActive(false);
        promotionRepository.save(promotion);

        log.info("Soft deleted promotion ID: {}", promotionId);
    }

    @Override
    public Promotion getPromotionById(Long promotionId) {
        return promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
    }

    @Override
    public Promotion getPromotionByCode(String promotionCode) {
        return promotionRepository.findByPromotionCodeAndIsActiveTrue(promotionCode)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
    }

    @Override
    public List<Promotion> getAllActivePromotions() {
        return promotionRepository.findActivePromotions();
    }

    @Override
    public List<Promotion> getActivePromotions() {
        return getAllActivePromotions();
    }

    @Override
    public Page<Promotion> getActivePromotions(Pageable pageable) {
        return promotionRepository.findActivePromotions(pageable);
    }

    @Override
    public List<Promotion> getUpcomingPromotions() {
        return promotionRepository.findUpcomingPromotions();
    }

    @Override
    public List<Promotion> getExpiredPromotions() {
        return promotionRepository.findExpiredPromotions();
    }

    @Override
    public List<Promotion> getFeaturedPromotions() {
        return promotionRepository.findByIsActiveTrueAndIsFeaturedTrueOrderByCreatedAtDesc();
    }

    @Override
    public List<Promotion> getPointsPromotions() {
        return promotionRepository.findPointsPromotions();
    }

    @Override
    public List<Promotion> getRedeemablePromotions(Integer availablePoints) {
        return promotionRepository.findRedeemablePromotions(availablePoints);
    }

    @Override
    public Page<Promotion> searchPromotions(String keyword, Pageable pageable) {
        return promotionRepository.searchPromotions(keyword, pageable);
    }

    @Override
    public List<Promotion> getPromotionsByDiscountType(DiscountType discountType) {
        return promotionRepository.findByIsActiveTrueAndDiscountTypeOrderByCreatedAtDesc(discountType);
    }

    @Override
    public List<Promotion> getPromotionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return promotionRepository.findPromotionsByDateRange(startDate, endDate);
    }

    @Override
    public boolean validatePromotion(String promotionCode) {
        try {
            Promotion promotion = getPromotionByCode(promotionCode);
            return isPromotionValid(promotion);
        } catch (AppException e) {
            return false;
        }
    }

    @Override
    public boolean validatePromotionForBooking(String promotionCode, Double totalAmount) {
        try {
            Promotion promotion = getPromotionByCode(promotionCode);

            if (!isPromotionValid(promotion)) {
                return false;
            }

            // Check minimum purchase amount
            if (promotion.getMinPurchaseAmount() != null &&
                    totalAmount < promotion.getMinPurchaseAmount()) {
                return false;
            }

            return true;
        } catch (AppException e) {
            return false;
        }
    }

    @Override
    public Double calculateDiscount(String promotionCode, Double totalAmount) {
        Promotion promotion = getPromotionByCode(promotionCode);

        if (!isPromotionValid(promotion)) {
            return 0.0;
        }

        // Check minimum purchase amount
        if (promotion.getMinPurchaseAmount() != null &&
                totalAmount < promotion.getMinPurchaseAmount()) {
            return 0.0;
        }

        Double discountAmount = 0.0;

        switch (promotion.getDiscountType()) {
            case PERCENTAGE:
                discountAmount = totalAmount * (promotion.getDiscountValue() / 100.0);
                if (promotion.getMaxDiscountAmount() != null) {
                    discountAmount = Math.min(discountAmount, promotion.getMaxDiscountAmount());
                }
                break;
            case FIXED:
                discountAmount = promotion.getDiscountValue();
                break;
            case POINTS:
                // For points-based promotions, return the points value as discount
                discountAmount = promotion.getDiscountValue();
                break;
            default:
                discountAmount = 0.0;
        }

        return Math.min(discountAmount, totalAmount); // Cannot discount more than total
    }

    @Override
    public void applyPromotion(String promotionCode) {
        Promotion promotion = getPromotionByCode(promotionCode);

        if (promotion.getCurrentUsageCount() < promotion.getMaxUsageCount()) {
            promotion.setCurrentUsageCount(promotion.getCurrentUsageCount() + 1);
            promotionRepository.save(promotion);
            log.info("Applied promotion usage for code: {}", promotionCode);
        } else {
            log.warn("Promotion usage limit reached for code: {}", promotionCode);
        }
    }

    @Override
    public void incrementUserUsage(String promotionCode, Long userId) {
        // This would typically update user-specific usage tracking
        // For now, we'll just log it
        log.info("Incremented user usage for promotion: {} by user: {}", promotionCode, userId);
    }

    @Override
    public boolean isUserUsageLimitReached(String promotionCode, Long userId) {
        // This would check user-specific usage limits
        // For now, return false (no limit reached)
        return false;
    }

    @Override
    public Long getActivePromotionsCount() {
        return promotionRepository.countActivePromotions();
    }

    @Override
    public Long getCurrentPromotionsCount() {
        return promotionRepository.countCurrentPromotions();
    }

    private boolean isPromotionValid(Promotion promotion) {
        LocalDate today = LocalDate.now();

        // Check if promotion is active
        if (!promotion.getIsActive()) {
            return false;
        }

        // Check date validity
        if (today.isBefore(promotion.getStartDate()) || today.isAfter(promotion.getEndDate())) {
            return false;
        }

        // Check usage limit
        if (promotion.getCurrentUsageCount() >= promotion.getMaxUsageCount()) {
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
        promotion.setStartDate(LocalDate.parse(request.getStartDate()));
        promotion.setEndDate(LocalDate.parse(request.getEndDate()));
        promotion.setMaxUsageCount(request.getMaxUsageCount());
        promotion.setMaxUsagePerUser(request.getMaxUsagePerUser());
        promotion.setIsFeatured(request.getIsFeatured());
        promotion.setBannerImageUrl(request.getBannerImageUrl());
        promotion.setPointsRequired(request.getPointsRequired());
        promotion.setCodeValidityHours(request.getCodeValidityHour());
        return promotion;
    }
} 

package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.entity.Concession;
import com.swp.MovieTheaterService.enums.ConcessionCategory;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.repository.ConcessionRepository;
import com.swp.MovieTheaterService.service.ConcessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Concession Service Implementation
 * Business logic implementation for concession management
 * 
 * @author Dũng_Solo
 * @version 1.1.0 - Added CRUD operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ConcessionServiceImpl implements ConcessionService {

    private final ConcessionRepository concessionRepository;

    // ==================== READ OPERATIONS ====================

    @Override
    @Transactional(readOnly = true)
    public List<Concession> getAllAvailableConcessions() {
        log.debug("Getting all available concessions");
        return concessionRepository.findByIsAvailableTrueAndIsActiveTrueOrderByDisplayOrderAsc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Concession> getConcessionsByCategory(ConcessionCategory category) {
        log.debug("Getting concessions by category: {}", category);
        return concessionRepository.findByCategoryAndIsAvailableTrueAndIsActiveTrueOrderByDisplayOrderAsc(category);
    }

    @Override
    @Transactional(readOnly = true)
    public Concession getConcessionById(Long concessionId) {
        log.debug("Getting concession by ID: {}", concessionId);
        return concessionRepository.findById(concessionId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Concession> getPopcornFlavors() {
        log.debug("Getting popcorn flavors");
        return getConcessionsByCategory(ConcessionCategory.POPCORN);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Concession> getDrinks() {
        log.debug("Getting drinks");
        return getConcessionsByCategory(ConcessionCategory.DRINKS);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isAvailableForOrder(Long concessionId, Integer quantity) {
        log.debug("Checking availability for concession ID: {} with quantity: {}", concessionId, quantity);
        
        Concession concession = getConcessionById(concessionId);
        
        return concession.getIsActive() &&
               concession.getIsAvailable() &&
               concession.getStockQuantity() >= quantity;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Concession> getInStockConcessions() {
        log.debug("Getting in-stock concessions");
        return concessionRepository.findInStockConcessions();
    }

    // ==================== CRUD OPERATIONS ====================

    @Override
    public Concession createConcession(Concession concession) {
        log.info("Creating new concession: {}", concession.getName());
        
        // Validate required fields
        if (concession.getName() == null || concession.getName().trim().isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        
        if (concession.getPrice() == null || concession.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        
        // Set default values
        if (concession.getIsActive() == null) {
            concession.setIsActive(true);
        }
        
        if (concession.getIsAvailable() == null) {
            concession.setIsAvailable(true);
        }
        
        if (concession.getStockQuantity() == null) {
            concession.setStockQuantity(0);
        }
        
        if (concession.getDisplayOrder() == null) {
            concession.setDisplayOrder(99);
        }
        
        concession.setCreatedAt(LocalDateTime.now());
        concession.setUpdatedAt(LocalDateTime.now());
        
        Concession savedConcession = concessionRepository.save(concession);
        log.info("Created concession with ID: {} - {}", savedConcession.getConcessionId(), savedConcession.getName());
        
        return savedConcession;
    }

    @Override
    public Concession updateConcession(Long concessionId, Concession concession) {
        log.info("Updating concession ID: {}", concessionId);
        
        Concession existingConcession = getConcessionById(concessionId);
        
        // Update fields
        if (concession.getName() != null && !concession.getName().trim().isEmpty()) {
            existingConcession.setName(concession.getName());
        }
        
        if (concession.getPrice() != null && concession.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            existingConcession.setPrice(concession.getPrice());
        }
        
        if (concession.getCategory() != null) {
            existingConcession.setCategory(concession.getCategory());
        }
        
        if (concession.getDescription() != null) {
            existingConcession.setDescription(concession.getDescription());
        }
        
        if (concession.getImageUrl() != null) {
            existingConcession.setImageUrl(concession.getImageUrl());
        }
        
        if (concession.getSize() != null) {
            existingConcession.setSize(concession.getSize());
        }
        
        if (concession.getFlavor() != null) {
            existingConcession.setFlavor(concession.getFlavor());
        }
        
        if (concession.getStockQuantity() != null) {
            existingConcession.setStockQuantity(concession.getStockQuantity());
        }
        
        if (concession.getIsActive() != null) {
            existingConcession.setIsActive(concession.getIsActive());
        }
        
        if (concession.getIsAvailable() != null) {
            existingConcession.setIsAvailable(concession.getIsAvailable());
        }
        
        if (concession.getDisplayOrder() != null) {
            existingConcession.setDisplayOrder(concession.getDisplayOrder());
        }
        
        existingConcession.setUpdatedAt(LocalDateTime.now());
        
        Concession updatedConcession = concessionRepository.save(existingConcession);
        log.info("Updated concession: {}", updatedConcession.getName());
        
        return updatedConcession;
    }

    @Override
    public void deleteConcession(Long concessionId) {
        log.info("Deleting concession ID: {}", concessionId);
        
        Concession concession = getConcessionById(concessionId);
        
        // Soft delete - set isActive to false
        concession.setIsActive(false);
        concession.setIsAvailable(false);
        concession.setUpdatedAt(LocalDateTime.now());
        
        concessionRepository.save(concession);
        log.info("Soft deleted concession: {}", concession.getName());
    }

    @Override
    public void updateStock(Long concessionId, Integer quantity) {
        log.debug("Updating stock for concession ID: {} with quantity: {}", concessionId, quantity);
        
        Concession concession = getConcessionById(concessionId);
        
        if (!isAvailableForOrder(concessionId, quantity)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        
        concession.decreaseStock(quantity);
        concessionRepository.save(concession);
        
        log.info("Updated stock for {} from {} to {}", 
                concession.getName(),
                concession.getStockQuantity() + quantity,
                concession.getStockQuantity());
    }
} 
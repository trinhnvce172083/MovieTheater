package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.entity.Concession;
import com.swp.MovieTheaterService.enums.ConcessionCategory;
import com.swp.MovieTheaterService.repository.ConcessionRepository;
import com.swp.MovieTheaterService.service.ConcessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Concession Service Implementation
 * Business logic implementation for concession management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ConcessionServiceImpl implements ConcessionService {

    private final ConcessionRepository concessionRepository;

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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món đồ ăn với ID: " + concessionId));
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
    public void updateStock(Long concessionId, Integer quantity) {
        log.debug("Updating stock for concession ID: {} with quantity: {}", concessionId, quantity);
        
        Concession concession = getConcessionById(concessionId);
        
        if (!isAvailableForOrder(concessionId, quantity)) {
            throw new RuntimeException("Không đủ hàng trong kho cho món: " + concession.getFullName());
        }
        
        concession.decreaseStock(quantity);
        concessionRepository.save(concession);
        
        log.info("Updated stock for {}: {} -> {}", 
                concession.getFullName(), 
                concession.getStockQuantity() + quantity, 
                concession.getStockQuantity());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Concession> getInStockConcessions() {
        log.debug("Getting in-stock concessions");
        return concessionRepository.findInStockConcessions();
    }
} 
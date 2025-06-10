package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.entity.Concession;
import com.swp.MovieTheaterService.enums.ConcessionCategory;

import java.util.List;

/**
 * Concession Service Interface
 * Business logic for concession management (simple food & beverage system)
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public interface ConcessionService {

    /**
     * Get all available concessions
     */
    List<Concession> getAllAvailableConcessions();

    /**
     * Get concessions by category
     */
    List<Concession> getConcessionsByCategory(ConcessionCategory category);

    /**
     * Get concession by ID
     */
    Concession getConcessionById(Long concessionId);

    /**
     * Get popcorn flavors (4 types)
     */
    List<Concession> getPopcornFlavors();

    /**
     * Get drinks
     */
    List<Concession> getDrinks();

    /**
     * Check if concession is available for order
     */
    boolean isAvailableForOrder(Long concessionId, Integer quantity);

    /**
     * Update stock quantity after order
     */
    void updateStock(Long concessionId, Integer quantity);

    /**
     * Get in-stock concessions only
     */
    List<Concession> getInStockConcessions();
} 
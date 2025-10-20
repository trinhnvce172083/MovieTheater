package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.entity.Concession;
import com.swp.MovieTheaterService.enums.ConcessionCategory;

import java.util.List;

/**
 * Concession Service Interface
 * Business logic for concession management (simple food & beverage system)
 *
 * @author Ngo Viet Trinh
 * @version 1.1.0 - Added CRUD operations
 */
public interface ConcessionService {

    // ==================== READ OPERATIONS ====================

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
     * Get combo concessions
     */
    List<Concession> getComboConcessions();

    /**
     * Check if concession is available for order
     */
    boolean isAvailableForOrder(Long concessionId, Integer quantity);

    /**
     * Get in-stock concessions only
     */
    List<Concession> getInStockConcessions();

    // ==================== CRUD OPERATIONS ====================

    /**
     * Create new concession
     */
    Concession createConcession(Concession concession);

    /**
     * Update existing concession
     */
    Concession updateConcession(Long concessionId, Concession concession);

    /**
     * Delete concession (soft delete)
     */
    void deleteConcession(Long concessionId);

    /**
     * Update stock quantity (decrease for orders)
     */
    void updateStock(Long concessionId, Integer quantity);
} 

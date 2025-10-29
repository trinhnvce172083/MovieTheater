package com.swp.MovieTheaterService.repository;

import com.swp.MovieTheaterService.entity.Concession;
import com.swp.MovieTheaterService.enums.ConcessionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Concession Repository Interface
 * Data access layer for Concession entity
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Repository
public interface ConcessionRepository extends JpaRepository<Concession, Long> {

    // Find by category
    List<Concession> findByCategoryAndIsActiveTrueOrderByDisplayOrderAsc(ConcessionCategory category);
    
    // Find available concessions
    List<Concession> findByIsAvailableTrueAndIsActiveTrueOrderByDisplayOrderAsc();
    
    // Find by category and availability
    List<Concession> findByCategoryAndIsAvailableTrueAndIsActiveTrueOrderByDisplayOrderAsc(ConcessionCategory category);
    
    // Find in stock items
    @Query("SELECT c FROM Concession c WHERE c.stockQuantity > 0 AND c.isAvailable = true AND c.isActive = true ORDER BY c.displayOrder")
    List<Concession> findInStockConcessions();
    
    // Find by flavor (for popcorn)
    List<Concession> findByFlavorAndIsActiveTrueOrderByDisplayOrderAsc(String flavor);
    
    // Find by size
    List<Concession> findBySizeAndIsActiveTrueOrderByDisplayOrderAsc(String size);
    
    // Find by name containing
    @Query("SELECT c FROM Concession c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')) AND c.isActive = true ORDER BY c.displayOrder")
    List<Concession> findByNameContainingIgnoreCase(@Param("name") String name);
}
package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.entity.Concession;
import com.swp.MovieTheaterService.enums.ConcessionCategory;
import com.swp.MovieTheaterService.service.ConcessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Concession Controller
 * REST API endpoints for concession management (simple food & beverage system)
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/concessions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ConcessionController {

    private final ConcessionService concessionService;

    /**
     * Get all available concessions
     */
    @GetMapping
    public ResponseEntity<List<Concession>> getAllConcessions() {
        log.info("GET /api/concessions - Getting all available concessions");
        
        List<Concession> concessions = concessionService.getAllAvailableConcessions();
        
        log.info("Found {} available concessions", concessions.size());
        return ResponseEntity.ok(concessions);
    }

    /**
     * Get popcorn flavors (4 types)
     */
    @GetMapping("/popcorn")
    public ResponseEntity<List<Concession>> getPopcornFlavors() {
        log.info("GET /api/concessions/popcorn - Getting popcorn flavors");
        
        List<Concession> popcorns = concessionService.getPopcornFlavors();
        
        log.info("Found {} popcorn flavors", popcorns.size());
        return ResponseEntity.ok(popcorns);
    }

    /**
     * Get drinks
     */
    @GetMapping("/drinks")
    public ResponseEntity<List<Concession>> getDrinks() {
        log.info("GET /api/concessions/drinks - Getting drinks");
        
        List<Concession> drinks = concessionService.getDrinks();
        
        log.info("Found {} drinks", drinks.size());
        return ResponseEntity.ok(drinks);
    }

    /**
     * Get concessions by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Concession>> getConcessionsByCategory(
            @PathVariable ConcessionCategory category) {
        log.info("GET /api/concessions/category/{} - Getting concessions by category", category);
        
        List<Concession> concessions = concessionService.getConcessionsByCategory(category);
        
        log.info("Found {} concessions for category {}", concessions.size(), category);
        return ResponseEntity.ok(concessions);
    }

    /**
     * Get concession by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Concession> getConcessionById(@PathVariable Long id) {
        log.info("GET /api/concessions/{} - Getting concession by ID", id);
        
        try {
            Concession concession = concessionService.getConcessionById(id);
            log.info("Found concession: {}", concession.getFullName());
            return ResponseEntity.ok(concession);
        } catch (RuntimeException e) {
            log.error("Concession not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Check availability for ordering
     */
    @GetMapping("/{id}/availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") Integer quantity) {
        log.info("GET /api/concessions/{}/availability?quantity={} - Checking availability", id, quantity);
        
        try {
            boolean available = concessionService.isAvailableForOrder(id, quantity);
            Concession concession = concessionService.getConcessionById(id);
            
            Map<String, Object> response = Map.of(
                "concessionId", id,
                "concessionName", concession.getFullName(),
                "requestedQuantity", quantity,
                "available", available,
                "currentStock", concession.getStockQuantity()
            );
            
            log.info("Availability check for {}: {} (stock: {})", 
                    concession.getFullName(), available, concession.getStockQuantity());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error checking availability for concession ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get in-stock concessions only
     */
    @GetMapping("/in-stock")
    public ResponseEntity<List<Concession>> getInStockConcessions() {
        log.info("GET /api/concessions/in-stock - Getting in-stock concessions");
        
        List<Concession> concessions = concessionService.getInStockConcessions();
        
        log.info("Found {} in-stock concessions", concessions.size());
        return ResponseEntity.ok(concessions);
    }

    /**
     * Get menu summary (grouped by category)
     */
    @GetMapping("/menu")
    public ResponseEntity<Map<String, List<Concession>>> getMenu() {
        log.info("GET /api/concessions/menu - Getting menu summary");
        
        List<Concession> popcorns = concessionService.getPopcornFlavors();
        List<Concession> drinks = concessionService.getDrinks();
        
        Map<String, List<Concession>> menu = Map.of(
            "popcorns", popcorns,
            "drinks", drinks
        );
        
        log.info("Menu summary: {} popcorns, {} drinks", popcorns.size(), drinks.size());
        return ResponseEntity.ok(menu);
    }
} 
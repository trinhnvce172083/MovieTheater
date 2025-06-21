package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.entity.Concession;
import com.swp.MovieTheaterService.enums.ConcessionCategory;
import com.swp.MovieTheaterService.service.ConcessionService;
import com.swp.MovieTheaterService.service.ImageManagementService;
import com.swp.MovieTheaterService.utils.ImageUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Concession Controller
 * REST API endpoints for concession management (simple food & beverage system)
 * 
 * @author Dũng_Solo
 * @version 1.2.0 - Added image management
 */
@RestController
@RequestMapping("/api/concessions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Concession Management", description = "APIs for food & beverage management")
public class ConcessionController {

    private final ConcessionService concessionService;
    private final ImageManagementService imageManagementService;

    // ==================== PUBLIC READ OPERATIONS ====================

    /**
     * Get all available concessions
     */
    @GetMapping
    @Operation(summary = "Get all concessions", description = "Get all available concessions for customers")
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
    @Operation(summary = "Get popcorn flavors", description = "Get all available popcorn flavors")
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
    @Operation(summary = "Get drinks", description = "Get all available drinks")
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
    @Operation(summary = "Get by category", description = "Get concessions by category")
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
    @Operation(summary = "Get concession by ID", description = "Get specific concession details")
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
    @Operation(summary = "Check availability", description = "Check if concession is available for order")
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
    @Operation(summary = "Get in-stock items", description = "Get only in-stock concessions")
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
    @Operation(summary = "Get menu", description = "Get menu summary grouped by category")
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

    // ==================== ADMIN CRUD OPERATIONS ====================

    /**
     * Create new concession (Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create concession", description = "Create new concession item (Admin only)")
    public ResponseEntity<Concession> createConcession(@Valid @RequestBody Concession concession) {
        log.info("POST /api/concessions - Creating new concession: {}", concession.getFullName());
        
        try {
            Concession savedConcession = concessionService.createConcession(concession);
            log.info("Created concession with ID: {}", savedConcession.getConcessionId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedConcession);
        } catch (Exception e) {
            log.error("Error creating concession: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update concession (Admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update concession", description = "Update concession details (Admin only)")
    public ResponseEntity<Concession> updateConcession(
            @PathVariable Long id, 
            @Valid @RequestBody Concession concession) {
        log.info("PUT /api/concessions/{} - Updating concession", id);
        
        try {
            Concession updatedConcession = concessionService.updateConcession(id, concession);
            log.info("Updated concession: {}", updatedConcession.getFullName());
            return ResponseEntity.ok(updatedConcession);
        } catch (RuntimeException e) {
            log.error("Error updating concession ID {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete concession (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete concession", description = "Delete concession item (Admin only)")
    public ResponseEntity<Void> deleteConcession(@PathVariable Long id) {
        log.info("DELETE /api/concessions/{} - Deleting concession", id);
        
        try {
            concessionService.deleteConcession(id);
            log.info("Deleted concession with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error deleting concession ID {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update stock quantity (Admin/Employee)
     */
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update stock", description = "Update concession stock quantity")
    public ResponseEntity<Map<String, Object>> updateStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        log.info("PATCH /api/concessions/{}/stock?quantity={} - Updating stock", id, quantity);
        
        try {
            concessionService.updateStock(id, quantity);
            Concession concession = concessionService.getConcessionById(id);
            
            Map<String, Object> response = Map.of(
                "concessionId", id,
                "concessionName", concession.getFullName(),
                "newStock", concession.getStockQuantity(),
                "message", "Cập nhật kho thành công"
            );
            
            log.info("Updated stock for {}: {}", concession.getFullName(), concession.getStockQuantity());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error updating stock for concession ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== IMAGE MANAGEMENT ====================

    /**
     * Upload concession image (Admin only)
     */
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Upload concession image", description = "Upload image for concession item (Admin only)")
    public ResponseEntity<Map<String, Object>> uploadConcessionImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        
        log.info("POST /api/concessions/{}/image - Uploading image for concession", id);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate file
            if (!ImageUtils.isValidImageFile(file)) {
                response.put("success", false);
                response.put("message", ImageUtils.getValidationMessage(file));
                return ResponseEntity.badRequest().body(response);
            }
            
            String newImageUrl = imageManagementService.updateConcessionImage(id, file);
            
            response.put("success", true);
            response.put("message", "Upload ảnh đồ ăn/uống thành công");
            response.put("imageUrl", newImageUrl);
            response.put("concessionId", id);
            
            log.info("Successfully uploaded image for concession ID: {}", id);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to upload image for concession ID: {}", id, e);
            response.put("success", false);
            response.put("message", "Upload ảnh thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Update concession image (Admin only)
     */
    @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update concession image", description = "Replace existing concession image (Admin only)")
    public ResponseEntity<Map<String, Object>> updateConcessionImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        
        log.info("PUT /api/concessions/{}/image - Updating image for concession", id);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate file
            if (!ImageUtils.isValidImageFile(file)) {
                response.put("success", false);
                response.put("message", ImageUtils.getValidationMessage(file));
                return ResponseEntity.badRequest().body(response);
            }
            
            String newImageUrl = imageManagementService.updateConcessionImage(id, file);
            
            response.put("success", true);
            response.put("message", "Cập nhật ảnh đồ ăn/uống thành công");
            response.put("imageUrl", newImageUrl);
            response.put("concessionId", id);
            
            log.info("Successfully updated image for concession ID: {}", id);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to update image for concession ID: {}", id, e);
            response.put("success", false);
            response.put("message", "Cập nhật ảnh thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Delete concession image (Admin only)
     */
    @DeleteMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete concession image", description = "Delete concession image (Admin only)")
    public ResponseEntity<Map<String, Object>> deleteConcessionImage(@PathVariable Long id) {
        log.info("DELETE /api/concessions/{}/image - Deleting image for concession", id);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean deleted = imageManagementService.deleteConcessionImage(id);
            
            if (deleted) {
                response.put("success", true);
                response.put("message", "Xóa ảnh đồ ăn/uống thành công");
                response.put("concessionId", id);
                
                log.info("Successfully deleted image for concession ID: {}", id);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Không thể xóa ảnh hoặc ảnh không tồn tại");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("Failed to delete image for concession ID: {}", id, e);
            response.put("success", false);
            response.put("message", "Xóa ảnh thất bại: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Create concession with image (Admin only)
     */
    @PostMapping(value = "/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create concession with image", description = "Create new concession with image upload (Admin only)")
    public ResponseEntity<Concession> createConcessionWithImage(
            @RequestParam("concessionData") String concessionDataJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        
        log.info("POST /api/concessions/with-image - Creating concession with image");
        
        try {
            // Parse JSON data
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            Concession concessionRequest = objectMapper.readValue(concessionDataJson, Concession.class);
            
            // Create concession first
            Concession createdConcession = concessionService.createConcession(concessionRequest);
            Long concessionId = createdConcession.getConcessionId();
            
            // Upload image if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                if (ImageUtils.isValidImageFile(imageFile)) {
                    String imageUrl = imageManagementService.updateConcessionImage(concessionId, imageFile);
                    createdConcession.setImageUrl(imageUrl);
                    // Update concession with image URL
                    createdConcession = concessionService.updateConcession(concessionId, createdConcession);
                }
            }
            
            log.info("Successfully created concession with image - ID: {}", concessionId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdConcession);
            
        } catch (Exception e) {
            log.error("Error creating concession with image: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update concession with image (Admin only)
     */
    @PutMapping(value = "/{id}/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update concession with image", description = "Update concession data and image (Admin only)")
    public ResponseEntity<Concession> updateConcessionWithImage(
            @PathVariable Long id,
            @RequestParam(value = "concessionData", required = false) String concessionDataJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        
        log.info("PUT /api/concessions/{}/with-image - Updating concession with image", id);
        
        try {
            // Update concession data if provided
            if (concessionDataJson != null && !concessionDataJson.trim().isEmpty()) {
                com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
                objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
                Concession concessionRequest = objectMapper.readValue(concessionDataJson, Concession.class);
                concessionService.updateConcession(id, concessionRequest);
            }
            
            // Upload image if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                if (ImageUtils.isValidImageFile(imageFile)) {
                    imageManagementService.updateConcessionImage(id, imageFile);
                }
            }
            
            // Return updated concession data
            Concession updatedConcession = concessionService.getConcessionById(id);
            
            log.info("Successfully updated concession with image - ID: {}", id);
            return ResponseEntity.ok(updatedConcession);
            
        } catch (Exception e) {
            log.error("Error updating concession with image: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
} 
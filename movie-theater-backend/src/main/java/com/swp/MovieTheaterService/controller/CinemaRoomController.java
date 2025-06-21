package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.cinema.*;
import com.swp.MovieTheaterService.service.CinemaRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Cinema Room Controller
 * REST API endpoints for cinema room management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/cinema-rooms")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Cinema Room Management", description = "APIs for managing cinema rooms")
public class CinemaRoomController {

    private final CinemaRoomService cinemaRoomService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create cinema room", description = "Create a new cinema room (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<CinemaRoomResponse> createCinemaRoom(@RequestBody CinemaRoomCreateRequest request) {
        log.info("Creating new cinema room: {}", request.getCinemaRoomName());
        
        CinemaRoomResponse response = cinemaRoomService.createCinemaRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update cinema room", description = "Update an existing cinema room (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<CinemaRoomResponse> updateCinemaRoom(
            @PathVariable Long id,
            @RequestBody CinemaRoomUpdateRequest request) {
        log.info("Updating cinema room with ID: {}", id);
        
        CinemaRoomResponse response = cinemaRoomService.updateCinemaRoom(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get cinema room by ID", description = "Retrieve cinema room details by ID")
    public ResponseEntity<CinemaRoomResponse> getCinemaRoom(@PathVariable Long id) {
        log.info("Fetching cinema room with ID: {}", id);
        
        CinemaRoomResponse response = cinemaRoomService.getCinemaRoomById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete cinema room", description = "Delete a cinema room (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deleteCinemaRoom(@PathVariable Long id) {
        log.info("Deleting cinema room with ID: {}", id);
        
        cinemaRoomService.deleteCinemaRoom(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get all cinema rooms", description = "Retrieve all cinema rooms with pagination")
    public ResponseEntity<Page<CinemaRoomResponse>> getAllCinemaRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "roomName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        log.info("Fetching cinema rooms - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(sortDirection.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<CinemaRoomResponse> rooms = cinemaRoomService.getAllCinemaRooms(pageable);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/search")
    @Operation(summary = "Search cinema rooms", description = "Search cinema rooms by keyword")
    public ResponseEntity<Page<CinemaRoomResponse>> searchCinemaRooms(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Searching cinema rooms with keyword: {}", keyword);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CinemaRoomResponse> rooms = cinemaRoomService.searchCinemaRooms(keyword, pageable);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get cinema rooms by type", description = "Retrieve cinema rooms filtered by type")
    public ResponseEntity<List<CinemaRoomResponse>> getCinemaRoomsByType(@PathVariable String type) {
        log.info("Fetching cinema rooms by type: {}", type);
        
        List<CinemaRoomResponse> rooms = cinemaRoomService.getCinemaRoomsByType(type);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/features/3d")
    @Operation(summary = "Get 3D cinema rooms", description = "Retrieve cinema rooms with 3D capability")
    public ResponseEntity<List<CinemaRoomResponse>> get3DCinemaRooms() {
        log.info("Fetching 3D cinema rooms");
        
        List<CinemaRoomResponse> rooms = cinemaRoomService.getCinemaRoomsWith3D();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/features/dolby-atmos")
    @Operation(summary = "Get Dolby Atmos cinema rooms", description = "Retrieve cinema rooms with Dolby Atmos")
    public ResponseEntity<List<CinemaRoomResponse>> getDolbyAtmosCinemaRooms() {
        log.info("Fetching Dolby Atmos cinema rooms");
        
        List<CinemaRoomResponse> rooms = cinemaRoomService.getCinemaRoomsWithDolbyAtmos();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/features/recliner")
    @Operation(summary = "Get recliner seat cinema rooms", description = "Retrieve cinema rooms with recliner seats")
    public ResponseEntity<List<CinemaRoomResponse>> getReclinerCinemaRooms() {
        log.info("Fetching recliner seat cinema rooms");
        
        List<CinemaRoomResponse> rooms = cinemaRoomService.getCinemaRoomsWithReclinerSeats();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/capacity")
    @Operation(summary = "Get cinema rooms by seat capacity", description = "Retrieve cinema rooms by seat capacity range")
    public ResponseEntity<List<CinemaRoomResponse>> getCinemaRoomsByCapacity(
            @RequestParam(required = false) Integer minSeats,
            @RequestParam(required = false) Integer maxSeats) {
        
        log.info("Fetching cinema rooms by capacity - min: {}, max: {}", minSeats, maxSeats);
        
        List<CinemaRoomResponse> rooms = cinemaRoomService.getCinemaRoomsBySeatsRange(minSeats, maxSeats);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/available")
    @Operation(summary = "Get available cinema rooms", description = "Get available cinema rooms for specific time slot")
    public ResponseEntity<List<CinemaRoomResponse>> getAvailableCinemaRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate showDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime) {
        
        log.info("Fetching available cinema rooms for {} from {} to {}", showDate, startTime, endTime);
        
        List<CinemaRoomResponse> rooms = cinemaRoomService.getAvailableCinemaRooms(showDate, startTime, endTime);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/premium")
    @Operation(summary = "Get premium cinema rooms", description = "Retrieve premium cinema rooms (VIP, IMAX, 4DX)")
    public ResponseEntity<List<CinemaRoomResponse>> getPremiumCinemaRooms() {
        log.info("Fetching premium cinema rooms");
        
        List<CinemaRoomResponse> rooms = cinemaRoomService.getPremiumCinemaRooms();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get cinema room statistics", description = "Get cinema room statistics (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<CinemaRoomService.CinemaRoomStatistics> getCinemaRoomStatistics() {
        log.info("Fetching cinema room statistics");
        
        CinemaRoomService.CinemaRoomStatistics statistics = cinemaRoomService.getCinemaRoomStatistics();
        return ResponseEntity.ok(statistics);
    }

    // Seat Management Endpoints
    @GetMapping("/{id}/seats")
    @Operation(summary = "Get seat layout", description = "Get seat layout for cinema room")
    public ResponseEntity<List<SeatResponse>> getSeatLayout(@PathVariable Long id) {
        log.info("Fetching seat layout for cinema room ID: {}", id);
        
        List<SeatResponse> seats = cinemaRoomService.getSeatLayout(id);
        return ResponseEntity.ok(seats);
    }

    @PostMapping("/{id}/seats/generate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate default seat layout", description = "Generate default seat layout for cinema room (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<SeatResponse>> generateDefaultSeatLayout(@PathVariable Long id) {
        log.info("Generating default seat layout for cinema room ID: {}", id);
        
        List<SeatResponse> seats = cinemaRoomService.generateDefaultSeatLayout(id);
        return ResponseEntity.ok(seats);
    }

    @PostMapping("/seats/layout")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create custom seat layout", description = "Create custom seat layout for cinema room (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<SeatResponse>> createSeatLayout(@RequestBody SeatLayoutRequest request) {
        log.info("Creating custom seat layout for cinema room ID: {}", request.getCinemaRoomId());
        
        List<SeatResponse> seats = cinemaRoomService.createSeatLayout(request);
        return ResponseEntity.ok(seats);
    }

    @PostMapping("/{id}/seats/reset")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reset seat layout", description = "Reset seat layout for cinema room (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<SeatResponse>> resetSeatLayout(@PathVariable Long id) {
        log.info("Resetting seat layout for cinema room ID: {}", id);
        
        List<SeatResponse> seats = cinemaRoomService.resetSeatLayout(id);
        return ResponseEntity.ok(seats);
    }
} 
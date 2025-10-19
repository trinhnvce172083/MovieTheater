package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.cinema.*;
import com.swp.MovieTheaterService.dto.response.ApiResponse;
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
import java.util.Map;

/**
 * Cinema Room Controller
 * REST API endpoints for cinema room management
 * 
 * @author Ngo Viet Trinh
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
    public ResponseEntity<ApiResponse<CinemaRoomResponse>> createCinemaRoom(@RequestBody CinemaRoomCreateRequest request) {
        log.info("Creating new cinema room: {}", request.getCinemaRoomName());
        
        CinemaRoomResponse response = cinemaRoomService.createCinemaRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Tạo phòng chiếu thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update cinema room", description = "Update an existing cinema room (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<CinemaRoomResponse>> updateCinemaRoom(
            @PathVariable Long id,
            @RequestBody CinemaRoomUpdateRequest request) {
        log.info("Updating cinema room with ID: {}", id);
        
        CinemaRoomResponse response = cinemaRoomService.updateCinemaRoom(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phòng chiếu thành công", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get cinema room by ID", description = "Retrieve cinema room details by ID")
    public ResponseEntity<ApiResponse<CinemaRoomResponse>> getCinemaRoom(@PathVariable Long id) {
        log.info("Fetching cinema room with ID: {}", id);
        
        CinemaRoomResponse response = cinemaRoomService.getCinemaRoomById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin phòng chiếu thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete cinema room", description = "Delete a cinema room (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<String>> deleteCinemaRoom(@PathVariable Long id) {
        log.info("Deleting cinema room with ID: {}", id);
        
        cinemaRoomService.deleteCinemaRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phòng chiếu thành công", null));
    }

    @GetMapping
    @Operation(summary = "Get all cinema rooms", description = "Retrieve all cinema rooms with pagination")
    public ResponseEntity<ApiResponse<Page<CinemaRoomResponse>>> getAllCinemaRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "cinemaRoomName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        log.info("Fetching cinema rooms - page: {}, size: {}", page, size);
        
        // Handle backward compatibility: map "roomName" to "cinemaRoomName"
        if ("roomName".equals(sortBy)) {
            sortBy = "cinemaRoomName";
            log.info("Mapped deprecated sortBy 'roomName' to 'cinemaRoomName'");
        }
        
        Sort sort = Sort.by(sortDirection.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<CinemaRoomResponse> rooms = cinemaRoomService.getAllCinemaRooms(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phòng chiếu thành công", rooms));
    }

    @GetMapping("/search")
    @Operation(summary = "Search cinema rooms", description = "Search cinema rooms by keyword")
    public ResponseEntity<ApiResponse<Page<CinemaRoomResponse>>> searchCinemaRooms(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Searching cinema rooms with keyword: {}", keyword);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CinemaRoomResponse> rooms = cinemaRoomService.searchCinemaRooms(keyword, pageable);

        ApiResponse<Page<CinemaRoomResponse>> apiResponse = ApiResponse.<Page<CinemaRoomResponse>>builder()
                .success(true)
                .message("Tìm kiếm phòng chiếu thành công")
                .data(rooms)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get cinema rooms by type", description = "Retrieve cinema rooms filtered by type")
    public ResponseEntity<ApiResponse<List<CinemaRoomResponse>>> getCinemaRoomsByType(@PathVariable String type) {
        log.info("Fetching cinema rooms by type: {}", type);
        
        List<CinemaRoomResponse> rooms = cinemaRoomService.getCinemaRoomsByType(type);

        ApiResponse<List<CinemaRoomResponse>> apiResponse = ApiResponse.<List<CinemaRoomResponse>>builder()
                .success(true)
                .message("Lấy danh sách phòng chiếu theo loại thành công")
                .data(rooms)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/features/3d")
    @Operation(summary = "Get 3D cinema rooms", description = "Retrieve cinema rooms with 3D capability")
    public ResponseEntity<ApiResponse<List<CinemaRoomResponse>>> get3DCinemaRooms() {
        log.info("Fetching 3D cinema rooms");
        
        List<CinemaRoomResponse> rooms = cinemaRoomService.getCinemaRoomsWith3D();

        ApiResponse<List<CinemaRoomResponse>> apiResponse = ApiResponse.<List<CinemaRoomResponse>>builder()
                .success(true)
                .message("Lấy danh sách phòng chiếu 3D thành công")
                .data(rooms)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/features/dolby-atmos")
    @Operation(summary = "Get Dolby Atmos cinema rooms", description = "Retrieve cinema rooms with Dolby Atmos")
    public ResponseEntity<ApiResponse<List<CinemaRoomResponse>>> getDolbyAtmosCinemaRooms() {
        log.info("Fetching Dolby Atmos cinema rooms");
        
        List<CinemaRoomResponse> rooms = cinemaRoomService.getCinemaRoomsWithDolbyAtmos();

        ApiResponse<List<CinemaRoomResponse>> apiResponse = ApiResponse.<List<CinemaRoomResponse>>builder()
                .success(true)
                .message("Lấy danh sách phòng chiếu Dolby Atmos thành công")
                .data(rooms)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/features/recliner")
    @Operation(summary = "Get recliner seat cinema rooms", description = "Retrieve cinema rooms with recliner seats")
    public ResponseEntity<ApiResponse<List<CinemaRoomResponse>>> getReclinerCinemaRooms() {
        log.info("Fetching recliner seat cinema rooms");
        
        List<CinemaRoomResponse> rooms = cinemaRoomService.getCinemaRoomsWithReclinerSeats();

        ApiResponse<List<CinemaRoomResponse>> apiResponse = ApiResponse.<List<CinemaRoomResponse>>builder()
                .success(true)
                .message("Lấy danh sách phòng chiếu ghế nằm thành công")
                .data(rooms)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/capacity")
    @Operation(summary = "Get cinema rooms by seat capacity", description = "Retrieve cinema rooms by seat capacity range")
    public ResponseEntity<ApiResponse<List<CinemaRoomResponse>>> getCinemaRoomsByCapacity(
            @RequestParam(required = false) Integer minSeats,
            @RequestParam(required = false) Integer maxSeats) {
        
        log.info("Fetching cinema rooms by capacity - min: {}, max: {}", minSeats, maxSeats);
        
        List<CinemaRoomResponse> rooms = cinemaRoomService.getCinemaRoomsBySeatsRange(minSeats, maxSeats);

        ApiResponse<List<CinemaRoomResponse>> apiResponse = ApiResponse.<List<CinemaRoomResponse>>builder()
                .success(true)
                .message("Lấy danh sách phòng chiếu theo sức chứa thành công")
                .data(rooms)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/available")
    @Operation(summary = "Get available cinema rooms", description = "Get available cinema rooms for specific time slot")
    public ResponseEntity<ApiResponse<List<CinemaRoomResponse>>> getAvailableCinemaRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate showDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime) {
        
        log.info("Fetching available cinema rooms for {} from {} to {}", showDate, startTime, endTime);
        
        List<CinemaRoomResponse> rooms = cinemaRoomService.getAvailableCinemaRooms(showDate, startTime, endTime);

        ApiResponse<List<CinemaRoomResponse>> apiResponse = ApiResponse.<List<CinemaRoomResponse>>builder()
                .success(true)
                .message("Lấy danh sách phòng chiếu có sẵn thành công")
                .data(rooms)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/premium")
    @Operation(summary = "Get premium cinema rooms", description = "Retrieve premium cinema rooms (VIP, IMAX, 4DX)")
    public ResponseEntity<ApiResponse<List<CinemaRoomResponse>>> getPremiumCinemaRooms() {
        log.info("Fetching premium cinema rooms");
        
        List<CinemaRoomResponse> rooms = cinemaRoomService.getPremiumCinemaRooms();

        ApiResponse<List<CinemaRoomResponse>> apiResponse = ApiResponse.<List<CinemaRoomResponse>>builder()
                .success(true)
                .message("Lấy danh sách phòng chiếu cao cấp thành công")
                .data(rooms)
                .build();

        return ResponseEntity.ok(apiResponse);
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

    // ==================== SEAT STATUS ENDPOINTS ====================
    
    @GetMapping("/{id}/seats/booked")
    @Operation(summary = "Get booked seats", description = "Get list of seats that are currently booked (OCCUPIED status)")
    public ResponseEntity<List<SeatResponse>> getBookedSeats(@PathVariable Long id) {
        log.info("Getting booked seats for cinema room ID: {}", id);
        
        List<SeatResponse> bookedSeats = cinemaRoomService.getBookedSeats(id);
        return ResponseEntity.ok(bookedSeats);
    }
    
    @GetMapping("/{id}/seats/available")
    @Operation(summary = "Get available seats", description = "Get list of seats that are currently available")
    public ResponseEntity<List<SeatResponse>> getAvailableSeats(@PathVariable Long id) {
        log.info("Getting available seats for cinema room ID: {}", id);
        
        List<SeatResponse> availableSeats = cinemaRoomService.getAvailableSeats(id);
        return ResponseEntity.ok(availableSeats);
    }
    
    @GetMapping("/{id}/seats/status")
    @Operation(summary = "Get seat status overview", description = "Get overview of seat statuses in cinema room")
    public ResponseEntity<Map<String, Object>> getSeatStatusOverview(@PathVariable Long id) {
        log.info("Getting seat status overview for cinema room ID: {}", id);
        
        Map<String, Object> overview = cinemaRoomService.getSeatStatusOverview(id);
        return ResponseEntity.ok(overview);
    }
} 

package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.schedule.*;
import com.swp.MovieTheaterService.service.ScheduleService;
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
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Schedule Controller
 * REST API endpoints for movie schedule management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Schedule Management", description = "APIs for managing movie schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new schedule", description = "Create a new movie schedule (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ScheduleResponse> createSchedule(@RequestBody ScheduleCreateRequest request) {
        log.info("Creating new schedule for movie: {}", request.getMovieId());
        
        ScheduleResponse response = scheduleService.createSchedule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update schedule", description = "Update an existing schedule (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ScheduleResponse> updateSchedule(
            @PathVariable Long id,
            @RequestBody ScheduleUpdateRequest request) {
        log.info("Updating schedule with ID: {}", id);
        
        ScheduleResponse response = scheduleService.updateSchedule(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get schedule by ID", description = "Retrieve schedule details by ID")
    public ResponseEntity<ScheduleResponse> getSchedule(@PathVariable Long id) {
        log.info("Fetching schedule with ID: {}", id);
        
        ScheduleResponse response = scheduleService.getScheduleById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete schedule", description = "Delete a schedule (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        log.info("Deleting schedule with ID: {}", id);
        
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get all schedules", description = "Retrieve all schedules with pagination")
    public ResponseEntity<Page<ScheduleSummaryResponse>> getAllSchedules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "showDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        log.info("Fetching schedules - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(sortDirection.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ScheduleSummaryResponse> schedules = scheduleService.getAllSchedulesSummary(pageable);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/movie/{movieId}")
    @Operation(summary = "Get schedules by movie", description = "Retrieve schedules for a specific movie")
    public ResponseEntity<List<ScheduleSummaryResponse>> getSchedulesByMovie(
            @PathVariable Long movieId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        
        log.info("Fetching schedules for movie ID: {}", movieId);
        
        List<ScheduleSummaryResponse> schedules = scheduleService.getSchedulesByMovieId(movieId, fromDate, toDate);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/room/{roomId}")
    @Operation(summary = "Get schedules by room", description = "Retrieve schedules for a specific room")
    public ResponseEntity<List<ScheduleSummaryResponse>> getSchedulesByRoom(
            @PathVariable Long roomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        
        log.info("Fetching schedules for room ID: {}", roomId);
        
        List<ScheduleSummaryResponse> schedules = scheduleService.getSchedulesByRoomId(roomId, fromDate, toDate);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/date/{date}")
    @Operation(summary = "Get schedules by date", description = "Retrieve schedules for a specific date")
    public ResponseEntity<List<ScheduleSummaryResponse>> getSchedulesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        log.info("Fetching schedules for date: {}", date);
        
        List<ScheduleSummaryResponse> schedules = scheduleService.getSchedulesByDateSummary(date);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get schedules by date range", description = "Retrieve schedules within a date range")
    public ResponseEntity<Page<ScheduleSummaryResponse>> getSchedulesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Fetching schedules from {} to {}", fromDate, toDate);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "showDate", "showTime"));
        Page<ScheduleSummaryResponse> schedules = scheduleService.getSchedulesByDateRangeSummary(fromDate, toDate, pageable);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/available-seats/{scheduleId}")
    @Operation(summary = "Get available seats", description = "Get available seats for a specific schedule")
    public ResponseEntity<SeatAvailabilityResponse> getAvailableSeats(@PathVariable Long scheduleId) {
        log.info("Fetching available seats for schedule ID: {}", scheduleId);
        
        SeatAvailabilityResponse response = scheduleService.getAvailableSeats(scheduleId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming schedules", description = "Retrieve upcoming movie schedules")
    public ResponseEntity<List<ScheduleSummaryResponse>> getUpcomingSchedules(
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Fetching upcoming schedules for next {} days, limit: {}", days, limit);
        
        List<ScheduleSummaryResponse> schedules = scheduleService.getUpcomingSchedules(days, limit);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/popular-times")
    @Operation(summary = "Get popular showtimes", description = "Get most popular showtimes based on bookings")
    public ResponseEntity<List<PopularShowtimeResponse>> getPopularShowtimes() {
        log.info("Fetching popular showtimes");
        
        List<PopularShowtimeResponse> showtimes = scheduleService.getPopularShowtimes();
        return ResponseEntity.ok(showtimes);
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get schedule statistics", description = "Get schedule statistics (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ScheduleService.ScheduleStatistics> getScheduleStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        
        log.info("Fetching schedule statistics from {} to {}", fromDate, toDate);
        
        ScheduleService.ScheduleStatistics statistics = scheduleService.getScheduleStatistics(fromDate, toDate);
        return ResponseEntity.ok(statistics);
    }
} 
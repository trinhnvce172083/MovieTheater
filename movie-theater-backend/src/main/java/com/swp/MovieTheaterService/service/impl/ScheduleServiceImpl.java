package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.schedule.*;
import com.swp.MovieTheaterService.entity.CinemaRoom;
import com.swp.MovieTheaterService.entity.Movie;
import com.swp.MovieTheaterService.entity.Schedule;
import com.swp.MovieTheaterService.exception.BadRequestException;
import com.swp.MovieTheaterService.exception.ConflictException;
import com.swp.MovieTheaterService.exception.NotFoundException;
import com.swp.MovieTheaterService.mapper.ScheduleMapper;
import com.swp.MovieTheaterService.repository.CinemaRoomRepository;
import com.swp.MovieTheaterService.repository.MovieRepository;
import com.swp.MovieTheaterService.repository.ScheduleRepository;
import com.swp.MovieTheaterService.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Schedule Service Implementation
 * Business logic implementation for schedule management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final MovieRepository movieRepository;
    private final CinemaRoomRepository cinemaRoomRepository;
    private final ScheduleMapper scheduleMapper;

    @Override
    public ScheduleResponse createSchedule(ScheduleCreateRequest request) {
        log.info("Creating new schedule for movie ID: {} in cinema room ID: {}", 
                request.getMovieId(), request.getCinemaRoomId());

        // Validate time
        if (!request.isTimeValid()) {
            throw new BadRequestException("Giờ kết thúc phải sau giờ bắt đầu");
        }

        // Validate date
        if (!request.isValidScheduleDate()) {
            throw new BadRequestException("Ngày chiếu phải là hôm nay hoặc trong tương lai");
        }

        // Get movie and cinema room
        Movie movie = findMovieById(request.getMovieId());
        CinemaRoom cinemaRoom = findCinemaRoomById(request.getCinemaRoomId());

        // Check for schedule conflicts
        if (hasScheduleConflict(request.getCinemaRoomId(), request.getShowDate(), 
                               request.getStartTime(), request.getEndTime())) {
            throw new ConflictException("Phòng chiếu đã có lịch chiếu trong khoảng thời gian này");
        }

        // Convert DTO to entity
        Schedule schedule = scheduleMapper.toEntity(request);
        schedule.setMovie(movie);
        schedule.setCinemaRoom(cinemaRoom);
        schedule.setAvailableSeats(cinemaRoom.getSeatQuantity());
        schedule.setBookedSeats(0);

        // Save schedule
        Schedule savedSchedule = scheduleRepository.save(schedule);
        log.info("Schedule created successfully with ID: {}", savedSchedule.getScheduleId());

        return scheduleMapper.toResponse(savedSchedule);
    }

    @Override
    public ScheduleResponse updateSchedule(Long scheduleId, ScheduleUpdateRequest request) {
        log.info("Updating schedule with ID: {}", scheduleId);

        Schedule schedule = findScheduleById(scheduleId);

        // Check if schedule can be updated
        if (!schedule.isScheduled()) {
            throw new BadRequestException("Chỉ có thể cập nhật lịch chiếu ở trạng thái 'Đã lên lịch'");
        }

        // Validate time if provided
        if (!request.isTimeValid()) {
            throw new BadRequestException("Giờ kết thúc phải sau giờ bắt đầu");
        }

        // Validate date if provided
        if (!request.isValidScheduleDate()) {
            throw new BadRequestException("Ngày chiếu phải là hôm nay hoặc trong tương lai");
        }

        // Check for conflicts if time/date is being changed
        if (request.getShowDate() != null || request.getStartTime() != null || request.getEndTime() != null) {
            LocalDate newDate = request.getShowDate() != null ? request.getShowDate() : schedule.getShowDate();
            LocalTime newStartTime = request.getStartTime() != null ? request.getStartTime() : schedule.getStartTime();
            LocalTime newEndTime = request.getEndTime() != null ? request.getEndTime() : schedule.getEndTime();

            if (hasScheduleConflict(schedule.getCinemaRoom().getCinemaRoomId(), newDate, 
                                   newStartTime, newEndTime, scheduleId)) {
                throw new ConflictException("Phòng chiếu đã có lịch chiếu trong khoảng thời gian này");
            }
        }

        // Update schedule
        scheduleMapper.updateEntity(schedule, request);
        Schedule updatedSchedule = scheduleRepository.save(schedule);
        log.info("Schedule updated successfully with ID: {}", updatedSchedule.getScheduleId());

        return scheduleMapper.toResponse(updatedSchedule);
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleResponse getScheduleById(Long scheduleId) {
        log.info("Getting schedule by ID: {}", scheduleId);
        Schedule schedule = findScheduleById(scheduleId);
        return scheduleMapper.toResponse(schedule);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScheduleResponse> getAllSchedules(Pageable pageable) {
        log.info("Getting all schedules with pagination: page={}, size={}", 
                pageable.getPageNumber(), pageable.getPageSize());
        Page<Schedule> schedules = scheduleRepository.findAll(pageable);
        return schedules.map(scheduleMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedulesByMovie(Long movieId) {
        log.info("Getting schedules by movie ID: {}", movieId);
        List<Schedule> schedules = scheduleRepository.findByMovieMovieIdAndIsActiveTrue(movieId);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScheduleResponse> getSchedulesByMovie(Long movieId, Pageable pageable) {
        log.info("Getting schedules by movie ID: {} with pagination", movieId);
        Page<Schedule> schedules = scheduleRepository.findByMovieMovieIdAndIsActiveTrue(movieId, pageable);
        return schedules.map(scheduleMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedulesByCinemaRoom(Long cinemaRoomId) {
        log.info("Getting schedules by cinema room ID: {}", cinemaRoomId);
        List<Schedule> schedules = scheduleRepository.findByCinemaRoomCinemaRoomIdAndIsActiveTrue(cinemaRoomId);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScheduleResponse> getSchedulesByCinemaRoom(Long cinemaRoomId, Pageable pageable) {
        log.info("Getting schedules by cinema room ID: {} with pagination", cinemaRoomId);
        Page<Schedule> schedules = scheduleRepository.findByCinemaRoomCinemaRoomIdAndIsActiveTrue(cinemaRoomId, pageable);
        return schedules.map(scheduleMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedulesByDate(LocalDate showDate) {
        log.info("Getting schedules by date: {}", showDate);
        List<Schedule> schedules = scheduleRepository.findByShowDateAndIsActiveTrue(showDate);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScheduleResponse> getSchedulesByDate(LocalDate showDate, Pageable pageable) {
        log.info("Getting schedules by date: {} with pagination", showDate);
        Page<Schedule> schedules = scheduleRepository.findByShowDateAndIsActiveTrue(showDate, pageable);
        return schedules.map(scheduleMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedulesByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Getting schedules by date range: {} to {}", startDate, endDate);
        List<Schedule> schedules = scheduleRepository.findByShowDateBetweenAndIsActiveTrue(startDate, endDate);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScheduleResponse> getSchedulesByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        log.info("Getting schedules by date range: {} to {} with pagination", startDate, endDate);
        Page<Schedule> schedules = scheduleRepository.findByShowDateBetweenAndIsActiveTrue(startDate, endDate, pageable);
        return schedules.map(scheduleMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedulesByStatus(String status) {
        log.info("Getting schedules by status: {}", status);
        List<Schedule> schedules = scheduleRepository.findByStatusAndIsActiveTrue(status);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScheduleResponse> getSchedulesByStatus(String status, Pageable pageable) {
        log.info("Getting schedules by status: {} with pagination", status);
        Page<Schedule> schedules = scheduleRepository.findByStatusAndIsActiveTrue(status, pageable);
        return schedules.map(scheduleMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedulesByMovieAndDate(Long movieId, LocalDate showDate) {
        log.info("Getting schedules by movie ID: {} and date: {}", movieId, showDate);
        List<Schedule> schedules = scheduleRepository.findByMovieMovieIdAndShowDateAndIsActiveTrue(movieId, showDate);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedulesByCinemaRoomAndDate(Long cinemaRoomId, LocalDate showDate) {
        log.info("Getting schedules by cinema room ID: {} and date: {}", cinemaRoomId, showDate);
        List<Schedule> schedules = scheduleRepository.findByCinemaRoomCinemaRoomIdAndShowDateAndIsActiveTrue(cinemaRoomId, showDate);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScheduleResponse> searchSchedules(String keyword, Pageable pageable) {
        log.info("Searching schedules with keyword: {}", keyword);
        Page<Schedule> schedules = scheduleRepository.searchSchedules(keyword, pageable);
        return schedules.map(scheduleMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getAvailableSchedules() {
        log.info("Getting available schedules");
        List<Schedule> schedules = scheduleRepository.findAvailableSchedules(LocalDate.now());
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScheduleResponse> getAvailableSchedules(Pageable pageable) {
        log.info("Getting available schedules with pagination");
        List<Schedule> schedules = scheduleRepository.findAvailableSchedules(LocalDate.now());
        // Convert to page manually since repository method returns List
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), schedules.size());
        List<ScheduleResponse> pageContent = schedules.subList(start, end)
                .stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, schedules.size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> get3DSchedules() {
        log.info("Getting 3D schedules");
        List<Schedule> schedules = scheduleRepository.find3DSchedules();
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getIMAXSchedules() {
        log.info("Getting IMAX schedules");
        List<Schedule> schedules = scheduleRepository.findIMAXSchedules();
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> get4DXSchedules() {
        log.info("Getting 4DX schedules");
        List<Schedule> schedules = scheduleRepository.find4DXSchedules();
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedulesByTimeRange(LocalDate showDate, LocalTime startTime, LocalTime endTime) {
        log.info("Getting schedules by time range: {} {} - {}", showDate, startTime, endTime);
        List<Schedule> schedules = scheduleRepository.findSchedulesByTimeRange(showDate, startTime, endTime);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getTodaySchedules() {
        log.info("Getting today's schedules");
        List<Schedule> schedules = scheduleRepository.findTodaySchedules(LocalDate.now());
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getUpcomingSchedules() {
        log.info("Getting upcoming schedules");
        List<Schedule> schedules = scheduleRepository.findUpcomingSchedules(LocalDate.now());
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScheduleResponse> getUpcomingSchedules(Pageable pageable) {
        log.info("Getting upcoming schedules with pagination");
        List<Schedule> schedules = scheduleRepository.findUpcomingSchedules(LocalDate.now());
        // Convert to page manually
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), schedules.size());
        List<ScheduleResponse> pageContent = schedules.subList(start, end)
                .stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, schedules.size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getPastSchedules() {
        log.info("Getting past schedules");
        List<Schedule> schedules = scheduleRepository.findPastSchedules(LocalDate.now());
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScheduleResponse> getPastSchedules(Pageable pageable) {
        log.info("Getting past schedules with pagination");
        List<Schedule> schedules = scheduleRepository.findPastSchedules(LocalDate.now());
        // Convert to page manually
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), schedules.size());
        List<ScheduleResponse> pageContent = schedules.subList(start, end)
                .stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, schedules.size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedulesByPriceRange(Double minPrice, Double maxPrice) {
        log.info("Getting schedules by price range: {} - {}", minPrice, maxPrice);
        List<Schedule> schedules = scheduleRepository.findSchedulesByPriceRange(minPrice, maxPrice);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getPopularSchedules(Double minOccupancyRate) {
        log.info("Getting popular schedules with min occupancy rate: {}", minOccupancyRate);
        List<Schedule> schedules = scheduleRepository.findPopularSchedules(minOccupancyRate);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedulesBySubtitleLanguage(String language) {
        log.info("Getting schedules by subtitle language: {}", language);
        List<Schedule> schedules = scheduleRepository.findBySubtitleLanguageAndIsActiveTrue(language);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedulesByAudioLanguage(String language) {
        log.info("Getting schedules by audio language: {}", language);
        List<Schedule> schedules = scheduleRepository.findByAudioLanguageAndIsActiveTrue(language);
        return schedules.stream()
                .map(scheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ScheduleResponse cancelSchedule(Long scheduleId) {
        log.info("Cancelling schedule with ID: {}", scheduleId);
        Schedule schedule = findScheduleById(scheduleId);

        if (!schedule.isScheduled()) {
            throw new BadRequestException("Chỉ có thể hủy lịch chiếu ở trạng thái 'Đã lên lịch'");
        }

        if (schedule.getBookedSeats() > 0) {
            throw new BadRequestException("Không thể hủy lịch chiếu đã có khách đặt vé");
        }

        schedule.setStatus("CANCELLED");
        Schedule updatedSchedule = scheduleRepository.save(schedule);
        log.info("Schedule cancelled successfully with ID: {}", scheduleId);

        return scheduleMapper.toResponse(updatedSchedule);
    }

    @Override
    public ScheduleResponse completeSchedule(Long scheduleId) {
        log.info("Completing schedule with ID: {}", scheduleId);
        Schedule schedule = findScheduleById(scheduleId);

        if (!schedule.isOngoing()) {
            throw new BadRequestException("Chỉ có thể hoàn thành lịch chiếu ở trạng thái 'Đang chiếu'");
        }

        schedule.setStatus("COMPLETED");
        Schedule updatedSchedule = scheduleRepository.save(schedule);
        log.info("Schedule completed successfully with ID: {}", scheduleId);

        return scheduleMapper.toResponse(updatedSchedule);
    }

    @Override
    public ScheduleResponse startSchedule(Long scheduleId) {
        log.info("Starting schedule with ID: {}", scheduleId);
        Schedule schedule = findScheduleById(scheduleId);

        if (!schedule.isScheduled()) {
            throw new BadRequestException("Chỉ có thể bắt đầu lịch chiếu ở trạng thái 'Đã lên lịch'");
        }

        schedule.setStatus("ONGOING");
        Schedule updatedSchedule = scheduleRepository.save(schedule);
        log.info("Schedule started successfully with ID: {}", scheduleId);

        return scheduleMapper.toResponse(updatedSchedule);
    }

    @Override
    public void deleteSchedule(Long scheduleId) {
        log.info("Soft deleting schedule with ID: {}", scheduleId);
        Schedule schedule = findScheduleById(scheduleId);

        if (schedule.getBookedSeats() > 0) {
            throw new BadRequestException("Không thể xóa lịch chiếu đã có khách đặt vé");
        }

        schedule.setIsActive(false);
        scheduleRepository.save(schedule);
        log.info("Schedule soft deleted successfully with ID: {}", scheduleId);
    }

    @Override
    public ScheduleResponse restoreSchedule(Long scheduleId) {
        log.info("Restoring schedule with ID: {}", scheduleId);
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch chiếu với ID: " + scheduleId));

        schedule.setIsActive(true);
        Schedule restoredSchedule = scheduleRepository.save(schedule);
        log.info("Schedule restored successfully with ID: {}", scheduleId);

        return scheduleMapper.toResponse(restoredSchedule);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasScheduleConflict(Long cinemaRoomId, LocalDate showDate, LocalTime startTime, LocalTime endTime) {
        return hasScheduleConflict(cinemaRoomId, showDate, startTime, endTime, null);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasScheduleConflict(Long cinemaRoomId, LocalDate showDate, LocalTime startTime, LocalTime endTime, Long excludeScheduleId) {
        List<Schedule> overlappingSchedules = scheduleRepository.findOverlappingSchedules(cinemaRoomId, showDate, startTime, endTime);
        
        if (excludeScheduleId != null) {
            overlappingSchedules = overlappingSchedules.stream()
                    .filter(schedule -> !schedule.getScheduleId().equals(excludeScheduleId))
                    .collect(Collectors.toList());
        }
        
        return !overlappingSchedules.isEmpty();
    }

    @Override
    public ScheduleResponse bookSeats(Long scheduleId, Integer seatCount) {
        log.info("Booking {} seats for schedule ID: {}", seatCount, scheduleId);
        Schedule schedule = findScheduleById(scheduleId);

        if (!schedule.isBookable()) {
            throw new BadRequestException("Lịch chiếu này không thể đặt vé");
        }

        if (schedule.getAvailableSeats() < seatCount) {
            throw new BadRequestException("Không đủ ghế trống");
        }

        schedule.bookSeats(seatCount);
        Schedule updatedSchedule = scheduleRepository.save(schedule);
        log.info("Booked {} seats successfully for schedule ID: {}", seatCount, scheduleId);

        return scheduleMapper.toResponse(updatedSchedule);
    }

    @Override
    public ScheduleResponse cancelSeatBooking(Long scheduleId, Integer seatCount) {
        log.info("Cancelling {} seat bookings for schedule ID: {}", seatCount, scheduleId);
        Schedule schedule = findScheduleById(scheduleId);

        if (schedule.getBookedSeats() < seatCount) {
            throw new BadRequestException("Số ghế hủy vượt quá số ghế đã đặt");
        }

        schedule.cancelSeats(seatCount);
        Schedule updatedSchedule = scheduleRepository.save(schedule);
        log.info("Cancelled {} seat bookings successfully for schedule ID: {}", seatCount, scheduleId);

        return scheduleMapper.toResponse(updatedSchedule);
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleStatistics getScheduleStatistics() {
        log.info("Getting schedule statistics");
        return calculateStatistics(null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleStatistics getScheduleStatistics(LocalDate startDate, LocalDate endDate) {
        log.info("Getting schedule statistics for date range: {} to {}", startDate, endDate);
        return calculateStatistics(startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public Double getRevenue(LocalDate startDate, LocalDate endDate) {
        log.info("Getting revenue for date range: {} to {}", startDate, endDate);
        Double revenue = scheduleRepository.getTotalRevenue(startDate, endDate);
        return revenue != null ? revenue : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageOccupancyRate() {
        log.info("Getting average occupancy rate");
        Double rate = scheduleRepository.getAverageOccupancyRate();
        return rate != null ? rate * 100 : 0.0; // Convert to percentage
    }

    @Override
    public List<ScheduleResponse> bulkCreateSchedules(BulkScheduleCreateRequest request) {
        log.info("Bulk creating schedules for movie ID: {}", request.getMovieId());

        Movie movie = findMovieById(request.getMovieId());
        List<ScheduleResponse> createdSchedules = new ArrayList<>();

        for (BulkScheduleCreateRequest.ScheduleTimeSlot timeSlot : request.getTimeSlots()) {
            try {
                ScheduleCreateRequest scheduleRequest = new ScheduleCreateRequest();
                scheduleRequest.setMovieId(request.getMovieId());
                scheduleRequest.setCinemaRoomId(timeSlot.getCinemaRoomId());
                scheduleRequest.setShowDate(timeSlot.getShowDate());
                scheduleRequest.setStartTime(timeSlot.getStartTime());
                scheduleRequest.setEndTime(timeSlot.getEndTime());
                scheduleRequest.setPrice(timeSlot.getPrice());
                scheduleRequest.setIs3D(timeSlot.getIs3D());
                scheduleRequest.setIsIMAX(timeSlot.getIsIMAX());
                scheduleRequest.setIs4DX(timeSlot.getIs4DX());
                scheduleRequest.setSubtitleLanguage(timeSlot.getSubtitleLanguage());
                scheduleRequest.setAudioLanguage(timeSlot.getAudioLanguage());

                ScheduleResponse createdSchedule = createSchedule(scheduleRequest);
                createdSchedules.add(createdSchedule);
            } catch (Exception e) {
                log.warn("Failed to create schedule for time slot: {}, error: {}", timeSlot, e.getMessage());
                // Continue with other time slots
            }
        }

        log.info("Bulk created {} schedules out of {} requested", createdSchedules.size(), request.getTimeSlots().size());
        return createdSchedules;
    }

    // Helper methods
    private Schedule findScheduleById(Long scheduleId) {
        return scheduleRepository.findById(scheduleId)
                .filter(Schedule::getIsActive)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch chiếu với ID: " + scheduleId));
    }

    private Movie findMovieById(Long movieId) {
        return movieRepository.findById(movieId)
                .filter(Movie::getIsActive)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy phim với ID: " + movieId));
    }

    private CinemaRoom findCinemaRoomById(Long cinemaRoomId) {
        return cinemaRoomRepository.findById(cinemaRoomId)
                .filter(CinemaRoom::getIsActive)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng chiếu với ID: " + cinemaRoomId));
    }

    private ScheduleStatistics calculateStatistics(LocalDate startDate, LocalDate endDate) {
        List<Schedule> schedules;
        
        if (startDate != null && endDate != null) {
            schedules = scheduleRepository.findByShowDateBetweenAndIsActiveTrue(startDate, endDate);
        } else {
            schedules = scheduleRepository.findAll().stream()
                    .filter(Schedule::getIsActive)
                    .collect(Collectors.toList());
        }

        Long totalSchedules = (long) schedules.size();
        Long scheduledCount = schedules.stream().mapToLong(s -> s.isScheduled() ? 1 : 0).sum();
        Long ongoingCount = schedules.stream().mapToLong(s -> s.isOngoing() ? 1 : 0).sum();
        Long completedCount = schedules.stream().mapToLong(s -> s.isCompleted() ? 1 : 0).sum();
        Long cancelledCount = schedules.stream().mapToLong(s -> s.isCancelled() ? 1 : 0).sum();
        
        Long totalBookedSeats = schedules.stream().mapToLong(Schedule::getBookedSeats).sum();
        Long totalAvailableSeats = schedules.stream().mapToLong(Schedule::getAvailableSeats).sum();
        
        Double averageOccupancyRate = schedules.stream()
                .mapToDouble(Schedule::getOccupancyRate)
                .average()
                .orElse(0.0);
        
        Double totalRevenue = schedules.stream()
                .mapToDouble(s -> s.getPrice() * s.getBookedSeats())
                .sum();
        
        Long schedules3D = schedules.stream().mapToLong(s -> s.getIs3D() ? 1 : 0).sum();
        Long schedulesIMAX = schedules.stream().mapToLong(s -> s.getIsIMAX() ? 1 : 0).sum();
        Long schedules4DX = schedules.stream().mapToLong(s -> s.getIs4DX() ? 1 : 0).sum();
        
        Double averagePrice = schedules.stream()
                .mapToDouble(Schedule::getPrice)
                .average()
                .orElse(0.0);

        return new ScheduleStatistics(totalSchedules, scheduledCount, ongoingCount, completedCount, 
                                    cancelledCount, totalBookedSeats, totalAvailableSeats, averageOccupancyRate,
                                    totalRevenue, schedules3D, schedulesIMAX, schedules4DX, averagePrice);
    }
} 
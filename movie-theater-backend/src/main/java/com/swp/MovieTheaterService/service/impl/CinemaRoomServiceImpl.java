package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.cinema.*;
import com.swp.MovieTheaterService.entity.CinemaRoom;
import com.swp.MovieTheaterService.entity.Seat;
import com.swp.MovieTheaterService.enums.SeatStatus;
import com.swp.MovieTheaterService.exception.BadRequestException;
import com.swp.MovieTheaterService.exception.ConflictException;
import com.swp.MovieTheaterService.exception.NotFoundException;
import com.swp.MovieTheaterService.mapper.CinemaRoomMapper;
import com.swp.MovieTheaterService.mapper.SeatMapper;
import com.swp.MovieTheaterService.repository.CinemaRoomRepository;
import com.swp.MovieTheaterService.repository.SeatRepository;
import com.swp.MovieTheaterService.service.CinemaRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Cinema Room Service Implementation
 * Business logic implementation for cinema room management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CinemaRoomServiceImpl implements CinemaRoomService {

    private final CinemaRoomRepository cinemaRoomRepository;
    private final SeatRepository seatRepository;
    private final CinemaRoomMapper cinemaRoomMapper;
    private final SeatMapper seatMapper;

    @Override
    public CinemaRoomResponse createCinemaRoom(CinemaRoomCreateRequest request) {
        log.info("Creating new cinema room with name: {}", request.getCinemaRoomName());

        // Validate seat quantity
        if (!request.isSeatQuantityValid()) {
            throw new BadRequestException("Số lượng ghế không khớp với kích thước phòng (hàng x cột)");
        }

        // Check if cinema room name already exists
        if (cinemaRoomRepository.existsByCinemaRoomNameIgnoreCaseAndIsActiveTrue(request.getCinemaRoomName())) {
            throw new ConflictException("Phòng chiếu với tên '" + request.getCinemaRoomName() + "' đã tồn tại");
        }

        // Convert DTO to entity
        CinemaRoom cinemaRoom = cinemaRoomMapper.toEntity(request);

        // Save cinema room
        CinemaRoom savedCinemaRoom = cinemaRoomRepository.save(cinemaRoom);
        log.info("Cinema room created successfully with ID: {}", savedCinemaRoom.getCinemaRoomId());

        // Generate default seat layout
        generateDefaultSeatLayout(savedCinemaRoom.getCinemaRoomId());

        return cinemaRoomMapper.toResponse(savedCinemaRoom);
    }

    @Override
    public CinemaRoomResponse updateCinemaRoom(Long cinemaRoomId, CinemaRoomUpdateRequest request) {
        log.info("Updating cinema room with ID: {}", cinemaRoomId);

        CinemaRoom cinemaRoom = findCinemaRoomById(cinemaRoomId);

        // Check if name is being changed and already exists
        if (request.getCinemaRoomName() != null && 
            !request.getCinemaRoomName().equalsIgnoreCase(cinemaRoom.getCinemaRoomName())) {
            if (cinemaRoomRepository.existsByCinemaRoomNameIgnoreCaseAndIsActiveTrue(request.getCinemaRoomName())) {
                throw new ConflictException("Phòng chiếu với tên '" + request.getCinemaRoomName() + "' đã tồn tại");
            }
        }

        // Update cinema room
        cinemaRoomMapper.updateEntity(cinemaRoom, request);
        CinemaRoom updatedCinemaRoom = cinemaRoomRepository.save(cinemaRoom);
        log.info("Cinema room updated successfully with ID: {}", updatedCinemaRoom.getCinemaRoomId());

        return cinemaRoomMapper.toResponse(updatedCinemaRoom);
    }

    @Override
    @Transactional(readOnly = true)
    public CinemaRoomResponse getCinemaRoomById(Long cinemaRoomId) {
        log.info("Getting cinema room by ID: {}", cinemaRoomId);
        CinemaRoom cinemaRoom = findCinemaRoomById(cinemaRoomId);
        CinemaRoomResponse response = cinemaRoomMapper.toResponse(cinemaRoom);
        
        // Set seat counts
        setSeatCounts(response, cinemaRoomId);
        
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CinemaRoomResponse> getAllCinemaRooms(Pageable pageable) {
        log.info("Getting all cinema rooms with pagination: page={}, size={}", 
                pageable.getPageNumber(), pageable.getPageSize());
        Page<CinemaRoom> cinemaRooms = cinemaRoomRepository.findByIsActiveTrue(pageable);
        return cinemaRooms.map(room -> {
            CinemaRoomResponse response = cinemaRoomMapper.toResponse(room);
            setSeatCounts(response, room.getCinemaRoomId());
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<CinemaRoomResponse> getCinemaRoomsByType(String roomType) {
        log.info("Getting cinema rooms by type: {}", roomType);
        List<CinemaRoom> cinemaRooms = cinemaRoomRepository.findByRoomTypeAndIsActiveTrue(roomType);
        return cinemaRooms.stream()
                .map(room -> {
                    CinemaRoomResponse response = cinemaRoomMapper.toResponse(room);
                    setSeatCounts(response, room.getCinemaRoomId());
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CinemaRoomResponse> getCinemaRoomsByType(String roomType, Pageable pageable) {
        log.info("Getting cinema rooms by type with pagination: type={}, page={}, size={}", 
                roomType, pageable.getPageNumber(), pageable.getPageSize());
        Page<CinemaRoom> cinemaRooms = cinemaRoomRepository.findByRoomTypeAndIsActiveTrue(roomType, pageable);
        return cinemaRooms.map(room -> {
            CinemaRoomResponse response = cinemaRoomMapper.toResponse(room);
            setSeatCounts(response, room.getCinemaRoomId());
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CinemaRoomResponse> searchCinemaRooms(String keyword, Pageable pageable) {
        log.info("Searching cinema rooms with keyword: {}, page={}, size={}", 
                keyword, pageable.getPageNumber(), pageable.getPageSize());
        Page<CinemaRoom> cinemaRooms = cinemaRoomRepository.searchCinemaRooms(keyword, pageable);
        return cinemaRooms.map(room -> {
            CinemaRoomResponse response = cinemaRoomMapper.toResponse(room);
            setSeatCounts(response, room.getCinemaRoomId());
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<CinemaRoomResponse> getCinemaRoomsWith3D() {
        log.info("Getting cinema rooms with 3D");
        List<CinemaRoom> cinemaRooms = cinemaRoomRepository.findByHas3DTrueAndIsActiveTrue();
        return mapToResponseList(cinemaRooms);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CinemaRoomResponse> getCinemaRoomsWithDolbyAtmos() {
        log.info("Getting cinema rooms with Dolby Atmos");
        List<CinemaRoom> cinemaRooms = cinemaRoomRepository.findByHasDolbyAtmosTrueAndIsActiveTrue();
        return mapToResponseList(cinemaRooms);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CinemaRoomResponse> getCinemaRoomsWithReclinerSeats() {
        log.info("Getting cinema rooms with recliner seats");
        List<CinemaRoom> cinemaRooms = cinemaRoomRepository.findByHasReclinerSeatsTrueAndIsActiveTrue();
        return mapToResponseList(cinemaRooms);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CinemaRoomResponse> getCinemaRoomsBySeatsRange(Integer minSeats, Integer maxSeats) {
        log.info("Getting cinema rooms by seats range: {} to {}", minSeats, maxSeats);
        List<CinemaRoom> cinemaRooms = cinemaRoomRepository.findBySeatsRange(minSeats, maxSeats);
        return mapToResponseList(cinemaRooms);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CinemaRoomResponse> getAvailableCinemaRooms(LocalDate showDate, LocalTime startTime, LocalTime endTime) {
        log.info("Getting available cinema rooms for date: {}, time: {} - {}", showDate, startTime, endTime);
        List<CinemaRoom> cinemaRooms = cinemaRoomRepository.findAvailableRooms(showDate, startTime, endTime);
        return mapToResponseList(cinemaRooms);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CinemaRoomResponse> getPremiumCinemaRooms() {
        log.info("Getting premium cinema rooms");
        List<CinemaRoom> cinemaRooms = cinemaRoomRepository.findPremiumRooms();
        return mapToResponseList(cinemaRooms);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CinemaRoomResponse> getCinemaRoomsOrderByCapacity(boolean ascending) {
        log.info("Getting cinema rooms ordered by capacity: ascending={}", ascending);
        List<CinemaRoom> cinemaRooms = ascending ? 
                cinemaRoomRepository.findByIsActiveTrueOrderBySeatQuantityAsc() :
                cinemaRoomRepository.findByIsActiveTrueOrderBySeatQuantityDesc();
        return mapToResponseList(cinemaRooms);
    }

    @Override
    public void deleteCinemaRoom(Long cinemaRoomId) {
        log.info("Soft deleting cinema room with ID: {}", cinemaRoomId);
        CinemaRoom cinemaRoom = findCinemaRoomById(cinemaRoomId);
        cinemaRoom.setIsActive(false);
        cinemaRoomRepository.save(cinemaRoom);
        log.info("Cinema room soft deleted successfully with ID: {}", cinemaRoomId);
    }

    @Override
    public CinemaRoomResponse restoreCinemaRoom(Long cinemaRoomId) {
        log.info("Restoring cinema room with ID: {}", cinemaRoomId);
        CinemaRoom cinemaRoom = cinemaRoomRepository.findById(cinemaRoomId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng chiếu với ID: " + cinemaRoomId));
        cinemaRoom.setIsActive(true);
        CinemaRoom restoredCinemaRoom = cinemaRoomRepository.save(cinemaRoom);
        log.info("Cinema room restored successfully with ID: {}", cinemaRoomId);
        return cinemaRoomMapper.toResponse(restoredCinemaRoom);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isCinemaRoomNameExists(String cinemaRoomName) {
        return cinemaRoomRepository.existsByCinemaRoomNameIgnoreCaseAndIsActiveTrue(cinemaRoomName);
    }

    @Override
    @Transactional(readOnly = true)
    public CinemaRoomStatistics getCinemaRoomStatistics() {
        log.info("Getting cinema room statistics");
        
        Long totalRooms = cinemaRoomRepository.count();
        Long standardRooms = cinemaRoomRepository.countByRoomType("STANDARD");
        Long vipRooms = cinemaRoomRepository.countByRoomType("VIP");
        Long imaxRooms = cinemaRoomRepository.countByRoomType("IMAX");
        Long fourDXRooms = cinemaRoomRepository.countByRoomType("4DX");
        
        Long totalSeats = cinemaRoomRepository.getTotalSeatCapacity();
        Double averageSeats = cinemaRoomRepository.getAverageSeatCapacity();
        
        List<CinemaRoom> rooms3D = cinemaRoomRepository.findByHas3DTrueAndIsActiveTrue();
        List<CinemaRoom> roomsDolbyAtmos = cinemaRoomRepository.findByHasDolbyAtmosTrueAndIsActiveTrue();
        List<CinemaRoom> roomsRecliner = cinemaRoomRepository.findByHasReclinerSeatsTrueAndIsActiveTrue();
        
        List<CinemaRoom> allRooms = cinemaRoomRepository.findByIsActiveTrue();
        Double averagePriceMultiplier = allRooms.stream()
                .mapToDouble(CinemaRoom::getPriceMultiplier)
                .average()
                .orElse(0.0);

        return new CinemaRoomStatistics(totalRooms, standardRooms, vipRooms, imaxRooms, fourDXRooms,
                totalSeats != null ? totalSeats : 0L, averageSeats != null ? averageSeats : 0.0,
                (long) rooms3D.size(), (long) roomsDolbyAtmos.size(), (long) roomsRecliner.size(),
                averagePriceMultiplier);
    }

    @Override
    public List<SeatResponse> generateDefaultSeatLayout(Long cinemaRoomId) {
        log.info("Generating default seat layout for cinema room ID: {}", cinemaRoomId);
        
        CinemaRoom cinemaRoom = findCinemaRoomById(cinemaRoomId);
        
        // Delete existing seats
        seatRepository.deleteByCinemaRoomCinemaRoomId(cinemaRoomId);
        
        List<Seat> seats = new ArrayList<>();
        
        for (int row = 1; row <= cinemaRoom.getRows(); row++) {
            for (int col = 1; col <= cinemaRoom.getColumns(); col++) {
                Seat seat = new Seat();
                seat.setSeatRow(row);
                seat.setSeatColumn(col);
                seat.setSeatNumber(generateSeatNumber(row, col));
                seat.setSeatStatus(SeatStatus.AVAILABLE);
                seat.setSeatType(determineSeatType(row, cinemaRoom.getRows(), cinemaRoom.getRoomType()));
                seat.setIsActive(true);
                seat.setPriceMultiplier(determineSeatPriceMultiplier(seat.getSeatType()));
                seat.setIsRecliner(cinemaRoom.getHasReclinerSeats() && seat.getSeatType().equals("VIP"));
                seat.setHasTable(false);
                seat.setCinemaRoom(cinemaRoom);
                seat.setCreatedAt(LocalDateTime.now());
                seat.setUpdatedAt(LocalDateTime.now());
                
                seats.add(seat);
            }
        }
        
        List<Seat> savedSeats = seatRepository.saveAll(seats);
        log.info("Generated {} seats for cinema room ID: {}", savedSeats.size(), cinemaRoomId);
        
        return savedSeats.stream()
                .map(seatMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SeatResponse> createSeatLayout(SeatLayoutRequest request) {
        log.info("Creating custom seat layout for cinema room ID: {}", request.getCinemaRoomId());
        
        CinemaRoom cinemaRoom = findCinemaRoomById(request.getCinemaRoomId());
        
        // Delete existing seats
        seatRepository.deleteByCinemaRoomCinemaRoomId(request.getCinemaRoomId());
        
        List<Seat> seats = new ArrayList<>();
        
        for (SeatLayoutRequest.SeatCreateRequest seatRequest : request.getSeats()) {
            // Check if seat position is valid
            if (seatRequest.getSeatRow() > cinemaRoom.getRows() || 
                seatRequest.getSeatColumn() > cinemaRoom.getColumns()) {
                throw new BadRequestException("Vị trí ghế vượt quá kích thước phòng chiếu");
            }
            
            Seat seat = new Seat();
            seat.setSeatRow(seatRequest.getSeatRow());
            seat.setSeatColumn(seatRequest.getSeatColumn());
            seat.setSeatNumber(generateSeatNumber(seatRequest.getSeatRow(), seatRequest.getSeatColumn()));
            seat.setSeatStatus(SeatStatus.AVAILABLE);
            seat.setSeatType(seatRequest.getSeatType() != null ? seatRequest.getSeatType() : "STANDARD");
            seat.setIsActive(true);
            seat.setPriceMultiplier(seatRequest.getPriceMultiplier() != null ? seatRequest.getPriceMultiplier() : 1.0);
            seat.setIsRecliner(seatRequest.getIsRecliner() != null ? seatRequest.getIsRecliner() : false);
            seat.setHasTable(seatRequest.getHasTable() != null ? seatRequest.getHasTable() : false);
            seat.setCinemaRoom(cinemaRoom);
            seat.setCreatedAt(LocalDateTime.now());
            seat.setUpdatedAt(LocalDateTime.now());
            
            seats.add(seat);
        }
        
        List<Seat> savedSeats = seatRepository.saveAll(seats);
        log.info("Created {} custom seats for cinema room ID: {}", savedSeats.size(), request.getCinemaRoomId());
        
        return savedSeats.stream()
                .map(seatMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SeatResponse> resetSeatLayout(Long cinemaRoomId) {
        log.info("Resetting seat layout for cinema room ID: {}", cinemaRoomId);
        return generateDefaultSeatLayout(cinemaRoomId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatLayout(Long cinemaRoomId) {
        log.info("Getting seat layout for cinema room ID: {}", cinemaRoomId);
        List<Seat> seats = seatRepository.getSeatLayout(cinemaRoomId);
        return seats.stream()
                .map(seatMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SeatResponse> getSeatsByCinemaRoom(Long cinemaRoomId, Pageable pageable) {
        log.info("Getting seats by cinema room ID: {} with pagination", cinemaRoomId);
        Page<Seat> seats = seatRepository.findByCinemaRoomCinemaRoomIdAndIsActiveTrue(cinemaRoomId, pageable);
        return seats.map(seatMapper::toResponse);
    }

    // Helper methods
    private CinemaRoom findCinemaRoomById(Long cinemaRoomId) {
        return cinemaRoomRepository.findById(cinemaRoomId)
                .filter(CinemaRoom::getIsActive)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng chiếu với ID: " + cinemaRoomId));
    }

    private List<CinemaRoomResponse> mapToResponseList(List<CinemaRoom> cinemaRooms) {
        return cinemaRooms.stream()
                .map(room -> {
                    CinemaRoomResponse response = cinemaRoomMapper.toResponse(room);
                    setSeatCounts(response, room.getCinemaRoomId());
                    return response;
                })
                .collect(Collectors.toList());
    }

    private void setSeatCounts(CinemaRoomResponse response, Long cinemaRoomId) {
        Long availableSeats = seatRepository.countSeatsByStatus(cinemaRoomId, SeatStatus.AVAILABLE);
        Long occupiedSeats = seatRepository.countSeatsByStatus(cinemaRoomId, SeatStatus.OCCUPIED);
        Long maintenanceSeats = seatRepository.countSeatsByStatus(cinemaRoomId, SeatStatus.MAINTENANCE);
        
        response.setAvailableSeats(availableSeats != null ? availableSeats.intValue() : 0);
        response.setOccupiedSeats(occupiedSeats != null ? occupiedSeats.intValue() : 0);
        response.setMaintenanceSeats(maintenanceSeats != null ? maintenanceSeats.intValue() : 0);
    }

    private String generateSeatNumber(int row, int column) {
        char rowLetter = (char) ('A' + row - 1);
        return rowLetter + String.valueOf(column);
    }

    private String determineSeatType(int row, int totalRows, String roomType) {
        if ("VIP".equals(roomType)) {
            return "VIP";
        }
        
        // Last 2 rows are VIP for premium rooms
        if (("IMAX".equals(roomType) || "4DX".equals(roomType)) && row > totalRows - 2) {
            return "VIP";
        }
        
        // First row for wheelchair accessibility
        if (row == 1) {
            return "WHEELCHAIR";
        }
        
        return "STANDARD";
    }

    private Double determineSeatPriceMultiplier(String seatType) {
        switch (seatType) {
            case "VIP":
                return 1.5;
            case "COUPLE":
                return 1.3;
            case "WHEELCHAIR":
                return 1.0;
            default:
                return 1.0;
        }
    }
} 
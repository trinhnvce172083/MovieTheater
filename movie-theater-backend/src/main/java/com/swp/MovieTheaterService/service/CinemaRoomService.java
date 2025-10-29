package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.cinema.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Cinema Room Service Interface
 * Business logic for cinema room management
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public interface CinemaRoomService {

    /**
     * Create a new cinema room
     */
    CinemaRoomResponse createCinemaRoom(CinemaRoomCreateRequest request);

    /**
     * Update an existing cinema room
     */
    CinemaRoomResponse updateCinemaRoom(Long cinemaRoomId, CinemaRoomUpdateRequest request);

    /**
     * Get cinema room by ID
     */
    CinemaRoomResponse getCinemaRoomById(Long cinemaRoomId);

    /**
     * Get all active cinema rooms with pagination
     */
    Page<CinemaRoomResponse> getAllCinemaRooms(Pageable pageable);

    /**
     * Get cinema rooms by type
     */
    List<CinemaRoomResponse> getCinemaRoomsByType(String roomType);

    /**
     * Get cinema rooms by type with pagination
     */
    Page<CinemaRoomResponse> getCinemaRoomsByType(String roomType, Pageable pageable);

    /**
     * Search cinema rooms by keyword
     */
    Page<CinemaRoomResponse> searchCinemaRooms(String keyword, Pageable pageable);

    /**
     * Get cinema rooms by features
     */
    List<CinemaRoomResponse> getCinemaRoomsWith3D();
    List<CinemaRoomResponse> getCinemaRoomsWithDolbyAtmos();
    List<CinemaRoomResponse> getCinemaRoomsWithReclinerSeats();

    /**
     * Get cinema rooms by seat capacity range
     */
    List<CinemaRoomResponse> getCinemaRoomsBySeatsRange(Integer minSeats, Integer maxSeats);

    /**
     * Get available cinema rooms for specific time slot
     */
    List<CinemaRoomResponse> getAvailableCinemaRooms(LocalDate showDate, LocalTime startTime, LocalTime endTime);

    /**
     * Get premium cinema rooms (VIP, IMAX, 4DX)
     */
    List<CinemaRoomResponse> getPremiumCinemaRooms();

    /**
     * Get cinema rooms ordered by seat capacity
     */
    List<CinemaRoomResponse> getCinemaRoomsOrderByCapacity(boolean ascending);

    /**
     * Soft delete cinema room (set isActive = false)
     */
    void deleteCinemaRoom(Long cinemaRoomId);

    /**
     * Restore deleted cinema room (set isActive = true)
     */
    CinemaRoomResponse restoreCinemaRoom(Long cinemaRoomId);

    /**
     * Check if cinema room name exists
     */
    boolean isCinemaRoomNameExists(String cinemaRoomName);

    /**
     * Get cinema room statistics
     */
    CinemaRoomStatistics getCinemaRoomStatistics();

    /**
     * Generate default seat layout for cinema room
     */
    List<SeatResponse> generateDefaultSeatLayout(Long cinemaRoomId);

    /**
     * Create custom seat layout for cinema room
     */
    List<SeatResponse> createSeatLayout(SeatLayoutRequest request);

    /**
     * Reset seat layout (delete all seats and regenerate)
     */
    List<SeatResponse> resetSeatLayout(Long cinemaRoomId);

    /**
     * Get seat layout for cinema room
     */
    List<SeatResponse> getSeatLayout(Long cinemaRoomId);

    /**
     * Get seats by cinema room with pagination
     */
    Page<SeatResponse> getSeatsByCinemaRoom(Long cinemaRoomId, Pageable pageable);

    // ==================== SEAT STATUS METHODS ====================
    
    /**
     * Get booked seats (OCCUPIED status) for cinema room
     */
    List<SeatResponse> getBookedSeats(Long cinemaRoomId);
    
    /**
     * Get available seats for cinema room
     */
    List<SeatResponse> getAvailableSeats(Long cinemaRoomId);
    
    /**
     * Get seat status overview for cinema room
     */
    java.util.Map<String, Object> getSeatStatusOverview(Long cinemaRoomId);

    /**
     * Inner class for cinema room statistics
     */
    class CinemaRoomStatistics {
        private Long totalRooms;
        private Long standardRooms;
        private Long vipRooms;
        private Long imaxRooms;
        private Long fourDXRooms;
        private Long totalSeats;
        private Double averageSeats;
        private Long rooms3D;
        private Long roomsDolbyAtmos;
        private Long roomsRecliner;
        private Double averagePriceMultiplier;

        // Constructors, getters, setters
        public CinemaRoomStatistics() {}

        public CinemaRoomStatistics(Long totalRooms, Long standardRooms, Long vipRooms, Long imaxRooms, 
                                   Long fourDXRooms, Long totalSeats, Double averageSeats, Long rooms3D, 
                                   Long roomsDolbyAtmos, Long roomsRecliner, Double averagePriceMultiplier) {
            this.totalRooms = totalRooms;
            this.standardRooms = standardRooms;
            this.vipRooms = vipRooms;
            this.imaxRooms = imaxRooms;
            this.fourDXRooms = fourDXRooms;
            this.totalSeats = totalSeats;
            this.averageSeats = averageSeats;
            this.rooms3D = rooms3D;
            this.roomsDolbyAtmos = roomsDolbyAtmos;
            this.roomsRecliner = roomsRecliner;
            this.averagePriceMultiplier = averagePriceMultiplier;
        }

        // Getters and setters
        public Long getTotalRooms() { return totalRooms; }
        public void setTotalRooms(Long totalRooms) { this.totalRooms = totalRooms; }

        public Long getStandardRooms() { return standardRooms; }
        public void setStandardRooms(Long standardRooms) { this.standardRooms = standardRooms; }

        public Long getVipRooms() { return vipRooms; }
        public void setVipRooms(Long vipRooms) { this.vipRooms = vipRooms; }

        public Long getImaxRooms() { return imaxRooms; }
        public void setImaxRooms(Long imaxRooms) { this.imaxRooms = imaxRooms; }

        public Long getFourDXRooms() { return fourDXRooms; }
        public void setFourDXRooms(Long fourDXRooms) { this.fourDXRooms = fourDXRooms; }

        public Long getTotalSeats() { return totalSeats; }
        public void setTotalSeats(Long totalSeats) { this.totalSeats = totalSeats; }

        public Double getAverageSeats() { return averageSeats; }
        public void setAverageSeats(Double averageSeats) { this.averageSeats = averageSeats; }

        public Long getRooms3D() { return rooms3D; }
        public void setRooms3D(Long rooms3D) { this.rooms3D = rooms3D; }

        public Long getRoomsDolbyAtmos() { return roomsDolbyAtmos; }
        public void setRoomsDolbyAtmos(Long roomsDolbyAtmos) { this.roomsDolbyAtmos = roomsDolbyAtmos; }

        public Long getRoomsRecliner() { return roomsRecliner; }
        public void setRoomsRecliner(Long roomsRecliner) { this.roomsRecliner = roomsRecliner; }

        public Double getAveragePriceMultiplier() { return averagePriceMultiplier; }
        public void setAveragePriceMultiplier(Double averagePriceMultiplier) { this.averagePriceMultiplier = averagePriceMultiplier; }
    }
}
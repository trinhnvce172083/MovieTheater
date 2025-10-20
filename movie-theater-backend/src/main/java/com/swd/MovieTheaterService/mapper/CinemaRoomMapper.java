package com.swp.MovieTheaterService.mapper;

import com.swp.MovieTheaterService.dto.cinema.CinemaRoomCreateRequest;
import com.swp.MovieTheaterService.dto.cinema.CinemaRoomResponse;
import com.swp.MovieTheaterService.dto.cinema.CinemaRoomUpdateRequest;
import com.swp.MovieTheaterService.entity.CinemaRoom;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Cinema Room Mapper
 * Maps between CinemaRoom entity and DTOs
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Component
public class CinemaRoomMapper {

    /**
     * Convert CinemaRoomCreateRequest to CinemaRoom entity
     */
    public CinemaRoom toEntity(CinemaRoomCreateRequest request) {
        if (request == null) {
            return null;
        }

        CinemaRoom cinemaRoom = new CinemaRoom();
        cinemaRoom.setCinemaRoomName(request.getCinemaRoomName());
        cinemaRoom.setSeatQuantity(request.getSeatQuantity());
        cinemaRoom.setRoomType(request.getRoomType() != null ? request.getRoomType() : "STANDARD");
        cinemaRoom.setDescription(request.getDescription());
        cinemaRoom.setRows(request.getRows());
        cinemaRoom.setColumns(request.getColumns());
        cinemaRoom.setHas3D(request.getHas3D() != null ? request.getHas3D() : false);
        cinemaRoom.setHasDolbyAtmos(request.getHasDolbyAtmos() != null ? request.getHasDolbyAtmos() : false);
        cinemaRoom.setHasReclinerSeats(request.getHasReclinerSeats() != null ? request.getHasReclinerSeats() : false);
        cinemaRoom.setPriceMultiplier(request.getPriceMultiplier() != null ? request.getPriceMultiplier() : 1.0);
        cinemaRoom.setIsActive(true);
        cinemaRoom.setCreatedAt(LocalDateTime.now());
        cinemaRoom.setUpdatedAt(LocalDateTime.now());

        return cinemaRoom;
    }

    /**
     * Update CinemaRoom entity from CinemaRoomUpdateRequest
     */
    public void updateEntity(CinemaRoom cinemaRoom, CinemaRoomUpdateRequest request) {
        if (cinemaRoom == null || request == null) {
            return;
        }

        if (request.getCinemaRoomName() != null) {
            cinemaRoom.setCinemaRoomName(request.getCinemaRoomName());
        }
        if (request.getRoomType() != null) {
            cinemaRoom.setRoomType(request.getRoomType().name());
        }
        if (request.getDescription() != null) {
            cinemaRoom.setDescription(request.getDescription());
        }
        if (request.getHas3D() != null) {
            cinemaRoom.setHas3D(request.getHas3D());
        }
        if (request.getHasDolbyAtmos() != null) {
            cinemaRoom.setHasDolbyAtmos(request.getHasDolbyAtmos());
        }
        if (request.getHasReclinerSeats() != null) {
            cinemaRoom.setHasReclinerSeats(request.getHasReclinerSeats());
        }
        if (request.getPriceMultiplier() != null) {
            cinemaRoom.setPriceMultiplier(request.getPriceMultiplier());
        }
        if (request.getIsActive() != null) {
            cinemaRoom.setIsActive(request.getIsActive());
        }

        cinemaRoom.setUpdatedAt(LocalDateTime.now());
    }

    /**
     * Convert CinemaRoom entity to CinemaRoomResponse
     */
    public CinemaRoomResponse toResponse(CinemaRoom cinemaRoom) {
        if (cinemaRoom == null) {
            return null;
        }

        CinemaRoomResponse response = new CinemaRoomResponse();
        response.setCinemaRoomId(cinemaRoom.getCinemaRoomId());
        response.setCinemaRoomName(cinemaRoom.getCinemaRoomName());
        response.setSeatQuantity(cinemaRoom.getSeatQuantity());
        response.setRoomType(cinemaRoom.getRoomType());
        response.setIsActive(cinemaRoom.getIsActive());
        response.setDescription(cinemaRoom.getDescription());
        response.setRows(cinemaRoom.getRows());
        response.setColumns(cinemaRoom.getColumns());
        response.setHas3D(cinemaRoom.getHas3D());
        response.setHasDolbyAtmos(cinemaRoom.getHasDolbyAtmos());
        response.setHasReclinerSeats(cinemaRoom.getHasReclinerSeats());
        response.setPriceMultiplier(cinemaRoom.getPriceMultiplier());
        response.setCreatedAt(cinemaRoom.getCreatedAt());
        response.setUpdatedAt(cinemaRoom.getUpdatedAt());

        // Set computed fields
        response.setDisplayName(cinemaRoom.getDisplayName());
        response.setIsVIP(cinemaRoom.isVIP());
        response.setIsIMAX(cinemaRoom.isIMAX());
        response.setIs4DX(cinemaRoom.is4DX());
        response.setIsPremium(cinemaRoom.isPremium());
        response.setAvailableSeats(cinemaRoom.getAvailableSeats());

        // Schedule count and seat counts will be set by service layer
        response.setScheduleCount(cinemaRoom.getSchedules() != null ? cinemaRoom.getSchedules().size() : 0);

        return response;
    }
} 

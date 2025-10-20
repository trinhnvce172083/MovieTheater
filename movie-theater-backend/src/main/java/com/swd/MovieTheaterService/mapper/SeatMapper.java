package com.swp.MovieTheaterService.mapper;

import com.swp.MovieTheaterService.dto.cinema.SeatResponse;
import com.swp.MovieTheaterService.entity.Seat;
import org.springframework.stereotype.Component;

/**
 * Seat Mapper
 * Maps between Seat entity and DTOs
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Component
public class SeatMapper {

    /**
     * Convert Seat entity to SeatResponse
     */
    public SeatResponse toResponse(Seat seat) {
        if (seat == null) {
            return null;
        }

        SeatResponse response = new SeatResponse();
        response.setSeatId(seat.getSeatId());
        response.setSeatNumber(seat.getSeatNumber());
        response.setSeatRow(seat.getSeatRow());
        response.setSeatColumn(seat.getSeatColumn());
        response.setSeatStatus(seat.getSeatStatus());
        response.setSeatType(seat.getSeatType());
        response.setIsActive(seat.getIsActive());
        response.setPriceMultiplier(seat.getPriceMultiplier());
        response.setIsRecliner(seat.getIsRecliner());
        response.setHasTable(seat.getHasTable());
        response.setCreatedAt(seat.getCreatedAt());
        response.setUpdatedAt(seat.getUpdatedAt());

        // Cinema room info
        if (seat.getCinemaRoom() != null) {
            response.setCinemaRoomId(seat.getCinemaRoom().getCinemaRoomId());
            response.setCinemaRoomName(seat.getCinemaRoom().getCinemaRoomName());
        }

        // Set computed fields
        response.setRowLetter(seat.getRowLetter());
        response.setDisplayName(seat.getDisplayName());
        response.setIsAvailable(seat.isAvailable());
        response.setIsOccupied(seat.isOccupied());
        response.setIsTemporarilyReserved(seat.isTemporarilyReserved());
        response.setIsVIP(seat.isVIP());
        response.setIsCouple(seat.isCouple());
        response.setIsWheelchair(seat.isWheelchair());
        response.setIsPremium(seat.isPremium());

        return response;
    }
} 

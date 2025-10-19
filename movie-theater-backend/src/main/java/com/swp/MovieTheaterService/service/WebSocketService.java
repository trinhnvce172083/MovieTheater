package com.swp.MovieTheaterService.service;

import java.util.Map;

/**
 * WebSocket Service Interface
 * Handles real-time messaging and notifications
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public interface WebSocketService {
    
    /**
     * Send seat status update to all clients viewing a schedule
     * 
     * @param scheduleId schedule ID
     * @param seatUpdates seat status updates
     */
    void broadcastSeatStatusUpdate(Long scheduleId, Map<String, Object> seatUpdates);
    
    /**
     * Send booking notification to specific user
     * 
     * @param userId user ID
     * @param notification notification message
     */
    void sendBookingNotification(Long userId, Object notification);
    
    /**
     * Send payment status update to user
     * 
     * @param userId user ID
     * @param paymentStatus payment status update
     */
    void sendPaymentStatusUpdate(Long userId, Object paymentStatus);
    
    /**
     * Send show reminder to user
     * 
     * @param userId user ID
     * @param reminder reminder message
     */
    void sendShowReminder(Long userId, Object reminder);
    
    /**
     * Broadcast system maintenance message
     * 
     * @param message maintenance message
     */
    void broadcastMaintenanceMessage(Object message);
    
    /**
     * Send promotion notification to user
     * 
     * @param userId user ID
     * @param promotion promotion details
     */
    void sendPromotionNotification(Long userId, Object promotion);
    
    /**
     * Broadcast movie schedule updates
     * 
     * @param movieId movie ID
     * @param scheduleUpdates schedule updates
     */
    void broadcastScheduleUpdates(Long movieId, Object scheduleUpdates);
    
    /**
     * Send session timeout warning to user
     * 
     * @param sessionId session ID
     * @param warningMessage warning message
     */
    void sendSessionTimeoutWarning(String sessionId, Object warningMessage);
    
    /**
     * Send check-in success notification
     * 
     * @param userId user ID
     * @param checkInDetails check-in details
     */
    void sendCheckInNotification(Long userId, Object checkInDetails);
    
    /**
     * Broadcast cinema status updates (e.g., technical issues)
     * 
     * @param cinemaId cinema ID
     * @param statusUpdate status update
     */
    void broadcastCinemaStatusUpdate(Long cinemaId, Object statusUpdate);
    
    /**
     * WebSocket Message Types
     */
    enum MessageType {
        SEAT_UPDATE("seat-update"),
        BOOKING_NOTIFICATION("booking-notification"),
        PAYMENT_STATUS("payment-status"),
        SHOW_REMINDER("show-reminder"),
        MAINTENANCE("maintenance"),
        PROMOTION("promotion"),
        SCHEDULE_UPDATE("schedule-update"),
        SESSION_WARNING("session-warning"),
        CHECK_IN("check-in"),
        CINEMA_STATUS("cinema-status");
        
        private final String type;
        
        MessageType(String type) {
            this.type = type;
        }
        
        public String getType() {
            return type;
        }
    }
    
    /**
     * WebSocket Destinations
     */
    interface Destinations {
        String SEAT_UPDATES = "/topic/seats";
        String USER_NOTIFICATIONS = "/queue/notifications";
        String SYSTEM_MESSAGES = "/topic/system";
        String MOVIE_UPDATES = "/topic/movies";
        String CINEMA_UPDATES = "/topic/cinemas";
        String PAYMENT_UPDATES = "/queue/payments";
    }
} 

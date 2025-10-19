package com.swp.MovieTheaterService.utils;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;
import java.util.TimeZone;

/**
 * DateTime Utility Class
 * Utility class để xử lý thời gian một cách nhất quán
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Slf4j
public class DateTimeUtils {

    // Timezone mặc định cho Việt Nam
    public static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    public static final TimeZone VIETNAM_TIMEZONE = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");

    // Format cho VNPay
    public static final String VNPAY_DATE_FORMAT = "yyyyMMddHHmmss";
    public static final DateTimeFormatter VNPAY_FORMATTER = DateTimeFormatter.ofPattern(VNPAY_DATE_FORMAT);

    // Format cho hiển thị
    public static final String DISPLAY_DATE_FORMAT = "dd/MM/yyyy HH:mm:ss";
    public static final DateTimeFormatter DISPLAY_FORMATTER = DateTimeFormatter.ofPattern(DISPLAY_DATE_FORMAT);

    /**
     * Lấy thời gian hiện tại theo timezone Việt Nam
     */
    public static LocalDateTime now() {
        return LocalDateTime.now(VIETNAM_ZONE);
    }

    /**
     * Tạo thời gian hết hạn cho payment (mặc định 15 phút)
     */
    public static LocalDateTime createExpirationTime() {
        return createExpirationTime(15);
    }

    /**
     * Tạo thời gian hết hạn cho payment với số phút tùy chỉnh
     */
    public static LocalDateTime createExpirationTime(int minutes) {
        return now().plusMinutes(minutes);
    }

    /**
     * Format thời gian cho VNPay
     */
    public static String formatForVNPay(LocalDateTime dateTime) {
        if (dateTime == null) {
            dateTime = now();
        }
        return dateTime.format(VNPAY_FORMATTER);
    }

    /**
     * Format thời gian cho hiển thị
     */
    public static String formatForDisplay(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "N/A";
        }
        return dateTime.format(DISPLAY_FORMATTER);
    }

    /**
     * Kiểm tra xem thời gian có hết hạn chưa
     */
    public static boolean isExpired(LocalDateTime expirationTime) {
        if (expirationTime == null) {
            return false;
        }
        return now().isAfter(expirationTime);
    }

    /**
     * Tính số phút còn lại trước khi hết hạn
     */
    public static long getMinutesUntilExpiration(LocalDateTime expirationTime) {
        if (expirationTime == null) {
            return 0;
        }

        LocalDateTime now = now();
        if (now.isAfter(expirationTime)) {
            return 0; // Đã hết hạn
        }

        return java.time.Duration.between(now, expirationTime).toMinutes();
    }

    /**
     * Tạo Calendar với timezone Việt Nam
     */
    public static Calendar createVietnamCalendar() {
        return Calendar.getInstance(VIETNAM_TIMEZONE);
    }

    /**
     * Format Calendar cho VNPay
     */
    public static String formatCalendarForVNPay(Calendar calendar) {
        if (calendar == null) {
            calendar = createVietnamCalendar();
        }

        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat(VNPAY_DATE_FORMAT);
        formatter.setTimeZone(VIETNAM_TIMEZONE);
        return formatter.format(calendar.getTime());
    }

    /**
     * Log thông tin thời gian cho debug
     */
    public static void logTimeInfo(String context, LocalDateTime dateTime) {
        log.info("{} - Time: {} (Formatted: {})",
                context,
                dateTime != null ? dateTime.toString() : "null",
                formatForDisplay(dateTime));
    }
} 

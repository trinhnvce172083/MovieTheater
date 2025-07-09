package com.swp.MovieTheaterService.exception;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

/**
 * Error Code Enumeration for Movie Theater Management System
 * Professional error handling with specific codes and HTTP status
 * 
 * @author Dũng_Solo
 * @version 2.0.0 - Cleaned up unused codes
 */
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
public enum ErrorCode {

    // ==================== GENERAL ERRORS (1000-1099) ====================
    UNCATEGORIZED_EXCEPTION(1000, "Lỗi hệ thống không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Khóa thông báo không hợp lệ", HttpStatus.BAD_REQUEST),
    VALIDATION_ERROR(1002, "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND(1003, "Tài nguyên không tìm thấy", HttpStatus.NOT_FOUND),
    ACCESS_DENIED(1004, "Truy cập bị từ chối", HttpStatus.FORBIDDEN),

    // ==================== AUTHENTICATION & AUTHORIZATION (1100-1199)
    // ====================
    UNAUTHENTICATED(1100, "Chưa xác thực", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1101, "Không có quyền truy cập", HttpStatus.FORBIDDEN),
    INVALID_CREDENTIALS(1102, "Thông tin đăng nhập không đúng", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(1103, "Token đã hết hạn", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID(1104, "Token không hợp lệ", HttpStatus.UNAUTHORIZED),
    ACCOUNT_LOCKED(1105, "Tài khoản đã bị khóa", HttpStatus.FORBIDDEN),
    EMAIL_NOT_VERIFIED(1107, "Email chưa được xác thực", HttpStatus.FORBIDDEN),
    AUTHENTICATION_FAILED(1108, "Xác thực thất bại", HttpStatus.UNAUTHORIZED),
    LOGIN_FAILED(1109, "Đăng nhập thất bại", HttpStatus.UNAUTHORIZED),
    REGISTRATION_FAILED(1110, "Đăng ký thất bại", HttpStatus.BAD_REQUEST),

    // ==================== USER MANAGEMENT (1200-1299) ====================
    USER_NOT_FOUND(1200, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS(1201, "Người dùng đã tồn tại", HttpStatus.CONFLICT),
    USERNAME_INVALID(1202, "Username phải có ít nhất {min} ký tự", HttpStatus.BAD_REQUEST),
    USERNAME_ALREADY_EXISTS(1203, "Username đã được sử dụng", HttpStatus.CONFLICT),
    EMAIL_INVALID(1204, "Email không đúng định dạng", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_EXISTS(1205, "Email đã được sử dụng", HttpStatus.CONFLICT),
    PASSWORD_INVALID(1206, "Mật khẩu phải có ít nhất {min} ký tự", HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_MATCH(1207, "Mật khẩu xác nhận không khớp", HttpStatus.BAD_REQUEST),
    PHONE_INVALID(1208, "Số điện thoại không hợp lệ", HttpStatus.BAD_REQUEST),
    PHONE_ALREADY_EXISTS(1209, "Số điện thoại đã được sử dụng", HttpStatus.CONFLICT),
    AGE_INVALID(1210, "Tuổi phải từ {min} đến {max}", HttpStatus.BAD_REQUEST),
    FULLNAME_INVALID(1211, "Tên đầy đủ phải từ {min} đến {max} ký tự", HttpStatus.BAD_REQUEST),
    TERMS_NOT_AGREED(1212, "Bạn phải đồng ý với điều khoản sử dụng", HttpStatus.BAD_REQUEST),

    // ==================== MOVIE MANAGEMENT (1300-1399) ====================
    MOVIE_NOT_FOUND(1300, "Phim không tồn tại", HttpStatus.NOT_FOUND),
    MOVIE_ALREADY_EXISTS(1301, "Phim đã tồn tại", HttpStatus.CONFLICT),
    MOVIE_TITLE_INVALID(1302, "Tên phim không hợp lệ", HttpStatus.BAD_REQUEST),
    MOVIE_DURATION_INVALID(1303, "Thời lượng phim không hợp lệ", HttpStatus.BAD_REQUEST),
    MOVIE_RATING_INVALID(1304, "Đánh giá phim không hợp lệ", HttpStatus.BAD_REQUEST),
    MOVIE_STATUS_INVALID(1305, "Trạng thái phim không hợp lệ", HttpStatus.BAD_REQUEST),
    MOVIE_RELEASE_DATE_INVALID(1306, "Ngày phát hành không hợp lệ", HttpStatus.BAD_REQUEST),
    MOVIE_FETCH_FAILED(1307, "Không thể lấy danh sách phim", HttpStatus.INTERNAL_SERVER_ERROR),

    // ==================== CINEMA & ROOM MANAGEMENT (1400-1499)
    // ====================
    CINEMA_ROOM_NOT_FOUND(1400, "Phòng chiếu không tồn tại", HttpStatus.NOT_FOUND),
    CINEMA_ROOM_ALREADY_EXISTS(1401, "Phòng chiếu đã tồn tại", HttpStatus.CONFLICT),
    CINEMA_ROOM_CAPACITY_INVALID(1402, "Sức chứa phòng chiếu không hợp lệ", HttpStatus.BAD_REQUEST),
    CINEMA_ROOM_IN_USE(1403, "Phòng chiếu đang được sử dụng", HttpStatus.CONFLICT),
    SEAT_NOT_FOUND(1404, "Ghế không tồn tại", HttpStatus.NOT_FOUND),
    SEAT_ALREADY_BOOKED(1405, "Ghế đã được đặt", HttpStatus.CONFLICT),
    SEAT_NOT_AVAILABLE(1406, "Ghế không khả dụng", HttpStatus.CONFLICT),
    SEATS_NOT_ADJACENT(1407, "Ghế phải liền nhau (cùng hàng và cạnh nhau) khi đặt từ 2 ghế trở lên", HttpStatus.BAD_REQUEST),

    // ==================== SCHEDULE MANAGEMENT (1500-1599) ====================
    SCHEDULE_NOT_FOUND(1500, "Lịch chiếu không tồn tại", HttpStatus.NOT_FOUND),
    SCHEDULE_ALREADY_EXISTS(1501, "Lịch chiếu đã tồn tại", HttpStatus.CONFLICT),
    SCHEDULE_TIME_INVALID(1502, "Thời gian lịch chiếu không hợp lệ", HttpStatus.BAD_REQUEST),
    SCHEDULE_ROOM_OCCUPIED(1503, "Phòng chiếu đã có lịch vào thời gian này", HttpStatus.CONFLICT),
    SCHEDULE_PAST_DATE(1504, "Không thể tạo lịch chiếu trong quá khứ", HttpStatus.BAD_REQUEST),
    SCHEDULE_NOT_BOOKABLE(1505, "Lịch chiếu này không thể đặt vé", HttpStatus.BAD_REQUEST),

    // ==================== BOOKING MANAGEMENT (1600-1699) ====================
    BOOKING_NOT_FOUND(1600, "Đặt vé không tồn tại", HttpStatus.NOT_FOUND),
    BOOKING_ALREADY_EXISTS(1601, "Đặt vé đã tồn tại", HttpStatus.CONFLICT),
    BOOKING_SEAT_LIMIT_EXCEEDED(1602, "Số lượng ghế vượt quá giới hạn cho phép", HttpStatus.BAD_REQUEST),
    BOOKING_INVALID_CUSTOMER_INFO(1603, "Thông tin khách hàng không hợp lệ", HttpStatus.BAD_REQUEST),
    BOOKING_PAYMENT_REQUIRED(1604, "Yêu cầu thanh toán để hoàn tất đặt vé", HttpStatus.BAD_REQUEST),
    BOOKING_CANCELLED(1605, "Đặt vé đã bị hủy", HttpStatus.CONFLICT),
    BOOKING_EXPIRED(1606, "Đặt vé đã hết hạn", HttpStatus.CONFLICT),
    BOOKING_SESSION_EXPIRED(1607, "Phiên đặt vé đã hết hạn", HttpStatus.CONFLICT),
    BOOKING_INVALID_STATUS(1608, "Trạng thái booking không hợp lệ để thực hiện thao tác này", HttpStatus.BAD_REQUEST),
    BOOKING_CANNOT_BE_CANCELLED(1609, "Booking không thể hủy (quá gần giờ chiếu hoặc đã thanh toán)", HttpStatus.BAD_REQUEST),

    // ==================== PAYMENT MANAGEMENT (1700-1799) ====================
    PAYMENT_NOT_FOUND(1700, "Thanh toán không tồn tại", HttpStatus.NOT_FOUND),
    PAYMENT_FAILED(1701, "Thanh toán thất bại", HttpStatus.BAD_REQUEST),
    PAYMENT_AMOUNT_INVALID(1702, "Số tiền thanh toán không hợp lệ", HttpStatus.BAD_REQUEST),
    PAYMENT_METHOD_INVALID(1703, "Phương thức thanh toán không hợp lệ", HttpStatus.BAD_REQUEST),
    PAYMENT_ALREADY_PROCESSED(1704, "Thanh toán đã được xử lý", HttpStatus.CONFLICT),
    PAYMENT_REFUND_FAILED(1705, "Hoàn tiền thất bại", HttpStatus.BAD_REQUEST),
    PAYMENT_INSUFFICIENT_BALANCE(1706, "Số dư không đủ", HttpStatus.BAD_REQUEST),

    // ==================== PROMOTION MANAGEMENT (1800-1899) ====================
    PROMOTION_NOT_FOUND(1800, "Khuyến mãi không tồn tại", HttpStatus.NOT_FOUND),
    PROMOTION_EXPIRED(1801, "Khuyến mãi đã hết hạn", HttpStatus.BAD_REQUEST),
    PROMOTION_NOT_APPLICABLE(1802, "Khuyến mãi không áp dụng được", HttpStatus.BAD_REQUEST),
    PROMOTION_USAGE_LIMIT_EXCEEDED(1803, "Đã vượt quá giới hạn sử dụng khuyến mãi", HttpStatus.BAD_REQUEST),
    PROMOTION_MINIMUM_AMOUNT_NOT_MET(1804, "Chưa đạt số tiền tối thiểu để sử dụng khuyến mãi", HttpStatus.BAD_REQUEST),
    
    // Point-based promotion errors
    INVALID_PROMOTION_TYPE(1805, "Loại khuyến mãi không hợp lệ", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_POINTS(1806, "Điểm thưởng không đủ để mua khuyến mãi", HttpStatus.BAD_REQUEST),
    MAX_CODES_REACHED(1807, "Đã đạt giới hạn số mã khuyến mãi cho promotion này", HttpStatus.BAD_REQUEST),
    PROMOTION_CODE_USED(1808, "Mã khuyến mãi đã được sử dụng", HttpStatus.BAD_REQUEST),
    PROMOTION_CODE_EXPIRED(1809, "Mã khuyến mãi đã hết hạn", HttpStatus.BAD_REQUEST),
    PROMOTION_CODE_INVALID(1810, "Mã khuyến mãi không hợp lệ", HttpStatus.BAD_REQUEST),
    PROMOTION_CODE_EXISTS(1811, "Mã khuyến mãi đã tồn tại", HttpStatus.CONFLICT),
    PROMOTION_APPLICATION_FAILED(1812, "Áp dụng khuyến mãi thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    PROMOTION_REMOVAL_FAILED(1813, "Xóa khuyến mãi thất bại", HttpStatus.INTERNAL_SERVER_ERROR),

    // ==================== RATE LIMITING (1900-1999) ====================
    RATE_LIMIT_EXCEEDED(1900, "Quá nhiều yêu cầu, vui lòng thử lại sau", HttpStatus.TOO_MANY_REQUESTS),
    REGISTRATION_RATE_LIMIT(1901, "Quá nhiều yêu cầu đăng ký từ IP này", HttpStatus.TOO_MANY_REQUESTS),
    LOGIN_RATE_LIMIT(1902, "Quá nhiều yêu cầu đăng nhập từ IP này", HttpStatus.TOO_MANY_REQUESTS),
    EMAIL_RATE_LIMIT(1903, "Quá nhiều yêu cầu gửi email từ địa chỉ này", HttpStatus.TOO_MANY_REQUESTS),

    // ==================== FILE UPLOAD MANAGEMENT (2000-2099) ====================
    FILE_UPLOAD_FAILED(2000, "Upload file thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_TYPE_NOT_SUPPORTED(2001, "Định dạng file không được hỗ trợ", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE(2002, "Kích thước file vượt quá giới hạn cho phép (5MB)", HttpStatus.BAD_REQUEST),
    FILE_EMPTY(2003, "File không được để trống", HttpStatus.BAD_REQUEST),
    FILE_NOT_FOUND(2004, "File không tồn tại", HttpStatus.NOT_FOUND),
    FILE_DELETE_FAILED(2005, "Xóa file thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_STORAGE_SERVICE_ERROR(2006, "Lỗi dịch vụ lưu trữ file", HttpStatus.SERVICE_UNAVAILABLE),
    INVALID_FILE_URL(2007, "URL file không hợp lệ", HttpStatus.BAD_REQUEST),
    FILE_ALREADY_EXISTS(2008, "File đã tồn tại", HttpStatus.CONFLICT),
    STORAGE_QUOTA_EXCEEDED(2009, "Vượt quá dung lượng lưu trữ cho phép", HttpStatus.INSUFFICIENT_STORAGE),

    // ==================== AUTO SCHEDULE MANAGEMENT (2100-2199)
    // ====================
    AUTO_SCHEDULE_FAILED(2100, "Tạo lịch chiếu tự động thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    AUTO_SCHEDULE_NO_MOVIES(2101, "Không có phim nào để tạo lịch chiếu", HttpStatus.BAD_REQUEST),
    AUTO_SCHEDULE_NO_ROOMS(2102, "Không có phòng chiếu nào khả dụng", HttpStatus.BAD_REQUEST),
    AUTO_SCHEDULE_INVALID_DATE_RANGE(2103, "Khoảng thời gian không hợp lệ", HttpStatus.BAD_REQUEST),
    AUTO_SCHEDULE_DATE_TOO_FAR(2104, "Ngày tạo lịch quá xa trong tương lai (tối đa 30 ngày)", HttpStatus.BAD_REQUEST),
    AUTO_SCHEDULE_PAST_DATE(2105, "Không thể tạo lịch chiếu cho ngày trong quá khứ", HttpStatus.BAD_REQUEST),
    AUTO_SCHEDULE_MOVIE_NOT_FOUND(2106, "Một hoặc nhiều phim không tồn tại", HttpStatus.NOT_FOUND),
    AUTO_SCHEDULE_MOVIE_NOT_SHOWING(2107, "Phim không ở trạng thái NOW_SHOWING", HttpStatus.BAD_REQUEST),
    AUTO_SCHEDULE_ROOM_CONFLICT(2108, "Xung đột phòng chiếu trong khoảng thời gian", HttpStatus.CONFLICT),
    AUTO_SCHEDULE_TIME_CONFLICT(2109, "Xung đột thời gian chiếu", HttpStatus.CONFLICT),
    AUTO_SCHEDULE_INVALID_SHOWS_COUNT(2110, "Số suất chiếu không hợp lệ", HttpStatus.BAD_REQUEST),
    AUTO_SCHEDULE_TRANSACTION_FAILED(2111, "Lỗi transaction khi tạo lịch chiếu", HttpStatus.INTERNAL_SERVER_ERROR),
    AUTO_SCHEDULE_PARTIAL_SUCCESS(2112, "Tạo lịch chiếu thành công một phần", HttpStatus.PARTIAL_CONTENT),
    AUTO_SCHEDULE_VALIDATION_FAILED(2113, "Validation request thất bại", HttpStatus.BAD_REQUEST),
    AUTO_SCHEDULE_DATABASE_ERROR(2114, "Lỗi cơ sở dữ liệu khi tạo lịch chiếu", HttpStatus.INTERNAL_SERVER_ERROR),
    AUTO_SCHEDULE_PROCESSING_TIMEOUT(2115, "Timeout khi xử lý tạo lịch chiếu", HttpStatus.REQUEST_TIMEOUT),
    AUTO_SCHEDULE_CONCURRENT_MODIFICATION(2116, "Dữ liệu đã bị thay đổi bởi tiến trình khác", HttpStatus.CONFLICT),
    AUTO_SCHEDULE_INSUFFICIENT_TIME_SLOTS(2117, "Không đủ khung giờ chiếu khả dụng", HttpStatus.BAD_REQUEST),
    AUTO_SCHEDULE_MOVIE_DURATION_CONFLICT(2118, "Thời lượng phim xung đột với khung giờ", HttpStatus.BAD_REQUEST),
    AUTO_SCHEDULE_ROOM_CAPACITY_INSUFFICIENT(2119, "Sức chứa phòng chiếu không đủ", HttpStatus.BAD_REQUEST),

    // ==================== ANALYTICS & REPORTING (2200-2299) ====================
    ANALYTICS_GENERATION_FAILED(2200, "Không thể tạo báo cáo phân tích", HttpStatus.INTERNAL_SERVER_ERROR),
    REPORT_TYPE_UNSUPPORTED(2201, "Loại báo cáo không được hỗ trợ", HttpStatus.BAD_REQUEST),
    EXPORT_FORMAT_UNSUPPORTED(2202, "Định dạng export không được hỗ trợ", HttpStatus.BAD_REQUEST),
    REPORT_DATA_INSUFFICIENT(2203, "Không đủ dữ liệu để tạo báo cáo", HttpStatus.BAD_REQUEST),

    // ==================== EMAIL & NOTIFICATION (2300-2399) ====================
    EMAIL_SENDING_FAILED(2300, "Gửi email thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    EMAIL_TEMPLATE_NOT_FOUND(2301, "Không tìm thấy template email", HttpStatus.NOT_FOUND),
    EMAIL_AUTHENTICATION_FAILED(2302, "Xác thực email server thất bại", HttpStatus.SERVICE_UNAVAILABLE),
    NOTIFICATION_SENDING_FAILED(2303, "Gửi thông báo thất bại", HttpStatus.INTERNAL_SERVER_ERROR),

    // ==================== CONCESSION MANAGEMENT (2400-2499) ====================
    CONCESSION_NOT_FOUND(2400, "Đồ ăn/uống không tồn tại", HttpStatus.NOT_FOUND),
    CONCESSION_OUT_OF_STOCK(2401, "Đồ ăn/uống đã hết hàng", HttpStatus.CONFLICT),
    CONCESSION_INVALID_QUANTITY(2402, "Số lượng đồ ăn/uống không hợp lệ", HttpStatus.BAD_REQUEST),
    CONCESSION_ORDER_INVALID(2403, "Đơn hàng đồ ăn/uống không hợp lệ", HttpStatus.BAD_REQUEST);

    int code;
    String message;
    HttpStatusCode httpStatusCode;

    /**
     * Format error message with parameters
     */
    public String formatMessage(Object... params) {
        String formattedMessage = this.message;
        for (int i = 0; i < params.length; i++) {
            formattedMessage = formattedMessage.replace("{" + i + "}", params[i].toString());
        }
        // Handle named parameters
        formattedMessage = formattedMessage.replace("{min}", params.length > 0 ? params[0].toString() : "")
                .replace("{max}", params.length > 1 ? params[1].toString() : "")
                .replace("{value}", params.length > 0 ? params[0].toString() : "");
        return formattedMessage;
    }
}
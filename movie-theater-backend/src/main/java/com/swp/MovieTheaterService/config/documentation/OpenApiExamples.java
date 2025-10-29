package com.swp.MovieTheaterService.config.documentation;

import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI Examples Configuration
 * Chứa các dữ liệu mẫu cho Swagger UI
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Configuration
public class OpenApiExamples {

    // ==================== AUTHENTICATION EXAMPLES ====================
    
    public static final String REGISTER_REQUEST_EXAMPLE = """
        {
          "fullName": "Nguyễn Văn An",
          "email": "nguyenvanan@example.com",
          "password": "SecurePass123!",
          "confirmPassword": "SecurePass123!",
          "phoneNumber": "0901234567",
          "dateOfBirth": "1995-05-15",
          "address": "123 Đường Lê Lợi, Quận 1, TP.HCM",
          "agreeToTerms": true,
          "acceptMarketing": false
        }
        """;

    public static final String LOGIN_REQUEST_EXAMPLE = """
        {
          "email": "admin@lumierecinema.com",
          "password": "Admin123!"
        }
        """;

    public static final String FORGOT_PASSWORD_REQUEST_EXAMPLE = """
        {
          "email": "nguyenvannam@example.com"
        }
        """;

    public static final String RESET_PASSWORD_REQUEST_EXAMPLE = """
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "newPassword": "NewSecurePassword123!",
          "confirmPassword": "NewSecurePassword123!"
        }
        """;

    public static final String CHANGE_PASSWORD_REQUEST_EXAMPLE = """
        {
          "currentPassword": "SecurePassword123!",
          "newPassword": "NewSecurePassword456!",
          "confirmPassword": "NewSecurePassword456!"
        }
        """;

    // ==================== BOOKING EXAMPLES ====================

    public static final String BOOKING_CREATE_REQUEST_EXAMPLE = """
        {
          "scheduleId": 1,
          "seatIds": [1, 2],
          "customerName": "Nguyễn Văn A",
          "customerEmail": "customer@example.com",
          "customerPhone": "0901234567",
          "notes": "Đặt vé xem phim cuối tuần"
        }
        """;

    public static final String BOOKING_UPDATE_REQUEST_EXAMPLE = """
        {
          "customerName": "Trần Thị Mai Linh",
          "customerEmail": "tranthimailin@example.com",
          "customerPhone": "0987654322",
          "notes": "Cập nhật thông tin liên hệ",
          "bookingStatus": "CONFIRMED"
        }
        """;

    public static final String PAYMENT_REQUEST_EXAMPLE = """
        {
          "bookingId": 12345,
          "paymentMethod": "CARD",
          "amount": 240000.0,
          "cardNumber": "4111111111111111",
          "cardHolderName": "TRAN THI MAI",
          "expiryDate": "12/25",
          "cvv": "123",
          "paymentReference": "PAY_20250606_001"
        }
        """;

    // ==================== MOVIE EXAMPLES ====================

    public static final String MOVIE_CREATE_REQUEST_EXAMPLE = """
        {
          "title": "Cục Vàng Của Ngoại",
          "originalTitle": "CỤC VÀNG CỦA NGOẠI",
          "description": "Phim cảm động về tình bà cháu trong một xóm nhỏ đầy nghĩa tình...",
          "duration": 119,
          "releaseDate": "2025-10-17",
          "endDate": "2026-01-03",
          "language": "Tiếng Việt",
          "subtitle": "Phụ đề tiếng Anh",
          "country": "Việt Nam",
          "director": "Khương Ngọc",
          "cast": "Việt Hương, Hồng Đào, Lê Khánh, Băng Di",
          "genres": "Gia đình, Tâm Lý",
          "rating": "T13",
          "trailerUrl": "https://youtu.be/YPCtgD0KnGk",
          "posterUrl": "https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/poster/cucvangcuangoai.png",
          "bannerUrl": "https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/banner/cucvangcuangoai.jpg",
          "status": "NOW_SHOWING",
          "ticketPrice": 150000.0,
          "autoScheduleEnabled": true,
          "priorityScore": 9,
          "minDailyShows": 3,
          "maxDailyShows": 5,
          "preferredRoomTypes": "STANDARD,IMAX,VIP"
        }
        """;

    public static final String MOVIE_UPDATE_REQUEST_EXAMPLE = """
        {
          "title": "Cục Vàng Của Ngoại - Phiên bản mở rộng",
          "description": "Phim cảm động về tình bà cháu - Phiên bản có thêm cảnh quay...",
          "duration": 125,
          "endDate": "2026-02-03",
          "ticketPrice": 160000.0,
          "status": "NOW_SHOWING",
          "priorityScore": 10
        }
        """;

    // ==================== SCHEDULE EXAMPLES ====================

    public static final String SCHEDULE_CREATE_REQUEST_EXAMPLE = """
        {
          "movieId": 1,
          "cinemaRoomId": 1,
          "showDate": "2025-10-30",
          "startTime": "19:30:00",
          "endTime": "21:29:00",
          "price": 150000.0,
          "isAvailable": true,
          "language": "Vietnamese",
          "subtitle": "English",
          "timeSlotType": "EVENING"
        }
        """;

    public static final String SCHEDULE_UPDATE_REQUEST_EXAMPLE = """
        {
          "showDate": "2025-10-31",
          "startTime": "20:00:00",
          "endTime": "21:59:00",
          "price": 160000.0,
          "isAvailable": true,
          "timeSlotType": "EVENING"
        }
        """;

    // ==================== CINEMA ROOM EXAMPLES ====================

    public static final String CINEMA_ROOM_CREATE_REQUEST_EXAMPLE = """
        {
          "cinemaRoomName": "Standard Room 4",
          "seatQuantity": 120,
          "roomType": "STANDARD",
          "description": "Phòng chiếu tiêu chuẩn với hệ thống âm thanh Dolby Atmos",
          "rowCount": 10,
          "columnCount": 12,
          "has3d": true,
          "hasDolbyAtmos": true,
          "hasReclinerSeats": false,
          "priceMultiplier": 1.0,
          "isActive": true
        }
        """;

    // ==================== ACCOUNT EXAMPLES ====================

    public static final String ACCOUNT_UPDATE_REQUEST_EXAMPLE = """
        {
          "fullName": "Nguyễn Văn Nam Phong",
          "phoneNumber": "0901234568",
          "dateOfBirth": "1995-05-16",
          "address": "456 Đường Nguyễn Huệ, Quận 1, TP.HCM"
        }
        """;

    // ==================== EMPLOYEE EXAMPLES ====================

    public static final String EMPLOYEE_CREATE_REQUEST_EXAMPLE = """
        {
          "fullName": "Lê Thị Hương",
          "email": "lethihuong@lumierecinema.com",
          "password": "Employee123!",
          "phoneNumber": "0912345678",
          "dateOfBirth": "1990-08-20",
          "address": "789 Đường Pasteur, Quận 3, TP.HCM",
          "role": "EMPLOYEE"
        }
        """;

    // ==================== PROMOTION EXAMPLES ====================

    public static final String PROMOTION_CREATE_REQUEST_EXAMPLE = """
        {
          "promotionCode": "HALLOWEEN25",
          "promotionName": "Halloween Spooktacular 2025",
          "description": "Giảm 25% cho tất cả phim kinh dị - Đặc biệt Halloween!",
          "discountType": "PERCENTAGE",
          "discountValue": 25.0,
          "maxDiscountAmount": 80000.0,
          "minPurchaseAmount": 120000.0,
          "startDate": "2025-10-15",
          "endDate": "2025-10-31",
          "usageLimit": 500,
          "usagePerUser": 2,
          "isActive": true,
          "isFeatured": true
        }
        """;

    // ==================== RESPONSE EXAMPLES ====================

    public static final String SUCCESS_RESPONSE_EXAMPLE = """
        {
          "success": true,
          "message": "Thao tác thành công",
          "data": {
            "id": 123,
            "createdAt": "2025-06-06T12:00:00"
          }
        }
        """;

    public static final String ERROR_RESPONSE_EXAMPLE = """
        {
          "success": false,
          "message": "Dữ liệu không hợp lệ",
          "errorCode": "VALIDATION_ERROR",
          "errors": [
            {
              "field": "email",
              "message": "Email không đúng định dạng"
            },
            {
              "field": "password",
              "message": "Mật khẩu phải có ít nhất 8 ký tự"
            }
          ],
          "timestamp": "2025-06-06T12:00:00"
        }
        """;

    public static final String BOOKING_RESPONSE_EXAMPLE = """
        {
          "bookingId": 12345,
          "bookingCode": "BK1730196600ABCD1234",
          "bookingDate": "2025-10-29T14:30:00",
          "bookingStatus": "CONFIRMED",
          "totalAmount": 300000.0,
          "discountAmount": 0.0,
          "finalAmount": 300000.0,
          "customerName": "Trần Thị Mai",
          "customerEmail": "tranthimai@example.com",
          "customerPhone": "0987654321",
          "isGuestBooking": true,
          "schedule": {
            "scheduleId": 1,
            "showDateTime": "2025-10-30T19:30:00",
            "formattedShowDateTime": "30/10/2025 19:30",
            "language": "Vietnamese",
            "subtitle": "English"
          },
          "movie": {
            "movieId": 1,
            "title": "Cục Vàng Của Ngoại",
            "duration": 119,
            "rating": "T13",
            "genres": "Gia đình, Tâm Lý",
            "posterUrl": "https://qgjfmmrrpxfnyhbowyqq.supabase.co/storage/v1/object/public/movie-backdrops/poster/cucvangcuangoai.png",
            "formattedDuration": "1h 59m"
          },
          "cinema": {
            "cinemaRoomId": 1,
            "cinemaRoomName": "Standard Room 1",
            "roomType": "STANDARD"
          },
          "seats": [
            {
              "seatId": 1,
              "seatNumber": "A1",
              "seatRow": "A",
              "seatColumn": 1,
              "seatType": "STANDARD",
              "seatPrice": 150000.0,
              "isVIP": false,
              "isCouple": false
            },
            {
              "seatId": 2,
              "seatNumber": "A2",
              "seatRow": "A",
              "seatColumn": 2,
              "seatType": "STANDARD",
              "seatPrice": 150000.0,
              "isVIP": false,
              "isCouple": false
            }
          ],
          "seatCount": 2,
          "qrCode": "QR1730196600EFGH5678",
          "isCheckedIn": false,
          "canBeCancelled": true,
          "canBeCheckedIn": false,
          "isExpired": false,
          "formattedBookingDate": "29/10/2025 14:30",
          "statusDisplayName": "Đã xác nhận",
          "refundPolicy": "Hoàn tiền 100% nếu hủy trước 24h",
          "createdAt": "2025-10-29T14:30:00",
          "updatedAt": "2025-10-29T14:35:00"
        }
        """;

    // ==================== PAGINATION EXAMPLES ====================

    public static final String PAGINATION_RESPONSE_EXAMPLE = """
        {
          "content": [],
          "pageable": {
            "sort": {
              "sorted": true,
              "empty": false,
              "unsorted": false
            },
            "pageNumber": 0,
            "pageSize": 10,
            "offset": 0,
            "paged": true,
            "unpaged": false
          },
          "totalElements": 150,
          "totalPages": 15,
          "last": false,
          "first": true,
          "numberOfElements": 10,
          "size": 10,
          "number": 0,
          "sort": {
            "sorted": true,
            "empty": false,
            "unsorted": false
          },
          "empty": false
        }
        """;

    // ==================== BOOKING EXAMPLES (từ SwaggerExamples) ====================

    public static final String GUEST_BOOKING_WITH_CONCESSIONS_EXAMPLE = """
            {
              "scheduleId": 1,
              "seatIds": [3, 4],
              "customerName": "Trần Thị B",
              "customerEmail": "customer2@example.com",
              "customerPhone": "0901234568",
              "concessionOrders": [
                {
                  "concessionId": 1,
                  "quantity": 1,
                  "notes": "Bắp rang bơ Original (Lớn)"
                },
                {
                  "concessionId": 9,
                  "quantity": 2,
                  "notes": "2 ly Coca Cola (Lớn)"
                }
              ]
            }
            """;

    public static final String MEMBER_BOOKING_SIMPLE_EXAMPLE = """
            {
              "scheduleId": 1,
              "seatIds": [5, 6]
            }
            """;

    public static final String GUEST_BOOKING_SEATS_ONLY_EXAMPLE = """
            {
              "scheduleId": 1,
              "seatIds": [7, 8],
              "customerName": "Nguyễn Văn A",
              "customerEmail": "customer@example.com",
              "customerPhone": "0901234567"
            }
            """;

    public static final String BOOKING_WITH_PROMOTION_EXAMPLE = """
            {
              "scheduleId": 1,
              "seatIds": [9, 10],
              "customerName": "Lê Văn C",
              "customerEmail": "customer3@example.com",
              "customerPhone": "0901234569",
              "promotionCode": "HALLOWEEN25"
            }
            """;

    public static final String MEMBER_BOOKING_WITH_PAYMENT_METHOD_EXAMPLE = """
            {
              "scheduleId": 1,
              "seatIds": [11, 12],
              "paymentMethod": "CASH",
              "notes": "Thanh toán tiền mặt tại quầy"
            }
            """;

    public static final String FAMILY_BOOKING_SCENARIO = """
            {
              "scheduleId": 1,
              "seatIds": [13, 14, 15, 16],
              "customerName": "Gia đình Nguyễn",
              "customerEmail": "family.nguyen@example.com",
              "customerPhone": "0903456789",
              "paymentMethod": "ONLINE",
              "notes": "Gia đình 4 người - 2 người lớn, 2 trẻ em",
              "concessionOrders": [
                {
                  "concessionId": 1,
                  "quantity": 2,
                  "notes": "2 bắp rang bơ Original (Lớn)"
                },
                {
                  "concessionId": 9,
                  "quantity": 4,
                  "notes": "4 Coca Cola (Lớn)"
                },
                {
                  "concessionId": 18,
                  "quantity": 2,
                  "notes": "2 Hot Dog Phô mai"
                }
              ]
            }
            """;

    public static final String COUPLE_DATE_SCENARIO = """
            {
              "scheduleId": 2,
              "seatIds": [17, 18],
              "customerName": "Đỗ Văn C",
              "customerEmail": "couple@example.com",
              "customerPhone": "0914567890",
              "paymentMethod": "CARD",
              "notes": "Hẹn hò xem phim",
              "concessionOrders": [
                {
                  "concessionId": 6,
                  "quantity": 1,
                  "notes": "Bắp rang Caramel (Lớn)"
                },
                {
                  "concessionId": 9,
                  "quantity": 2,
                  "notes": "2 Coca Cola (Lớn)"
                }
              ]
            }
            """;

    public static final String BUSINESS_GROUP_SCENARIO = """
            {
              "scheduleId": 3,
              "seatIds": [19, 20, 21, 22, 23, 24, 25, 26],
              "customerName": "Công ty ABC",
              "customerEmail": "events@company-abc.com",
              "customerPhone": "0925678901",
              "paymentMethod": "ONLINE",
              "notes": "Đặt vé cho nhóm nhân viên - sự kiện công ty",
              "concessionOrders": [
                {
                  "concessionId": 1,
                  "quantity": 4,
                  "notes": "4 Bắp rang bơ Original (Lớn)"
                },
                {
                  "concessionId": 9,
                  "quantity": 8,
                  "notes": "8 Coca Cola (Lớn)"
                }
              ]
            }
            """;

    // ==================== CONCESSION EXAMPLES ====================

    public static final String ADD_CONCESSION_EXAMPLE = """
            {
              "concessionId": 2,
              "quantity": 1,
              "notes": "Thêm sau khi đã booking"
            }
            """;

    public static final String POPCORN_ORDER_EXAMPLE = """
            {
              "concessionId": 1,
              "quantity": 3,
              "notes": "Bắp rang bơ Original (Lớn)"
            }
            """;

    public static final String DRINK_ORDER_EXAMPLE = """
            {
              "concessionId": 9,
              "quantity": 2,
              "notes": "Coca Cola (Lớn) - Không đá"
            }
            """;

    // ==================== PAYMENT EXAMPLES ====================

    public static final String CASH_PAYMENT_EXAMPLE = """
            {
              "bookingId": 1,
              "paymentMethod": "CASH",
              "amount": 300000,
              "notes": "Thanh toán tiền mặt tại quầy"
            }
            """;

    public static final String ONLINE_PAYMENT_EXAMPLE = """
            {
              "bookingId": 1,
              "paymentMethod": "ONLINE",
              "amount": 300000,
              "onlinePaymentProvider": "MOMO",
              "transactionId": "MOMO123456789",
              "notes": "Thanh toán online qua MoMo"
            }
            """;

    // ==================== VNPAY PAYMENT EXAMPLES ====================

    public static final String VNPAY_PAYMENT_REQUEST_EXAMPLE = """
            {
              "bookingId": 1,
              "bankCode": "NCB",
              "language": "vn",
              "orderInfo": "Thanh toan ve xem phim Cuc Vang Cua Ngoai",
              "returnUrl": "http://localhost:3000/payment/result",
              "cancelUrl": "http://localhost:3000/payment/cancel"
            }
            """;

    public static final String VNPAY_PAYMENT_RESPONSE_EXAMPLE = """
            {
              "success": true,
              "message": "Tạo URL thanh toán thành công",
              "data": {
                "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=30000000&vnp_Command=pay&vnp_CreateDate=20251029123000&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+ve+xem+phim+-+Booking+%231&vnp_OrderType=billpayment&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fpayment%2Fvnpay%2Freturn&vnp_TmnCode=G6UJ6GM0&vnp_TxnRef=G6UJ6GM01730196600123&vnp_Version=2.1.0&vnp_SecureHash=abc123...",
                "bookingId": 1,
                "language": "vn"
              }
            }
            """;

    public static final String VNPAY_SIMPLE_REQUEST_EXAMPLE = """
            {
              "bookingId": 1,
              "language": "vn"
            }
            """;

    public static final String VNPAY_WITH_BANK_EXAMPLE = """
            {
              "bookingId": 1,
              "bankCode": "VIETCOMBANK",
              "language": "vn",
              "orderInfo": "Thanh toan ve xem phim - Gia dinh 4 nguoi"
            }
            """;
}
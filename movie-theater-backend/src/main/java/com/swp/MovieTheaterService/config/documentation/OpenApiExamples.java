package com.swp.MovieTheaterService.config.documentation;

import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI Examples Configuration
 * Chứa các dữ liệu mẫu cho Swagger UI
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Configuration
public class OpenApiExamples {

    // ==================== AUTHENTICATION EXAMPLES ====================
    
    public static final String REGISTER_REQUEST_EXAMPLE = """
        {
          "fullName": "Nguyễn Tiến Dũng",
          "email": "gundneit@example.com",
          "password": "12345Aa!",
          "confirmPassword": "12345Aa!",
          "phoneNumber": "0901234567",
          "dateOfBirth": "2001-05-15",
          "address": "123 Đường Lê Lợi, Quận 1, TP.HCM",
          "agreeToTerms": true,
          "acceptMarketing": false,
          "passwordMatching": true
        }
        """;

    public static final String LOGIN_REQUEST_EXAMPLE = """
        {
          "email": "gundneit@gmail.com",
          "password": "SecurePassword123!"
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
          "scheduleId": 100,
          "seatIds": [121, 122],
          "customerName": "Nguyễn Văn A",
          "customerEmail": "customer@example.com",
          "customerPhone": "0901234567"
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
          "title": "Spider-Man: No Way Home",
          "originalTitle": "Spider-Man: No Way Home",
          "description": "Peter Parker's secret identity is revealed to the entire world...",
          "duration": 148,
          "releaseDate": "2021-12-15",
          "endDate": "2022-03-15",
          "language": "English",
          "subtitle": "Vietnamese",
          "country": "United States",
          "director": "Jon Watts",
          "cast": "Tom Holland, Zendaya, Benedict Cumberbatch",
          "genres": "Action, Adventure, Sci-Fi",
          "rating": "T13",
          "trailerUrl": "https://youtube.com/watch?v=JfVOs4VSpmA",
          "posterUrl": "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
          "bannerUrl": "https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
          "status": "NOW_SHOWING",
          "ticketPrice": 120000.0
        }
        """;

    public static final String MOVIE_UPDATE_REQUEST_EXAMPLE = """
        {
          "title": "Spider-Man: No Way Home - Extended Version",
          "description": "Peter Parker's secret identity is revealed to the entire world. Updated description...",
          "duration": 155,
          "endDate": "2022-04-15",
          "ticketPrice": 130000.0,
          "status": "NOW_SHOWING"
        }
        """;

    // ==================== SCHEDULE EXAMPLES ====================

    public static final String SCHEDULE_CREATE_REQUEST_EXAMPLE = """
        {
          "movieId": 1,
          "cinemaRoomId": 2,
          "showDate": "2025-06-10",
          "startTime": "19:30:00",
          "endTime": "22:00:00",
          "ticketPrice": 120000.0,
          "specialPrice": 150000.0,
          "vipPrice": 200000.0
        }
        """;

    public static final String SCHEDULE_UPDATE_REQUEST_EXAMPLE = """
        {
          "showDate": "2025-06-11",
          "startTime": "20:00:00",
          "endTime": "22:30:00",
          "ticketPrice": 125000.0,
          "specialPrice": 155000.0,
          "vipPrice": 210000.0
        }
        """;

    // ==================== CINEMA ROOM EXAMPLES ====================

    public static final String CINEMA_ROOM_CREATE_REQUEST_EXAMPLE = """
        {
          "cinemaRoomName": "Cinema 01 - IMAX",
          "seatQuantity": 120,
          "roomType": "IMAX",
          "description": "Phòng chiếu IMAX với âm thanh và hình ảnh chất lượng cao",
          "facilities": ["IMAX", "Dolby Atmos", "Recliner Seats"],
          "status": "ACTIVE"
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
          "email": "lethihuong@movietheater.com",
          "password": "Employee123!",
          "phoneNumber": "0912345678",
          "dateOfBirth": "1990-08-20",
          "address": "789 Đường Pasteur, Quận 3, TP.HCM",
          "position": "EMPLOYEE",
          "department": "Customer Service",
          "salary": 8000000.0,
          "hireDate": "2025-06-01"
        }
        """;

    // ==================== PROMOTION EXAMPLES ====================

    public static final String PROMOTION_CREATE_REQUEST_EXAMPLE = """
        {
          "promotionCode": "SUMMER2025",
          "promotionName": "Khuyến mãi mùa hè 2025",
          "description": "Giảm giá 20% cho tất cả vé xem phim trong tháng 6",
          "discountType": "PERCENTAGE",
          "discountValue": 20.0,
          "maxDiscountAmount": 50000.0,
          "minOrderAmount": 100000.0,
          "startDate": "2025-06-01T00:00:00",
          "endDate": "2025-06-30T23:59:59",
          "usageLimit": 1000,
          "usagePerCustomer": 3,
          "applicableMovies": [1, 2, 3],
          "applicableRooms": [1, 2],
          "isActive": true
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
          "bookingCode": "BK1733472000ABCD1234",
          "bookingDate": "2025-06-06T14:30:00",
          "bookingStatus": "CONFIRMED",
          "totalAmount": 240000.0,
          "discountAmount": 0.0,
          "finalAmount": 240000.0,
          "customerName": "Trần Thị Mai",
          "customerEmail": "tranthimai@example.com",
          "customerPhone": "0987654321",
          "isGuestBooking": true,
          "schedule": {
            "scheduleId": 1,
            "showDateTime": "2025-06-10T19:30:00",
            "formattedShowDateTime": "10/06/2025 19:30",
            "language": "Vietnamese",
            "isSubtitled": false
          },
          "movie": {
            "movieId": 1,
            "title": "Spider-Man: No Way Home",
            "duration": 148,
            "rating": "T13",
            "genres": "Action, Adventure, Sci-Fi",
            "posterUrl": "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
            "formattedDuration": "2h 28m"
          },
          "cinema": {
            "cinemaRoomId": 2,
            "cinemaRoomName": "Cinema 01 - IMAX",
            "cinemaLocation": "CGV Cinemas",
            "address": "Địa chỉ rạp phim"
          },
          "seats": [
            {
              "seatId": 15,
              "seatNumber": "A1",
              "seatRow": "A",
              "seatColumn": 1,
              "seatType": "STANDARD",
              "seatPrice": 120000.0,
              "isVIP": false,
              "isCouple": false
            },
            {
              "seatId": 16,
              "seatNumber": "A2",
              "seatRow": "A",
              "seatColumn": 2,
              "seatType": "STANDARD",
              "seatPrice": 120000.0,
              "isVIP": false,
              "isCouple": false
            }
          ],
          "seatCount": 2,
          "qrCode": "QR1733472000EFGH5678",
          "isCheckedIn": false,
          "canBeCancelled": true,
          "canBeCheckedIn": false,
          "isExpired": false,
          "formattedBookingDate": "06/06/2025 14:30",
          "statusDisplayName": "Đã xác nhận",
          "refundPolicy": "Hoàn tiền 100% nếu hủy trước 24h",
          "createdAt": "2025-06-06T14:30:00",
          "updatedAt": "2025-06-06T14:35:00"
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
              "scheduleId": 100,
              "seatIds": [125, 126],
              "customerName": "Trần Thị B",
              "customerEmail": "customer2@example.com",
              "customerPhone": "0901234568",
              "concessionOrders": [
                {
                  "concessionId": 1,
                  "quantity": 1,
                  "notes": "Bắp rang size L"
                },
                {
                  "concessionId": 3,
                  "quantity": 2,
                  "notes": "2 ly Coca Cola"
                }
              ]
            }
            """;

    public static final String MEMBER_BOOKING_SIMPLE_EXAMPLE = """
            {
              "scheduleId": 100,
              "seatIds": [121, 122]
            }
            """;

    public static final String GUEST_BOOKING_SEATS_ONLY_EXAMPLE = """
            {
              "scheduleId": 100,
              "seatIds": [123, 124],
              "customerName": "Nguyễn Văn A",
              "customerEmail": "customer@example.com",
              "customerPhone": "0901234567"
            }
            """;

    public static final String BOOKING_WITH_PROMOTION_EXAMPLE = """
            {
              "scheduleId": 100,
              "seatIds": [127, 128],
              "customerName": "Lê Văn C",
              "customerEmail": "customer3@example.com",
              "customerPhone": "0901234569",
              "promotionCode": "WELCOME10"
            }
            """;

    public static final String MEMBER_BOOKING_WITH_PAYMENT_METHOD_EXAMPLE = """
            {
              "scheduleId": 100,
              "seatIds": [129, 130],
              "paymentMethod": "CASH",
              "notes": "Thanh toán tiền mặt tại quầy"
            }
            """;

    public static final String FAMILY_BOOKING_SCENARIO = """
            {
              "scheduleId": 1,
              "seatIds": [20, 21, 22, 23],
              "sessionId": "FAMILY-SESSION-20241212-150000",
              "customerName": "Gia đình Nguyễn",
              "customerEmail": "family.nguyen@example.com",
              "customerPhone": "0903456789",
              "paymentMethod": "ONLINE",
              "notes": "Gia đình 4 người - 2 người lớn, 2 trẻ em",
              "concessionOrders": [
                {
                  "concessionId": 1,
                  "quantity": 2,
                  "unitPrice": 45000,
                  "notes": "2 bắp rang size lớn cho cả gia đình"
                },
                {
                  "concessionId": 3,
                  "quantity": 4,
                  "unitPrice": 25000,
                  "notes": "4 nước ngọt cho mọi người"
                },
                {
                  "concessionId": 5,
                  "quantity": 2,
                  "unitPrice": 15000,
                  "notes": "Kẹo cho trẻ em"
                }
              ],
              "isGuestBooking": true,
              "hasChildren": true,
              "needsWheelchairAccess": false
            }
            """;

    public static final String COUPLE_DATE_SCENARIO = """
            {
              "scheduleId": 2,
              "seatIds": [50, 51],
              "sessionId": "COUPLE-SESSION-20241212-200000",
              "customerName": "Đỗ Văn C",
              "customerEmail": "couple@example.com",
              "customerPhone": "0914567890",
              "paymentMethod": "CARD",
              "notes": "Hẹn hò xem phim - ghế đôi VIP",
              "concessionOrders": [
                {
                  "concessionId": 1,
                  "quantity": 1,
                  "unitPrice": 55000,
                  "notes": "Bắp rang caramel size lớn để chia"
                },
                {
                  "concessionId": 4,
                  "quantity": 2,
                  "unitPrice": 35000,
                  "notes": "2 nước ép trái cây"
                }
              ],
              "isGuestBooking": true,
              "hasChildren": false,
              "needsWheelchairAccess": false
            }
            """;

    public static final String BUSINESS_GROUP_SCENARIO = """
            {
              "scheduleId": 3,
              "seatIds": [100, 101, 102, 103, 104, 105, 106, 107],
              "sessionId": "BUSINESS-SESSION-20241212-190000",
              "customerName": "Công ty ABC",
              "customerEmail": "events@company-abc.com",
              "customerPhone": "0925678901",
              "paymentMethod": "ONLINE",
              "notes": "Đặt vé cho nhóm nhân viên - sự kiện công ty",
              "concessionOrders": [
                {
                  "concessionId": 1,
                  "quantity": 4,
                  "unitPrice": 45000,
                  "notes": "Bắp rang cho team"
                },
                {
                  "concessionId": 3,
                  "quantity": 8,
                  "unitPrice": 25000,
                  "notes": "Nước uống cho cả team"
                }
              ],
              "isGuestBooking": true,
              "hasChildren": false,
              "needsWheelchairAccess": false
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
              "notes": "Bắp rang bơ size lớn"
            }
            """;

    public static final String DRINK_ORDER_EXAMPLE = """
            {
              "concessionId": 4,
              "quantity": 2,
              "notes": "Coca Cola không đá"
            }
            """;

    // ==================== PAYMENT EXAMPLES ====================

    public static final String CASH_PAYMENT_EXAMPLE = """
            {
              "bookingId": 1,
              "paymentMethod": "CASH",
              "amount": 280000,
              "notes": "Thanh toán tiền mặt tại quầy"
            }
            """;

    public static final String ONLINE_PAYMENT_EXAMPLE = """
            {
              "bookingId": 1,
              "paymentMethod": "ONLINE",
              "amount": 280000,
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
              "orderInfo": "Thanh toan ve xem phim Spider-Man",
              "returnUrl": "http://localhost:3000/payment/result",
              "cancelUrl": "http://localhost:3000/payment/cancel"
            }
            """;

    public static final String VNPAY_PAYMENT_RESPONSE_EXAMPLE = """
            {
              "success": true,
              "message": "Tạo URL thanh toán thành công",
              "data": {
                "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=24000000&vnp_Command=pay&vnp_CreateDate=20250620123000&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+ve+xem+phim+-+Booking+%231&vnp_OrderType=billpayment&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fpayment%2Fvnpay%2Freturn&vnp_TmnCode=G6UJ6GM0&vnp_TxnRef=G6UJ6GM01703123000123&vnp_Version=2.1.0&vnp_SecureHash=abc123...",
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
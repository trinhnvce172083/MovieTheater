package com.swp.MovieTheaterService.config;

import org.springframework.context.annotation.Configuration;

/**
 * Swagger Examples Configuration
 * Chứa các example JSON cho API documentation
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Configuration
public class SwaggerExamples {

    // ==================== BOOKING EXAMPLES ====================

    public static final String GUEST_BOOKING_WITH_CONCESSIONS_EXAMPLE = """
            {
              "scheduleId": 1,
              "seatIds": [1, 2],
              "sessionId": "SESSION-20241212-143015",
              "customerName": "Nguyễn Văn A",
              "customerEmail": "customer@example.com",
              "customerPhone": "0901234567",
              "paymentMethod": "ONLINE",
              "notes": "Booking cho gia đình có trẻ em",
              "concessionOrders": [
                {
                  "concessionId": 1,
                  "quantity": 2,
                  "unitPrice": 45000,
                  "notes": "Extra butter"
                },
                {
                  "concessionId": 3,
                  "quantity": 2,
                  "unitPrice": 35000,
                  "notes": "No ice"
                }
              ],
              "isGuestBooking": true,
              "needsWheelchairAccess": false,
              "hasChildren": true
            }
            """;

    public static final String MEMBER_BOOKING_SIMPLE_EXAMPLE = """
            {
              "scheduleId": 1,
              "seatIds": [5, 6],
              "sessionId": "SESSION-20241212-143020",
              "paymentMethod": "ONLINE",
              "notes": "Member booking",
              "isGuestBooking": false,
              "useRewardPoints": true,
              "rewardPointsToUse": 1000
            }
            """;

    public static final String GUEST_BOOKING_SEATS_ONLY_EXAMPLE = """
            {
              "scheduleId": 1,
              "seatIds": [10, 11],
              "sessionId": "SESSION-20241212-143025",
              "customerName": "Trần Thị B",
              "customerEmail": "customer2@example.com",
              "customerPhone": "0912345678",
              "paymentMethod": "CASH",
              "notes": "Chỉ đặt ghế, không có đồ ăn",
              "isGuestBooking": true
            }
            """;

    // ==================== CONCESSION EXAMPLES ====================

    public static final String ADD_CONCESSION_EXAMPLE = """
            {
              "concessionId": 2,
              "quantity": 1,
              "unitPrice": 25000,
              "notes": "Thêm sau khi đã booking"
            }
            """;

    public static final String POPCORN_ORDER_EXAMPLE = """
            {
              "concessionId": 1,
              "quantity": 3,
              "unitPrice": 45000,
              "notes": "Bắp rang bơ size lớn"
            }
            """;

    public static final String DRINK_ORDER_EXAMPLE = """
            {
              "concessionId": 4,
              "quantity": 2,
              "unitPrice": 30000,
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

    // ==================== TYPICAL USAGE SCENARIOS ====================

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

    // ==================== ERROR SCENARIOS ====================

    public static final String INVALID_PHONE_EXAMPLE = """
            {
              "scheduleId": 1,
              "seatIds": [1, 2],
              "sessionId": "SESSION-20241212-143015",
              "customerName": "Test Invalid Phone",
              "customerEmail": "test@example.com",
              "customerPhone": "123456",
              "isGuestBooking": true
            }
            """;

    public static final String MISSING_GUEST_INFO_EXAMPLE = """
            {
              "scheduleId": 1,
              "seatIds": [1, 2],
              "sessionId": "SESSION-20241212-143015",
              "isGuestBooking": true
            }
            """;
}
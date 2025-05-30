#!/bin/bash

# =============================================================================
# BOOKING MANAGEMENT SYSTEM API TEST SCRIPT
# Comprehensive testing for all booking endpoints
# Author: Dũng_Solo
# Version: 1.0.0
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:8080/api"
ADMIN_TOKEN=""
EMPLOYEE_TOKEN=""
CUSTOMER_TOKEN=""
BOOKING_ID=""
BOOKING_CODE=""
SCHEDULE_ID=""
ACCOUNT_ID=""
QR_CODE=""

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper functions
print_header() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

print_test() {
    echo -e "${YELLOW}Test $1: $2${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

print_success() {
    echo -e "${GREEN}✓ PASSED: $1${NC}\n"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

print_error() {
    echo -e "${RED}✗ FAILED: $1${NC}\n"
    FAILED_TESTS=$((FAILED_TESTS + 1))
}

print_info() {
    echo -e "${BLUE}ℹ INFO: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ WARNING: $1${NC}"
}

# Make HTTP request with error handling
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local token=$4
    local expected_status=$5
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data" "$url")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Authorization: Bearer $token" "$url")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" "$url")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$url")
        fi
    fi
    
    # Extract status code and body
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    # Check if status code matches expected
    if [ "$status_code" = "$expected_status" ]; then
        echo "$body"
        return 0
    else
        echo "Expected status $expected_status but got $status_code"
        echo "Response: $body"
        return 1
    fi
}

# =============================================================================
# TEST EXECUTION
# =============================================================================

print_header "BOOKING MANAGEMENT SYSTEM API TESTING"

# Test 1: Health Check
print_test "1" "Health Check"
if response=$(make_request "GET" "$BASE_URL/health" "" "" "200"); then
    print_success "Application is running"
else
    print_error "Application health check failed"
    exit 1
fi

# Test 2: Admin Authentication
print_test "2" "Admin Authentication"
auth_data='{"email":"admin@movietheater.com","password":"admin123"}'
if response=$(make_request "POST" "$BASE_URL/auth/login" "$auth_data" "" "200"); then
    ADMIN_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$ADMIN_TOKEN" ]; then
        print_success "Admin authenticated successfully"
        print_info "Admin token: ${ADMIN_TOKEN:0:20}..."
    else
        print_error "Failed to extract admin token"
    fi
else
    print_error "Admin authentication failed"
fi

# Test 3: Get Schedule ID for testing
print_test "3" "Get Schedule ID for Testing"
if response=$(make_request "GET" "$BASE_URL/schedules?page=0&size=1" "" "$ADMIN_TOKEN" "200"); then
    SCHEDULE_ID=$(echo "$response" | grep -o '"scheduleId":[0-9]*' | head -1 | cut -d':' -f2)
    if [ -n "$SCHEDULE_ID" ]; then
        print_success "Schedule ID obtained: $SCHEDULE_ID"
    else
        print_error "No schedule found for testing"
    fi
else
    print_error "Failed to get schedule for testing"
fi

# Test 4: Get Account ID for testing
print_test "4" "Get Account ID for Testing"
if response=$(make_request "GET" "$BASE_URL/accounts?page=0&size=1" "" "$ADMIN_TOKEN" "200"); then
    ACCOUNT_ID=$(echo "$response" | grep -o '"accountId":[0-9]*' | head -1 | cut -d':' -f2)
    if [ -n "$ACCOUNT_ID" ]; then
        print_success "Account ID obtained: $ACCOUNT_ID"
    else
        print_error "No account found for testing"
    fi
else
    print_error "Failed to get account for testing"
fi

# Test 5: Create Guest Booking
print_test "5" "Create Guest Booking"
guest_booking_data='{
    "scheduleId": '$SCHEDULE_ID',
    "selectedSeats": [
        {"seatId": 1, "seatPrice": 100000.0, "seatType": "STANDARD"},
        {"seatId": 2, "seatPrice": 100000.0, "seatType": "STANDARD"}
    ],
    "customerName": "Nguyễn Văn Test",
    "customerEmail": "test@example.com",
    "customerPhone": "0123456789",
    "notes": "Test booking",
    "preferredPaymentMethod": "CASH"
}'
if response=$(make_request "POST" "$BASE_URL/bookings/guest" "$guest_booking_data" "" "201"); then
    BOOKING_ID=$(echo "$response" | grep -o '"bookingId":[0-9]*' | cut -d':' -f2)
    BOOKING_CODE=$(echo "$response" | grep -o '"bookingCode":"[^"]*"' | cut -d'"' -f4)
    print_success "Guest booking created - ID: $BOOKING_ID, Code: $BOOKING_CODE"
else
    print_error "Failed to create guest booking"
fi

# Test 6: Get Booking by ID
print_test "6" "Get Booking by ID"
if [ -n "$BOOKING_ID" ]; then
    if response=$(make_request "GET" "$BASE_URL/bookings/$BOOKING_ID" "" "" "200"); then
        print_success "Booking retrieved successfully"
    else
        print_error "Failed to get booking by ID"
    fi
else
    print_error "No booking ID available for testing"
fi

# Test 7: Get Booking by Code
print_test "7" "Get Booking by Code"
if [ -n "$BOOKING_CODE" ]; then
    if response=$(make_request "GET" "$BASE_URL/bookings/code/$BOOKING_CODE" "" "" "200"); then
        print_success "Booking retrieved by code successfully"
    else
        print_error "Failed to get booking by code"
    fi
else
    print_error "No booking code available for testing"
fi

# Test 8: Get All Bookings
print_test "8" "Get All Bookings with Pagination"
if response=$(make_request "GET" "$BASE_URL/bookings?page=0&size=10" "" "" "200"); then
    print_success "All bookings retrieved successfully"
else
    print_error "Failed to get all bookings"
fi

# Test 9: Get Bookings by Schedule
print_test "9" "Get Bookings by Schedule"
if [ -n "$SCHEDULE_ID" ]; then
    if response=$(make_request "GET" "$BASE_URL/bookings/schedule/$SCHEDULE_ID" "" "" "200"); then
        print_success "Bookings by schedule retrieved successfully"
    else
        print_error "Failed to get bookings by schedule"
    fi
else
    print_error "No schedule ID available for testing"
fi

# Test 10: Get Bookings by Account
print_test "10" "Get Bookings by Account"
if [ -n "$ACCOUNT_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    if response=$(make_request "GET" "$BASE_URL/bookings/account/$ACCOUNT_ID" "" "$ADMIN_TOKEN" "200"); then
        print_success "Bookings by account retrieved successfully"
    else
        print_error "Failed to get bookings by account"
    fi
else
    print_error "No account ID or admin token available for testing"
fi

# Test 11: Get Bookings by Status
print_test "11" "Get Bookings by Status (PENDING)"
if response=$(make_request "GET" "$BASE_URL/bookings/status/PENDING" "" "" "200"); then
    print_success "Bookings by status retrieved successfully"
else
    print_error "Failed to get bookings by status"
fi

# Test 12: Search Bookings
print_test "12" "Search Bookings"
if response=$(make_request "GET" "$BASE_URL/bookings/search?keyword=test&page=0&size=10" "" "" "200"); then
    print_success "Booking search completed successfully"
else
    print_error "Failed to search bookings"
fi

# Test 13: Get Available Seats
print_test "13" "Get Available Seats for Schedule"
if [ -n "$SCHEDULE_ID" ]; then
    if response=$(make_request "GET" "$BASE_URL/bookings/schedule/$SCHEDULE_ID/available-seats" "" "" "200"); then
        print_success "Available seats retrieved successfully"
    else
        print_error "Failed to get available seats"
    fi
else
    print_error "No schedule ID available for testing"
fi

# Test 14: Get Booked Seats
print_test "14" "Get Booked Seats for Schedule"
if [ -n "$SCHEDULE_ID" ]; then
    if response=$(make_request "GET" "$BASE_URL/bookings/schedule/$SCHEDULE_ID/booked-seats" "" "" "200"); then
        print_success "Booked seats retrieved successfully"
    else
        print_error "Failed to get booked seats"
    fi
else
    print_error "No schedule ID available for testing"
fi

# Test 15: Check Seats Availability
print_test "15" "Check Seats Availability"
if [ -n "$SCHEDULE_ID" ]; then
    seat_check_data='[3, 4, 5]'
    if response=$(make_request "POST" "$BASE_URL/bookings/schedule/$SCHEDULE_ID/check-seats" "$seat_check_data" "" "200"); then
        print_success "Seats availability checked successfully"
    else
        print_error "Failed to check seats availability"
    fi
else
    print_error "No schedule ID available for testing"
fi

# Test 16: Generate QR Code
print_test "16" "Generate QR Code for Booking"
if [ -n "$BOOKING_ID" ]; then
    if response=$(make_request "POST" "$BASE_URL/bookings/$BOOKING_ID/generate-qr" "" "" "200"); then
        QR_CODE=$(echo "$response" | grep -o '"qrCode":"[^"]*"' | cut -d'"' -f4)
        print_success "QR code generated: $QR_CODE"
    else
        print_error "Failed to generate QR code"
    fi
else
    print_error "No booking ID available for testing"
fi

# Test 17: Validate QR Code
print_test "17" "Validate QR Code"
if [ -n "$QR_CODE" ]; then
    if response=$(make_request "POST" "$BASE_URL/bookings/validate-qr?qrCode=$QR_CODE" "" "" "200"); then
        print_success "QR code validated successfully"
    else
        print_error "Failed to validate QR code"
    fi
else
    print_error "No QR code available for testing"
fi

# Test 18: Get Today's Bookings
print_test "18" "Get Today's Bookings"
if response=$(make_request "GET" "$BASE_URL/bookings/today" "" "" "200"); then
    print_success "Today's bookings retrieved successfully"
else
    print_error "Failed to get today's bookings"
fi

# Test 19: Get Upcoming Show Bookings
print_test "19" "Get Upcoming Show Bookings"
if response=$(make_request "GET" "$BASE_URL/bookings/upcoming" "" "" "200"); then
    print_success "Upcoming show bookings retrieved successfully"
else
    print_error "Failed to get upcoming show bookings"
fi

# Test 20: Get Bookings by Customer Email
print_test "20" "Get Bookings by Customer Email"
if response=$(make_request "GET" "$BASE_URL/bookings/customer/email/test@example.com" "" "" "200"); then
    print_success "Bookings by customer email retrieved successfully"
else
    print_error "Failed to get bookings by customer email"
fi

# Test 21: Get Bookings by Customer Phone
print_test "21" "Get Bookings by Customer Phone"
if response=$(make_request "GET" "$BASE_URL/bookings/customer/phone/0123456789" "" "" "200"); then
    print_success "Bookings by customer phone retrieved successfully"
else
    print_error "Failed to get bookings by customer phone"
fi

# Test 22: Get Bookings by Payment Method
print_test "22" "Get Bookings by Payment Method"
if response=$(make_request "GET" "$BASE_URL/bookings/payment-method/CASH" "" "" "200"); then
    print_success "Bookings by payment method retrieved successfully"
else
    print_error "Failed to get bookings by payment method"
fi

# Test 23: Admin - Confirm Booking
print_test "23" "Admin - Confirm Booking"
if [ -n "$BOOKING_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    if response=$(make_request "POST" "$BASE_URL/bookings/admin/$BOOKING_ID/confirm" "" "$ADMIN_TOKEN" "200"); then
        print_success "Booking confirmed by admin successfully"
    else
        print_error "Failed to confirm booking"
    fi
else
    print_error "No booking ID or admin token available for testing"
fi

# Test 24: Process Guest Payment
print_test "24" "Process Guest Payment"
if [ -n "$BOOKING_CODE" ]; then
    payment_data='{
        "bookingCode": "'$BOOKING_CODE'",
        "paymentMethod": "CASH",
        "paidAmount": 200000.0,
        "paymentReference": "CASH-'$(date +%s)'"
    }'
    if response=$(make_request "POST" "$BASE_URL/bookings/payment/guest" "$payment_data" "" "200"); then
        print_success "Guest payment processed successfully"
    else
        print_error "Failed to process guest payment"
    fi
else
    print_error "No booking code available for testing"
fi

# Test 25: Admin - Check-in Booking
print_test "25" "Admin - Check-in Booking"
if [ -n "$BOOKING_CODE" ] && [ -n "$ADMIN_TOKEN" ]; then
    if response=$(make_request "POST" "$BASE_URL/bookings/admin/check-in?code=$BOOKING_CODE&useQrCode=false" "" "$ADMIN_TOKEN" "200"); then
        print_success "Booking checked in successfully"
    else
        print_error "Failed to check-in booking"
    fi
else
    print_error "No booking code or admin token available for testing"
fi

# Test 26: Admin - Get Bookings for Check-in
print_test "26" "Admin - Get Bookings for Check-in"
if [ -n "$ADMIN_TOKEN" ]; then
    if response=$(make_request "GET" "$BASE_URL/bookings/check-in" "" "$ADMIN_TOKEN" "200"); then
        print_success "Bookings for check-in retrieved successfully"
    else
        print_error "Failed to get bookings for check-in"
    fi
else
    print_error "No admin token available for testing"
fi

# Test 27: Admin - Get Booking Statistics
print_test "27" "Admin - Get Booking Statistics"
if [ -n "$ADMIN_TOKEN" ]; then
    if response=$(make_request "GET" "$BASE_URL/bookings/admin/statistics" "" "$ADMIN_TOKEN" "200"); then
        print_success "Booking statistics retrieved successfully"
    else
        print_error "Failed to get booking statistics"
    fi
else
    print_error "No admin token available for testing"
fi

# Test 28: Admin - Get Revenue
print_test "28" "Admin - Get Revenue"
if [ -n "$ADMIN_TOKEN" ]; then
    start_date=$(date -d "30 days ago" -Iseconds)
    end_date=$(date -Iseconds)
    if response=$(make_request "GET" "$BASE_URL/bookings/admin/revenue?startDate=$start_date&endDate=$end_date" "" "$ADMIN_TOKEN" "200"); then
        print_success "Revenue data retrieved successfully"
    else
        print_error "Failed to get revenue data"
    fi
else
    print_error "No admin token available for testing"
fi

# Test 29: Admin - Get Average Booking Amount
print_test "29" "Admin - Get Average Booking Amount"
if [ -n "$ADMIN_TOKEN" ]; then
    if response=$(make_request "GET" "$BASE_URL/bookings/admin/average-amount" "" "$ADMIN_TOKEN" "200"); then
        print_success "Average booking amount retrieved successfully"
    else
        print_error "Failed to get average booking amount"
    fi
else
    print_error "No admin token available for testing"
fi

# Test 30: Create Member Booking (Admin)
print_test "30" "Admin - Create Member Booking"
if [ -n "$SCHEDULE_ID" ] && [ -n "$ACCOUNT_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    member_booking_data='{
        "scheduleId": '$SCHEDULE_ID',
        "selectedSeats": [
            {"seatId": 10, "seatPrice": 120000.0, "seatType": "VIP"}
        ],
        "notes": "Member booking test"
    }'
    if response=$(make_request "POST" "$BASE_URL/bookings/admin?accountId=$ACCOUNT_ID" "$member_booking_data" "$ADMIN_TOKEN" "201"); then
        MEMBER_BOOKING_ID=$(echo "$response" | grep -o '"bookingId":[0-9]*' | cut -d':' -f2)
        print_success "Member booking created - ID: $MEMBER_BOOKING_ID"
    else
        print_error "Failed to create member booking"
    fi
else
    print_error "Missing required data for member booking test"
fi

# Test 31: Update Booking
print_test "31" "Admin - Update Booking"
if [ -n "$BOOKING_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    update_data='{
        "customerName": "Nguyễn Văn Test Updated",
        "notes": "Updated booking notes"
    }'
    if response=$(make_request "PUT" "$BASE_URL/bookings/admin/$BOOKING_ID" "$update_data" "$ADMIN_TOKEN" "200"); then
        print_success "Booking updated successfully"
    else
        print_error "Failed to update booking"
    fi
else
    print_error "No booking ID or admin token available for testing"
fi

# Test 32: Get Bookings by Date Range
print_test "32" "Get Bookings by Date Range"
start_date=$(date -d "7 days ago" -Iseconds)
end_date=$(date -Iseconds)
if response=$(make_request "GET" "$BASE_URL/bookings/date-range?startDate=$start_date&endDate=$end_date" "" "" "200"); then
    print_success "Bookings by date range retrieved successfully"
else
    print_error "Failed to get bookings by date range"
fi

# Test 33: Get Bookings by Movie
print_test "33" "Get Bookings by Movie"
if response=$(make_request "GET" "$BASE_URL/bookings/movie/1" "" "" "200"); then
    print_success "Bookings by movie retrieved successfully"
else
    print_error "Failed to get bookings by movie"
fi

# Test 34: Get Bookings by Cinema Room
print_test "34" "Get Bookings by Cinema Room"
if response=$(make_request "GET" "$BASE_URL/bookings/cinema-room/1" "" "" "200"); then
    print_success "Bookings by cinema room retrieved successfully"
else
    print_error "Failed to get bookings by cinema room"
fi

# Test 35: Admin - Get Revenue by Payment Method
print_test "35" "Admin - Get Revenue by Payment Method"
if [ -n "$ADMIN_TOKEN" ]; then
    if response=$(make_request "GET" "$BASE_URL/bookings/admin/revenue/payment-method?paymentMethod=CASH" "" "$ADMIN_TOKEN" "200"); then
        print_success "Revenue by payment method retrieved successfully"
    else
        print_error "Failed to get revenue by payment method"
    fi
else
    print_error "No admin token available for testing"
fi

# Test 36: Admin - Get Bookings Requiring Refund
print_test "36" "Admin - Get Bookings Requiring Refund"
if [ -n "$ADMIN_TOKEN" ]; then
    if response=$(make_request "GET" "$BASE_URL/bookings/admin/refunds" "" "$ADMIN_TOKEN" "200"); then
        print_success "Bookings requiring refund retrieved successfully"
    else
        print_error "Failed to get bookings requiring refund"
    fi
else
    print_error "No admin token available for testing"
fi

# Test 37: Create Booking with Seat Conflict
print_test "37" "Create Booking with Seat Conflict (Should Fail)"
conflict_booking_data='{
    "scheduleId": '$SCHEDULE_ID',
    "selectedSeats": [
        {"seatId": 1, "seatPrice": 100000.0, "seatType": "STANDARD"}
    ],
    "customerName": "Conflict Test",
    "customerEmail": "conflict@example.com",
    "customerPhone": "0987654321"
}'
if response=$(make_request "POST" "$BASE_URL/bookings/guest" "$conflict_booking_data" "" "409"); then
    print_success "Seat conflict detected correctly"
else
    print_error "Seat conflict not detected properly"
fi

# Test 38: Invalid Booking ID Test
print_test "38" "Get Booking with Invalid ID (Should Fail)"
if response=$(make_request "GET" "$BASE_URL/bookings/99999" "" "" "404"); then
    print_success "Invalid booking ID handled correctly"
else
    print_error "Invalid booking ID not handled properly"
fi

# Test 39: Invalid Booking Code Test
print_test "39" "Get Booking with Invalid Code (Should Fail)"
if response=$(make_request "GET" "$BASE_URL/bookings/code/INVALID_CODE" "" "" "404"); then
    print_success "Invalid booking code handled correctly"
else
    print_error "Invalid booking code not handled properly"
fi

# Test 40: Unauthorized Access Test
print_test "40" "Unauthorized Admin Access (Should Fail)"
if response=$(make_request "GET" "$BASE_URL/bookings/admin/statistics" "" "" "401"); then
    print_success "Unauthorized access blocked correctly"
else
    print_error "Unauthorized access not blocked properly"
fi

# Test 41: Invalid Schedule ID Test
print_test "41" "Create Booking with Invalid Schedule (Should Fail)"
invalid_schedule_data='{
    "scheduleId": 99999,
    "selectedSeats": [
        {"seatId": 20, "seatPrice": 100000.0, "seatType": "STANDARD"}
    ],
    "customerName": "Invalid Schedule Test",
    "customerEmail": "invalid@example.com",
    "customerPhone": "0111111111"
}'
if response=$(make_request "POST" "$BASE_URL/bookings/guest" "$invalid_schedule_data" "" "404"); then
    print_success "Invalid schedule ID handled correctly"
else
    print_error "Invalid schedule ID not handled properly"
fi

# Test 42: Invalid Payment Amount Test
print_test "42" "Process Payment with Wrong Amount (Should Fail)"
if [ -n "$BOOKING_CODE" ]; then
    wrong_payment_data='{
        "bookingCode": "'$BOOKING_CODE'",
        "paymentMethod": "CASH",
        "paidAmount": 50000.0,
        "paymentReference": "WRONG-AMOUNT"
    }'
    if response=$(make_request "POST" "$BASE_URL/bookings/payment/guest" "$wrong_payment_data" "" "400"); then
        print_success "Wrong payment amount detected correctly"
    else
        print_error "Wrong payment amount not detected properly"
    fi
else
    print_error "No booking code available for testing"
fi

# Test 43: Admin - Cleanup Expired Bookings
print_test "43" "Admin - Cleanup Expired Bookings"
if [ -n "$ADMIN_TOKEN" ]; then
    if response=$(make_request "POST" "$BASE_URL/bookings/admin/cleanup-expired" "" "$ADMIN_TOKEN" "200"); then
        print_success "Expired bookings cleanup completed"
    else
        print_error "Failed to cleanup expired bookings"
    fi
else
    print_error "No admin token available for testing"
fi

# Test 44: Admin - Get Statistics by Date Range
print_test "44" "Admin - Get Statistics by Date Range"
if [ -n "$ADMIN_TOKEN" ]; then
    start_date=$(date -d "30 days ago" -Iseconds)
    end_date=$(date -Iseconds)
    if response=$(make_request "GET" "$BASE_URL/bookings/admin/statistics/date-range?startDate=$start_date&endDate=$end_date" "" "$ADMIN_TOKEN" "200"); then
        print_success "Statistics by date range retrieved successfully"
    else
        print_error "Failed to get statistics by date range"
    fi
else
    print_error "No admin token available for testing"
fi

# Test 45: Create Booking with Invalid Customer Info
print_test "45" "Create Guest Booking with Invalid Customer Info (Should Fail)"
invalid_customer_data='{
    "scheduleId": '$SCHEDULE_ID',
    "selectedSeats": [
        {"seatId": 25, "seatPrice": 100000.0, "seatType": "STANDARD"}
    ],
    "customerName": "",
    "customerEmail": "invalid-email",
    "customerPhone": "123"
}'
if response=$(make_request "POST" "$BASE_URL/bookings/guest" "$invalid_customer_data" "" "400"); then
    print_success "Invalid customer info validation working correctly"
else
    print_error "Invalid customer info validation not working properly"
fi

# Test 46: Cancel Guest Booking
print_test "46" "Cancel Guest Booking"
if [ -n "$BOOKING_ID" ]; then
    if response=$(make_request "POST" "$BASE_URL/bookings/$BOOKING_ID/cancel/guest?reason=Test cancellation" "" "" "200"); then
        print_success "Guest booking cancelled successfully"
    else
        print_error "Failed to cancel guest booking"
    fi
else
    print_error "No booking ID available for testing"
fi

# Test 47: Admin - Cancel Booking
print_test "47" "Admin - Cancel Booking"
if [ -n "$MEMBER_BOOKING_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    if response=$(make_request "POST" "$BASE_URL/bookings/admin/$MEMBER_BOOKING_ID/cancel?reason=Admin test cancellation" "" "$ADMIN_TOKEN" "200"); then
        print_success "Admin booking cancellation successful"
    else
        print_error "Failed to cancel booking as admin"
    fi
else
    print_error "No member booking ID or admin token available for testing"
fi

# Test 48: Admin - Process Refund
print_test "48" "Admin - Process Refund"
if [ -n "$MEMBER_BOOKING_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    if response=$(make_request "POST" "$BASE_URL/bookings/admin/$MEMBER_BOOKING_ID/refund?refundAmount=60000.0" "" "$ADMIN_TOKEN" "200"); then
        print_success "Refund processed successfully"
    else
        print_error "Failed to process refund"
    fi
else
    print_error "No member booking ID or admin token available for testing"
fi

# Test 49: Admin - Delete Booking
print_test "49" "Admin - Delete Booking"
if [ -n "$MEMBER_BOOKING_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    if response=$(make_request "DELETE" "$BASE_URL/bookings/admin/$MEMBER_BOOKING_ID" "" "$ADMIN_TOKEN" "204"); then
        print_success "Booking deleted successfully"
    else
        print_error "Failed to delete booking"
    fi
else
    print_error "No member booking ID or admin token available for testing"
fi

# Test 50: Admin - Restore Booking
print_test "50" "Admin - Restore Booking"
if [ -n "$MEMBER_BOOKING_ID" ] && [ -n "$ADMIN_TOKEN" ]; then
    if response=$(make_request "POST" "$BASE_URL/bookings/admin/$MEMBER_BOOKING_ID/restore" "" "$ADMIN_TOKEN" "200"); then
        print_success "Booking restored successfully"
    else
        print_error "Failed to restore booking"
    fi
else
    print_error "No member booking ID or admin token available for testing"
fi

# =============================================================================
# TEST SUMMARY
# =============================================================================

print_header "TEST SUMMARY"

echo -e "${CYAN}Total Tests: $TOTAL_TESTS${NC}"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Booking Management System is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the booking system implementation.${NC}"
    exit 1
fi 
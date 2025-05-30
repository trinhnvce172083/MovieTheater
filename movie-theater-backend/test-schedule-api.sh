#!/bin/bash

# Schedule Management API Testing Script
# Tests all schedule management endpoints

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:8080/cinema"
ADMIN_TOKEN=""
USER_TOKEN=""
SCHEDULE_ID=""
MOVIE_ID=""
CINEMA_ROOM_ID=""

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
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

make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local description=$5
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data" \
                "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Authorization: Bearer $token" \
                "$BASE_URL$endpoint")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    echo "Response: $response_body"
    echo "HTTP Code: $http_code"
    
    if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
        print_success "$description"
        return 0
    else
        print_error "$description (HTTP $http_code)"
        return 1
    fi
}

# Test 1: Health Check
print_header "SCHEDULE MANAGEMENT API TESTING"
print_test "1" "Health Check - Application Status"
make_request "GET" "/actuator/health" "" "" "Application should be running"

# Test 2: Admin Login
print_test "2" "Admin Authentication"
login_data='{
    "email": "admin@cinema.com",
    "password": "admin123"
}'

response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$login_data" \
    "$BASE_URL/auth/login")

if echo "$response" | grep -q '"success":true'; then
    ADMIN_TOKEN=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    print_success "Admin login successful"
    echo "Admin Token: ${ADMIN_TOKEN:0:20}..."
else
    print_error "Admin login failed"
    echo "Response: $response"
fi

# Test 3: Get Movie ID for testing
print_test "3" "Get Movie for Schedule Testing"
response=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
    "$BASE_URL/movies?page=0&size=1")

if echo "$response" | grep -q '"success":true'; then
    MOVIE_ID=$(echo "$response" | grep -o '"movieId":[0-9]*' | head -1 | cut -d':' -f2)
    print_success "Got movie ID for testing"
    echo "Movie ID: $MOVIE_ID"
else
    print_error "Failed to get movie ID"
fi

# Test 4: Get Cinema Room ID for testing
print_test "4" "Get Cinema Room for Schedule Testing"
response=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
    "$BASE_URL/cinema-rooms?page=0&size=1")

if echo "$response" | grep -q '"success":true'; then
    CINEMA_ROOM_ID=$(echo "$response" | grep -o '"cinemaRoomId":[0-9]*' | head -1 | cut -d':' -f2)
    print_success "Got cinema room ID for testing"
    echo "Cinema Room ID: $CINEMA_ROOM_ID"
else
    print_error "Failed to get cinema room ID"
fi

# Test 5: Create Schedule
print_test "5" "Create Schedule (Admin)"
if [ -n "$MOVIE_ID" ] && [ -n "$CINEMA_ROOM_ID" ]; then
    tomorrow=$(date -d "+1 day" +%Y-%m-%d)
    schedule_data="{
        \"movieId\": $MOVIE_ID,
        \"cinemaRoomId\": $CINEMA_ROOM_ID,
        \"showDate\": \"$tomorrow\",
        \"startTime\": \"14:00\",
        \"endTime\": \"16:30\",
        \"price\": 120000.0,
        \"status\": \"SCHEDULED\",
        \"is3D\": true,
        \"isIMAX\": false,
        \"is4DX\": false,
        \"subtitleLanguage\": \"Vietnamese\",
        \"audioLanguage\": \"Vietnamese\"
    }"

    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "$schedule_data" \
        "$BASE_URL/schedules")

    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)

    echo "Response: $response_body"
    echo "HTTP Code: $http_code"

    if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
        SCHEDULE_ID=$(echo "$response_body" | grep -o '"scheduleId":[0-9]*' | cut -d':' -f2)
        print_success "Schedule created successfully"
        echo "Schedule ID: $SCHEDULE_ID"
    else
        print_error "Schedule creation failed (HTTP $http_code)"
    fi
else
    print_error "No movie or cinema room ID available for testing"
fi

# Test 6: Get Schedule by ID
print_test "6" "Get Schedule by ID"
if [ -n "$SCHEDULE_ID" ]; then
    make_request "GET" "/schedules/$SCHEDULE_ID" "" "" "Should retrieve schedule details"
else
    print_error "No schedule ID available for testing"
fi

# Test 7: Get All Schedules
print_test "7" "Get All Schedules (Public)"
make_request "GET" "/schedules?page=0&size=10" "" "" "Should retrieve schedules list"

# Test 8: Get Schedules by Movie
print_test "8" "Get Schedules by Movie"
if [ -n "$MOVIE_ID" ]; then
    make_request "GET" "/schedules/movie/$MOVIE_ID" "" "" "Should retrieve schedules by movie"
else
    print_error "No movie ID available for testing"
fi

# Test 9: Get Schedules by Cinema Room
print_test "9" "Get Schedules by Cinema Room"
if [ -n "$CINEMA_ROOM_ID" ]; then
    make_request "GET" "/schedules/cinema-room/$CINEMA_ROOM_ID" "" "" "Should retrieve schedules by cinema room"
else
    print_error "No cinema room ID available for testing"
fi

# Test 10: Get Schedules by Date
print_test "10" "Get Schedules by Date"
tomorrow=$(date -d "+1 day" +%Y-%m-%d)
make_request "GET" "/schedules/date/$tomorrow" "" "" "Should retrieve schedules by date"

# Test 11: Get Schedules by Date Range
print_test "11" "Get Schedules by Date Range"
tomorrow=$(date -d "+1 day" +%Y-%m-%d)
next_week=$(date -d "+7 days" +%Y-%m-%d)
make_request "GET" "/schedules/date-range?startDate=$tomorrow&endDate=$next_week" "" "" "Should retrieve schedules by date range"

# Test 12: Get Schedules by Status
print_test "12" "Get Schedules by Status"
make_request "GET" "/schedules/status/SCHEDULED" "" "" "Should retrieve scheduled schedules"

# Test 13: Search Schedules
print_test "13" "Search Schedules"
make_request "GET" "/schedules/search?keyword=movie&page=0&size=10" "" "" "Should search schedules by keyword"

# Test 14: Get Available Schedules
print_test "14" "Get Available Schedules"
make_request "GET" "/schedules/available" "" "" "Should retrieve available schedules"

# Test 15: Get 3D Schedules
print_test "15" "Get 3D Schedules"
make_request "GET" "/schedules/features/3d" "" "" "Should retrieve 3D schedules"

# Test 16: Get IMAX Schedules
print_test "16" "Get IMAX Schedules"
make_request "GET" "/schedules/features/imax" "" "" "Should retrieve IMAX schedules"

# Test 17: Get 4DX Schedules
print_test "17" "Get 4DX Schedules"
make_request "GET" "/schedules/features/4dx" "" "" "Should retrieve 4DX schedules"

# Test 18: Get Today's Schedules
print_test "18" "Get Today's Schedules"
make_request "GET" "/schedules/today" "" "" "Should retrieve today's schedules"

# Test 19: Get Upcoming Schedules
print_test "19" "Get Upcoming Schedules"
make_request "GET" "/schedules/upcoming" "" "" "Should retrieve upcoming schedules"

# Test 20: Get Past Schedules
print_test "20" "Get Past Schedules"
make_request "GET" "/schedules/past" "" "" "Should retrieve past schedules"

# Test 21: Get Schedules by Price Range
print_test "21" "Get Schedules by Price Range"
make_request "GET" "/schedules/price-range?minPrice=50000&maxPrice=200000" "" "" "Should retrieve schedules by price range"

# Test 22: Get Popular Schedules
print_test "22" "Get Popular Schedules"
make_request "GET" "/schedules/popular?minOccupancyRate=50.0" "" "" "Should retrieve popular schedules"

# Test 23: Get Schedules by Subtitle Language
print_test "23" "Get Schedules by Subtitle Language"
make_request "GET" "/schedules/language/subtitle/Vietnamese" "" "" "Should retrieve schedules by subtitle language"

# Test 24: Get Schedules by Audio Language
print_test "24" "Get Schedules by Audio Language"
make_request "GET" "/schedules/language/audio/Vietnamese" "" "" "Should retrieve schedules by audio language"

# Test 25: Check Schedule Conflict
print_test "25" "Check Schedule Conflict"
if [ -n "$CINEMA_ROOM_ID" ]; then
    tomorrow=$(date -d "+1 day" +%Y-%m-%d)
    make_request "GET" "/schedules/check-conflict?cinemaRoomId=$CINEMA_ROOM_ID&showDate=$tomorrow&startTime=15:00&endTime=17:00" "" "" "Should check schedule conflict"
else
    print_error "No cinema room ID available for testing"
fi

# Test 26: Update Schedule (Admin)
print_test "26" "Update Schedule (Admin)"
if [ -n "$SCHEDULE_ID" ]; then
    update_data='{
        "price": 150000.0,
        "is3D": false,
        "subtitleLanguage": "English"
    }'
    make_request "PUT" "/schedules/$SCHEDULE_ID" "$update_data" "$ADMIN_TOKEN" "Should update schedule"
else
    print_error "No schedule ID available for testing"
fi

# Test 27: Book Seats (Admin)
print_test "27" "Book Seats (Admin)"
if [ -n "$SCHEDULE_ID" ]; then
    make_request "POST" "/schedules/$SCHEDULE_ID/book-seats?seatCount=5" "" "$ADMIN_TOKEN" "Should book seats"
else
    print_error "No schedule ID available for testing"
fi

# Test 28: Cancel Seat Booking (Admin)
print_test "28" "Cancel Seat Booking (Admin)"
if [ -n "$SCHEDULE_ID" ]; then
    make_request "POST" "/schedules/$SCHEDULE_ID/cancel-booking?seatCount=2" "" "$ADMIN_TOKEN" "Should cancel seat booking"
else
    print_error "No schedule ID available for testing"
fi

# Test 29: Start Schedule (Admin)
print_test "29" "Start Schedule (Admin)"
if [ -n "$SCHEDULE_ID" ]; then
    make_request "POST" "/schedules/$SCHEDULE_ID/start" "" "$ADMIN_TOKEN" "Should start schedule"
else
    print_error "No schedule ID available for testing"
fi

# Test 30: Complete Schedule (Admin)
print_test "30" "Complete Schedule (Admin)"
if [ -n "$SCHEDULE_ID" ]; then
    make_request "POST" "/schedules/$SCHEDULE_ID/complete" "" "$ADMIN_TOKEN" "Should complete schedule"
else
    print_error "No schedule ID available for testing"
fi

# Test 31: Get Schedule Statistics (Admin)
print_test "31" "Get Schedule Statistics (Admin)"
make_request "GET" "/schedules/statistics" "" "$ADMIN_TOKEN" "Should retrieve schedule statistics"

# Test 32: Get Revenue (Admin)
print_test "32" "Get Revenue (Admin)"
start_date=$(date -d "-30 days" +%Y-%m-%d)
end_date=$(date +%Y-%m-%d)
make_request "GET" "/schedules/revenue?startDate=$start_date&endDate=$end_date" "" "$ADMIN_TOKEN" "Should retrieve revenue"

# Test 33: Get Average Occupancy Rate (Admin)
print_test "33" "Get Average Occupancy Rate (Admin)"
make_request "GET" "/schedules/occupancy-rate" "" "$ADMIN_TOKEN" "Should retrieve average occupancy rate"

# Test 34: Bulk Create Schedules (Admin)
print_test "34" "Bulk Create Schedules (Admin)"
if [ -n "$MOVIE_ID" ] && [ -n "$CINEMA_ROOM_ID" ]; then
    day_after_tomorrow=$(date -d "+2 days" +%Y-%m-%d)
    bulk_data="{
        \"movieId\": $MOVIE_ID,
        \"timeSlots\": [
            {
                \"cinemaRoomId\": $CINEMA_ROOM_ID,
                \"showDate\": \"$day_after_tomorrow\",
                \"startTime\": \"09:00\",
                \"endTime\": \"11:30\",
                \"price\": 100000.0,
                \"is3D\": false
            },
            {
                \"cinemaRoomId\": $CINEMA_ROOM_ID,
                \"showDate\": \"$day_after_tomorrow\",
                \"startTime\": \"19:00\",
                \"endTime\": \"21:30\",
                \"price\": 130000.0,
                \"is3D\": true
            }
        ]
    }"
    make_request "POST" "/schedules/bulk" "$bulk_data" "$ADMIN_TOKEN" "Should bulk create schedules"
else
    print_error "No movie or cinema room ID available for testing"
fi

# Test 35: Unauthorized Access Test
print_test "35" "Unauthorized Access Test"
schedule_data='{
    "movieId": 1,
    "cinemaRoomId": 1,
    "showDate": "2024-12-31",
    "startTime": "20:00",
    "endTime": "22:30",
    "price": 120000.0
}'

response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$schedule_data" \
    "$BASE_URL/schedules")

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "401" || "$http_code" == "403" ]]; then
    print_success "Unauthorized access properly blocked"
else
    print_error "Unauthorized access not properly blocked (HTTP $http_code)"
fi

# Test 36: Invalid Schedule ID
print_test "36" "Invalid Schedule ID"
response=$(curl -s -w "\n%{http_code}" -X GET \
    "$BASE_URL/schedules/99999")

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "404" ]]; then
    print_success "Invalid schedule ID properly handled"
else
    print_error "Invalid schedule ID not properly handled (HTTP $http_code)"
fi

# Test 37: Schedule Conflict Test
print_test "37" "Schedule Conflict Test"
if [ -n "$MOVIE_ID" ] && [ -n "$CINEMA_ROOM_ID" ]; then
    tomorrow=$(date -d "+1 day" +%Y-%m-%d)
    conflict_data="{
        \"movieId\": $MOVIE_ID,
        \"cinemaRoomId\": $CINEMA_ROOM_ID,
        \"showDate\": \"$tomorrow\",
        \"startTime\": \"14:30\",
        \"endTime\": \"17:00\",
        \"price\": 120000.0
    }"

    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "$conflict_data" \
        "$BASE_URL/schedules")

    http_code=$(echo "$response" | tail -n1)
    if [[ "$http_code" == "409" ]]; then
        print_success "Schedule conflict properly detected"
    else
        print_error "Schedule conflict not properly detected (HTTP $http_code)"
    fi
else
    print_error "No movie or cinema room ID available for testing"
fi

# Test 38: Invalid Time Range
print_test "38" "Invalid Time Range"
if [ -n "$MOVIE_ID" ] && [ -n "$CINEMA_ROOM_ID" ]; then
    tomorrow=$(date -d "+1 day" +%Y-%m-%d)
    invalid_data="{
        \"movieId\": $MOVIE_ID,
        \"cinemaRoomId\": $CINEMA_ROOM_ID,
        \"showDate\": \"$tomorrow\",
        \"startTime\": \"16:00\",
        \"endTime\": \"14:00\",
        \"price\": 120000.0
    }"

    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "$invalid_data" \
        "$BASE_URL/schedules")

    http_code=$(echo "$response" | tail -n1)
    if [[ "$http_code" == "400" ]]; then
        print_success "Invalid time range properly rejected"
    else
        print_error "Invalid time range not properly rejected (HTTP $http_code)"
    fi
else
    print_error "No movie or cinema room ID available for testing"
fi

# Test 39: Past Date Schedule
print_test "39" "Past Date Schedule"
if [ -n "$MOVIE_ID" ] && [ -n "$CINEMA_ROOM_ID" ]; then
    yesterday=$(date -d "-1 day" +%Y-%m-%d)
    past_data="{
        \"movieId\": $MOVIE_ID,
        \"cinemaRoomId\": $CINEMA_ROOM_ID,
        \"showDate\": \"$yesterday\",
        \"startTime\": \"14:00\",
        \"endTime\": \"16:30\",
        \"price\": 120000.0
    }"

    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "$past_data" \
        "$BASE_URL/schedules")

    http_code=$(echo "$response" | tail -n1)
    if [[ "$http_code" == "400" ]]; then
        print_success "Past date schedule properly rejected"
    else
        print_error "Past date schedule not properly rejected (HTTP $http_code)"
    fi
else
    print_error "No movie or cinema room ID available for testing"
fi

# Test 40: Delete Schedule (Admin)
print_test "40" "Delete Schedule (Admin)"
if [ -n "$SCHEDULE_ID" ]; then
    make_request "DELETE" "/schedules/$SCHEDULE_ID" "" "$ADMIN_TOKEN" "Should delete schedule"
else
    print_error "No schedule ID available for testing"
fi

# Final Results
print_header "TEST RESULTS SUMMARY"
echo -e "${BLUE}Total Tests: $TOTAL_TESTS${NC}"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Schedule Management API is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the schedule management implementation.${NC}"
    exit 1
fi 
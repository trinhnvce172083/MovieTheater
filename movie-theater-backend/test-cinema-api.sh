#!/bin/bash

# Cinema Room Management API Testing Script
# Tests all cinema room and seat management endpoints

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
print_header "CINEMA ROOM MANAGEMENT API TESTING"
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

# Test 3: Create Cinema Room
print_test "3" "Create Cinema Room (Admin)"
cinema_room_data='{
    "cinemaRoomName": "Room A1",
    "seatQuantity": 100,
    "roomType": "STANDARD",
    "description": "Standard cinema room with comfortable seating",
    "rows": 10,
    "columns": 10,
    "has3D": true,
    "hasDolbyAtmos": false,
    "hasReclinerSeats": false,
    "priceMultiplier": 1.0
}'

response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "$cinema_room_data" \
    "$BASE_URL/cinema-rooms")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

echo "Response: $response_body"
echo "HTTP Code: $http_code"

if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
    CINEMA_ROOM_ID=$(echo "$response_body" | grep -o '"cinemaRoomId":[0-9]*' | cut -d':' -f2)
    print_success "Cinema room created successfully"
    echo "Cinema Room ID: $CINEMA_ROOM_ID"
else
    print_error "Cinema room creation failed (HTTP $http_code)"
fi

# Test 4: Get Cinema Room by ID
print_test "4" "Get Cinema Room by ID"
if [ -n "$CINEMA_ROOM_ID" ]; then
    make_request "GET" "/cinema-rooms/$CINEMA_ROOM_ID" "" "" "Should retrieve cinema room details"
else
    print_error "No cinema room ID available for testing"
fi

# Test 5: Get All Cinema Rooms
print_test "5" "Get All Cinema Rooms (Public)"
make_request "GET" "/cinema-rooms?page=0&size=10" "" "" "Should retrieve cinema rooms list"

# Test 6: Create VIP Cinema Room
print_test "6" "Create VIP Cinema Room (Admin)"
vip_room_data='{
    "cinemaRoomName": "VIP Room 1",
    "seatQuantity": 50,
    "roomType": "VIP",
    "description": "Luxury VIP cinema room with recliner seats",
    "rows": 5,
    "columns": 10,
    "has3D": true,
    "hasDolbyAtmos": true,
    "hasReclinerSeats": true,
    "priceMultiplier": 2.0
}'

make_request "POST" "/cinema-rooms" "$vip_room_data" "$ADMIN_TOKEN" "VIP cinema room creation"

# Test 7: Search Cinema Rooms
print_test "7" "Search Cinema Rooms"
make_request "GET" "/cinema-rooms/search?keyword=Room&page=0&size=10" "" "" "Should find cinema rooms by keyword"

# Test 8: Get Cinema Rooms by Type
print_test "8" "Get Cinema Rooms by Type"
make_request "GET" "/cinema-rooms/type/STANDARD" "" "" "Should retrieve standard cinema rooms"

# Test 9: Get Premium Cinema Rooms
print_test "9" "Get Premium Cinema Rooms"
make_request "GET" "/cinema-rooms/premium" "" "" "Should retrieve premium cinema rooms"

# Test 10: Get Cinema Rooms with 3D
print_test "10" "Get Cinema Rooms with 3D"
make_request "GET" "/cinema-rooms/features/3d" "" "" "Should retrieve 3D cinema rooms"

# Test 11: Get Cinema Rooms with Dolby Atmos
print_test "11" "Get Cinema Rooms with Dolby Atmos"
make_request "GET" "/cinema-rooms/features/dolby-atmos" "" "" "Should retrieve Dolby Atmos cinema rooms"

# Test 12: Get Cinema Rooms with Recliner Seats
print_test "12" "Get Cinema Rooms with Recliner Seats"
make_request "GET" "/cinema-rooms/features/recliner" "" "" "Should retrieve recliner cinema rooms"

# Test 13: Get Cinema Rooms by Seats Range
print_test "13" "Get Cinema Rooms by Seats Range"
make_request "GET" "/cinema-rooms/seats-range?minSeats=50&maxSeats=150" "" "" "Should retrieve cinema rooms in seat range"

# Test 14: Get Available Cinema Rooms
print_test "14" "Get Available Cinema Rooms"
tomorrow=$(date -d "+1 day" +%Y-%m-%d)
make_request "GET" "/cinema-rooms/available?showDate=$tomorrow&startTime=14:00&endTime=16:30" "" "" "Should retrieve available cinema rooms"

# Test 15: Get Cinema Rooms by Capacity
print_test "15" "Get Cinema Rooms by Capacity"
make_request "GET" "/cinema-rooms/capacity?ascending=false" "" "" "Should retrieve cinema rooms ordered by capacity"

# Test 16: Check Cinema Room Name Exists
print_test "16" "Check Cinema Room Name Exists"
make_request "GET" "/cinema-rooms/check-name?cinemaRoomName=Room A1" "" "" "Should check if cinema room name exists"

# Test 17: Get Seat Layout
print_test "17" "Get Seat Layout"
if [ -n "$CINEMA_ROOM_ID" ]; then
    make_request "GET" "/cinema-rooms/$CINEMA_ROOM_ID/seats" "" "" "Should retrieve seat layout"
else
    print_error "No cinema room ID available for testing"
fi

# Test 18: Get Seats with Pagination
print_test "18" "Get Seats with Pagination"
if [ -n "$CINEMA_ROOM_ID" ]; then
    make_request "GET" "/cinema-rooms/$CINEMA_ROOM_ID/seats/paginated?page=0&size=20" "" "" "Should retrieve seats with pagination"
else
    print_error "No cinema room ID available for testing"
fi

# Test 19: Generate Default Seat Layout (Admin)
print_test "19" "Generate Default Seat Layout (Admin)"
if [ -n "$CINEMA_ROOM_ID" ]; then
    make_request "POST" "/cinema-rooms/$CINEMA_ROOM_ID/seats/generate" "" "$ADMIN_TOKEN" "Should generate default seat layout"
else
    print_error "No cinema room ID available for testing"
fi

# Test 20: Create Custom Seat Layout (Admin)
print_test "20" "Create Custom Seat Layout (Admin)"
if [ -n "$CINEMA_ROOM_ID" ]; then
    seat_layout_data="{
        \"cinemaRoomId\": $CINEMA_ROOM_ID,
        \"seats\": [
            {\"seatRow\": 1, \"seatColumn\": 1, \"seatType\": \"WHEELCHAIR\", \"priceMultiplier\": 1.0},
            {\"seatRow\": 1, \"seatColumn\": 2, \"seatType\": \"WHEELCHAIR\", \"priceMultiplier\": 1.0},
            {\"seatRow\": 2, \"seatColumn\": 1, \"seatType\": \"STANDARD\", \"priceMultiplier\": 1.0},
            {\"seatRow\": 2, \"seatColumn\": 2, \"seatType\": \"STANDARD\", \"priceMultiplier\": 1.0},
            {\"seatRow\": 10, \"seatColumn\": 5, \"seatType\": \"VIP\", \"isRecliner\": true, \"priceMultiplier\": 1.5}
        ]
    }"
    make_request "POST" "/cinema-rooms/seats/layout" "$seat_layout_data" "$ADMIN_TOKEN" "Should create custom seat layout"
else
    print_error "No cinema room ID available for testing"
fi

# Test 21: Reset Seat Layout (Admin)
print_test "21" "Reset Seat Layout (Admin)"
if [ -n "$CINEMA_ROOM_ID" ]; then
    make_request "POST" "/cinema-rooms/$CINEMA_ROOM_ID/seats/reset" "" "$ADMIN_TOKEN" "Should reset seat layout"
else
    print_error "No cinema room ID available for testing"
fi

# Test 22: Update Cinema Room (Admin)
print_test "22" "Update Cinema Room (Admin)"
if [ -n "$CINEMA_ROOM_ID" ]; then
    update_data='{
        "description": "Updated description for standard cinema room",
        "hasDolbyAtmos": true,
        "priceMultiplier": 1.2
    }'
    make_request "PUT" "/cinema-rooms/$CINEMA_ROOM_ID" "$update_data" "$ADMIN_TOKEN" "Should update cinema room"
else
    print_error "No cinema room ID available for testing"
fi

# Test 23: Get Cinema Room Statistics (Admin)
print_test "23" "Get Cinema Room Statistics (Admin)"
make_request "GET" "/cinema-rooms/statistics" "" "$ADMIN_TOKEN" "Should retrieve cinema room statistics"

# Test 24: Unauthorized Access Test
print_test "24" "Unauthorized Access Test"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$cinema_room_data" \
    "$BASE_URL/cinema-rooms")

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "401" || "$http_code" == "403" ]]; then
    print_success "Unauthorized access properly blocked"
else
    print_error "Unauthorized access not properly blocked (HTTP $http_code)"
fi

# Test 25: Invalid Cinema Room ID
print_test "25" "Invalid Cinema Room ID"
response=$(curl -s -w "\n%{http_code}" -X GET \
    "$BASE_URL/cinema-rooms/99999")

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "404" ]]; then
    print_success "Invalid cinema room ID properly handled"
else
    print_error "Invalid cinema room ID not properly handled (HTTP $http_code)"
fi

# Test 26: Duplicate Cinema Room Name
print_test "26" "Duplicate Cinema Room Name"
duplicate_data='{
    "cinemaRoomName": "Room A1",
    "seatQuantity": 80,
    "roomType": "STANDARD",
    "rows": 8,
    "columns": 10,
    "priceMultiplier": 1.0
}'

response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "$duplicate_data" \
    "$BASE_URL/cinema-rooms")

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "409" ]]; then
    print_success "Duplicate cinema room name properly rejected"
else
    print_error "Duplicate cinema room name not properly rejected (HTTP $http_code)"
fi

# Test 27: Invalid Seat Layout
print_test "27" "Invalid Seat Layout"
if [ -n "$CINEMA_ROOM_ID" ]; then
    invalid_layout_data="{
        \"cinemaRoomId\": $CINEMA_ROOM_ID,
        \"seats\": [
            {\"seatRow\": 15, \"seatColumn\": 15, \"seatType\": \"STANDARD\"}
        ]
    }"
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d "$invalid_layout_data" \
        "$BASE_URL/cinema-rooms/seats/layout")
    
    http_code=$(echo "$response" | tail -n1)
    if [[ "$http_code" == "400" ]]; then
        print_success "Invalid seat layout properly rejected"
    else
        print_error "Invalid seat layout not properly rejected (HTTP $http_code)"
    fi
else
    print_error "No cinema room ID available for testing"
fi

# Test 28: Delete Cinema Room (Admin)
print_test "28" "Delete Cinema Room (Admin)"
if [ -n "$CINEMA_ROOM_ID" ]; then
    make_request "DELETE" "/cinema-rooms/$CINEMA_ROOM_ID" "" "$ADMIN_TOKEN" "Should delete cinema room"
else
    print_error "No cinema room ID available for testing"
fi

# Test 29: Restore Cinema Room (Admin)
print_test "29" "Restore Cinema Room (Admin)"
if [ -n "$CINEMA_ROOM_ID" ]; then
    make_request "POST" "/cinema-rooms/$CINEMA_ROOM_ID/restore" "" "$ADMIN_TOKEN" "Should restore cinema room"
else
    print_error "No cinema room ID available for testing"
fi

# Test 30: Validation Test - Invalid Data
print_test "30" "Validation Test - Invalid Data"
invalid_data='{
    "cinemaRoomName": "",
    "seatQuantity": -1,
    "roomType": "INVALID",
    "rows": 0,
    "columns": 0,
    "priceMultiplier": -1.0
}'

response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "$invalid_data" \
    "$BASE_URL/cinema-rooms")

http_code=$(echo "$response" | tail -n1)
if [[ "$http_code" == "400" ]]; then
    print_success "Invalid data properly validated"
else
    print_error "Invalid data not properly validated (HTTP $http_code)"
fi

# Final Results
print_header "TEST RESULTS SUMMARY"
echo -e "${BLUE}Total Tests: $TOTAL_TESTS${NC}"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Cinema Room Management API is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the cinema room management implementation.${NC}"
    exit 1
fi 
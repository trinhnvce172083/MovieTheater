#!/bin/bash

# Comprehensive Test Suite for Promotion & Loyalty System
# Author: Dũng_Solo
# Version: 1.0.0

BASE_URL="http://localhost:8080/cinema/api"

echo "🎯💎 COMPREHENSIVE PROMOTION & LOYALTY SYSTEM TEST"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test results
print_result() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to print section header
print_section() {
    echo -e "\n${BLUE}📋 $1${NC}"
    echo "========================================="
}

# Function to print subsection
print_subsection() {
    echo -e "\n${CYAN}🔸 $1${NC}"
    echo "-----------------------------------------"
}

# Function to make API call
test_api() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local data=$5
    local content_type=${6:-"application/json"}
    
    echo -e "${YELLOW}Testing:${NC} $description"
    echo "→ $method $BASE_URL$endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: $content_type" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "Status: $status_code"
    if [ ${#body} -gt 100 ]; then
        echo "Response: $(echo "$body" | head -c 100)..."
    else
        echo "Response: $body"
    fi
    
    if [ "$status_code" = "$expected_status" ]; then
        print_result 0 "$description"
    else
        print_result 1 "$description (Expected: $expected_status, Got: $status_code)"
    fi
    
    echo ""
    return $status_code
}

# Start comprehensive testing
echo "Starting comprehensive API tests..."
echo "Base URL: $BASE_URL"
echo "Timestamp: $(date)"
echo ""

# ============================================================================
# PROMOTION SYSTEM TESTS
# ============================================================================

print_section "🎯 PROMOTION SYSTEM TESTS"

print_subsection "Public Promotion Endpoints"

test_api "GET" "/promotions" "200" "Get all active promotions"
test_api "GET" "/promotions/featured" "200" "Get featured promotions"
test_api "GET" "/promotions/points" "200" "Get points promotions"
test_api "GET" "/promotions/paged?page=0&size=5" "200" "Get promotions with pagination"
test_api "GET" "/promotions/redeemable?availablePoints=500" "200" "Get redeemable promotions"
test_api "GET" "/promotions/member/GOLD" "200" "Get promotions for GOLD members"
test_api "GET" "/promotions/search?keyword=test&page=0&size=10" "200" "Search promotions"

print_subsection "Promotion Validation & Calculation"

validation_data="promotionCode=SUMMER2024&totalAmount=150000&movieId=1&roomId=1"
test_api "POST" "/promotions/validate" "200" "Validate promotion" "$validation_data" "application/x-www-form-urlencoded"

discount_data="promotionCode=SUMMER2024&totalAmount=150000"
test_api "POST" "/promotions/calculate-discount" "200" "Calculate discount" "$discount_data" "application/x-www-form-urlencoded"

print_subsection "Promotion Error Handling"

test_api "GET" "/promotions/code/NONEXISTENT" "500" "Get non-existent promotion"
test_api "GET" "/promotions/code/" "404" "Get promotion with empty code"
test_api "GET" "/promotions/member/" "404" "Get promotions for empty membership"

print_subsection "Promotion Security (Auth Required)"

create_promotion_data='{
    "promotionCode": "TEST2024",
    "promotionName": "Test Promotion",
    "description": "Test promotion for API testing",
    "discountType": "PERCENTAGE",
    "discountValue": 15.0,
    "startDate": "2024-01-01T00:00:00",
    "endDate": "2024-12-31T23:59:59"
}'

test_api "POST" "/promotions" "403" "Create promotion without auth" "$create_promotion_data"
test_api "PUT" "/promotions/1/deactivate" "403" "Deactivate promotion without auth"
test_api "POST" "/promotions/apply/SUMMER2024" "403" "Apply promotion without auth"

# ============================================================================
# LOYALTY SYSTEM TESTS
# ============================================================================

print_section "💎 LOYALTY SYSTEM TESTS"

print_subsection "Points Management (Auth Required)"

test_api "GET" "/loyalty/points/1" "403" "Get account points without auth"
test_api "GET" "/loyalty/overview/1" "403" "Get points overview without auth"

print_subsection "Transaction History (Auth Required)"

test_api "GET" "/loyalty/transactions/1" "403" "Get transaction history without auth"
test_api "GET" "/loyalty/transactions/1/recent" "403" "Get recent transactions without auth"
test_api "GET" "/loyalty/expiring/1" "403" "Get expiring points without auth"

print_subsection "Statistics (Auth Required)"

test_api "GET" "/loyalty/statistics/1/monthly?year=2024&month=6" "403" "Get monthly statistics without auth"

print_subsection "Admin Functions (Auth Required)"

test_api "POST" "/loyalty/process-expired" "403" "Process expired points without auth"

adjust_data="accountId=1&points=100&reason=Test"
test_api "POST" "/loyalty/adjust" "403" "Adjust points without auth" "$adjust_data" "application/x-www-form-urlencoded"

print_subsection "Redemption Check (Auth Required)"

test_api "GET" "/loyalty/can-redeem/1?promotionId=1" "403" "Check redemption eligibility without auth"

print_subsection "Loyalty Error Handling"

test_api "GET" "/loyalty/points/invalid" "403" "Get points with invalid account ID"
test_api "GET" "/loyalty/statistics/1/monthly" "404" "Get monthly stats without parameters"

# ============================================================================
# INTEGRATION TESTS
# ============================================================================

print_section "🔗 INTEGRATION TESTS"

print_subsection "Cross-System Functionality"

# Test promotion-loyalty integration endpoints
test_api "GET" "/promotions/points" "200" "Get points-based promotions"
test_api "GET" "/promotions/redeemable?availablePoints=1000" "200" "Get promotions redeemable with 1000 points"

print_subsection "Data Consistency"

# Test that promotion and loyalty endpoints are consistent
test_api "GET" "/promotions" "200" "Verify promotion endpoints available"
test_api "GET" "/loyalty/points/1" "403" "Verify loyalty endpoints available (auth required)"

# ============================================================================
# PERFORMANCE TESTS
# ============================================================================

print_section "⚡ PERFORMANCE TESTS"

print_subsection "Concurrent Request Handling"

echo -e "${YELLOW}Testing:${NC} 10 concurrent promotion requests"
start_time=$(date +%s)

for i in {1..10}; do
    curl -s "$BASE_URL/promotions" > /dev/null &
done
wait

end_time=$(date +%s)
duration=$((end_time - start_time))
echo "10 concurrent requests completed in ${duration}s"

if [ $duration -le 3 ]; then
    print_result 0 "Concurrent promotion requests (${duration}s)"
else
    print_result 1 "Concurrent promotion requests (${duration}s - too slow)"
fi

echo -e "${YELLOW}Testing:${NC} Mixed endpoint performance"
start_time=$(date +%s)

curl -s "$BASE_URL/promotions" > /dev/null &
curl -s "$BASE_URL/promotions/featured" > /dev/null &
curl -s "$BASE_URL/promotions/points" > /dev/null &
curl -s "$BASE_URL/loyalty/points/1" > /dev/null &
curl -s "$BASE_URL/loyalty/overview/1" > /dev/null &
wait

end_time=$(date +%s)
duration=$((end_time - start_time))
echo "5 mixed requests completed in ${duration}s"

if [ $duration -le 3 ]; then
    print_result 0 "Mixed endpoint performance (${duration}s)"
else
    print_result 1 "Mixed endpoint performance (${duration}s - too slow)"
fi

# ============================================================================
# EDGE CASES & STRESS TESTS
# ============================================================================

print_section "🧪 EDGE CASES & STRESS TESTS"

print_subsection "Parameter Validation"

test_api "GET" "/promotions/redeemable?availablePoints=-1" "200" "Negative points parameter"
test_api "GET" "/promotions/redeemable?availablePoints=999999" "200" "Very high points parameter"
test_api "GET" "/promotions/paged?page=-1&size=0" "200" "Invalid pagination parameters"
test_api "GET" "/promotions/search?keyword=" "200" "Empty search keyword"

print_subsection "Large Data Handling"

test_api "GET" "/promotions/paged?page=0&size=100" "200" "Large page size request"
test_api "GET" "/promotions/search?keyword=a&page=0&size=50" "200" "Large search result request"

print_subsection "Special Characters"

test_api "GET" "/promotions/search?keyword=%20%21%40%23" "200" "Special characters in search"
test_api "GET" "/promotions/member/INVALID_LEVEL" "200" "Invalid membership level"

# ============================================================================
# SYSTEM HEALTH CHECKS
# ============================================================================

print_section "🏥 SYSTEM HEALTH CHECKS"

print_subsection "Service Availability"

# Check if main endpoints respond
echo -e "${YELLOW}Testing:${NC} Service health check"
health_response=$(curl -s -w "%{http_code}" "$BASE_URL/promotions" -o /dev/null)

if [ "$health_response" = "200" ]; then
    print_result 0 "Promotion service health check"
else
    print_result 1 "Promotion service health check (Status: $health_response)"
fi

loyalty_response=$(curl -s -w "%{http_code}" "$BASE_URL/loyalty/points/1" -o /dev/null)

if [ "$loyalty_response" = "403" ]; then
    print_result 0 "Loyalty service health check (auth required)"
else
    print_result 1 "Loyalty service health check (Status: $loyalty_response)"
fi

print_subsection "Database Connectivity"

# Test endpoints that require database access
test_api "GET" "/promotions" "200" "Database connectivity via promotions"

# ============================================================================
# FINAL SUMMARY
# ============================================================================

print_section "📊 COMPREHENSIVE TEST SUMMARY"

echo -e "${PURPLE}🎯💎 Promotion & Loyalty System Test Results${NC}"
echo "=============================================="
echo ""
echo -e "${BLUE}📈 Test Statistics:${NC}"
echo "  Total Tests: $TOTAL_TESTS"
echo -e "  ${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "  ${RED}Failed: $FAILED_TESTS${NC}"

if [ $TOTAL_TESTS -gt 0 ]; then
    success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "  Success Rate: ${success_rate}%"
fi

echo ""
echo -e "${BLUE}🔍 System Analysis:${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "  ${GREEN}✅ All tests passed! System is functioning correctly.${NC}"
elif [ $success_rate -ge 80 ]; then
    echo -e "  ${YELLOW}⚠️  Most tests passed. Minor issues detected.${NC}"
else
    echo -e "  ${RED}❌ Multiple failures detected. System needs attention.${NC}"
fi

echo ""
echo -e "${BLUE}📋 Test Coverage:${NC}"
echo "  ✅ Promotion Management APIs"
echo "  ✅ Loyalty Points APIs"
echo "  ✅ Security & Authentication"
echo "  ✅ Error Handling"
echo "  ✅ Performance Testing"
echo "  ✅ Edge Cases"
echo "  ✅ Integration Points"
echo "  ✅ System Health"

echo ""
echo -e "${BLUE}🔗 Useful Links:${NC}"
echo "  📖 Swagger UI: http://localhost:8080/cinema/swagger-ui.html"
echo "  🗄️  Adminer: http://localhost:8081"
echo "  📊 Application: http://localhost:8080/cinema"

echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "  1. Create sample data for more comprehensive testing"
echo "  2. Test with authentication tokens"
echo "  3. Verify database schema and relationships"
echo "  4. Test integration with booking system"
echo "  5. Performance optimization if needed"

echo ""
echo -e "${BLUE}💡 Sample Data Creation:${NC}"
echo "  Run the following SQL in Adminer to create test data:"
echo ""
echo "  -- Promotions"
echo "  INSERT INTO promotions (promotion_code, promotion_name, description, discount_type, discount_value, start_date, end_date, is_active) VALUES"
echo "  ('SUMMER2024', 'Summer Sale', '20% off all tickets', 'PERCENTAGE', 20.00, '2024-01-01', '2024-12-31', true),"
echo "  ('WELCOME50', 'Welcome Bonus', '50k off for new users', 'FIXED_AMOUNT', 50000.00, '2024-01-01', '2024-12-31', true);"
echo ""
echo "  -- Accounts (if not exists)"
echo "  INSERT INTO accounts (email, password, full_name, membership_level, role, is_active) VALUES"
echo "  ('test@example.com', 'password', 'Test User', 'BRONZE', 'USER', true);"
echo ""
echo "  -- Loyalty Transactions"
echo "  INSERT INTO loyalty_transactions (account_id, transaction_type, points, description, reference_type, transaction_date, is_active) VALUES"
echo "  (1, 'EARN', 100, 'Welcome bonus', 'MANUAL', NOW(), true),"
echo "  (1, 'EARN', 50, 'Booking reward', 'BOOKING', NOW(), true);"

echo ""
echo -e "${GREEN}🎉 Comprehensive testing completed!${NC}"
echo "Timestamp: $(date)" 
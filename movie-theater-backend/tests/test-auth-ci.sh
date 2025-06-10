#!/bin/bash

# Movie Theater Authentication Test Script for CI/CD
# Enhanced version with better error handling and logging

set -e  # Exit on any error

BASE_URL="http://localhost:8080/cinema"
LOG_FILE="auth-test-results.log"
FAILED_TESTS=0
TOTAL_TESTS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Test function with error handling
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_success="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log "${YELLOW}[TEST $TOTAL_TESTS] $test_name${NC}"
    
    if eval "$test_command"; then
        if [ "$expected_success" = "true" ]; then
            log "${GREEN}✅ PASSED: $test_name${NC}"
            return 0
        else
            log "${RED}❌ FAILED: $test_name (Expected failure but got success)${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
    else
        if [ "$expected_success" = "false" ]; then
            log "${GREEN}✅ PASSED: $test_name (Expected failure)${NC}"
            return 0
        else
            log "${RED}❌ FAILED: $test_name${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
    fi
}

# Wait for application to be ready
wait_for_app() {
    log "${YELLOW}🔄 Waiting for application to be ready...${NC}"
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$BASE_URL/actuator/health" > /dev/null 2>&1; then
            log "${GREEN}✅ Application is ready!${NC}"
            return 0
        fi
        log "Attempt $attempt/$max_attempts - Application not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log "${RED}❌ Application failed to start within timeout${NC}"
    return 1
}

# Initialize log file
echo "=== Movie Theater Authentication CI/CD Test ===" > "$LOG_FILE"
echo "Started at: $(date)" >> "$LOG_FILE"
echo "Base URL: $BASE_URL" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

log "${YELLOW}=== Movie Theater Authentication CI/CD Test ===${NC}"
log "Base URL: $BASE_URL"
log ""

# Wait for application
if ! wait_for_app; then
    log "${RED}❌ Application startup failed${NC}"
    exit 1
fi

# Test 1: Health Check
run_test "Health Check" \
    "curl -s '$BASE_URL/actuator/health' | jq -e '.status == \"UP\"'" \
    "true"

# Test 2: Public endpoint
run_test "Public Endpoint Access" \
    "curl -s '$BASE_URL/test/public' | jq -e '.success == true'" \
    "true"

# Test 3: Register new user
log "${YELLOW}🔐 Testing user registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "CI Test User",
    "email": "ci-test@example.com",
    "password": "Test123456",
    "confirmPassword": "Test123456",
    "phoneNumber": "0123456789"
  }')

echo "$REGISTER_RESPONSE" >> "$LOG_FILE"

run_test "User Registration" \
    "echo '$REGISTER_RESPONSE' | jq -e '.success == true'" \
    "true"

# Extract token
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.accessToken // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    log "${YELLOW}⚠️ Registration token not found, trying login...${NC}"
    
    # Test 4: Login fallback
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "ci-test@example.com",
            "password": "Test123456"
        }')
    
    echo "$LOGIN_RESPONSE" >> "$LOG_FILE"
    
    run_test "User Login (Fallback)" \
        "echo '$LOGIN_RESPONSE' | jq -e '.success == true'" \
        "true"
    
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // empty')
fi

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    log "${GREEN}🔑 Token obtained successfully${NC}"
    
    # Test 5: Protected endpoint
    run_test "Protected Endpoint Access" \
        "curl -s '$BASE_URL/test/protected' -H 'Authorization: Bearer $TOKEN' | jq -e '.success == true'" \
        "true"
    
    # Test 6: Customer endpoint (should succeed)
    run_test "Customer Endpoint Access" \
        "curl -s '$BASE_URL/test/customer' -H 'Authorization: Bearer $TOKEN' | jq -e '.success == true'" \
        "true"
    
    # Test 7: Admin endpoint (should fail for customer)
    run_test "Admin Endpoint Access (Should Fail)" \
        "curl -s '$BASE_URL/test/admin' -H 'Authorization: Bearer $TOKEN' | jq -e '.success == true'" \
        "false"
    
    # Test 8: Invalid token
    run_test "Invalid Token Rejection" \
        "curl -s '$BASE_URL/test/protected' -H 'Authorization: Bearer invalid_token' | jq -e '.success == true'" \
        "false"
    
    # Test 9: Logout
    run_test "User Logout" \
        "curl -s -X POST '$BASE_URL/auth/logout' -H 'Authorization: Bearer $TOKEN' | jq -e '.success == true'" \
        "true"
    
else
    log "${RED}❌ Failed to obtain authentication token${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test 10: Duplicate registration (should fail)
run_test "Duplicate Registration Prevention" \
    "curl -s -X POST '$BASE_URL/auth/register' \
        -H 'Content-Type: application/json' \
        -d '{
            \"fullName\": \"CI Test User 2\",
            \"email\": \"ci-test@example.com\",
            \"password\": \"Test123456\",
            \"confirmPassword\": \"Test123456\",
            \"phoneNumber\": \"0123456789\"
        }' | jq -e '.success == true'" \
    "false"

# Test 11: Invalid login
run_test "Invalid Login Rejection" \
    "curl -s -X POST '$BASE_URL/auth/login' \
        -H 'Content-Type: application/json' \
        -d '{
            \"email\": \"ci-test@example.com\",
            \"password\": \"WrongPassword\"
        }' | jq -e '.success == true'" \
    "false"

# Summary
log ""
log "${YELLOW}=== Test Summary ===${NC}"
log "Total Tests: $TOTAL_TESTS"
log "Passed: $((TOTAL_TESTS - FAILED_TESTS))"
log "Failed: $FAILED_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    log "${GREEN}🎉 All tests passed!${NC}"
    echo "SUCCESS" >> "$LOG_FILE"
    exit 0
else
    log "${RED}💥 $FAILED_TESTS test(s) failed!${NC}"
    echo "FAILURE" >> "$LOG_FILE"
    exit 1
fi 
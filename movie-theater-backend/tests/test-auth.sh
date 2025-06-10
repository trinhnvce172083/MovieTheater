#!/bin/bash

# Movie Theater Authentication Test Script
BASE_URL="http://localhost:8080/cinema"

echo "=== Movie Theater Authentication Test ==="
echo "Base URL: $BASE_URL"
echo

# Test 1: Public endpoint
echo "1. Testing public endpoint..."
curl -s "$BASE_URL/test/public" | jq .
echo

# Test 2: Register new user
echo "2. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Test123456",
    "confirmPassword": "Test123456",
    "phoneNumber": "0123456789"
  }')

echo "$REGISTER_RESPONSE" | jq .

# Extract token from register response
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.accessToken // empty')
REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.refreshToken // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "Registration failed or token not found. Trying login..."
  
  # Test 3: Login with existing user
  echo "3. Logging in..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "Test123456"
    }')
  
  echo "$LOGIN_RESPONSE" | jq .
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // empty')
  REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.refreshToken // empty')
fi

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo
  echo "Token obtained: ${TOKEN:0:50}..."
  
  # Test 4: Protected endpoint
  echo
  echo "4. Testing protected endpoint..."
  curl -s "$BASE_URL/test/protected" \
    -H "Authorization: Bearer $TOKEN" | jq .
  
  # Test 5: Customer endpoint
  echo
  echo "5. Testing customer endpoint..."
  curl -s "$BASE_URL/test/customer" \
    -H "Authorization: Bearer $TOKEN" | jq .
  
  # Test 6: Admin endpoint (should fail)
  echo
  echo "6. Testing admin endpoint (should fail)..."
  curl -s "$BASE_URL/test/admin" \
    -H "Authorization: Bearer $TOKEN" | jq .
  
  # Test 7: Refresh Token
  if [ -n "$REFRESH_TOKEN" ] && [ "$REFRESH_TOKEN" != "null" ]; then
    echo
    echo "7. Testing refresh token..."
    REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/refresh-token" \
      -H "Content-Type: application/json" \
      -d "{
        \"refreshToken\": \"$REFRESH_TOKEN\"
      }")
    
    echo "$REFRESH_RESPONSE" | jq .
    NEW_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.data.accessToken // empty')
    
    if [ -n "$NEW_TOKEN" ] && [ "$NEW_TOKEN" != "null" ]; then
      echo "New token obtained: ${NEW_TOKEN:0:50}..."
      TOKEN=$NEW_TOKEN
    fi
  fi
  
  # Test 8: Logout
  echo
  echo "8. Logging out..."
  curl -s -X POST "$BASE_URL/api/auth/logout" \
    -H "Authorization: Bearer $TOKEN" | jq .
  
else
  echo "Failed to obtain authentication token"
fi

echo
echo "=== Test completed ===" 
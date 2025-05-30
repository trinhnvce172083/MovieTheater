# Test Promotion & Loyalty APIs - PowerShell Version
# Author: Dũng_Solo
# Version: 1.0.0

$BASE_URL = "http://localhost:8080/cinema/api"

Write-Host "🎯💎 TESTING PROMOTION & LOYALTY SYSTEM APIs" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Test counters
$totalTests = 0
$passedTests = 0
$failedTests = 0

# Function to test API endpoint
function Test-API {
    param(
        [string]$Method,
        [string]$Endpoint,
        [int]$ExpectedStatus,
        [string]$Description,
        [string]$Body = $null,
        [string]$ContentType = "application/json"
    )
    
    $global:totalTests++
    
    Write-Host "`n🔸 Testing: $Description" -ForegroundColor Yellow
    Write-Host "→ $Method $BASE_URL$Endpoint" -ForegroundColor Gray
    
    try {
        $headers = @{
            'Content-Type' = $ContentType
        }
        
        $params = @{
            Uri = "$BASE_URL$Endpoint"
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params -ErrorAction SilentlyContinue
        $statusCode = $response.StatusCode
        $responseBody = $response.Content
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $responseBody = $_.Exception.Message
    }
    
    Write-Host "Status: $statusCode" -ForegroundColor Gray
    
    if ($responseBody.Length -gt 100) {
        Write-Host "Response: $($responseBody.Substring(0, 100))..." -ForegroundColor Gray
    } else {
        Write-Host "Response: $responseBody" -ForegroundColor Gray
    }
    
    if ($statusCode -eq $ExpectedStatus) {
        Write-Host "✅ PASS: $Description" -ForegroundColor Green
        $global:passedTests++
    } else {
        Write-Host "❌ FAIL: $Description (Expected: $ExpectedStatus, Got: $statusCode)" -ForegroundColor Red
        $global:failedTests++
    }
}

# Function to print section header
function Write-Section {
    param([string]$Title)
    Write-Host "`n📋 $Title" -ForegroundColor Blue
    Write-Host "=========================================" -ForegroundColor Blue
}

# Function to print subsection
function Write-Subsection {
    param([string]$Title)
    Write-Host "`n🔸 $Title" -ForegroundColor Cyan
    Write-Host "-----------------------------------------" -ForegroundColor Cyan
}

Write-Host "Starting comprehensive API tests..."
Write-Host "Base URL: $BASE_URL"
Write-Host "Timestamp: $(Get-Date)"

# ============================================================================
# PROMOTION SYSTEM TESTS
# ============================================================================

Write-Section "🎯 PROMOTION SYSTEM TESTS"

Write-Subsection "Public Promotion Endpoints"

Test-API "GET" "/promotions" 200 "Get all active promotions"
Test-API "GET" "/promotions/featured" 200 "Get featured promotions"
Test-API "GET" "/promotions/points" 200 "Get points promotions"
Test-API "GET" "/promotions/paged?page=0&size=5" 200 "Get promotions with pagination"
Test-API "GET" "/promotions/redeemable?availablePoints=500" 200 "Get redeemable promotions"
Test-API "GET" "/promotions/member/GOLD" 200 "Get promotions for GOLD members"
Test-API "GET" "/promotions/search?keyword=test&page=0&size=10" 200 "Search promotions"

Write-Subsection "Promotion Validation & Calculation"

$validationData = "promotionCode=SUMMER2024&totalAmount=150000&movieId=1&roomId=1"
Test-API "POST" "/promotions/validate" 200 "Validate promotion" $validationData "application/x-www-form-urlencoded"

$discountData = "promotionCode=SUMMER2024&totalAmount=150000"
Test-API "POST" "/promotions/calculate-discount" 200 "Calculate discount" $discountData "application/x-www-form-urlencoded"

Write-Subsection "Promotion Error Handling"

Test-API "GET" "/promotions/code/NONEXISTENT" 500 "Get non-existent promotion"
Test-API "GET" "/promotions/code/" 404 "Get promotion with empty code"
Test-API "GET" "/promotions/member/" 404 "Get promotions for empty membership"

Write-Subsection "Promotion Security (Auth Required)"

$createPromotionData = @{
    promotionCode = "TEST2024"
    promotionName = "Test Promotion"
    description = "Test promotion for API testing"
    discountType = "PERCENTAGE"
    discountValue = 15.0
    startDate = "2024-01-01T00:00:00"
    endDate = "2024-12-31T23:59:59"
} | ConvertTo-Json

Test-API "POST" "/promotions" 403 "Create promotion without auth" $createPromotionData
Test-API "PUT" "/promotions/1/deactivate" 403 "Deactivate promotion without auth"
Test-API "POST" "/promotions/apply/SUMMER2024" 403 "Apply promotion without auth"

# ============================================================================
# LOYALTY SYSTEM TESTS
# ============================================================================

Write-Section "💎 LOYALTY SYSTEM TESTS"

Write-Subsection "Points Management (Auth Required)"

Test-API "GET" "/loyalty/points/1" 403 "Get account points without auth"
Test-API "GET" "/loyalty/overview/1" 403 "Get points overview without auth"

Write-Subsection "Transaction History (Auth Required)"

Test-API "GET" "/loyalty/transactions/1" 403 "Get transaction history without auth"
Test-API "GET" "/loyalty/transactions/1/recent" 403 "Get recent transactions without auth"
Test-API "GET" "/loyalty/expiring/1" 403 "Get expiring points without auth"

Write-Subsection "Statistics (Auth Required)"

Test-API "GET" "/loyalty/statistics/1/monthly?year=2024&month=6" 403 "Get monthly statistics without auth"

Write-Subsection "Admin Functions (Auth Required)"

Test-API "POST" "/loyalty/process-expired" 403 "Process expired points without auth"

$adjustData = "accountId=1&points=100&reason=Test"
Test-API "POST" "/loyalty/adjust" 403 "Adjust points without auth" $adjustData "application/x-www-form-urlencoded"

Write-Subsection "Redemption Check (Auth Required)"

Test-API "GET" "/loyalty/can-redeem/1?promotionId=1" 403 "Check redemption eligibility without auth"

Write-Subsection "Loyalty Error Handling"

Test-API "GET" "/loyalty/points/invalid" 403 "Get points with invalid account ID"
Test-API "GET" "/loyalty/statistics/1/monthly" 404 "Get monthly stats without parameters"

# ============================================================================
# INTEGRATION TESTS
# ============================================================================

Write-Section "🔗 INTEGRATION TESTS"

Write-Subsection "Cross-System Functionality"

Test-API "GET" "/promotions/points" 200 "Get points-based promotions"
Test-API "GET" "/promotions/redeemable?availablePoints=1000" 200 "Get promotions redeemable with 1000 points"

Write-Subsection "Data Consistency"

Test-API "GET" "/promotions" 200 "Verify promotion endpoints available"
Test-API "GET" "/loyalty/points/1" 403 "Verify loyalty endpoints available (auth required)"

# ============================================================================
# PERFORMANCE TESTS
# ============================================================================

Write-Section "⚡ PERFORMANCE TESTS"

Write-Subsection "Concurrent Request Handling"

Write-Host "`n🔸 Testing: 5 concurrent promotion requests" -ForegroundColor Yellow
$startTime = Get-Date

$jobs = @()
for ($i = 1; $i -le 5; $i++) {
    $jobs += Start-Job -ScriptBlock {
        param($url)
        try {
            Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction SilentlyContinue
        } catch {
            # Ignore errors for performance test
        }
    } -ArgumentList "$BASE_URL/promotions"
}

$jobs | Wait-Job | Remove-Job

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host "5 concurrent requests completed in $([math]::Round($duration, 2))s" -ForegroundColor Gray

if ($duration -le 3) {
    Write-Host "✅ PASS: Concurrent promotion requests ($([math]::Round($duration, 2))s)" -ForegroundColor Green
    $global:passedTests++
} else {
    Write-Host "❌ FAIL: Concurrent promotion requests ($([math]::Round($duration, 2))s - too slow)" -ForegroundColor Red
    $global:failedTests++
}
$global:totalTests++

# ============================================================================
# EDGE CASES & STRESS TESTS
# ============================================================================

Write-Section "🧪 EDGE CASES & STRESS TESTS"

Write-Subsection "Parameter Validation"

Test-API "GET" "/promotions/redeemable?availablePoints=-1" 200 "Negative points parameter"
Test-API "GET" "/promotions/redeemable?availablePoints=999999" 200 "Very high points parameter"
Test-API "GET" "/promotions/paged?page=-1&size=0" 200 "Invalid pagination parameters"
Test-API "GET" "/promotions/search?keyword=" 200 "Empty search keyword"

Write-Subsection "Large Data Handling"

Test-API "GET" "/promotions/paged?page=0&size=100" 200 "Large page size request"
Test-API "GET" "/promotions/search?keyword=a&page=0&size=50" 200 "Large search result request"

# ============================================================================
# SYSTEM HEALTH CHECKS
# ============================================================================

Write-Section "🏥 SYSTEM HEALTH CHECKS"

Write-Subsection "Service Availability"

Write-Host "`n🔸 Testing: Service health check" -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$BASE_URL/promotions" -UseBasicParsing -ErrorAction SilentlyContinue
    $healthStatus = $healthResponse.StatusCode
} catch {
    $healthStatus = $_.Exception.Response.StatusCode.value__
}

if ($healthStatus -eq 200) {
    Write-Host "✅ PASS: Promotion service health check" -ForegroundColor Green
    $global:passedTests++
} else {
    Write-Host "❌ FAIL: Promotion service health check (Status: $healthStatus)" -ForegroundColor Red
    $global:failedTests++
}
$global:totalTests++

try {
    $loyaltyResponse = Invoke-WebRequest -Uri "$BASE_URL/loyalty/points/1" -UseBasicParsing -ErrorAction SilentlyContinue
    $loyaltyStatus = $loyaltyResponse.StatusCode
} catch {
    $loyaltyStatus = $_.Exception.Response.StatusCode.value__
}

if ($loyaltyStatus -eq 403) {
    Write-Host "✅ PASS: Loyalty service health check (auth required)" -ForegroundColor Green
    $global:passedTests++
} else {
    Write-Host "❌ FAIL: Loyalty service health check (Status: $loyaltyStatus)" -ForegroundColor Red
    $global:failedTests++
}
$global:totalTests++

# ============================================================================
# FINAL SUMMARY
# ============================================================================

Write-Section "📊 COMPREHENSIVE TEST SUMMARY"

Write-Host "`n🎯💎 Promotion & Loyalty System Test Results" -ForegroundColor Magenta
Write-Host "==============================================`n" -ForegroundColor Magenta

Write-Host "📈 Test Statistics:" -ForegroundColor Blue
Write-Host "  Total Tests: $totalTests"
Write-Host "  Passed: $passedTests" -ForegroundColor Green
Write-Host "  Failed: $failedTests" -ForegroundColor Red

if ($totalTests -gt 0) {
    $successRate = [math]::Round(($passedTests * 100 / $totalTests), 1)
    Write-Host "  Success Rate: $successRate%"
}

Write-Host "`n🔍 System Analysis:" -ForegroundColor Blue

if ($failedTests -eq 0) {
    Write-Host "  ✅ All tests passed! System is functioning correctly." -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Host "  ⚠️  Most tests passed. Minor issues detected." -ForegroundColor Yellow
} else {
    Write-Host "  ❌ Multiple failures detected. System needs attention." -ForegroundColor Red
}

Write-Host "`n📋 Test Coverage:" -ForegroundColor Blue
Write-Host "  ✅ Promotion Management APIs"
Write-Host "  ✅ Loyalty Points APIs"
Write-Host "  ✅ Security & Authentication"
Write-Host "  ✅ Error Handling"
Write-Host "  ✅ Performance Testing"
Write-Host "  ✅ Edge Cases"
Write-Host "  ✅ Integration Points"
Write-Host "  ✅ System Health"

Write-Host "`n🔗 Useful Links:" -ForegroundColor Blue
Write-Host "  📖 Swagger UI: http://localhost:8080/cinema/swagger-ui.html"
Write-Host "  🗄️  Adminer: http://localhost:8081"
Write-Host "  📊 Application: http://localhost:8080/cinema"

Write-Host "`n📝 Next Steps:" -ForegroundColor Blue
Write-Host "  1. Create sample data for more comprehensive testing"
Write-Host "  2. Test with authentication tokens"
Write-Host "  3. Verify database schema and relationships"
Write-Host "  4. Test integration with booking system"
Write-Host "  5. Performance optimization if needed"

Write-Host "`n💡 Sample Data Creation:" -ForegroundColor Blue
Write-Host "  Run the following SQL in Adminer to create test data:"
Write-Host ""
Write-Host "  -- Promotions" -ForegroundColor Gray
Write-Host "  INSERT INTO promotions (promotion_code, promotion_name, description, discount_type, discount_value, start_date, end_date, is_active) VALUES" -ForegroundColor Gray
Write-Host "  ('SUMMER2024', 'Summer Sale', '20% off all tickets', 'PERCENTAGE', 20.00, '2024-01-01', '2024-12-31', true)," -ForegroundColor Gray
Write-Host "  ('WELCOME50', 'Welcome Bonus', '50k off for new users', 'FIXED_AMOUNT', 50000.00, '2024-01-01', '2024-12-31', true);" -ForegroundColor Gray
Write-Host ""
Write-Host "  -- Accounts (if not exists)" -ForegroundColor Gray
Write-Host "  INSERT INTO accounts (email, password, full_name, membership_level, role, is_active) VALUES" -ForegroundColor Gray
Write-Host "  ('test@example.com', 'password', 'Test User', 'BRONZE', 'USER', true);" -ForegroundColor Gray
Write-Host ""
Write-Host "  -- Loyalty Transactions" -ForegroundColor Gray
Write-Host "  INSERT INTO loyalty_transactions (account_id, transaction_type, points, description, reference_type, transaction_date, is_active) VALUES" -ForegroundColor Gray
Write-Host "  (1, 'EARN', 100, 'Welcome bonus', 'MANUAL', NOW(), true)," -ForegroundColor Gray
Write-Host "  (1, 'EARN', 50, 'Booking reward', 'BOOKING', NOW(), true);" -ForegroundColor Gray

Write-Host "`n🎉 Comprehensive testing completed!" -ForegroundColor Green
Write-Host "Timestamp: $(Get-Date)" 
# Debug Request Script - Kiểm tra request client gửi lên
$baseUrl = "http://localhost:8080/cinema"

$testData = @{
    username = "testuser123"
    fullName = "Test User"
    email = "testuser123@example.com"
    password = "12345Aa!"
    confirmPassword = "12345Aa!"
    phoneNumber = "0399927256"
    dateOfBirth = "2000-01-01"
    address = "Test Address"
    agreeToTerms = $true
    acceptMarketing = $false
} | ConvertTo-Json

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "DEBUGGING RAW REQUEST" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "Test data being sent:" -ForegroundColor Yellow
Write-Host $testData -ForegroundColor White

Write-Host ""
Write-Host "1. Testing raw request headers..." -ForegroundColor Green

try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/api/test/debug-raw-request" -Method POST -Body $testData -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Headers debug: $response1" -ForegroundColor Green
} catch {
    Write-Host "❌ Headers debug failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Testing JSON string parsing..." -ForegroundColor Green

try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/api/test/debug-register-step-by-step" -Method POST -Body $testData -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ JSON debug: $response2" -ForegroundColor Green
} catch {
    Write-Host "❌ JSON debug failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Testing RegisterRequest object parsing..." -ForegroundColor Green

try {
    $response3 = Invoke-RestMethod -Uri "$baseUrl/api/test/debug-register-object" -Method POST -Body $testData -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Object debug: $response3" -ForegroundColor Green
} catch {
    Write-Host "❌ Object debug failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Error details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "4. Testing actual register endpoint..." -ForegroundColor Green

try {
    $response4 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $testData -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Actual register worked: $($response4 | ConvertTo-Json -Depth 2)" -ForegroundColor Green
} catch {
    Write-Host "❌ Actual register failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Error details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Debug completed! Check server logs for detailed information." -ForegroundColor Cyan 
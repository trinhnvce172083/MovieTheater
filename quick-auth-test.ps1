# Quick Auth Test - Chỉ test AuthController
$baseUrl = "http://localhost:8080"

$testData = @{
    username = "quicktest123"
    fullName = "Quick Test User"
    email = "quicktest123@example.com"
    password = "12345Aa!"
    confirmPassword = "12345Aa!"
    phoneNumber = "0399927256"
    dateOfBirth = "2000-01-01"
    address = "Test Address"
    agreeToTerms = $true
    acceptMarketing = $false
} | ConvertTo-Json

Write-Host "Quick test cho AuthController register endpoint..." -ForegroundColor Green
Write-Host "Data: $testData" -ForegroundColor Yellow

Write-Host ""
Write-Host "Testing AuthController register..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $testData -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ AuthController SUCCESS!" -ForegroundColor Green  
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ AuthController FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Error details:" -ForegroundColor Yellow
        Write-Host "$($_.ErrorDetails.Message)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Check server logs for detailed debug information!" -ForegroundColor Cyan 
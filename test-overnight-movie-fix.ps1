#!/usr/bin/env pwsh

Write-Host "🌙 ===== TEST PHIM QUA ĐÊM FIX =====" -ForegroundColor Cyan

# Đợi server khởi động
Write-Host "⏳ Đợi server khởi động..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test health endpoint
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Server đang chạy: $($healthResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Server chưa sẵn sàng: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Login admin
Write-Host "📝 Đăng nhập admin..." -ForegroundColor Yellow
try {
    $loginBody = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -TimeoutSec 10
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.token
    Write-Host "✅ Đăng nhập thành công" -ForegroundColor Green
} catch {
    Write-Host "❌ Lỗi đăng nhập: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test tạo lịch chiếu qua đêm
Write-Host "🎬 Test tạo lịch chiếu qua đêm (22:00-01:13)..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Tạo request cho phim qua đêm
$scheduleRequest = @{
    movieId = 6  # Mission Impossible
    cinemaRoomId = 4  # VIP Cinema Room
    showDate = "2025-06-25"
    startTime = "22:00"
    endTime = "01:13"
    price = 150000
    timeSlotType = "LATE_NIGHT"
    status = "SCHEDULED"
} | ConvertTo-Json

try {
    $scheduleResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/schedules" -Method POST -Headers $headers -Body $scheduleRequest -TimeoutSec 15
    $scheduleData = $scheduleResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Tạo lịch chiếu qua đêm thành công!" -ForegroundColor Green
    Write-Host "   📅 Ngày: $($scheduleData.showDate)" -ForegroundColor White
    Write-Host "   🕐 Thời gian: $($scheduleData.startTime) - $($scheduleData.endTime)" -ForegroundColor White
    Write-Host "   🎭 Phim: $($scheduleData.movieTitle)" -ForegroundColor White
    Write-Host "   🏢 Phòng: $($scheduleData.cinemaRoomName)" -ForegroundColor White
    
} catch {
    Write-Host "❌ Lỗi tạo lịch chiếu qua đêm: $($_.Exception.Message)" -ForegroundColor Red
    
    # Hiển thị response body nếu có
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📄 Response: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host "🏁 Test hoàn thành!" -ForegroundColor Cyan 
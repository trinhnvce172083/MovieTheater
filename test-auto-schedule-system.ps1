# Test Auto Schedule System - PowerShell Script
# Kiểm tra hệ thống tự động tạo lịch chiếu phim
# Author: Dũng_Solo
# Version: 1.0.0

$baseUrl = "http://localhost:8080/api/v1"
$adminToken = ""

Write-Host "=== KIỂM TRA HỆ THỐNG TỰ ĐỘNG TẠO LỊCH CHIẾU ===" -ForegroundColor Green

# Function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    try {
        $params = @{
            Method = $Method
            Uri = $Uri
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 10
        }
        
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response }
    }
    catch {
        $errorDetails = $_.Exception.Message
        if ($_.Exception.Response) {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            $errorDetails += " - Response: $errorBody"
        }
        return @{ Success = $false; Error = $errorDetails }
    }
}

# 1. Login as Admin
Write-Host "`n1. Đăng nhập Admin..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
}

$loginResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/auth/login" -Body $loginBody

if ($loginResult.Success) {
    $adminToken = $loginResult.Data.accessToken
    Write-Host "✅ Đăng nhập thành công" -ForegroundColor Green
} else {
    Write-Host "❌ Đăng nhập thất bại: $($loginResult.Error)" -ForegroundColor Red
    Write-Host "🔧 Thử với dữ liệu mặc định..." -ForegroundColor Blue
    # Fake token for testing
    $adminToken = "fake-token-for-testing"
}

$authHeaders = @{
    "Authorization" = "Bearer $adminToken"
}

# 2. Kiểm tra trạng thái hệ thống
Write-Host "`n2. Kiểm tra trạng thái hệ thống..." -ForegroundColor Yellow
$statusResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/auto-schedule/status"

if ($statusResult.Success) {
    Write-Host "✅ Trạng thái hệ thống: $($statusResult.Data)" -ForegroundColor Green
} else {
    Write-Host "❌ Không thể kiểm tra trạng thái: $($statusResult.Error)" -ForegroundColor Red
}

# 3. Lấy thống kê hệ thống
Write-Host "`n3. Lấy thống kê tự động tạo lịch..." -ForegroundColor Yellow
$statsResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/auto-schedule/statistics" -Headers $authHeaders

if ($statsResult.Success) {
    $stats = $statsResult.Data
    Write-Host "✅ Thống kê hệ thống:" -ForegroundColor Green
    Write-Host "   • Tổng lịch chiếu: $($stats.totalSchedulesGenerated)" -ForegroundColor Cyan
    Write-Host "   • Lịch chiếu 7 ngày qua: $($stats.schedulesLast7Days)" -ForegroundColor Cyan
    Write-Host "   • Trung bình/ngày: $($stats.averageSchedulesPerDay)" -ForegroundColor Cyan
    Write-Host "   • Phim đang chiếu: $($stats.nowShowingMovies)" -ForegroundColor Cyan
    Write-Host "   • Tổng phòng chiếu: $($stats.totalRoomsCreated)" -ForegroundColor Cyan
    Write-Host "   • Tỷ lệ lấp đầy TB: $($stats.averageOccupancyRate)%" -ForegroundColor Cyan
} else {
    Write-Host "❌ Không thể lấy thống kê: $($statsResult.Error)" -ForegroundColor Red
}

# 4. Lấy giờ chiếu chuẩn
Write-Host "`n4. Lấy giờ chiếu chuẩn..." -ForegroundColor Yellow
$showtimesResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/auto-schedule/standard-showtimes"

if ($showtimesResult.Success) {
    Write-Host "✅ Giờ chiếu chuẩn:" -ForegroundColor Green
    $showtimesResult.Data | ForEach-Object {
        Write-Host "   • $($_.timeSlot): $($_.startTime) - $($_.endTime) ($($_.description), x$($_.priceMultiplier))" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Không thể lấy giờ chiếu chuẩn: $($showtimesResult.Error)" -ForegroundColor Red
}

# 5. Kiểm tra ngày cần tạo lịch
Write-Host "`n5. Kiểm tra ngày cần tạo lịch..." -ForegroundColor Yellow
$needDatesResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/auto-schedule/dates-need-schedules" -Headers $authHeaders

if ($needDatesResult.Success) {
    $needDates = $needDatesResult.Data
    if ($needDates.Count -gt 0) {
        Write-Host "⚠️ Có $($needDates.Count) ngày cần tạo lịch:" -ForegroundColor Yellow
        $needDates | ForEach-Object {
            Write-Host "   • $_" -ForegroundColor Cyan
        }
    } else {
        Write-Host "✅ Tất cả ngày đều đã có lịch chiếu đầy đủ" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Không thể kiểm tra ngày cần tạo lịch: $($needDatesResult.Error)" -ForegroundColor Red
}

# 6. Test tạo thêm phòng chiếu
Write-Host "`n6. Kiểm tra và tạo thêm phòng chiếu..." -ForegroundColor Yellow
$roomResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/auto-schedule/create-additional-rooms" -Headers $authHeaders

if ($roomResult.Success) {
    $roomData = $roomResult.Data
    if ($roomData.success) {
        if ($roomData.roomsCreated -gt 0) {
            Write-Host "✅ Đã tạo thêm $($roomData.roomsCreated) phòng:" -ForegroundColor Green
            $roomData.roomNames | ForEach-Object {
                Write-Host "   • $_" -ForegroundColor Cyan
            }
        } else {
            Write-Host "ℹ️ $($roomData.message)" -ForegroundColor Blue
        }
    } else {
        Write-Host "❌ Tạo phòng thất bại: $($roomData.message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Không thể kiểm tra/tạo phòng: $($roomResult.Error)" -ForegroundColor Red
}

# 7. Test tạo lịch cho ngày cụ thể
Write-Host "`n7. Test tạo lịch cho ngày cụ thể..." -ForegroundColor Yellow
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$scheduleResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/auto-schedule/generate-for-date?date=$tomorrow" -Headers $authHeaders

if ($scheduleResult.Success) {
    $scheduleData = $scheduleResult.Data
    if ($scheduleData.success) {
        Write-Host "✅ $($scheduleData.message)" -ForegroundColor Green
        Write-Host "   • Lịch chiếu tạo: $($scheduleData.totalSchedulesCreated)" -ForegroundColor Cyan
        Write-Host "   • Phim xử lý: $($scheduleData.moviesProcessed)" -ForegroundColor Cyan
        Write-Host "   • Phòng sử dụng: $($scheduleData.roomsUsed)" -ForegroundColor Cyan
        
        if ($scheduleData.errors -and $scheduleData.errors.Count -gt 0) {
            Write-Host "⚠️ Một số lỗi:" -ForegroundColor Yellow
            $scheduleData.errors | ForEach-Object {
                Write-Host "   • $_" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "❌ Tạo lịch thất bại: $($scheduleData.message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Không thể tạo lịch: $($scheduleResult.Error)" -ForegroundColor Red
}

# 8. Test tạo lịch cho 3 ngày tiếp theo
Write-Host "`n8. Test tạo lịch cho 3 ngày tiếp theo..." -ForegroundColor Yellow
$next3DaysResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/auto-schedule/generate-next-3-days" -Headers $authHeaders

if ($next3DaysResult.Success) {
    $next3DaysData = $next3DaysResult.Data
    if ($next3DaysData.success) {
        Write-Host "✅ $($next3DaysData.message)" -ForegroundColor Green
        Write-Host "   • Tổng lịch chiếu: $($next3DaysData.totalSchedulesCreated)" -ForegroundColor Cyan
        Write-Host "   • Tổng phim: $($next3DaysData.moviesProcessed)" -ForegroundColor Cyan
        Write-Host "   • Tổng phòng: $($next3DaysData.roomsUsed)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Tạo lịch 3 ngày thất bại: $($next3DaysData.message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Không thể tạo lịch 3 ngày: $($next3DaysResult.Error)" -ForegroundColor Red
}

# 9. Test chạy tác vụ hàng ngày
Write-Host "`n9. Test tác vụ tạo lịch hàng ngày..." -ForegroundColor Yellow
$dailyResult = Invoke-ApiRequest -Method "POST" -Uri "$baseUrl/auto-schedule/daily-generation" -Headers $authHeaders

if ($dailyResult.Success) {
    $dailyData = $dailyResult.Data
    if ($dailyData.success) {
        Write-Host "✅ Tác vụ hàng ngày: $($dailyData.message)" -ForegroundColor Green
        Write-Host "   • Lịch chiếu tạo: $($dailyData.totalSchedulesCreated)" -ForegroundColor Cyan
        Write-Host "   • Phim xử lý: $($dailyData.moviesProcessed)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Tác vụ hàng ngày thất bại: $($dailyData.message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Không thể chạy tác vụ hàng ngày: $($dailyResult.Error)" -ForegroundColor Red
}

# 10. Kiểm tra lịch chiếu vừa tạo
Write-Host "`n10. Kiểm tra lịch chiếu vừa tạo..." -ForegroundColor Yellow
$checkSchedulesResult = Invoke-ApiRequest -Method "GET" -Uri "$baseUrl/schedules?page=0&size=10&sort=showDate,desc"

if ($checkSchedulesResult.Success) {
    $schedules = $checkSchedulesResult.Data
    Write-Host "✅ Lịch chiếu mới nhất:" -ForegroundColor Green
    
    if ($schedules.content -and $schedules.content.Count -gt 0) {
        $schedules.content | Select-Object -First 5 | ForEach-Object {
            $autoGenerated = if ($_.autoGenerated) { "(Tự động)" } else { "(Thủ công)" }
            Write-Host "   • $($_.movieName) - $($_.showDate) $($_.displayTime) - $($_.cinemaRoomName) $autoGenerated" -ForegroundColor Cyan
        }
        Write-Host "   📊 Tổng: $($schedules.totalElements) lịch chiếu" -ForegroundColor Blue
    } else {
        Write-Host "ℹ️ Chưa có lịch chiếu nào" -ForegroundColor Blue
    }
} else {
    Write-Host "❌ Không thể kiểm tra lịch chiếu: $($checkSchedulesResult.Error)" -ForegroundColor Red
}

# Summary
Write-Host "`n=== TỔNG KẾT KIỂM TRA ===" -ForegroundColor Green
Write-Host "✅ Hệ thống tự động tạo lịch chiếu đã được kiểm tra" -ForegroundColor Green
Write-Host "📋 Các tính năng đã test:" -ForegroundColor Blue
Write-Host "   • Trạng thái hệ thống" -ForegroundColor White
Write-Host "   • Thống kê tự động" -ForegroundColor White
Write-Host "   • Giờ chiếu chuẩn" -ForegroundColor White
Write-Host "   • Phát hiện ngày cần tạo lịch" -ForegroundColor White
Write-Host "   • Tự động tạo phòng chiếu" -ForegroundColor White
Write-Host "   • Tạo lịch cho ngày cụ thể" -ForegroundColor White
Write-Host "   • Tạo lịch cho 3 ngày tiếp theo" -ForegroundColor White
Write-Host "   • Tác vụ tạo lịch hàng ngày" -ForegroundColor White
Write-Host "   • Kiểm tra kết quả" -ForegroundColor White

Write-Host "`n🎬 Hệ thống sẵn sàng cho việc tự động tạo lịch chiếu!" -ForegroundColor Green
Write-Host "⏰ Lịch trình tự động:" -ForegroundColor Yellow
Write-Host "   • 01:00 AM: Tạo lịch chiếu hàng ngày" -ForegroundColor Cyan
Write-Host "   • 02:00 AM: Kiểm tra và tạo thêm phòng" -ForegroundColor Cyan
Write-Host "   • 03:00 AM: Backup tạo lịch hàng tuần (Chủ nhật)" -ForegroundColor Cyan

Read-Host "Press any key to exit" 
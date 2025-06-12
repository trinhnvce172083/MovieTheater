# Enhanced Auto-Schedule Testing Script for Lumiere Cinema
# Test với phim thực tế và logic kiểm tra ngày hợp lệ

$baseUrl = "http://localhost:8080/api"
$adminEmail = "admin@lumierecinema.com"
$adminPassword = "admin123"

Write-Host "🎬 ======== LUMIERE CINEMA AUTO-SCHEDULE TEST ========" -ForegroundColor Cyan
Write-Host "Testing với phim thực tế 2025 và logic kiểm tra ngày" -ForegroundColor Green

# Function để login và lấy JWT token
function Get-AdminToken {
    $loginData = @{
        email = $adminEmail
        password = $adminPassword
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json"
        return $response.token
    } catch {
        Write-Host "❌ Login thất bại: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function để gọi API với token
function Invoke-AuthenticatedRequest {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [string]$Token,
        [object]$Body = $null
    )
    
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }
    
    try {
        if ($Body) {
            $bodyJson = $Body | ConvertTo-Json
            return Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers -Body $bodyJson
        } else {
            return Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers
        }
    } catch {
        Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Main testing logic
Write-Host "`n🔐 Đang login với admin account..." -ForegroundColor Yellow
$token = Get-AdminToken

if (-not $token) {
    Write-Host "❌ Không thể login! Kiểm tra server và database." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Login thành công!" -ForegroundColor Green

# 1. Kiểm tra database status TRƯỚC khi test
Write-Host "`n📊 CHECKING DATABASE STATUS BEFORE TESTING..." -ForegroundColor Cyan
$beforeStatus = Invoke-AuthenticatedRequest -Uri "$baseUrl/auto-schedule/check-database-status" -Token $token

if ($beforeStatus) {
    Write-Host "📈 TRẠNG THÁI DATABASE TRƯỚC TEST:" -ForegroundColor Yellow
    Write-Host "  • Tổng phim: $($beforeStatus.totalMovies)" -ForegroundColor White
    Write-Host "  • Phim NOW_SHOWING: $($beforeStatus.nowShowingMovies)" -ForegroundColor Green
    Write-Host "  • Phim COMING_SOON: $($beforeStatus.comingSoonMovies)" -ForegroundColor Blue
    Write-Host "  • Phim ENDED: $($beforeStatus.endedMovies)" -ForegroundColor Red
    Write-Host "  • Tổng phòng chiếu: $($beforeStatus.totalRooms)" -ForegroundColor White
    Write-Host "  • Lịch chiếu hôm nay: $($beforeStatus.todaySchedules)" -ForegroundColor Green
    Write-Host "  • Lịch chiếu ngày mai: $($beforeStatus.tomorrowSchedules)" -ForegroundColor Blue
    
    # Hiển thị thông tin chi tiết các phim NOW_SHOWING
    if ($beforeStatus.nowShowingMovieDetails -and $beforeStatus.nowShowingMovieDetails.Count -gt 0) {
        Write-Host "`n🎬 CHI TIẾT PHIM ĐANG CHIẾU:" -ForegroundColor Yellow
        foreach ($movie in $beforeStatus.nowShowingMovieDetails) {
            $releaseDate = if ($movie.releaseDate) { $movie.releaseDate } else { "N/A" }
            $endDate = if ($movie.endDate) { $movie.endDate } else { "N/A" }
            Write-Host "  • $($movie.title) (ID: $($movie.movieId))" -ForegroundColor White
            Write-Host "    Release: $releaseDate | End: $endDate" -ForegroundColor Gray
        }
    }
    
    # Hiển thị recommendations
    if ($beforeStatus.recommendations -and $beforeStatus.recommendations.Count -gt 0) {
        Write-Host "`n💡 KHUYẾN NGHỊ SYSTEM:" -ForegroundColor Magenta
        foreach ($rec in $beforeStatus.recommendations) {
            Write-Host "  • $rec" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ Không thể lấy database status!" -ForegroundColor Red
}

# 2. Test immediate schedule generation
Write-Host "`n🚀 TESTING IMMEDIATE SCHEDULE GENERATION..." -ForegroundColor Cyan
Write-Host "Triggering auto-schedule for tomorrow (should process all NOW_SHOWING movies)..." -ForegroundColor Yellow

$scheduleResult = Invoke-AuthenticatedRequest -Uri "$baseUrl/auto-schedule/trigger-immediate" -Method Post -Token $token

if ($scheduleResult) {
    Write-Host "`n📊 KẾT QUẢ TẠO LỊCH CHIẾU:" -ForegroundColor Green
    Write-Host "  • Thành công: $($scheduleResult.success)" -ForegroundColor $(if ($scheduleResult.success) { "Green" } else { "Red" })
    Write-Host "  • Message: $($scheduleResult.message)" -ForegroundColor White
    Write-Host "  • Tổng lịch chiếu tạo: $($scheduleResult.totalSchedulesCreated)" -ForegroundColor Green
    Write-Host "  • Phim đã xử lý: $($scheduleResult.moviesProcessed)" -ForegroundColor Blue
    Write-Host "  • Phòng đã sử dụng: $($scheduleResult.roomsUsed)" -ForegroundColor Cyan
    
    # Hiển thị chi tiết lịch chiếu được tạo
    if ($scheduleResult.createdSchedules -and $scheduleResult.createdSchedules.Count -gt 0) {
        Write-Host "`n🎯 CHI TIẾT LỊCH CHIẾU ĐƯỢC TẠO:" -ForegroundColor Yellow
        $groupedSchedules = $scheduleResult.createdSchedules | Group-Object movieTitle
        foreach ($group in $groupedSchedules) {
            Write-Host "  📽️ $($group.Name): $($group.Count) lịch chiếu" -ForegroundColor White
            foreach ($schedule in $group.Group) {
                $roomName = $schedule.cinemaRoomName
                $showTime = "$($schedule.startTime) - $($schedule.endTime)"
                $price = "{0:N0}" -f $schedule.price
                Write-Host "    • $roomName | $showTime | $price VND" -ForegroundColor Gray
            }
        }
    }
    
    # Hiển thị errors nếu có
    if ($scheduleResult.errors -and $scheduleResult.errors.Count -gt 0) {
        Write-Host "`n⚠️ ERRORS ENCOUNTERED:" -ForegroundColor Yellow
        foreach ($error in $scheduleResult.errors) {
            Write-Host "  • $error" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Không thể trigger immediate schedule generation!" -ForegroundColor Red
}

# 3. Kiểm tra database status SAU khi test
Write-Host "`n📊 CHECKING DATABASE STATUS AFTER TESTING..." -ForegroundColor Cyan
Start-Sleep -Seconds 2  # Wait for database to update

$afterStatus = Invoke-AuthenticatedRequest -Uri "$baseUrl/auto-schedule/check-database-status" -Token $token

if ($afterStatus) {
    Write-Host "📈 TRẠNG THÁI DATABASE SAU TEST:" -ForegroundColor Yellow
    Write-Host "  • Tổng phim: $($afterStatus.totalMovies)" -ForegroundColor White
    Write-Host "  • Phim NOW_SHOWING: $($afterStatus.nowShowingMovies)" -ForegroundColor Green
    Write-Host "  • Phim COMING_SOON: $($afterStatus.comingSoonMovies)" -ForegroundColor Blue
    Write-Host "  • Phim ENDED: $($afterStatus.endedMovies)" -ForegroundColor Red
    Write-Host "  • Lịch chiếu hôm nay: $($afterStatus.todaySchedules)" -ForegroundColor Green
    Write-Host "  • Lịch chiếu ngày mai: $($afterStatus.tomorrowSchedules)" -ForegroundColor Blue
    
    # So sánh before vs after
    if ($beforeStatus) {
        $scheduleIncrease = $afterStatus.tomorrowSchedules - $beforeStatus.tomorrowSchedules
        Write-Host "`n📈 SO SÁNH BEFORE vs AFTER:" -ForegroundColor Magenta
        Write-Host "  • Lịch chiếu ngày mai tăng: +$scheduleIncrease" -ForegroundColor $(if ($scheduleIncrease -gt 0) { "Green" } else { "Yellow" })
        
        # Kiểm tra xem có phim nào được cập nhật trạng thái không
        if ($afterStatus.endedMovies -gt $beforeStatus.endedMovies) {
            $endedIncrease = $afterStatus.endedMovies - $beforeStatus.endedMovies
            Write-Host "  • Phim chuyển sang ENDED: +$endedIncrease" -ForegroundColor Yellow
        }
    }
}

# 4. Test 3-day schedule generation
Write-Host "`n🗓️ TESTING 3-DAY SCHEDULE GENERATION..." -ForegroundColor Cyan
$threeDayResult = Invoke-AuthenticatedRequest -Uri "$baseUrl/auto-schedule/generate-3-days" -Method Post -Token $token

if ($threeDayResult) {
    Write-Host "📊 KẾT QUẢ TẠO LỊCH 3 NGÀY:" -ForegroundColor Green
    Write-Host "  • Thành công: $($threeDayResult.success)" -ForegroundColor $(if ($threeDayResult.success) { "Green" } else { "Red" })
    Write-Host "  • Message: $($threeDayResult.message)" -ForegroundColor White
    Write-Host "  • Tổng lịch chiếu tạo: $($threeDayResult.totalSchedulesCreated)" -ForegroundColor Green
    Write-Host "  • Phim đã xử lý: $($threeDayResult.moviesProcessed)" -ForegroundColor Blue
    Write-Host "  • Phòng đã sử dụng: $($threeDayResult.roomsUsed)" -ForegroundColor Cyan
}

# 5. Final status check
Write-Host "`n📊 FINAL DATABASE STATUS CHECK..." -ForegroundColor Cyan
$finalStatus = Invoke-AuthenticatedRequest -Uri "$baseUrl/auto-schedule/check-database-status" -Token $token

if ($finalStatus) {
    Write-Host "📈 TRẠNG THÁI FINAL:" -ForegroundColor Yellow
    Write-Host "  • Tổng lịch chiếu trong 7 ngày tới: $($finalStatus.upcomingSchedulesCount)" -ForegroundColor Green
    Write-Host "  • Ngày cần tạo lịch: $($finalStatus.datesThatNeedSchedules -join ', ')" -ForegroundColor Blue
    
    if ($finalStatus.recommendations -and $finalStatus.recommendations.Count -gt 0) {
        Write-Host "`n💡 KHUYẾN NGHỊ CUỐI:" -ForegroundColor Magenta
        foreach ($rec in $finalStatus.recommendations) {
            Write-Host "  • $rec" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n🎉 ======== TEST HOÀN THÀNH ========" -ForegroundColor Cyan
Write-Host "Enhanced auto-schedule system với phim thực tế 2025 đã được test!" -ForegroundColor Green
Write-Host "Kiểm tra logs trong console để xem chi tiết quá trình xử lý." -ForegroundColor Yellow

# Pause để xem kết quả
Write-Host "`nNhấn Enter để kết thúc..." -ForegroundColor Gray
Read-Host 
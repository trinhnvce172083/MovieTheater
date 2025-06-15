# ===============================================
# 🔍 DEBUG SCRIPT: Kiểm tra trạng thái phim
# ===============================================

$baseUrl = "http://localhost:8080"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "🔍 ===== DEBUG: KIỂM TRA TRẠNG THÁI PHIM ====="

# Lấy token admin
Write-ColorOutput Yellow "📝 Đăng nhập admin..."
$loginData = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.result.token
    Write-ColorOutput Green "✅ Đăng nhập thành công!"
} catch {
    Write-ColorOutput Red "❌ Lỗi đăng nhập: $($_.Exception.Message)"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 1. Kiểm tra tất cả phim
Write-ColorOutput Yellow "`n📽️ 1. Kiểm tra tất cả phim trong database:"
try {
    $allMovies = Invoke-RestMethod -Uri "$baseUrl/movies" -Method GET -Headers $headers
    
    if ($allMovies.result -and $allMovies.result.Count -gt 0) {
        Write-ColorOutput Green "✅ Tìm thấy $($allMovies.result.Count) phim"
        
        foreach ($movie in $allMovies.result) {
            $statusColor = switch ($movie.status) {
                "NOW_SHOWING" { "Green" }
                "COMING_SOON" { "Yellow" }
                "ENDED" { "Red" }
                default { "White" }
            }
            Write-ColorOutput $statusColor "   - ID: $($movie.movieId) | $($movie.title) | Status: $($movie.status)"
        }
    } else {
        Write-ColorOutput Red "❌ Không tìm thấy phim nào!"
    }
} catch {
    Write-ColorOutput Red "❌ Lỗi khi lấy danh sách phim: $($_.Exception.Message)"
}

# 2. Kiểm tra phim NOW_SHOWING
Write-ColorOutput Yellow "`n🎬 2. Kiểm tra phim NOW_SHOWING:"
try {
    $nowShowingMovies = Invoke-RestMethod -Uri "$baseUrl/movies?status=NOW_SHOWING" -Method GET -Headers $headers
    
    if ($nowShowingMovies.result -and $nowShowingMovies.result.Count -gt 0) {
        Write-ColorOutput Green "✅ Có $($nowShowingMovies.result.Count) phim NOW_SHOWING"
        $nowShowingIds = @()
        foreach ($movie in $nowShowingMovies.result) {
            Write-ColorOutput Green "   - ID: $($movie.movieId) | $($movie.title)"
            $nowShowingIds += $movie.movieId
        }
        Write-ColorOutput Cyan "📋 IDs để test: $($nowShowingIds -join ', ')"
    } else {
        Write-ColorOutput Red "❌ KHÔNG CÓ PHIM NÀO NOW_SHOWING!"
        Write-ColorOutput Yellow "💡 Cần cập nhật trạng thái phim trước khi test auto schedule"
    }
} catch {
    Write-ColorOutput Red "❌ Lỗi khi lấy phim NOW_SHOWING: $($_.Exception.Message)"
}

# 3. Kiểm tra phòng chiếu
Write-ColorOutput Yellow "`n🏠 3. Kiểm tra phòng chiếu:"
try {
    $rooms = Invoke-RestMethod -Uri "$baseUrl/cinema-rooms" -Method GET -Headers $headers
    
    if ($rooms.result -and $rooms.result.Count -gt 0) {
        Write-ColorOutput Green "✅ Có $($rooms.result.Count) phòng chiếu"
        foreach ($room in $rooms.result) {
            $activeStatus = if ($room.isActive) { "ACTIVE" } else { "INACTIVE" }
            $statusColor = if ($room.isActive) { "Green" } else { "Red" }
            Write-ColorOutput $statusColor "   - ID: $($room.cinemaRoomId) | $($room.cinemaRoomName) | Type: $($room.roomType) | Status: $activeStatus"
        }
    } else {
        Write-ColorOutput Red "❌ Không tìm thấy phòng chiếu nào!"
    }
} catch {
    Write-ColorOutput Red "❌ Lỗi khi lấy danh sách phòng: $($_.Exception.Message)"
}

# 4. Kiểm tra lịch chiếu hiện tại
Write-ColorOutput Yellow "`n📅 4. Kiểm tra lịch chiếu hiện tại:"
try {
    $today = Get-Date -Format "yyyy-MM-dd"
    $tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    
    $todaySchedules = Invoke-RestMethod -Uri "$baseUrl/schedules?date=$today" -Method GET -Headers $headers
    $tomorrowSchedules = Invoke-RestMethod -Uri "$baseUrl/schedules?date=$tomorrow" -Method GET -Headers $headers
    
    Write-ColorOutput White "   - Hôm nay ($today): $($todaySchedules.result.Count) lịch chiếu"
    Write-ColorOutput White "   - Ngày mai ($tomorrow): $($tomorrowSchedules.result.Count) lịch chiếu"
    
} catch {
    Write-ColorOutput Red "❌ Lỗi khi kiểm tra lịch chiếu: $($_.Exception.Message)"
}

# 5. Đề xuất hành động
Write-ColorOutput Yellow "`n💡 5. Đề xuất hành động:"

if ($nowShowingMovies.result -and $nowShowingMovies.result.Count -gt 0) {
    Write-ColorOutput Green "✅ Có thể test API Multiple Movie Schedule"
    Write-ColorOutput Cyan "🔗 Chạy script test:"
    Write-ColorOutput Cyan "   .\test-multi-movie-schedule.ps1"
    
    # Tạo sample request
    $sampleIds = $nowShowingMovies.result[0..2] | ForEach-Object { $_.movieId }
    $startDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    $endDate = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
    
    Write-ColorOutput Cyan "`n📝 Sample request:"
    $sampleRequest = @{
        movieIds = $sampleIds
        startDate = $startDate
        endDate = $endDate
        minShowsPerMoviePerDay = 1
        maxShowsPerMoviePerDay = 2
    } | ConvertTo-Json -Depth 3
    
    Write-ColorOutput White $sampleRequest
    
} else {
    Write-ColorOutput Red "❌ Cần cập nhật trạng thái phim trước"
    Write-ColorOutput Yellow "💡 Chạy lệnh SQL để cập nhật:"
    Write-ColorOutput White "   UPDATE movietheater_movie SET status = 'NOW_SHOWING' WHERE movie_id IN (1,2,3,4,5);"
}

Write-ColorOutput Green "`n🎉 ===== HOÀN THÀNH DEBUG =====" 
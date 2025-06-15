# ===============================================
# 🎯 TEST ROUND-ROBIN SCHEDULING ALGORITHM
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

Write-ColorOutput Green "🎯 ===== TEST ROUND-ROBIN SCHEDULING ALGORITHM ====="

# 1. Đăng nhập
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

# 2. Test với 3 phim
Write-ColorOutput Yellow "`n🎬 Test với 3 phim - Thuật toán Round-Robin"

$testRequest = @{
    movieIds = @(1, 2, 3)
    startDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    endDate = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")  # 2 ngày
    minShowsPerMoviePerDay = 2
    maxShowsPerMoviePerDay = 3
    prioritizeFeaturedMovies = $true
    adjustByRating = $true
    avoidTimeConflicts = $true
} | ConvertTo-Json

Write-ColorOutput Cyan "📋 Request:"
Write-ColorOutput White $testRequest

try {
    Write-ColorOutput Yellow "`n⏳ Gọi API Multiple Movie Schedule..."
    $response = Invoke-RestMethod -Uri "$baseUrl/auto-schedule/generate-for-multiple-movies" -Method POST -Body $testRequest -ContentType "application/json" -Headers $headers
    
    Write-ColorOutput Green "`n✅ API thành công!"
    
    # Phân tích kết quả
    Write-ColorOutput Cyan "`n📊 PHÂN TÍCH KẾT QUẢ ROUND-ROBIN:"
    
    $summary = $response.summary
    Write-ColorOutput White "   📈 Tổng quan:"
    Write-ColorOutput White "      - Tổng phim xử lý: $($summary.totalMoviesProcessed)"
    Write-ColorOutput White "      - Tổng lịch chiếu: $($summary.totalSchedulesCreated)"
    Write-ColorOutput White "      - Phim thành công: $($summary.successfulMovies)"
    Write-ColorOutput White "      - Phim thất bại: $($summary.failedMovies)"
    Write-ColorOutput White "      - Trung bình/phim: $($summary.averageSchedulesPerMovie)"
    Write-ColorOutput White "      - Trạng thái: $($summary.status)"
    
    Write-ColorOutput Cyan "`n🎭 Chi tiết từng phim:"
    foreach ($movieResult in $response.movieResults) {
        $statusColor = switch ($movieResult.status) {
            "SUCCESS" { "Green" }
            "PARTIAL" { "Yellow" }
            "FAILED" { "Red" }
            default { "White" }
        }
        
        Write-ColorOutput $statusColor "   🎬 $($movieResult.movieTitle) (ID: $($movieResult.movieId))"
        Write-ColorOutput White "      - Thể loại: $($movieResult.movieGenre)"
        Write-ColorOutput White "      - Rating: $($movieResult.movieRating)"
        Write-ColorOutput White "      - Lịch chiếu: $($movieResult.schedulesCreated)"
        Write-ColorOutput White "      - Tỷ lệ thành công: $($movieResult.successRate)%"
        Write-ColorOutput White "      - Trạng thái: $($movieResult.status)"
        
        if ($movieResult.assignedRooms.Count -gt 0) {
            Write-ColorOutput White "      - Phòng: $($movieResult.assignedRooms -join ', ')"
        }
        
        if ($movieResult.assignedTimeSlots.Count -gt 0) {
            Write-ColorOutput White "      - Khung giờ: $($movieResult.assignedTimeSlots -join ', ')"
        }
        
        Write-ColorOutput White "      - Phân bổ theo ngày:"
        foreach ($day in $movieResult.dailyScheduleCount.PSObject.Properties) {
            Write-ColorOutput White "        * $($day.Name): $($day.Value) suất"
        }
        Write-ColorOutput White ""
    }
    
    # Kiểm tra phân bổ cân bằng
    Write-ColorOutput Cyan "⚖️ KIỂM TRA PHÂN BỔ CÂN BẰNG:"
    
    $schedulesByMovie = @{}
    foreach ($movieResult in $response.movieResults) {
        $schedulesByMovie[$movieResult.movieTitle] = $movieResult.schedulesCreated
    }
    
    $maxSchedules = ($schedulesByMovie.Values | Measure-Object -Maximum).Maximum
    $minSchedules = ($schedulesByMovie.Values | Measure-Object -Minimum).Minimum
    $difference = $maxSchedules - $minSchedules
    
    Write-ColorOutput White "   📊 Phân bổ lịch chiếu:"
    foreach ($movie in $schedulesByMovie.Keys) {
        $count = $schedulesByMovie[$movie]
        $bar = "█" * [Math]::Max(1, [Math]::Floor($count / 2))
        Write-ColorOutput White "      $movie`: $count $bar"
    }
    
    if ($difference -le 2) {
        Write-ColorOutput Green "   ✅ Phân bổ CÂN BẰNG (chênh lệch: $difference)"
    } elseif ($difference -le 5) {
        Write-ColorOutput Yellow "   ⚠️ Phân bổ KHÁ CÂN BẰNG (chênh lệch: $difference)"
    } else {
        Write-ColorOutput Red "   ❌ Phân bổ KHÔNG CÂN BẰNG (chênh lệch: $difference)"
    }
    
    # Phân bổ phòng
    Write-ColorOutput Cyan "`n🏠 Phân bổ phòng chiếu:"
    foreach ($room in $response.roomDistribution.PSObject.Properties) {
        Write-ColorOutput White "   - $($room.Name): $($room.Value) lịch chiếu"
    }
    
    # Phân bổ thời gian
    Write-ColorOutput Cyan "`n⏰ Phân bổ khung thời gian:"
    foreach ($timeSlot in $response.timeSlotDistribution.PSObject.Properties) {
        Write-ColorOutput White "   - $($timeSlot.Name): $($timeSlot.Value) lịch chiếu"
    }
    
    # Thời gian xử lý
    Write-ColorOutput Cyan "`n⚡ Hiệu suất:"
    Write-ColorOutput White "   - Thời gian xử lý: $($response.processingDurationMs)ms"
    Write-ColorOutput White "   - Bắt đầu: $($response.processingStartTime)"
    Write-ColorOutput White "   - Kết thúc: $($response.processingEndTime)"
    
    # Cảnh báo và lỗi
    if ($response.warnings.Count -gt 0) {
        Write-ColorOutput Yellow "`n⚠️ Cảnh báo:"
        foreach ($warning in $response.warnings) {
            Write-ColorOutput Yellow "   - $warning"
        }
    }
    
    if ($response.errors.Count -gt 0) {
        Write-ColorOutput Red "`n❌ Lỗi:"
        foreach ($error in $response.errors) {
            Write-ColorOutput Red "   - $error"
        }
    }
    
    # Kết luận
    Write-ColorOutput Green "`n🎉 KẾT LUẬN:"
    if ($summary.status -eq "SUCCESS" -and $difference -le 2) {
        Write-ColorOutput Green "   ✅ Thuật toán Round-Robin hoạt động HOÀN HẢO!"
        Write-ColorOutput Green "   ✅ Phân bổ lịch chiếu cân bằng giữa các phim"
        Write-ColorOutput Green "   ✅ Không còn tình trạng 1 phim chiếm hết slot"
    } elseif ($summary.status -eq "SUCCESS") {
        Write-ColorOutput Yellow "   ⚠️ Thuật toán hoạt động nhưng cần tinh chỉnh"
    } else {
        Write-ColorOutput Red "   ❌ Thuật toán cần được cải thiện"
    }
    
} catch {
    Write-ColorOutput Red "❌ Lỗi khi gọi API: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-ColorOutput Red "Response: $responseBody"
    }
}

Write-ColorOutput Green "`n🎯 ===== HOÀN THÀNH TEST ROUND-ROBIN =====" 
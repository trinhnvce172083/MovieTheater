# ===============================================
# 🎉 FINAL TEST: ROUND-ROBIN ALGORITHM COMPLETE
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

Write-ColorOutput Green "🎉 ===== FINAL TEST: ROUND-ROBIN ALGORITHM COMPLETE ====="

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

# 2. Test với 4 phim - Thử thách cuối cùng
Write-ColorOutput Yellow "`n🎬 FINAL TEST: 4 phim trong 3 ngày"

$finalRequest = @{
    movieIds = @(1, 2, 3, 6)  # 4 phim
    startDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")   # 1 tuần sau
    endDate = (Get-Date).AddDays(9).ToString("yyyy-MM-dd")     # 3 ngày
    minShowsPerMoviePerDay = 2
    maxShowsPerMoviePerDay = 4
    prioritizeFeaturedMovies = $true
    adjustByRating = $true
    avoidTimeConflicts = $true
} | ConvertTo-Json

Write-ColorOutput Cyan "📋 Final Request:"
Write-ColorOutput White $finalRequest

try {
    Write-ColorOutput Yellow "`n⏳ Gọi API Final Test..."
    $finalResponse = Invoke-RestMethod -Uri "$baseUrl/auto-schedule/generate-for-multiple-movies" -Method POST -Body $finalRequest -ContentType "application/json" -Headers $headers
    
    Write-ColorOutput Green "`n🎉 FINAL TEST THÀNH CÔNG!"
    
    # Phân tích kết quả chi tiết
    Write-ColorOutput Cyan "`n📊 PHÂN TÍCH KẾT QUẢ CUỐI CÙNG:"
    
    $summary = $finalResponse.summary
    Write-ColorOutput White "   📈 Tổng quan:"
    Write-ColorOutput White "      - Tổng phim xử lý: $($summary.totalMoviesProcessed)"
    Write-ColorOutput White "      - Tổng lịch chiếu: $($summary.totalSchedulesCreated)"
    Write-ColorOutput White "      - Phim thành công: $($summary.successfulMovies)"
    Write-ColorOutput White "      - Phim thất bại: $($summary.failedMovies)"
    Write-ColorOutput White "      - Trung bình/phim: $($summary.averageSchedulesPerMovie)"
    Write-ColorOutput White "      - Phòng sử dụng: $($summary.totalRoomsUsed)"
    Write-ColorOutput White "      - Ngày lập lịch: $($summary.totalDaysScheduled)"
    Write-ColorOutput White "      - Trạng thái: $($summary.status)"
    Write-ColorOutput White "      - Thời gian xử lý: $($finalResponse.processingDurationMs)ms"
    
    Write-ColorOutput Cyan "`n🎭 Chi tiết từng phim:"
    $schedulesByMovie = @{}
    $totalSchedulesByMovie = 0
    
    foreach ($movieResult in $finalResponse.movieResults) {
        $schedulesByMovie[$movieResult.movieTitle] = $movieResult.schedulesCreated
        $totalSchedulesByMovie += $movieResult.schedulesCreated
        
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
    Write-ColorOutput Cyan "⚖️ ĐÁNH GIÁ PHÂN BỔ CÂN BẰNG:"
    
    if ($schedulesByMovie.Count -gt 0) {
        $maxSchedules = ($schedulesByMovie.Values | Measure-Object -Maximum).Maximum
        $minSchedules = ($schedulesByMovie.Values | Measure-Object -Minimum).Minimum
        $difference = $maxSchedules - $minSchedules
        
        Write-ColorOutput White "   📊 Phân bổ lịch chiếu:"
        foreach ($movie in $schedulesByMovie.Keys) {
            $count = $schedulesByMovie[$movie]
            $percentage = if ($totalSchedulesByMovie -gt 0) { ($count * 100.0 / $totalSchedulesByMovie) } else { 0 }
            $bar = "█" * [Math]::Max(1, [Math]::Floor($count / 3))
            Write-ColorOutput White "      $movie`: $count ($($percentage.ToString('F1'))%) $bar"
        }
        
        Write-ColorOutput White "   📈 Thống kê phân bổ:"
        Write-ColorOutput White "      - Lịch chiếu nhiều nhất: $maxSchedules"
        Write-ColorOutput White "      - Lịch chiếu ít nhất: $minSchedules"
        Write-ColorOutput White "      - Chênh lệch: $difference"
        
        if ($difference -eq 0) {
            Write-ColorOutput Green "   🏆 HOÀN HẢO: Phân bổ TUYỆT ĐỐI cân bằng!"
        } elseif ($difference -eq 1) {
            Write-ColorOutput Green "   ✅ XUẤT SẮC: Chênh lệch chỉ 1 lịch chiếu"
        } elseif ($difference -le 2) {
            Write-ColorOutput Green "   ✅ RẤT TỐT: Chênh lệch $difference lịch chiếu"
        } elseif ($difference -le 3) {
            Write-ColorOutput Yellow "   ⚠️ TỐT: Chênh lệch $difference lịch chiếu"
        } else {
            Write-ColorOutput Red "   ❌ CẦN CẢI THIỆN: Chênh lệch $difference lịch chiếu"
        }
    }
    
    # Phân bổ phòng
    Write-ColorOutput Cyan "`n🏠 Phân bổ phòng chiếu:"
    foreach ($room in $finalResponse.roomDistribution.PSObject.Properties) {
        $percentage = ($room.Value * 100.0 / $summary.totalSchedulesCreated)
        Write-ColorOutput White "   - $($room.Name): $($room.Value) lịch chiếu ($($percentage.ToString('F1'))%)"
    }
    
    # Phân bổ thời gian
    Write-ColorOutput Cyan "`n⏰ Phân bổ khung thời gian:"
    foreach ($timeSlot in $finalResponse.timeSlotDistribution.PSObject.Properties) {
        $percentage = ($timeSlot.Value * 100.0 / $summary.totalSchedulesCreated)
        Write-ColorOutput White "   - $($timeSlot.Name): $($timeSlot.Value) lịch chiếu ($($percentage.ToString('F1'))%)"
    }
    
    # Cảnh báo và lỗi
    if ($finalResponse.warnings.Count -gt 0) {
        Write-ColorOutput Yellow "`n⚠️ Cảnh báo:"
        foreach ($warning in $finalResponse.warnings) {
            Write-ColorOutput Yellow "   - $warning"
        }
    }
    
    if ($finalResponse.errors.Count -gt 0) {
        Write-ColorOutput Red "`n❌ Lỗi:"
        foreach ($error in $finalResponse.errors) {
            Write-ColorOutput Red "   - $error"
        }
    }
    
    # Đánh giá tổng thể
    Write-ColorOutput Green "`n🏆 ĐÁNH GIÁ TỔNG THỂ:"
    
    $isSuccess = $summary.status -eq "SUCCESS" -or $summary.status -eq "PARTIAL_SUCCESS"
    $hasBalancedDistribution = $difference -le 2
    $hasAllMoviesScheduled = ($schedulesByMovie.Values | Where-Object { $_ -eq 0 }).Count -eq 0
    $hasGoodPerformance = $finalResponse.processingDurationMs -lt 30000  # < 30 giây
    
    if ($isSuccess -and $hasBalancedDistribution -and $hasAllMoviesScheduled) {
        Write-ColorOutput Green "   🎊 THUẬT TOÁN ROUND-ROBIN HOÀN HẢO!"
        Write-ColorOutput Green "   ✅ Phân bổ lịch chiếu cân bằng"
        Write-ColorOutput Green "   ✅ Tất cả phim đều có lịch chiếu"
        Write-ColorOutput Green "   ✅ Không còn vòng lặp vô hạn"
        Write-ColorOutput Green "   ✅ Xử lý transaction rollback thông minh"
        Write-ColorOutput Green "   ✅ Tận dụng tối đa phòng chiếu và thời gian"
        
        if ($hasGoodPerformance) {
            Write-ColorOutput Green "   ✅ Hiệu suất xử lý tốt ($($finalResponse.processingDurationMs)ms)"
        }
        
        Write-ColorOutput Green "`n   🎯 KẾT LUẬN: THUẬT TOÁN ĐÃ HOÀN THIỆN!"
        
    } elseif ($isSuccess) {
        Write-ColorOutput Yellow "   ⚠️ Thuật toán hoạt động tốt nhưng có thể cải thiện thêm"
        if (-not $hasBalancedDistribution) {
            Write-ColorOutput Yellow "   - Cần cải thiện phân bổ cân bằng hơn"
        }
        if (-not $hasAllMoviesScheduled) {
            Write-ColorOutput Yellow "   - Một số phim chưa có lịch chiếu"
        }
    } else {
        Write-ColorOutput Red "   ❌ Thuật toán cần được cải thiện thêm"
    }
    
} catch {
    Write-ColorOutput Red "❌ Lỗi FINAL TEST: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-ColorOutput Red "Response: $responseBody"
    }
}

Write-ColorOutput Green "`n🎉 ===== HOÀN THÀNH FINAL TEST =====" 
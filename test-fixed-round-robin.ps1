# ===============================================
# 🔧 TEST FIXED ROUND-ROBIN SCHEDULING ALGORITHM
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

Write-ColorOutput Green "🔧 ===== TEST FIXED ROUND-ROBIN ALGORITHM ====="

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

# 2. Xóa lịch chiếu cũ (nếu có)
Write-ColorOutput Yellow "`n🗑️ Xóa lịch chiếu cũ..."
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$dayAfter = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")

try {
    # Lấy lịch chiếu hiện tại
    $existingSchedules = Invoke-RestMethod -Uri "$baseUrl/schedules?date=$tomorrow" -Method GET -Headers $headers
    if ($existingSchedules.result.Count -gt 0) {
        Write-ColorOutput Yellow "   Tìm thấy $($existingSchedules.result.Count) lịch chiếu cũ, đang xóa..."
        # Note: Cần API xóa lịch chiếu, tạm thời bỏ qua
    }
} catch {
    Write-ColorOutput Yellow "   Không có lịch chiếu cũ hoặc không thể xóa"
}

# 3. Test với 2 phim - Kỳ vọng phân bổ đều
Write-ColorOutput Yellow "`n🎬 TEST 1: 2 phim - Kỳ vọng phân bổ đều"

$test1Request = @{
    movieIds = @(2, 3)  # 2 phim
    startDate = $tomorrow
    endDate = $tomorrow  # 1 ngày
    minShowsPerMoviePerDay = 2
    maxShowsPerMoviePerDay = 4
    prioritizeFeaturedMovies = $false  # Không ưu tiên để test phân bổ đều
    adjustByRating = $false
    avoidTimeConflicts = $true
} | ConvertTo-Json

Write-ColorOutput Cyan "📋 Request Test 1:"
Write-ColorOutput White $test1Request

try {
    Write-ColorOutput Yellow "`n⏳ Gọi API..."
    $response1 = Invoke-RestMethod -Uri "$baseUrl/auto-schedule/generate-for-multiple-movies" -Method POST -Body $test1Request -ContentType "application/json" -Headers $headers
    
    Write-ColorOutput Green "`n✅ TEST 1 thành công!"
    
    # Phân tích kết quả
    Write-ColorOutput Cyan "`n📊 PHÂN TÍCH KẾT QUẢ TEST 1:"
    
    $summary1 = $response1.summary
    Write-ColorOutput White "   📈 Tổng quan:"
    Write-ColorOutput White "      - Tổng lịch chiếu: $($summary1.totalSchedulesCreated)"
    Write-ColorOutput White "      - Phim thành công: $($summary1.successfulMovies)"
    Write-ColorOutput White "      - Trạng thái: $($summary1.status)"
    
    Write-ColorOutput Cyan "`n🎭 Chi tiết từng phim:"
    $schedulesByMovie1 = @{}
    foreach ($movieResult in $response1.movieResults) {
        $schedulesByMovie1[$movieResult.movieTitle] = $movieResult.schedulesCreated
        Write-ColorOutput White "   🎬 $($movieResult.movieTitle): $($movieResult.schedulesCreated) lịch chiếu"
    }
    
    # Kiểm tra phân bổ
    $maxSchedules1 = ($schedulesByMovie1.Values | Measure-Object -Maximum).Maximum
    $minSchedules1 = ($schedulesByMovie1.Values | Measure-Object -Minimum).Minimum
    $difference1 = $maxSchedules1 - $minSchedules1
    
    Write-ColorOutput Cyan "`n⚖️ ĐÁNH GIÁ PHÂN BỔ TEST 1:"
    if ($difference1 -le 1) {
        Write-ColorOutput Green "   ✅ HOÀN HẢO: Chênh lệch chỉ $difference1 lịch chiếu"
    } elseif ($difference1 -le 2) {
        Write-ColorOutput Yellow "   ⚠️ TỐT: Chênh lệch $difference1 lịch chiếu"
    } else {
        Write-ColorOutput Red "   ❌ CẦN CẢI THIỆN: Chênh lệch $difference1 lịch chiếu"
    }
    
} catch {
    Write-ColorOutput Red "❌ Lỗi TEST 1: $($_.Exception.Message)"
}

# 4. Test với 3 phim - Thử thách khó hơn
Write-ColorOutput Yellow "`n🎬 TEST 2: 3 phim - Thử thách phân bổ"

$test2Request = @{
    movieIds = @(1, 2, 3)  # 3 phim
    startDate = $dayAfter
    endDate = $dayAfter  # 1 ngày
    minShowsPerMoviePerDay = 1
    maxShowsPerMoviePerDay = 3
    prioritizeFeaturedMovies = $false
    adjustByRating = $false
    avoidTimeConflicts = $true
} | ConvertTo-Json

Write-ColorOutput Cyan "📋 Request Test 2:"
Write-ColorOutput White $test2Request

try {
    Write-ColorOutput Yellow "`n⏳ Gọi API..."
    $response2 = Invoke-RestMethod -Uri "$baseUrl/auto-schedule/generate-for-multiple-movies" -Method POST -Body $test2Request -ContentType "application/json" -Headers $headers
    
    Write-ColorOutput Green "`n✅ TEST 2 thành công!"
    
    # Phân tích kết quả
    Write-ColorOutput Cyan "`n📊 PHÂN TÍCH KẾT QUẢ TEST 2:"
    
    $summary2 = $response2.summary
    Write-ColorOutput White "   📈 Tổng quan:"
    Write-ColorOutput White "      - Tổng lịch chiếu: $($summary2.totalSchedulesCreated)"
    Write-ColorOutput White "      - Phim thành công: $($summary2.successfulMovies)"
    Write-ColorOutput White "      - Trạng thái: $($summary2.status)"
    
    Write-ColorOutput Cyan "`n🎭 Chi tiết từng phim:"
    $schedulesByMovie2 = @{}
    foreach ($movieResult in $response2.movieResults) {
        $schedulesByMovie2[$movieResult.movieTitle] = $movieResult.schedulesCreated
        Write-ColorOutput White "   🎬 $($movieResult.movieTitle): $($movieResult.schedulesCreated) lịch chiếu"
    }
    
    # Kiểm tra phân bổ
    $maxSchedules2 = ($schedulesByMovie2.Values | Measure-Object -Maximum).Maximum
    $minSchedules2 = ($schedulesByMovie2.Values | Measure-Object -Minimum).Minimum
    $difference2 = $maxSchedules2 - $minSchedules2
    
    Write-ColorOutput Cyan "`n⚖️ ĐÁNH GIÁ PHÂN BỔ TEST 2:"
    if ($difference2 -le 1) {
        Write-ColorOutput Green "   ✅ HOÀN HẢO: Chênh lệch chỉ $difference2 lịch chiếu"
    } elseif ($difference2 -le 2) {
        Write-ColorOutput Yellow "   ⚠️ TỐT: Chênh lệch $difference2 lịch chiếu"
    } else {
        Write-ColorOutput Red "   ❌ CẦN CẢI THIỆN: Chênh lệch $difference2 lịch chiếu"
    }
    
    # Kiểm tra xem có phim nào bị bỏ qua không
    $moviesWithZeroSchedules = ($schedulesByMovie2.Values | Where-Object { $_ -eq 0 }).Count
    if ($moviesWithZeroSchedules -eq 0) {
        Write-ColorOutput Green "   ✅ TẤT CẢ PHIM đều có lịch chiếu"
    } else {
        Write-ColorOutput Red "   ❌ CÓ $moviesWithZeroSchedules PHIM bị bỏ qua"
    }
    
} catch {
    Write-ColorOutput Red "❌ Lỗi TEST 2: $($_.Exception.Message)"
}

# 5. Kết luận tổng thể
Write-ColorOutput Green "`n🎉 KẾT LUẬN TỔNG THỂ:"

$allTestsPassed = $true

# Kiểm tra Test 1
if (($difference1 -le 2) -and ($schedulesByMovie1.Values | Where-Object { $_ -eq 0 }).Count -eq 0) {
    Write-ColorOutput Green "   ✅ TEST 1: PASS - Phân bổ cân bằng cho 2 phim"
} else {
    Write-ColorOutput Red "   ❌ TEST 1: FAIL - Phân bổ không cân bằng"
    $allTestsPassed = $false
}

# Kiểm tra Test 2
if (($difference2 -le 2) -and ($schedulesByMovie2.Values | Where-Object { $_ -eq 0 }).Count -eq 0) {
    Write-ColorOutput Green "   ✅ TEST 2: PASS - Phân bổ cân bằng cho 3 phim"
} else {
    Write-ColorOutput Red "   ❌ TEST 2: FAIL - Phân bổ không cân bằng"
    $allTestsPassed = $false
}

if ($allTestsPassed) {
    Write-ColorOutput Green "`n🎊 THUẬT TOÁN ROUND-ROBIN ĐÃ ĐƯỢC FIX THÀNH CÔNG!"
    Write-ColorOutput Green "   ✅ Không còn tình trạng 1 phim chiếm hết slot"
    Write-ColorOutput Green "   ✅ Phân bổ lịch chiếu cân bằng giữa các phim"
    Write-ColorOutput Green "   ✅ Tất cả phim đều được tạo lịch chiếu"
} else {
    Write-ColorOutput Red "`n❌ THUẬT TOÁN VẪN CẦN TINH CHỈNH THÊM"
    Write-ColorOutput Yellow "   💡 Có thể cần điều chỉnh logic phân bổ hoặc quota"
}

Write-ColorOutput Green "`n🔧 ===== HOÀN THÀNH TEST FIXED ROUND-ROBIN =====" 
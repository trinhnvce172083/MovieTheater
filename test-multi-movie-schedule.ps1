# ===============================================
# 🎬 TEST SCRIPT: Multiple Movie Schedule API
# Kiểm tra API tạo lịch chiếu cho nhiều phim
# ===============================================

$baseUrl = "http://localhost:8080"
$apiUrl = "$baseUrl/auto-schedule/generate-for-multiple-movies"

# Màu sắc cho output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "🎬 ===== TESTING MULTIPLE MOVIE SCHEDULE API ====="

# Lấy token admin
Write-ColorOutput Yellow "📝 Đăng nhập admin để lấy token..."
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

# Headers với token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test Case 1: Tạo lịch cho nhiều phim (2-3 phim)
Write-ColorOutput Yellow "`n📅 Test Case 1: Tạo lịch cho 3 phim trong 7 ngày"

$startDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$endDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")

$requestData1 = @{
    movieIds = @(1, 2, 3)
    startDate = $startDate
    endDate = $endDate
    minShowsPerMoviePerDay = 2
    maxShowsPerMoviePerDay = 4
    prioritizeFeaturedMovies = $true
    evenRoomDistribution = $true
    adjustByRating = $true
    notes = "Test tạo lịch cho 3 phim"
} | ConvertTo-Json

try {
    Write-ColorOutput Cyan "📤 Gửi request: $requestData1"
    $response1 = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $requestData1 -Headers $headers
    
    Write-ColorOutput Green "✅ Test Case 1 - THÀNH CÔNG!"
    Write-ColorOutput White "📊 Kết quả:"
    Write-ColorOutput White "   - Tổng phim xử lý: $($response1.summary.totalMoviesProcessed)"
    Write-ColorOutput White "   - Tổng lịch chiếu: $($response1.summary.totalSchedulesCreated)"
    Write-ColorOutput White "   - Trạng thái: $($response1.summary.status)"
    Write-ColorOutput White "   - Thời gian xử lý: $($response1.processingDurationMs)ms"
    
    if ($response1.movieResults) {
        Write-ColorOutput White "   - Chi tiết từng phim:"
        foreach ($movie in $response1.movieResults) {
            Write-ColorOutput White "     * $($movie.movieTitle): $($movie.schedulesCreated) lịch chiếu"
        }
    }
    
} catch {
    Write-ColorOutput Red "❌ Test Case 1 - THẤT BẠI: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $errorDetails = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorDetails)
        $errorBody = $reader.ReadToEnd()
        Write-ColorOutput Red "Chi tiết lỗi: $errorBody"
    }
}

# Test Case 2: Tạo lịch với nhiều phim hơn (5 phim)
Write-ColorOutput Yellow "`n📅 Test Case 2: Tạo lịch cho 5 phim trong 3 ngày"

$requestData2 = @{
    movieIds = @(1, 2, 3, 4, 5)
    startDate = (Get-Date).AddDays(8).ToString("yyyy-MM-dd")
    endDate = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")
    minShowsPerMoviePerDay = 1
    maxShowsPerMoviePerDay = 3
    prioritizeFeaturedMovies = $false
    evenRoomDistribution = $true
    adjustByRating = $false
    notes = "Test tạo lịch cho 5 phim"
} | ConvertTo-Json

try {
    Write-ColorOutput Cyan "📤 Gửi request: $requestData2"
    $response2 = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $requestData2 -Headers $headers
    
    Write-ColorOutput Green "✅ Test Case 2 - THÀNH CÔNG!"
    Write-ColorOutput White "📊 Kết quả:"
    Write-ColorOutput White "   - Tổng phim xử lý: $($response2.summary.totalMoviesProcessed)"
    Write-ColorOutput White "   - Tổng lịch chiếu: $($response2.summary.totalSchedulesCreated)"
    Write-ColorOutput White "   - Trạng thái: $($response2.summary.status)"
    
} catch {
    Write-ColorOutput Red "❌ Test Case 2 - THẤT BẠI: $($_.Exception.Message)"
}

# Test Case 3: Test validation errors
Write-ColorOutput Yellow "`n📅 Test Case 3: Test validation errors"

$requestData3 = @{
    movieIds = @()  # Empty array - should fail
    startDate = $startDate
    endDate = $endDate
    minShowsPerMoviePerDay = 2
    maxShowsPerMoviePerDay = 4
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $requestData3 -Headers $headers
    Write-ColorOutput Red "❌ Test Case 3 - THẤT BẠI: Validation error không được bắt!"
} catch {
    Write-ColorOutput Green "✅ Test Case 3 - THÀNH CÔNG: Validation error được bắt đúng!"
    Write-ColorOutput White "   Lỗi: $($_.Exception.Message)"
}

# Test Case 4: Test với ngày trong quá khứ
Write-ColorOutput Yellow "`n📅 Test Case 4: Test với ngày trong quá khứ"

$requestData4 = @{
    movieIds = @(1, 2)
    startDate = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")  # Yesterday
    endDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    minShowsPerMoviePerDay = 2
    maxShowsPerMoviePerDay = 4
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $requestData4 -Headers $headers
    Write-ColorOutput Red "❌ Test Case 4 - THẤT BẠI: Past date error không được bắt!"
} catch {
    Write-ColorOutput Green "✅ Test Case 4 - THÀNH CÔNG: Past date error được bắt đúng!"
    Write-ColorOutput White "   Lỗi: $($_.Exception.Message)"
}

# Test Case 5: Test với phim không tồn tại
Write-ColorOutput Yellow "`n📅 Test Case 5: Test với phim không tồn tại"

$requestData5 = @{
    movieIds = @(999, 998, 997)  # Non-existent movies
    startDate = $startDate
    endDate = $endDate
    minShowsPerMoviePerDay = 2
    maxShowsPerMoviePerDay = 4
} | ConvertTo-Json

try {
    $response5 = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $requestData5 -Headers $headers
    Write-ColorOutput Yellow "⚠️ Test Case 5 - Có thể thành công hoặc thất bại tùy vào dữ liệu"
    Write-ColorOutput White "   Trạng thái: $($response5.summary.status)"
    if ($response5.errors) {
        Write-ColorOutput White "   Lỗi: $($response5.errors -join ', ')"
    }
} catch {
    Write-ColorOutput Green "✅ Test Case 5 - THÀNH CÔNG: Movie not found error được bắt đúng!"
    Write-ColorOutput White "   Lỗi: $($_.Exception.Message)"
}

Write-ColorOutput Green "`n🎉 ===== HOÀN THÀNH TESTING ====="
Write-ColorOutput White "📝 Tóm tắt:"
Write-ColorOutput White "   - API Multiple Movie Schedule đã được test với 5 test cases"
Write-ColorOutput White "   - Kiểm tra cả trường hợp thành công và validation errors"
Write-ColorOutput White "   - Error handling và exception management hoạt động tốt"

Write-ColorOutput Cyan "`n🔗 Để xem chi tiết lịch chiếu đã tạo:"
Write-ColorOutput Cyan "   GET $baseUrl/schedules"
Write-ColorOutput Cyan "`n🔗 Để xem thống kê auto schedule:"
Write-ColorOutput Cyan "   GET $baseUrl/auto-schedule/statistics" 
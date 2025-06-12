# Script test API tạo lịch chiếu tự động ngay lập tức
# Author: Dũng_Solo
# Version: 1.0.0

$ErrorActionPreference = "Continue"

# Cấu hình API
$BASE_URL = "http://localhost:8080/cinema"
$API_BASE = "$BASE_URL/auto-schedule"

# Colors for output
$Red = [System.ConsoleColor]::Red
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Blue
$White = [System.ConsoleColor]::White

function Write-ColorOutput($ForegroundColor, $Message) {
    $originalColor = [Console]::ForegroundColor
    [Console]::ForegroundColor = $ForegroundColor
    Write-Output $Message
    [Console]::ForegroundColor = $originalColor
}

function Test-APIEndpoint($Method, $Url, $Headers, $Body = $null, $Description) {
    Write-ColorOutput $Blue "========================================"
    Write-ColorOutput $Blue "Testing: $Description"
    Write-ColorOutput $Blue "URL: $Method $Url"
    Write-ColorOutput $Blue "========================================"
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        Write-ColorOutput $Green "✅ SUCCESS: $Description"
        Write-ColorOutput $White ($response | ConvertTo-Json -Depth 10)
        return $response
    }
    catch {
        Write-ColorOutput $Red "❌ FAILED: $Description"
        Write-ColorOutput $Red "Error: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            try {
                $errorContent = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorContent)
                $errorBody = $reader.ReadToEnd()
                Write-ColorOutput $Red "Error Body: $errorBody"
            }
            catch {
                Write-ColorOutput $Red "Could not read error response"
            }
        }
        return $null
    }
}

# Bước 1: Đăng nhập admin để lấy token
Write-ColorOutput $Yellow "=== BƯỚC 1: ĐĂNG NHẬP ADMIN ==="

$loginData = @{
    email = "admin@lumierecinema.com"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Test-APIEndpoint "POST" "$BASE_URL/auth/login" @{} $loginData "Đăng nhập admin"

if (-not $loginResponse -or -not $loginResponse.token) {
    Write-ColorOutput $Red "Không thể đăng nhập. Vui lòng kiểm tra server và thông tin đăng nhập."
    exit 1
}

$token = $loginResponse.token
$headers = @{
    "Authorization" = "Bearer $token"
}

Write-ColorOutput $Green "✅ Đăng nhập thành công. Token: $($token.Substring(0, 20))..."

# Bước 2: Kiểm tra trạng thái database
Write-ColorOutput $Yellow "`n=== BƯỚC 2: KIỂM TRA TRẠNG THÁI DATABASE ==="

$dbStatus = Test-APIEndpoint "GET" "$API_BASE/check-database-status" $headers $null "Kiểm tra trạng thái database"

if ($dbStatus) {
    Write-ColorOutput $White "📊 THÔNG TIN DATABASE:"
    Write-ColorOutput $White "- Số phim NOW_SHOWING: $($dbStatus.nowShowingMoviesCount)"
    Write-ColorOutput $White "- Tổng số lịch chiếu: $($dbStatus.totalSchedulesCount)"
    Write-ColorOutput $White "- Lịch chiếu 3 ngày tới: $($dbStatus.schedulesForNext3Days)"
    Write-ColorOutput $White "- Có lịch cho ngày mai: $($dbStatus.hasSchedulesForTomorrow)"
    Write-ColorOutput $White "- Trạng thái hệ thống: $($dbStatus.systemStatus)"
    
    if ($dbStatus.nowShowingMovieTitles -and $dbStatus.nowShowingMovieTitles.Count -gt 0) {
        Write-ColorOutput $White "📽️ PHIM ĐANG CHIẾU:"
        foreach ($movie in $dbStatus.nowShowingMovieTitles) {
            Write-ColorOutput $White "  - $movie"
        }
    }
    
    if ($dbStatus.recommendations -and $dbStatus.recommendations.Count -gt 0) {
        Write-ColorOutput $Yellow "💡 GỢI Ý:"
        foreach ($rec in $dbStatus.recommendations) {
            Write-ColorOutput $Yellow "  - $rec"
        }
    }
}

# Bước 3: Kích hoạt tạo lịch ngay lập tức
Write-ColorOutput $Yellow "`n=== BƯỚC 3: KÍCH HOẠT TẠO LỊCH NGAY LẬP TỨC ==="

$scheduleResult = Test-APIEndpoint "POST" "$API_BASE/trigger-immediate" $headers $null "Kích hoạt tạo lịch từ ngày mai"

if ($scheduleResult) {
    Write-ColorOutput $White "📅 KẾT QUẢ TẠO LỊCH:"
    Write-ColorOutput $White "- Thành công: $($scheduleResult.success)"
    Write-ColorOutput $White "- Thông báo: $($scheduleResult.message)"
    Write-ColorOutput $White "- Số lịch chiếu đã tạo: $($scheduleResult.totalSchedulesCreated)"
    Write-ColorOutput $White "- Số phim được xử lý: $($scheduleResult.moviesProcessed)"
    Write-ColorOutput $White "- Số phòng được sử dụng: $($scheduleResult.roomsUsed)"
    
    if ($scheduleResult.errors -and $scheduleResult.errors.Count -gt 0) {
        Write-ColorOutput $Red "⚠️ LỖI:"
        foreach ($error in $scheduleResult.errors) {
            Write-ColorOutput $Red "  - $error"
        }
    }
    
    if ($scheduleResult.createdSchedules -and $scheduleResult.createdSchedules.Count -gt 0) {
        Write-ColorOutput $Green "✅ LỊCH CHIẾU ĐÃ TẠO:"
        foreach ($schedule in $scheduleResult.createdSchedules) {
            $movieTitle = if ($schedule.movieTitle) { $schedule.movieTitle } else { "Movie ID: $($schedule.movieId)" }
            $roomName = if ($schedule.cinemaRoomName) { $schedule.cinemaRoomName } else { "Room ID: $($schedule.cinemaRoomId)" }
            Write-ColorOutput $Green "  - $movieTitle | $roomName | $($schedule.showDate) $($schedule.startTime)-$($schedule.endTime) | $($schedule.price)đ"
        }
    }
}

# Bước 4: Kiểm tra lại trạng thái sau khi tạo lịch
Write-ColorOutput $Yellow "`n=== BƯỚC 4: KIỂM TRA TRẠNG THÁI SAU KHI TẠO LỊCH ==="

$dbStatusAfter = Test-APIEndpoint "GET" "$API_BASE/check-database-status" $headers $null "Kiểm tra trạng thái database sau khi tạo lịch"

if ($dbStatusAfter) {
    Write-ColorOutput $White "📊 THÔNG TIN DATABASE SAU KHI TẠO LỊCH:"
    Write-ColorOutput $White "- Số phim NOW_SHOWING: $($dbStatusAfter.nowShowingMoviesCount)"
    Write-ColorOutput $White "- Tổng số lịch chiếu: $($dbStatusAfter.totalSchedulesCount)"
    Write-ColorOutput $White "- Lịch chiếu 3 ngày tới: $($dbStatusAfter.schedulesForNext3Days)"
    Write-ColorOutput $White "- Có lịch cho ngày mai: $($dbStatusAfter.hasSchedulesForTomorrow)"
    Write-ColorOutput $White "- Trạng thái hệ thống: $($dbStatusAfter.systemStatus)"
    
    # So sánh với trạng thái trước đó
    if ($dbStatus) {
        $scheduleIncrease = $dbStatusAfter.totalSchedulesCount - $dbStatus.totalSchedulesCount
        $next3DaysIncrease = $dbStatusAfter.schedulesForNext3Days - $dbStatus.schedulesForNext3Days
        
        Write-ColorOutput $Blue "📈 THAY ĐỔI:"
        Write-ColorOutput $Blue "- Tăng thêm: $scheduleIncrease lịch chiếu tổng"
        Write-ColorOutput $Blue "- Tăng thêm: $next3DaysIncrease lịch cho 3 ngày tới"
    }
}

# Bước 5: Lấy thống kê hệ thống
Write-ColorOutput $Yellow "`n=== BƯỚC 5: THỐNG KÊ HỆ THỐNG ==="

$stats = Test-APIEndpoint "GET" "$API_BASE/statistics" $headers $null "Lấy thống kê hệ thống"

if ($stats) {
    Write-ColorOutput $White "📈 THỐNG KÊ HỆ THỐNG:"
    Write-ColorOutput $White "- Tổng lịch chiếu đã tạo: $($stats.totalSchedulesGenerated)"
    Write-ColorOutput $White "- Lịch chiếu 7 ngày qua: $($stats.schedulesLast7Days)"
    Write-ColorOutput $White "- Trung bình lịch/ngày: $($stats.averageSchedulesPerDay)"
    Write-ColorOutput $White "- Tổng phòng đã tạo: $($stats.totalRoomsCreated)"
    Write-ColorOutput $White "- Số phim đang chiếu: $($stats.nowShowingMovies)"
    Write-ColorOutput $White "- Tỷ lệ lấp đầy TB: $($stats.averageOccupancyRate)%"
    Write-ColorOutput $White "- Ngày tạo lịch cuối: $($stats.lastGenerationDate)"
    Write-ColorOutput $White "- Ngày tạo lịch tiếp: $($stats.nextGenerationDate)"
}

Write-ColorOutput $Green "`n🎉 HOÀN THÀNH TEST HỆ THỐNG TẠO LỊCH TỰ ĐỘNG!"
Write-ColorOutput $Blue "Bạn có thể kiểm tra database để xác nhận lịch chiếu đã được tạo." 
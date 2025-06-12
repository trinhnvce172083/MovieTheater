# Test Smart Movie Update Feature
$adminToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBsdW1pZXJlLmNvbSIsImlhdCI6MTczMjE5MzAzNywiZXhwIjoxNzMyMjc5NDM3LCJyb2xlcyI6WyJBRE1JTiJdfQ.wUdG5Ae6JZrZQzXYUxNONW4d7b-h7AW7XnQQQVvdFcaVHMQJqexUzqexkwOy7m7VbGQnP9y_T49IQ4Cg6VqkPw"

Write-Host "=== TESTING SMART MOVIE UPDATE FEATURE ===" -ForegroundColor Green

# 1. Tạo movie mới trước để test update
Write-Host "`n1. Creating test movie..." -ForegroundColor Yellow
$movieData = @{
    title = "Smart Update Test Movie"
    description = "Original description"
    genre = "Action"
    duration = 120
    director = "Original Director"
    cast = "Original Cast"
    language = "English"
    country = "USA"
    rating = "PG-13"
    status = "NOW_SHOWING"
    price = 100000.0
    productionCompany = "Original Studio"
} | ConvertTo-Json

try {
    $newMovie = Invoke-RestMethod -Uri "http://localhost:8080/movies" -Method POST -Headers @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    } -Body $movieData
    Write-Host "✅ Created movie ID: $($newMovie.movieId)" -ForegroundColor Green
    $movieId = $newMovie.movieId
} catch {
    Write-Host "❌ FAILED to create movie" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit
}

# 2. Test partial update - chỉ update một số fields
Write-Host "`n2. Testing partial update (only title and price)..." -ForegroundColor Yellow
$partialUpdate = @{
    title = "Updated Title Only"
    price = 150000.0
    # Không gửi description, genre, etc. -> should keep original values
} | ConvertTo-Json

try {
    $updatedMovie = Invoke-RestMethod -Uri "http://localhost:8080/movies/$movieId" -Method PUT -Headers @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    } -Body $partialUpdate
    Write-Host "✅ Partial update successful!" -ForegroundColor Green
    Write-Host "   Title: $($updatedMovie.title)" -ForegroundColor Cyan
    Write-Host "   Price: $($updatedMovie.price)" -ForegroundColor Cyan
    Write-Host "   Description (should be unchanged): $($updatedMovie.description)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ FAILED partial update" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# 3. Test clear field feature
Write-Host "`n3. Testing CLEAR_FIELD feature..." -ForegroundColor Yellow
$clearFieldUpdate = @{
    description = "CLEAR_FIELD"  # This should clear the description
    productionCompany = "CLEAR_FIELD"  # This should clear production company
    cast = "New Cast Members"  # This should update cast
} | ConvertTo-Json

try {
    $clearedMovie = Invoke-RestMethod -Uri "http://localhost:8080/movies/$movieId" -Method PUT -Headers @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    } -Body $clearFieldUpdate
    Write-Host "✅ CLEAR_FIELD update successful!" -ForegroundColor Green
    Write-Host "   Description (should be null): '$($clearedMovie.description)'" -ForegroundColor Cyan
    Write-Host "   Production Company (should be null): '$($clearedMovie.productionCompany)'" -ForegroundColor Cyan
    Write-Host "   Cast (should be updated): $($clearedMovie.cast)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ FAILED CLEAR_FIELD update" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# 4. Test empty/whitespace handling
Write-Host "`n4. Testing empty/whitespace handling..." -ForegroundColor Yellow
$whitespaceUpdate = @{
    director = "   "  # Only whitespace - should NOT update
    language = ""     # Empty string - should NOT update  
    country = "Updated Country"  # Valid content - should update
} | ConvertTo-Json

try {
    $whitespaceMovie = Invoke-RestMethod -Uri "http://localhost:8080/movies/$movieId" -Method PUT -Headers @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    } -Body $whitespaceUpdate
    Write-Host "✅ Whitespace handling successful!" -ForegroundColor Green
    Write-Host "   Director (should be unchanged): $($whitespaceMovie.director)" -ForegroundColor Cyan
    Write-Host "   Language (should be unchanged): $($whitespaceMovie.language)" -ForegroundColor Cyan
    Write-Host "   Country (should be updated): $($whitespaceMovie.country)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ FAILED whitespace handling" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# 5. Cleanup - delete test movie
Write-Host "`n5. Cleaning up test movie..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:8080/movies/$movieId" -Method DELETE -Headers @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    Write-Host "✅ Test movie deleted successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ FAILED to delete test movie" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n=== SMART UPDATE TEST COMPLETED ===" -ForegroundColor Green
Write-Host "`nSUMMARY OF FEATURES:" -ForegroundColor Cyan
Write-Host "✓ Partial Update: Chỉ update fields có nội dung" -ForegroundColor Cyan
Write-Host "✓ CLEAR_FIELD: Xóa content bằng cách gửi 'CLEAR_FIELD'" -ForegroundColor Cyan
Write-Host "✓ Smart Handling: Bỏ qua null, empty string, và whitespace-only" -ForegroundColor Cyan
Write-Host "✓ Preserve Original: Giữ nguyên giá trị cũ nếu không gửi field" -ForegroundColor Cyan 
# Simple test script
$baseUrl = "http://localhost:8080"

# Login
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Write-Host "Logging in..."
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.result.token
Write-Host "Token: $($token.Substring(0,20))..."

# Get movies
$headers = @{
    "Authorization" = "Bearer $token"
}

Write-Host "Getting movies..."
$movies = Invoke-RestMethod -Uri "$baseUrl/movies" -Method GET -Headers $headers
Write-Host "Found $($movies.result.Count) movies"

# Show first few movies
$movies.result | Select-Object -First 5 | ForEach-Object {
    Write-Host "ID: $($_.movieId), Title: $($_.title), Status: $($_.status)"
}

# Test auto schedule with first 2 movies
$movieIds = $movies.result | Select-Object -First 2 | ForEach-Object { $_.movieId }
Write-Host "Testing with movie IDs: $($movieIds -join ', ')"

$requestBody = @{
    movieIds = $movieIds
    startDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    endDate = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")
    minShowsPerMoviePerDay = 1
    maxShowsPerMoviePerDay = 2
    prioritizeFeaturedMovies = $true
    adjustByRating = $true
    avoidTimeConflicts = $true
} | ConvertTo-Json

Write-Host "Request body:"
Write-Host $requestBody

Write-Host "Calling auto schedule API..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auto-schedule/generate-for-multiple-movies" -Method POST -Body $requestBody -ContentType "application/json" -Headers $headers
    Write-Host "SUCCESS!"
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody"
    }
} 
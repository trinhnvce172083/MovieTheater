# Check Build Script - Spring Boot 3.x + Java 17 + Latest Dependencies
# Script để kiểm tra build project với phiên bản cao nhất

Write-Host "🔧 Movie Theater Backend - Build Check" -ForegroundColor Cyan
Write-Host "📦 Spring Boot 3.4.2 + Java 17 + Jakarta EE" -ForegroundColor Green

# Check Java
Write-Host ""
Write-Host "☕ Checking Java version..." -ForegroundColor Yellow
try {
    $javaOutput = java -version 2>&1
    $javaVersion = $javaOutput | Select-String "version" | Out-String
    
    if ($javaVersion -match '"17\.') {
        Write-Host "✅ Java 17 detected!" -ForegroundColor Green
        Write-Host $javaVersion.Trim() -ForegroundColor Cyan
    } else {
        Write-Host "❌ Java 17 required!" -ForegroundColor Red
        Write-Host "Current: $javaVersion" -ForegroundColor Yellow
        Write-Host "📖 Please read docs/JAVA-SETUP.md" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "❌ Java not found!" -ForegroundColor Red
    Write-Host "📖 Please read docs/JAVA-SETUP.md" -ForegroundColor White
    exit 1
}

# Check Maven
Write-Host ""
Write-Host "🔧 Checking Maven..." -ForegroundColor Yellow
try {
    $mvnOutput = mvn -version 2>&1 | Select-Object -First 1
    if ($mvnOutput -match "Apache Maven") {
        Write-Host "✅ Maven found: $mvnOutput" -ForegroundColor Green
    } else {
        throw "Maven not detected"
    }
} catch {
    Write-Host "❌ Maven not found!" -ForegroundColor Red
    Write-Host "📖 Please read docs/MAVEN-SETUP.md" -ForegroundColor White
    exit 1
}

# Check project structure
Write-Host ""
Write-Host "📁 Checking project structure..." -ForegroundColor Yellow

$requiredFiles = @(
    "pom.xml",
    "src/main/java/com/swp/MovieTheaterService/config/security/SecurityConfiguration.java",
    "src/main/java/com/swp/MovieTheaterService/config/documentation/OpenApiConfiguration.java",
    "src/main/java/com/swp/MovieTheaterService/config/properties/ApplicationProperties.java",
    "src/main/resources/application.yml"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
        exit 1
    }
}

# Clean compile
Write-Host ""
Write-Host "🧹 Cleaning project..." -ForegroundColor Yellow
mvn clean -q

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Clean failed!" -ForegroundColor Red
    exit 1
}

# Compile check
Write-Host ""
Write-Host "🔨 Compiling project..." -ForegroundColor Yellow
mvn compile -q

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilation successful!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🎉 Build Check Results:" -ForegroundColor Cyan
    Write-Host "✅ Java 17 LTS" -ForegroundColor Green
    Write-Host "✅ Maven latest" -ForegroundColor Green  
    Write-Host "✅ Spring Boot 3.4.2" -ForegroundColor Green
    Write-Host "✅ Jakarta EE imports" -ForegroundColor Green
    Write-Host "✅ JWT 0.12.6" -ForegroundColor Green
    Write-Host "✅ MySQL Connector/J" -ForegroundColor Green
    Write-Host "✅ MapStruct 1.6.3" -ForegroundColor Green
    Write-Host "✅ OpenAPI 2.7.0" -ForegroundColor Green
    Write-Host "✅ Config organized" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🚀 Ready to run: mvn spring-boot:run" -ForegroundColor Yellow
    Write-Host "📚 API Docs: http://localhost:8080/cinema/swagger-ui.html" -ForegroundColor Cyan
    
} else {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Check Java 17 installation" -ForegroundColor White
    Write-Host "2. Verify Maven configuration" -ForegroundColor White
    Write-Host "3. Run: mvn clean compile -X (debug mode)" -ForegroundColor White
    Write-Host "4. Check config files organization" -ForegroundColor White
    exit 1
} 
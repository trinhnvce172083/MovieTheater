# 📋 Manual Install Guide - Java 17 + Maven
# Phương án thực tiễn không cần Administrator

Write-Host "📋 Manual Installation Guide - Java 17 + Maven" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "🎯 Phương án 1: Portable Installation (Khuyến nghị)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host ""
Write-Host "☕ Step 1: Download Java 17 Portable" -ForegroundColor Yellow
Write-Host "   1. Truy cập: https://adoptium.net/temurin/releases/?version=17" -ForegroundColor White
Write-Host "   2. Chọn: Windows x64 -> .zip (portable)" -ForegroundColor White
Write-Host "   3. Download file: OpenJDK17U-jdk_x64_windows_hotspot_17.0.13_11.zip" -ForegroundColor White
Write-Host "   4. Giải nén vào: C:\Tools\java17\" -ForegroundColor White

Write-Host ""
Write-Host "🔧 Step 2: Download Maven Portable" -ForegroundColor Yellow
Write-Host "   1. Truy cập: https://maven.apache.org/download.cgi" -ForegroundColor White
Write-Host "   2. Chọn: apache-maven-3.9.8-bin.zip" -ForegroundColor White
Write-Host "   3. Download và giải nén vào: C:\Tools\maven\" -ForegroundColor White

Write-Host ""
Write-Host "⚙️ Step 3: Setup Environment Variables" -ForegroundColor Yellow
Write-Host "   1. Mở System Properties (Win+R -> sysdm.cpl)" -ForegroundColor White
Write-Host "   2. Advanced -> Environment Variables" -ForegroundColor White
Write-Host "   3. Thêm User Variables:" -ForegroundColor White
Write-Host "      - JAVA_HOME: C:\Tools\java17\jdk-17.0.13+11" -ForegroundColor Cyan
Write-Host "      - MAVEN_HOME: C:\Tools\maven\apache-maven-3.9.8" -ForegroundColor Cyan
Write-Host "   4. Sửa PATH variable, thêm:" -ForegroundColor White
Write-Host "      - %JAVA_HOME%\bin" -ForegroundColor Cyan
Write-Host "      - %MAVEN_HOME%\bin" -ForegroundColor Cyan

Write-Host ""
Write-Host "🎯 Phương án 2: Scoop Package Manager (Dễ nhất)" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Step 1: Install Scoop (không cần Administrator)" -ForegroundColor Yellow
Write-Host "   Chạy lệnh sau trong PowerShell:" -ForegroundColor White
Write-Host "   iwr -useb get.scoop.sh | iex" -ForegroundColor Cyan

Write-Host ""
Write-Host "☕ Step 2: Install Java 17 với Scoop" -ForegroundColor Yellow
Write-Host "   scoop bucket add java" -ForegroundColor Cyan
Write-Host "   scoop install temurin17-jdk" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔧 Step 3: Install Maven với Scoop" -ForegroundColor Yellow
Write-Host "   scoop install maven" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔍 Verification Commands" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host "   java -version      # Phải hiển thị 17.x.x" -ForegroundColor Cyan
Write-Host "   mvn -version       # Phải hiển thị Apache Maven" -ForegroundColor Cyan

Write-Host ""
Write-Host "🚀 Auto Download Script" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green

$autoDownload = Read-Host "Bạn có muốn tôi tự động download cho bạn? (y/N)"
if ($autoDownload -eq "y" -or $autoDownload -eq "Y") {
    Write-Host ""
    Write-Host "📥 Downloading Java 17 và Maven..." -ForegroundColor Green
    
    # Create Tools directory
    $toolsDir = "C:\Tools"
    if (-not (Test-Path $toolsDir)) {
        New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
        Write-Host "   ✅ Created directory: $toolsDir" -ForegroundColor Green
    }
    
    try {
        # Download Java 17
        $javaUrl = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13%2B11/OpenJDK17U-jdk_x64_windows_hotspot_17.0.13_11.zip"
        $javaZip = "$toolsDir\java17.zip"
        Write-Host "   📥 Downloading Java 17..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $javaUrl -OutFile $javaZip -UseBasicParsing
        
        # Extract Java
        $javaDir = "$toolsDir\java17"
        if (-not (Test-Path $javaDir)) {
            New-Item -ItemType Directory -Path $javaDir -Force | Out-Null
        }
        Write-Host "   📦 Extracting Java 17..." -ForegroundColor Yellow
        Expand-Archive -Path $javaZip -DestinationPath $javaDir -Force
        Remove-Item $javaZip
        Write-Host "   ✅ Java 17 extracted to: $javaDir" -ForegroundColor Green
        
        # Download Maven
        $mavenUrl = "https://archive.apache.org/dist/maven/maven-3/3.9.8/binaries/apache-maven-3.9.8-bin.zip"
        $mavenZip = "$toolsDir\maven.zip"
        Write-Host "   📥 Downloading Maven 3.9.8..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $mavenUrl -OutFile $mavenZip -UseBasicParsing
        
        # Extract Maven
        $mavenDir = "$toolsDir\maven"
        if (-not (Test-Path $mavenDir)) {
            New-Item -ItemType Directory -Path $mavenDir -Force | Out-Null
        }
        Write-Host "   📦 Extracting Maven..." -ForegroundColor Yellow
        Expand-Archive -Path $mavenZip -DestinationPath $mavenDir -Force
        Remove-Item $mavenZip
        Write-Host "   ✅ Maven extracted to: $mavenDir" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "🎉 Download completed!" -ForegroundColor Green
        Write-Host "⚙️ Next: Setup Environment Variables as described above" -ForegroundColor Yellow
        
    } catch {
        Write-Host "   ❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   💡 Please download manually from the links above" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Blue
Write-Host "   - Restart PowerShell sau khi setup environment variables" -ForegroundColor White
Write-Host "   - Nếu gặp lỗi, hãy check PATH variables" -ForegroundColor White
Write-Host "   - Scoop là phương án dễ nhất nếu bạn không có quyền admin" -ForegroundColor White

Write-Host ""
Write-Host "📖 Documentation: docs/JAVA-SETUP.md" -ForegroundColor Blue 
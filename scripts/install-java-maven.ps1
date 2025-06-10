# 🚀 Auto Install Java 17 + Maven Script
# Tuân thủ user rule: Phiên bản cao nhất và thực tiễn

param(
    [switch]$Force,
    [switch]$SkipChocolatey
)

Write-Host "🚀 Auto Install Java 17 LTS + Maven Latest" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if running as Administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Administrator)) {
    Write-Host "⚠️ Cần chạy với quyền Administrator để cài đặt!" -ForegroundColor Red
    Write-Host "   Nhấn chuột phải PowerShell → 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "   Sau đó chạy lại: .\scripts\install-java-maven.ps1" -ForegroundColor Yellow
    exit 1
}

# Step 1: Install Chocolatey (package manager)
function Install-Chocolatey {
    Write-Host ""
    Write-Host "📦 Step 1: Installing Chocolatey Package Manager..." -ForegroundColor Green
    
    try {
        $chocoCheck = Get-Command choco -ErrorAction SilentlyContinue
        if ($chocoCheck) {
            Write-Host "   ✅ Chocolatey đã được cài đặt" -ForegroundColor Green
            return
        }
        
        Write-Host "   📥 Downloading và installing Chocolatey..." -ForegroundColor Yellow
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
        # Refresh environment
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Write-Host "   ✅ Chocolatey installed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Error installing Chocolatey: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    return $true
}

# Step 2: Install Java 17 LTS
function Install-Java17 {
    Write-Host ""
    Write-Host "☕ Step 2: Installing Java 17 LTS (Latest)..." -ForegroundColor Green
    
    try {
        # Check current Java version
        $javaCheck = java -version 2>&1
        if ($javaCheck -match "17\." -and -not $Force) {
            Write-Host "   ✅ Java 17 đã được cài đặt" -ForegroundColor Green
            Write-Host "   📋 Current version: $($javaCheck[0])" -ForegroundColor White
            return $true
        }
        
        Write-Host "   📥 Installing OpenJDK 17 LTS (Eclipse Temurin)..." -ForegroundColor Yellow
        choco install temurin17 -y
        
        # Refresh environment
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Verify installation
        $javaVerify = java -version 2>&1
        if ($javaVerify -match "17\.") {
            Write-Host "   ✅ Java 17 installed successfully!" -ForegroundColor Green
            Write-Host "   📋 Version: $($javaVerify[0])" -ForegroundColor White
            return $true
        } else {
            throw "Java 17 installation verification failed"
        }
    }
    catch {
        Write-Host "   ❌ Error installing Java 17: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Step 3: Install Maven
function Install-Maven {
    Write-Host ""
    Write-Host "🔧 Step 3: Installing Maven (Latest)..." -ForegroundColor Green
    
    try {
        # Check current Maven version
        $mavenCheck = mvn -version 2>&1
        if ($mavenCheck -and $mavenCheck[0] -match "Apache Maven" -and -not $Force) {
            Write-Host "   ✅ Maven đã được cài đặt" -ForegroundColor Green
            Write-Host "   📋 Current version: $($mavenCheck[0])" -ForegroundColor White
            return $true
        }
        
        Write-Host "   📥 Installing Apache Maven (Latest)..." -ForegroundColor Yellow
        choco install maven -y
        
        # Refresh environment
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Verify installation  
        $mavenVerify = mvn -version 2>&1
        if ($mavenVerify -and $mavenVerify[0] -match "Apache Maven") {
            Write-Host "   ✅ Maven installed successfully!" -ForegroundColor Green
            Write-Host "   📋 Version: $($mavenVerify[0])" -ForegroundColor White
            return $true
        } else {
            throw "Maven installation verification failed"
        }
    }
    catch {
        Write-Host "   ❌ Error installing Maven: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Step 4: Verify Installation
function Verify-Installation {
    Write-Host ""
    Write-Host "🔍 Step 4: Verifying Installation..." -ForegroundColor Green
    
    Write-Host "   Checking Java..." -ForegroundColor Yellow
    $javaResult = java -version 2>&1
    if ($javaResult -match "17\.") {
        Write-Host "   ✅ Java 17: $($javaResult[0])" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Java 17 not found" -ForegroundColor Red
        return $false
    }
    
    Write-Host "   Checking Maven..." -ForegroundColor Yellow
    $mavenResult = mvn -version 2>&1
    if ($mavenResult -and $mavenResult[0] -match "Apache Maven") {
        Write-Host "   ✅ Maven: $($mavenResult[0])" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Maven not found" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# Main Installation Process
try {
    if (-not $SkipChocolatey) {
        if (-not (Install-Chocolatey)) {
            throw "Failed to install Chocolatey"
        }
    }
    
    if (-not (Install-Java17)) {
        throw "Failed to install Java 17"
    }
    
    if (-not (Install-Maven)) {
        throw "Failed to install Maven"
    }
    
    if (Verify-Installation) {
        Write-Host ""
        Write-Host "🎉 Installation Completed Successfully!" -ForegroundColor Green
        Write-Host "=========================================" -ForegroundColor Green
        Write-Host "✅ Java 17 LTS - Latest Eclipse Temurin" -ForegroundColor White
        Write-Host "✅ Maven - Latest Apache Maven" -ForegroundColor White
        Write-Host ""
        Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
        Write-Host "   1. Restart PowerShell/Terminal" -ForegroundColor White
        Write-Host "   2. cd movie-theater-backend" -ForegroundColor White
        Write-Host "   3. mvn clean compile" -ForegroundColor White
        Write-Host "   4. mvn spring-boot:run" -ForegroundColor White
        Write-Host ""
        Write-Host "📖 Hoặc sử dụng quick-start script:" -ForegroundColor Cyan
        Write-Host "   .\scripts\quick-start.ps1" -ForegroundColor White
    } else {
        throw "Installation verification failed"
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Installation Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Manual Installation Links:" -ForegroundColor Yellow
    Write-Host "   Java 17: https://adoptium.net/temurin/releases/?version=17" -ForegroundColor White
    Write-Host "   Maven: https://maven.apache.org/download.cgi" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "💡 Tip: Restart terminal sau khi cài đặt để environment variables được load!" -ForegroundColor Blue 
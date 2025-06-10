# Safe File Deletion Script
# Implements user rule: "Khi xóa 1 file hãy kiểm tra hậu quả và nếu có ảnh hưởng hãy có 1 phương án thay thế"

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

Write-Host "🛡️ Safe File Deletion Process" -ForegroundColor Cyan
Write-Host "📁 Target: $FilePath" -ForegroundColor Yellow

# Check if file exists
if (-not (Test-Path $FilePath)) {
    Write-Host "❌ File not found: $FilePath" -ForegroundColor Red
    exit 1
}

# Extract file info
$FileInfo = Get-Item $FilePath
$ClassName = $FileInfo.BaseName
$FileExtension = $FileInfo.Extension
$RelativePath = Resolve-Path $FilePath -Relative

Write-Host "🔍 Analyzing file: $ClassName$FileExtension" -ForegroundColor White

# Step 1: Impact Analysis
Write-Host ""
Write-Host "📊 Step 1: Impact Analysis" -ForegroundColor Green

# Check for class references using Get-ChildItem for recursion
Write-Host "🔍 Checking class name references..." -ForegroundColor Yellow
$javaFiles = Get-ChildItem -Path "." -Filter "*.java" -Recurse 2>$null
$classRefs = $javaFiles | ForEach-Object { Select-String -Path $_.FullName -Pattern $ClassName 2>$null }

# Check for import statements  
Write-Host "🔍 Checking import statements..." -ForegroundColor Yellow
$importRefs = $javaFiles | ForEach-Object { Select-String -Path $_.FullName -Pattern "import.*$ClassName" 2>$null }

# Check for dependency injection
Write-Host "🔍 Checking dependency injection..." -ForegroundColor Yellow
$diRefs = $javaFiles | ForEach-Object { Select-String -Path $_.FullName -Pattern "@Autowired.*$ClassName|private.*$ClassName" 2>$null }

# Count total references
$totalRefs = 0
if ($classRefs) { $totalRefs += $classRefs.Count }
if ($importRefs) { $totalRefs += $importRefs.Count } 
if ($diRefs) { $totalRefs += $diRefs.Count }

Write-Host ""
Write-Host "📋 Analysis Results:" -ForegroundColor Cyan
Write-Host "   Class references: $(if($classRefs) {$classRefs.Count} else {0})" -ForegroundColor White
Write-Host "   Import references: $(if($importRefs) {$importRefs.Count} else {0})" -ForegroundColor White
Write-Host "   DI references: $(if($diRefs) {$diRefs.Count} else {0})" -ForegroundColor White
Write-Host "   Total references: $totalRefs" -ForegroundColor White

# Step 2: Risk Assessment
Write-Host ""
Write-Host "📊 Step 2: Risk Assessment" -ForegroundColor Green

$riskLevel = "Unknown"
$riskColor = "White"
$actionRequired = "Analysis needed"

if ($totalRefs -eq 0) {
    $riskLevel = "🟢 LOW"
    $riskColor = "Green"
    $actionRequired = "Safe deletion"
} elseif ($totalRefs -le 3) {
    $riskLevel = "🟡 MEDIUM"  
    $riskColor = "Yellow"
    $actionRequired = "Plan replacement"
} elseif ($totalRefs -le 10) {
    $riskLevel = "🟠 HIGH"
    $riskColor = "DarkYellow"
    $actionRequired = "Careful migration"
} else {
    $riskLevel = "🔴 CRITICAL"
    $riskColor = "Red"
    $actionRequired = "Avoid deletion"
}

Write-Host "Risk Level: $riskLevel" -ForegroundColor $riskColor
Write-Host "Action Required: $actionRequired" -ForegroundColor $riskColor

# Step 3: Show references if found
if ($totalRefs -gt 0) {
    Write-Host ""
    Write-Host "⚠️ Found References:" -ForegroundColor Red
    
    if ($classRefs) {
        Write-Host "📁 Class References:" -ForegroundColor Yellow
        $classRefs | ForEach-Object { 
            Write-Host "   $($_.Filename):$($_.LineNumber) - $($_.Line.Trim())" -ForegroundColor White
        }
    }
    
    if ($importRefs) {
        Write-Host "📥 Import References:" -ForegroundColor Yellow
        $importRefs | ForEach-Object {
            Write-Host "   $($_.Filename):$($_.LineNumber) - $($_.Line.Trim())" -ForegroundColor White
        }
    }
    
    if ($diRefs) {
        Write-Host "🔗 Dependency Injection:" -ForegroundColor Yellow
        $diRefs | ForEach-Object {
            Write-Host "   $($_.Filename):$($_.LineNumber) - $($_.Line.Trim())" -ForegroundColor White
        }
    }
}

# Step 4: Recommendations
Write-Host ""
Write-Host "💡 Recommendations:" -ForegroundColor Green

if ($totalRefs -eq 0) {
    Write-Host "✅ Safe to delete - No dependencies found" -ForegroundColor Green
    Write-Host "   Consider: Check if file is truly unused or has hidden purpose" -ForegroundColor White
} elseif ($totalRefs -le 3) {
    Write-Host "⚠️ Plan replacement strategy:" -ForegroundColor Yellow
    Write-Host "   Option A: Move & Reorganize (Recommended)" -ForegroundColor White
    Write-Host "   Option B: Consolidate with similar files" -ForegroundColor White
    Write-Host "   Option C: Replace with equivalent implementation" -ForegroundColor White
} else {
    Write-Host "🚨 High risk deletion - Consider alternatives:" -ForegroundColor Red
    Write-Host "   1. Refactor instead of delete" -ForegroundColor White
    Write-Host "   2. Gradual migration approach" -ForegroundColor White
    Write-Host "   3. Split into smaller, manageable pieces" -ForegroundColor White
}

# Step 5: Backup and deletion (if requested)
if ($DryRun) {
    Write-Host ""
    Write-Host "🔍 DRY RUN - No files will be deleted" -ForegroundColor Cyan
    Write-Host "Analysis complete. Use -Force to proceed with deletion." -ForegroundColor White
    exit 0
}

if ($Force) {
    if ($totalRefs -gt 0 -and $riskLevel -eq "🔴 CRITICAL") {
        Write-Host ""
        Write-Host "🚨 Cannot proceed - Too many dependencies (CRITICAL risk)" -ForegroundColor Red
        Write-Host "Please plan replacement strategy first." -ForegroundColor White
        exit 1
    }
    
    Write-Host ""
    Write-Host "⚠️ Force deletion requested..." -ForegroundColor Yellow
    
    # Create backup
    $backupDir = "backup/$(Get-Date -Format 'yyyy-MM-dd-HH-mm-ss')"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    $backupFile = "$backupDir/$($FileInfo.Name)"
    Copy-Item $FilePath $backupFile
    Write-Host "📦 Backup created: $backupFile" -ForegroundColor Green
    
    # Delete file
    Remove-Item $FilePath
    Write-Host "🗑️ File deleted: $FilePath" -ForegroundColor Red
    
    # Suggest next steps
    Write-Host ""
    Write-Host "🔄 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Test compilation: mvn clean compile" -ForegroundColor White
    Write-Host "2. Run tests: mvn test" -ForegroundColor White
    Write-Host "3. Check runtime: mvn spring-boot:run" -ForegroundColor White
    Write-Host "4. Recovery if needed: Copy-Item $backupFile $FilePath" -ForegroundColor White
    
} else {
    Write-Host ""
    Write-Host "ℹ️ Analysis complete. No changes made." -ForegroundColor Cyan
    Write-Host "Use -Force to proceed with deletion (if safe)" -ForegroundColor White
    Write-Host "Use -DryRun to run analysis only" -ForegroundColor White
}

Write-Host ""
Write-Host "📖 Full process documentation: docs/SAFE-DELETION-PROCESS.md" -ForegroundColor Blue 
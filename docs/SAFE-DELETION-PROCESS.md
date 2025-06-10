# 🛡️ Safe File Deletion Process

**User Rule**: *Khi xóa 1 file hãy kiểm tra hậu quả và nếu có ảnh hưởng hãy có 1 phương án thay thế để đảm bảo sự thay đổi không ảnh hưởng tới tổng thể dự án.*

## 📋 Checklist trước khi xóa file

### 1. 🔍 **Impact Analysis**
```bash
# Kiểm tra tất cả references đến file cần xóa
grep -r "FileName" .
grep -r "import.*FileName" .
grep -r "ClassName" .

# Kiểm tra dependency injection
grep -r "@Autowired.*ClassName" .
grep -r "private.*ClassName" .
```

### 2. 📊 **Dependency Check**
- [ ] **Direct imports** - Có class nào import file này không?
- [ ] **Bean references** - Có @Autowired, @Inject dependency không?
- [ ] **Configuration references** - File này có define @Bean nào không?
- [ ] **Annotation scanning** - File này có @Component, @Service, @Controller không?
- [ ] **Resource references** - Có file config/properties reference không?

### 3. 🔄 **Replacement Strategy**

#### Option A: **Move & Reorganize**
```
✅ SAFE - Preserve functionality
- Move file to better organized location
- Update imports if needed
- Maintain all functionality
```

#### Option B: **Consolidate**  
```
✅ SAFE - Merge functionality
- Merge multiple files into one
- Preserve all beans/methods
- Remove duplication
```

#### Option C: **Replace with Equivalent**
```
⚠️ CAREFUL - Functionality change
- Replace with equivalent implementation
- Ensure API compatibility
- Test thoroughly
```

#### Option D: **Complete Removal**
```
🚨 HIGH RISK - Only if truly unused
- Must verify zero dependencies
- Must have migration plan
- Must test all modules
```

### 4. ✅ **Verification Steps**

#### Before Deletion:
```bash
# Backup original file
cp target-file.java backup/target-file.java.bak

# Document current structure
tree src/ > before-deletion.txt

# Run full build test
mvn clean compile test
```

#### After Changes:
```bash
# Verify new structure
tree src/ > after-deletion.txt
diff before-deletion.txt after-deletion.txt

# Test compilation
mvn clean compile

# Test functionality
mvn test

# Check for runtime errors
mvn spring-boot:run
```

### 5. 📝 **Documentation Update**

- [ ] Update README.md structure diagrams
- [ ] Update configuration documentation  
- [ ] Create migration guide for team
- [ ] Update any setup scripts
- [ ] Document the changes in CHANGELOG

## 🎯 Safe Deletion Examples

### ✅ **Example 1: Config File Reorganization**

**Scenario**: Xóa `SecurityConfig.java` để reorganize

**Impact Analysis**:
```bash
grep -r "SecurityConfig" .
# Found: No direct imports, only documentation references
```

**Replacement Strategy**:
```bash
# SAFE: Move + Rename
SecurityConfig.java → security/SecurityConfiguration.java
- Preserve all @Bean methods
- Preserve all functionality  
- Update package declaration
- Update documentation
```

**Verification**:
```bash
mvn clean compile ✅
mvn test ✅  
All dependencies resolved ✅
```

### ❌ **Example 2: What NOT to do**

```bash
# DANGEROUS - Direct deletion without analysis
rm ImportantService.java  # 🚨 DON'T DO THIS

# Better approach:
grep -r "ImportantService" .  # Check dependencies first
# If found dependencies → Plan replacement
# If no dependencies → Verify why it exists
```

## 🛠️ Automation Script

Create `scripts/safe-delete.ps1`:

```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

Write-Host "🔍 Analyzing impact of deleting: $FilePath" -ForegroundColor Yellow

# Extract class name
$ClassName = (Get-Item $FilePath).BaseName

# Check references
$refs = grep -r $ClassName . 2>$null
if ($refs) {
    Write-Host "⚠️ Found references:" -ForegroundColor Red
    $refs
    Write-Host "❌ Cannot safely delete. Plan replacement first." -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ No references found. Safe to delete." -ForegroundColor Green
}
```

## 📊 Risk Assessment Matrix

| Impact Level | Dependencies | Action Required |
|-------------|-------------|----------------|
| 🟢 **Low** | 0 references | Safe deletion |
| 🟡 **Medium** | 1-3 references | Plan replacement |
| 🟠 **High** | 4+ references | Careful migration |
| 🔴 **Critical** | Core component | Avoid deletion |

## 🎯 Best Practices

### ✅ **DO**
- Always analyze impact first
- Create replacement before deletion
- Test thoroughly after changes
- Document all changes
- Keep backups during transition

### ❌ **DON'T**  
- Delete files without checking dependencies
- Remove core functionality without replacement
- Skip testing after deletion
- Forget to update documentation
- Delete multiple files simultaneously

## 🔄 Recovery Plan

If deletion causes issues:

1. **Immediate Recovery**:
   ```bash
   git checkout HEAD -- deleted-file.java
   mvn clean compile
   ```

2. **Alternative Recovery**:
   ```bash
   cp backup/deleted-file.java src/path/
   mvn clean compile
   ```

3. **Documentation Recovery**:
   - Restore from backup documentation
   - Update team about rollback
   - Plan better replacement strategy

---

**💡 Remember: It's better to be safe and reorganize than to delete and break!**

**🎯 Goal: Zero-downtime refactoring with improved organization** 
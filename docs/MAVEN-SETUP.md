# Hướng dẫn cài đặt Maven (Latest Version)

## Tại sao cần Maven?

Dự án backend sử dụng **Maven** với **phiên bản cao nhất**:
- **Apache Maven 3.9.x** - Build tool mới nhất
- **Spring Boot 3.4.2** - Requires Maven 3.6.3+
- **Java 17** - Modern build với performance optimization

## Cài đặt Maven trên Windows

### Cách 1: Sử dụng Winget (Khuyến nghị)

```powershell
# Install Maven phiên bản mới nhất
winget install Apache.Maven

# Kiểm tra version
mvn -version
```

### Cách 2: Manual Download

1. **Download Maven:**
   - Truy cập: [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)
   - Download: `apache-maven-3.9.x-bin.zip`

2. **Extract và Setup:**
   ```powershell
   # Extract to C:\Program Files\Apache\maven
   # Hoặc thư mục bất kỳ
   ```

3. **Set Environment Variables:**
   ```powershell
   # Thêm vào System Environment Variables
   setx MAVEN_HOME "C:\Program Files\Apache\maven"
   setx PATH "%MAVEN_HOME%\bin;%PATH%"
   ```

4. **Restart Terminal:**
   ```powershell
   # Đóng và mở lại PowerShell/CMD
   mvn -version
   ```

### Cách 3: Sử dụng Chocolatey

```powershell
# Install Chocolatey nếu chưa có
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Maven
choco install maven

# Kiểm tra
mvn -version
```

## Kiểm tra cài đặt

```powershell
mvn -version
```

**Kết quả mong đợi:**
```
Apache Maven 3.9.x (xxxxxxxx)
Maven home: C:\Program Files\Apache\maven
Java version: 17.0.x, vendor: Eclipse Adoptium
Default locale: en_US, platform encoding: UTF-8
OS name: "windows 10", version: "10.0", arch: "amd64"
```

## Build Project

Sau khi cài Maven:

```powershell
cd movie-theater-backend

# Clean và compile
mvn clean compile

# Run tests
mvn test

# Package (tạo JAR file)
mvn package

# Run application
mvn spring-boot:run
```

## Maven Commands hữu ích

```powershell
# Xem dependencies
mvn dependency:tree

# Clean target folder
mvn clean

# Compile code
mvn compile

# Run tests
mvn test

# Package without tests
mvn package -DskipTests

# Install to local repository
mvn install

# Show effective POM
mvn help:effective-pom

# Resolve dependencies
mvn dependency:resolve
```

## Troubleshooting

### Lỗi "mvn not found"
```powershell
# Kiểm tra PATH
echo $env:PATH

# Thêm Maven vào PATH
setx PATH "%MAVEN_HOME%\bin;%PATH%"

# Restart terminal
```

### Lỗi JAVA_HOME
```powershell
# Set JAVA_HOME nếu chưa có
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot"
```

### Lỗi "Could not find or load main class"
```powershell
# Clean và compile lại
mvn clean compile
mvn spring-boot:run
```

### Lỗi Dependencies không download được
```powershell
# Clear local repository
rmdir /s "%USERPROFILE%\.m2\repository"

# Download lại
mvn clean install
```

## Lợi ích của Maven 3.9.x (Latest)

✅ **Performance**: Build nhanh hơn 20-30%  
✅ **Security**: Vulnerabilities được fix trong version mới  
✅ **Java 17 Support**: Tối ưu cho Java 17+ features  
✅ **Parallel Builds**: Support multi-threading tốt hơn  
✅ **Plugin Updates**: Compatible với plugins mới nhất  

## Integration với IDE

### IntelliJ IDEA
```
File → Settings → Build → Build Tools → Maven
Maven home path: C:\Program Files\Apache\maven
```

### VS Code
```json
// settings.json
{
    "java.configuration.maven.userSettings": "C:\\Program Files\\Apache\\maven\\conf\\settings.xml"
}
```

**Lưu ý:** Dự án được optimize cho **phiên bản Maven cao nhất** để đảm bảo performance và compatibility tốt nhất! 
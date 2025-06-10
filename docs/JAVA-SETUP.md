# Hướng dẫn cài đặt Java 17 (Eclipse Temurin)

## Tại sao cần Java 17?

Dự án này sử dụng **phiên bản cao nhất** của các thư viện để đảm bảo không bị lạc hậu:
- **Spring Boot 3.4.2** (phiên bản mới nhất)
- **Java 17** (LTS version được khuyến nghị)
- **Jakarta EE** (thay thế javax)
- **JWT 0.12.6** (version mới nhất)

## Cài đặt Java 17

### 1. Download Eclipse Temurin 17

Truy cập: [https://adoptium.net/temurin/releases/](https://adoptium.net/temurin/releases/)

**Chọn:**
- Version: `17 - LTS`
- Operating System: `Windows`
- Architecture: `x64`
- Package Type: `JDK`

### 2. Cài đặt

1. Chạy file `.msi` đã download
2. Chọn **"Add to PATH"** (quan trọng!)
3. Chọn **"Set JAVA_HOME variable"**
4. Next → Install

### 3. Kiểm tra cài đặt

```powershell
java -version
javac -version
echo $env:JAVA_HOME
```

**Kết quả mong đợi:**
```
openjdk version "17.0.x" 2024-xx-xx
OpenJDK Runtime Environment Temurin-17.0.x
OpenJDK 64-Bit Server VM Temurin-17.0.x
```

### 4. Nếu có nhiều Java version

**Kiểm tra các Java đã cài:**
```powershell
where java
```

**Set Java 17 làm default:**
```powershell
# Thêm vào System Environment Variables
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot"
setx PATH "%JAVA_HOME%\bin;%PATH%"
```

### 5. Restart Terminal

Đóng và mở lại PowerShell/CMD để áp dụng thay đổi.

## Build Project

Sau khi cài Java 17:

```powershell
cd movie-theater-backend
mvn clean install
mvn spring-boot:run
```

## Lợi ích của phiên bản cao

✅ **Spring Boot 3.4.2**: Features mới nhất, security patches  
✅ **Java 17**: Performance cải thiện, syntax mới  
✅ **Jakarta EE**: Standard mới của enterprise Java  
✅ **JWT 0.12.6**: Security improvements, API cleaner  
✅ **MapStruct 1.6.3**: Better performance, fewer bugs  

## Troubleshooting

### Lỗi "JAVA_HOME not set"
```powershell
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot"
```

### Lỗi "Maven not found"
```powershell
# Install Maven
winget install Apache.Maven
```

### Lỗi compile
```powershell
mvn clean
mvn compile
```

**Lưu ý:** Dự án này được optimize cho **phiên bản cao nhất** để đảm bảo tính hiện đại và bảo mật tốt nhất! 
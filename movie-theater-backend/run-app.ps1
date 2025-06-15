# Spring Boot Application Runner (No Maven Required)
Write-Host "🚀 Starting Movie Theater Backend Service..." -ForegroundColor Yellow

# Check if Java is available
try {
    $javaVersion = java -version 2>&1
    Write-Host "✅ Java found: $($javaVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found. Please install Java first." -ForegroundColor Red
    exit 1
}

# Set classpath to include compiled classes and dependencies
$CLASSPATH = "target/classes"

# Add all JAR dependencies from Maven local repository
$M2_REPO = "$env:USERPROFILE\.m2\repository"
if (Test-Path $M2_REPO) {
    Write-Host "📚 Adding Maven dependencies to classpath..." -ForegroundColor Cyan
    
    # Common Spring Boot dependencies
    $commonDeps = @(
        "org/springframework/boot/spring-boot/*/**.jar",
        "org/springframework/boot/spring-boot-autoconfigure/*/**.jar", 
        "org/springframework/boot/spring-boot-starter/*/**.jar",
        "org/springframework/boot/spring-boot-starter-web/*/**.jar",
        "org/springframework/boot/spring-boot-starter-data-jpa/*/**.jar",
        "org/springframework/boot/spring-boot-starter-security/*/**.jar",
        "org/springframework/spring-web/*/**.jar",
        "org/springframework/spring-webmvc/*/**.jar",
        "org/springframework/spring-core/*/**.jar",
        "org/springframework/spring-context/*/**.jar",
        "org/springframework/spring-beans/*/**.jar",
        "org/springframework/spring-data-jpa/*/**.jar",
        "org/springframework/data/spring-data-commons/*/**.jar",
        "org/hibernate/hibernate-core/*/**.jar",
        "mysql/mysql-connector-java/*/**.jar",
        "com/mysql/mysql-connector-j/*/**.jar",
        "jakarta/persistence/jakarta.persistence-api/*/**.jar",
        "org/slf4j/slf4j-api/*/**.jar",
        "ch/qos/logback/logback-classic/*/**.jar",
        "ch/qos/logback/logback-core/*/**.jar",
        "com/fasterxml/jackson/core/jackson-core/*/**.jar",
        "com/fasterxml/jackson/core/jackson-databind/*/**.jar",
        "com/fasterxml/jackson/core/jackson-annotations/*/**.jar"
    )
    
    foreach ($dep in $commonDeps) {
        $jars = Get-ChildItem -Path "$M2_REPO/$dep" -ErrorAction SilentlyContinue
        foreach ($jar in $jars) {
            $CLASSPATH += ";$($jar.FullName)"
        }
    }
}

Write-Host "⚙️ Classpath configured" -ForegroundColor Green

# Set Spring profiles and properties
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:SERVER_PORT = "8080"

# Run the application
Write-Host "🏃 Running Spring Boot Application..." -ForegroundColor Yellow
Write-Host "Main Class: com.swp.MovieTheaterService.MovieTheaterServiceApplication" -ForegroundColor Cyan
Write-Host "Server will start on: http://localhost:8080/cinema" -ForegroundColor Cyan

try {
    java -cp $CLASSPATH -Dspring.profiles.active=dev -Dserver.port=8080 -Dspring.datasource.url="jdbc:mysql://localhost:3306/cinema_db" -Dspring.datasource.username="cinema_user" -Dspring.datasource.password="cinema_password" -Dspring.jpa.hibernate.ddl-auto=update com.swp.MovieTheaterService.MovieTheaterServiceApplication
} catch {
    Write-Host "❌ Failed to start application: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure MySQL database is running and accessible" -ForegroundColor Yellow
    exit 1
}

Write-Host "🏁 Application stopped" -ForegroundColor Yellow 
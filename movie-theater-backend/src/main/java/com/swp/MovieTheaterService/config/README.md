# 🔧 Configuration Structure

This directory contains all **Spring Boot 3.x configuration classes** organized for maintainability and clarity.

## 📁 Directory Structure

```
config/
├── 📁 documentation/           # API Documentation configs
│   └── OpenApiConfiguration.java    # Swagger/OpenAPI 2.7.0 setup
├── 📁 properties/             # Configuration Properties
│   ├── ApplicationProperties.java   # App-specific properties  
│   └── EmailProperties.java        # Email configuration
├── 📁 security/               # Security configurations
│   ├── SecurityConfiguration.java  # Spring Security setup
│   └── JwtAuthenticationFilter.java # JWT authentication
└── WebConfig.java             # Spring MVC configuration
```

## 🚀 Key Features

### ✅ Spring Boot 3.x Compatibility
- **Jakarta EE** imports (not javax)
- **@EnableMethodSecurity** (not @EnableGlobalMethodSecurity)
- **Latest OpenAPI 2.7.0** support
- **No @EnableWebMvc** to avoid auto-config conflicts

### ✅ Organized Structure  
- **documentation/**: API docs & Swagger configs
- **security/**: All security-related configurations
- **properties/**: Type-safe configuration properties
- **WebConfig**: Spring MVC & CORS setup

### ✅ Latest Versions (No Legacy!)
- **Spring Boot 3.4.2** - Latest stable
- **Java 17** - LTS with performance improvements
- **JWT 0.12.6** - Latest security fixes
- **OpenAPI 2.7.0** - Latest documentation

## 🔐 Security Configuration

### `SecurityConfiguration.java`
- **JWT authentication** with Bearer tokens
- **CORS configuration** for frontend integration  
- **Public endpoints** whitelist for guest access
- **BCrypt password encoding** (strength 12)

### `JwtAuthenticationFilter.java`
- **OncePerRequestFilter** for JWT validation
- **AntPathMatcher** for flexible URL patterns
- **Public path detection** for whitelisted URLs

## 📚 Documentation Configuration

### `OpenApiConfiguration.java`
- **Consolidated** Swagger + OpenAPI setup
- **Multiple API groups**: public, admin, booking, all
- **JWT security scheme** configuration
- **Development + Production** server configs

## ⚙️ Properties Configuration

### `ApplicationProperties.java`
- **Type-safe** configuration binding
- **File upload** settings
- **Booking business rules**
- **Pagination** defaults

### `EmailProperties.java`
- **Email service** configuration
- **Template** settings
- **Verification** parameters

## 🌐 Web Configuration

### `WebConfig.java`
- **Spring MVC** without @EnableWebMvc
- **CORS** configuration for cross-origin requests
- **Resource handlers** for static content
- **View controllers** for Swagger redirects

## 🔄 Migration from Legacy

**Old structure (deprecated):**
```
config/
├── SecurityConfig.java         # REMOVED
├── OpenApiConfig.java          # REMOVED  
├── SwaggerConfig.java          # REMOVED
├── PasswordConfig.java         # REMOVED
├── JwtAuthenticationFilter.java # MOVED
└── EmailProperties.java        # MOVED
```

**New structure (current):**
```
config/
├── documentation/OpenApiConfiguration.java  # Consolidated
├── security/SecurityConfiguration.java      # Enhanced
├── security/JwtAuthenticationFilter.java    # Moved
├── properties/ApplicationProperties.java    # New
├── properties/EmailProperties.java          # Moved
└── WebConfig.java                           # Fixed
```

## 🛠️ Key Improvements

✅ **No duplicate configs** - Consolidated SwaggerConfig + OpenApiConfig  
✅ **Organized by function** - security/, documentation/, properties/  
✅ **Spring Boot 3.x compliant** - No deprecated annotations  
✅ **Latest dependencies** - All phiên bản cao nhất  
✅ **Type-safe properties** - @ConfigurationProperties  
✅ **Better maintainability** - Clear separation of concerns  

## 🎯 Usage Examples

### JWT Authentication
```java
@Autowired
private JwtService jwtService;

String token = jwtService.generateAccessToken(account);
```

### Configuration Properties
```java
@Autowired
private ApplicationProperties appProps;

int maxSeats = appProps.getBooking().getMaxSeatsPerBooking();
```

### API Documentation
Access Swagger UI at: `http://localhost:8080/cinema/swagger-ui.html`

---

**🔧 Cấu trúc này tuân thủ user rule về tổ chức file hợp lý và sử dụng phiên bản cao nhất!** 
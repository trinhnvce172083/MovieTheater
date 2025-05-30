# 🚀 Movie Theater CI/CD Integration Guide

## 📋 **Tổng quan**

Dự án Movie Theater Management System đã được tích hợp đầy đủ CI/CD pipeline với authentication testing tự động. Bạn có thể sử dụng GitLab CI/CD hoặc GitHub Actions để triển khai tự động.

## 🎯 **Tính năng CI/CD**

### ✅ **Authentication Testing tự động**
- 🔐 **11 test cases** bao gồm registration, login, JWT validation, role-based access
- 🤖 **Tự động chạy** trong mỗi pipeline
- 📊 **Detailed reporting** với logs và artifacts
- 🚨 **Fail-fast** nếu authentication có vấn đề

### ✅ **Multi-stage Pipeline**
- 🔍 **Validate** - Project structure validation
- 🏗️ **Build** - Compile và cache dependencies
- 🧪 **Test** - Unit tests, integration tests, auth tests
- 📦 **Package** - JAR build và Docker image
- 🚀 **Deploy** - Staging và production deployment

### ✅ **Platform Support**
- 🦊 **GitLab CI/CD** - `.gitlab-ci.yml`
- 🐙 **GitHub Actions** - `.github/workflows/ci.yml`
- 🐳 **Docker** integration
- 🗄️ **MySQL** service containers

## 🛠️ **Files và Scripts**

### **CI/CD Configuration Files:**
```
.gitlab-ci.yml              # GitLab CI/CD pipeline
.github/workflows/ci.yml     # GitHub Actions workflow
```

### **Testing Scripts:**
```
test-auth.sh                 # Manual authentication testing
test-auth-ci.sh             # CI/CD authentication testing (enhanced)
demo-cicd.sh                # Local CI/CD pipeline simulation
build-and-run.sh            # Quick build and run
```

### **Documentation:**
```
CI_CD_SETUP.md              # Detailed setup guide
AUTH_README.md              # Authentication system docs
README_CICD.md              # This file
```

## 🚀 **Quick Start**

### **1. Test Authentication Locally**
```bash
# Basic authentication test
./test-auth.sh

# CI/CD enhanced test
./test-auth-ci.sh

# Full CI/CD simulation
./demo-cicd.sh
```

### **2. Setup GitLab CI/CD**
```bash
# 1. Create GitLab repository
git remote add origin <gitlab-repo-url>

# 2. Configure variables in GitLab Settings > CI/CD > Variables:
CI_REGISTRY_USER=your-docker-username
CI_REGISTRY_PASSWORD=your-docker-password
MYSQL_ROOT_PASSWORD=test123

# 3. Push to trigger pipeline
git push origin main
```

### **3. Setup GitHub Actions**
```bash
# 1. Create GitHub repository
git remote add origin <github-repo-url>

# 2. Configure secrets in GitHub Settings > Secrets:
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password

# 3. Push to trigger workflow
git push origin main
```

## 📊 **Pipeline Stages Detail**

### **Stage 1: Validate** 🔍
```yaml
# Validates project structure
mvn validate
mvn dependency:resolve
```

### **Stage 2: Build** 🏗️
```yaml
# Compiles source code
mvn clean compile
# Caches dependencies for faster builds
```

### **Stage 3: Test** 🧪

#### **Unit Tests**
```yaml
mvn test
# Generates JUnit reports
# Coverage analysis
```

#### **Integration Tests**
```yaml
# Starts MySQL service
# Runs database integration tests
mvn verify -Dspring.profiles.active=test
```

#### **Authentication Tests** 🔐
```yaml
# Starts Spring Boot application
# Runs comprehensive auth test suite:
✅ Health Check
✅ Public Endpoint Access
✅ User Registration
✅ User Login
✅ Protected Endpoint Access
✅ Role-based Access Control
✅ Invalid Token Rejection
✅ User Logout
✅ Duplicate Registration Prevention
✅ Invalid Login Rejection
✅ Security Validation
```

### **Stage 4: Package** 📦
```yaml
# Builds JAR file
mvn package -DskipTests

# Builds Docker image
docker build -t movie-theater:latest .
docker push registry/movie-theater:latest
```

### **Stage 5: Deploy** 🚀
```yaml
# Staging (auto from develop branch)
deploy-staging:
  environment: staging
  url: http://staging.movietheater.com

# Production (manual from main branch)
deploy-production:
  environment: production
  url: http://movietheater.com
  when: manual
```

## 🔐 **Authentication Test Cases**

### **Positive Test Cases:**
1. **Health Check** - Application startup verification
2. **Public Endpoint** - No authentication required
3. **User Registration** - New account creation
4. **User Login** - Authentication flow
5. **Protected Endpoint** - JWT token validation
6. **Customer Access** - Role-based permissions
7. **User Logout** - Session termination

### **Negative Test Cases:**
1. **Admin Access Denial** - Customer cannot access admin endpoints
2. **Invalid Token Rejection** - Security validation
3. **Duplicate Registration** - Conflict handling
4. **Invalid Login** - Wrong credentials handling

### **Test Results:**
```bash
=== Test Summary ===
Total Tests: 11
Passed: 11
Failed: 0
🎉 All tests passed!
```

## 📈 **Monitoring và Reporting**

### **Artifacts Generated:**
- `auth-test-results.log` - Authentication test detailed logs
- `target/surefire-reports/` - Unit test reports
- `target/failsafe-reports/` - Integration test reports
- JUnit XML reports for CI/CD integration

### **Pipeline Status:**
- ✅ **Success** - All tests pass, ready for deployment
- ❌ **Failed** - Tests failed, deployment blocked
- ⚠️ **Warning** - Some non-critical tests failed
- 🔄 **Running** - Pipeline in progress

## 🛡️ **Security Features**

### **Automated Security Checks:**
- 🔒 **JWT Token Validation** - Proper token format and expiration
- 🚫 **Access Control** - Role-based endpoint protection
- 🔐 **Password Security** - BCrypt encryption validation
- 🛡️ **Input Validation** - Request payload validation
- 🚨 **Error Handling** - Secure error responses

### **OWASP Integration:**
```yaml
# Security vulnerability scanning
mvn org.owasp:dependency-check-maven:check
```

## 🔧 **Customization**

### **Add New Test Cases:**
```bash
# In test-auth-ci.sh
run_test "Custom Test Name" \
    "curl -s '$BASE_URL/custom/endpoint' | jq -e '.success == true'" \
    "true"
```

### **Environment Variables:**
```yaml
# GitLab CI
variables:
  CUSTOM_VAR: "value"

# GitHub Actions
env:
  CUSTOM_VAR: "value"
```

### **Add New Deployment Environment:**
```yaml
deploy-qa:
  stage: deploy
  environment:
    name: qa
    url: http://qa.movietheater.com
  only:
    - feature/*
```

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **Authentication Tests Failed**
```bash
# Check application logs
tail -f app.log

# Verify database connection
docker-compose logs mysql

# Test endpoints manually
curl http://localhost:8080/cinema/actuator/health
```

#### **Pipeline Timeout**
```yaml
# Increase timeout in CI config
timeout: 30m
```

#### **Docker Build Failed**
```bash
# Check Docker daemon
docker info

# Verify Dockerfile syntax
docker build -t test .
```

### **Debug Commands:**
```bash
# Local testing
./demo-cicd.sh

# Check specific test
./test-auth-ci.sh

# Validate CI syntax
# GitLab: gitlab-ci-lint .gitlab-ci.yml
# GitHub: Use GitHub Actions tab
```

## 📞 **Support và Next Steps**

### **Immediate Actions:**
1. ✅ Test locally với `./demo-cicd.sh`
2. ✅ Setup GitLab/GitHub repository
3. ✅ Configure environment variables
4. ✅ Push code để trigger pipeline

### **Advanced Features:**
1. 🔄 **Blue-Green Deployment** - Zero-downtime deployments
2. 📊 **Performance Testing** - JMeter integration
3. 🔍 **E2E Testing** - Selenium/Cypress tests
4. 📈 **Monitoring** - Prometheus + Grafana
5. 🚨 **Alerting** - Slack/Discord notifications

### **Documentation:**
- 📖 `CI_CD_SETUP.md` - Detailed setup instructions
- 🔐 `AUTH_README.md` - Authentication system guide
- 🐳 `docker/README.md` - Docker setup guide

---

## 🎉 **Kết luận**

Movie Theater Management System đã sẵn sàng cho production với:
- ✅ **Complete CI/CD pipeline**
- ✅ **Automated authentication testing**
- ✅ **Multi-environment deployment**
- ✅ **Security validation**
- ✅ **Comprehensive monitoring**

**Happy Coding! 🚀** 
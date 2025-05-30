# Movie Theater CI/CD Setup Guide

## 🎯 **Tổng quan**

Hướng dẫn này sẽ giúp bạn thiết lập CI/CD pipeline cho Movie Theater Management System với authentication testing tự động.

## 🛠️ **Các Platform CI/CD được hỗ trợ**

### 1. **GitLab CI/CD** (Recommended)
- File: `.gitlab-ci.yml`
- Tích hợp sẵn với GitLab
- Hỗ trợ Docker Registry
- Free tier có 400 minutes/month

### 2. **GitHub Actions**
- File: `.github/workflows/ci.yml`
- Tích hợp với GitHub
- Free tier có 2000 minutes/month
- Dễ setup và sử dụng

## 🚀 **Setup GitLab CI/CD**

### **Bước 1: Tạo GitLab Repository**
```bash
# Clone project
git clone <your-gitlab-repo-url>
cd movie-theater-backend

# Add files và push
git add .
git commit -m "Initial commit with CI/CD setup"
git push origin main
```

### **Bước 2: Cấu hình GitLab Variables**
Vào **Settings > CI/CD > Variables** và thêm:

```bash
# Docker Registry (nếu sử dụng external registry)
CI_REGISTRY_USER=your-docker-username
CI_REGISTRY_PASSWORD=your-docker-password
CI_REGISTRY=docker.io

# Database credentials cho testing
MYSQL_ROOT_PASSWORD=test123
MYSQL_DATABASE=cinema_test_db
MYSQL_USER=test_user
MYSQL_PASSWORD=test_password

# JWT Secret cho testing
JWT_SECRET=bW92aWVUaGVhdGVyU2VjcmV0S2V5MjAyNUZvckpXVFRva2VuR2VuZXJhdGlvbg==
```

### **Bước 3: Enable GitLab Runner**
- Vào **Settings > CI/CD > Runners**
- Enable shared runners hoặc setup dedicated runner

### **Bước 4: Trigger Pipeline**
```bash
# Push code để trigger pipeline
git add .
git commit -m "Trigger CI/CD pipeline"
git push origin main
```

## 🐙 **Setup GitHub Actions**

### **Bước 1: Tạo GitHub Repository**
```bash
# Clone project
git clone <your-github-repo-url>
cd movie-theater-backend

# Add files và push
git add .
git commit -m "Initial commit with GitHub Actions"
git push origin main
```

### **Bước 2: Cấu hình GitHub Secrets**
Vào **Settings > Secrets and variables > Actions** và thêm:

```bash
# Docker Hub credentials
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password

# Database credentials (optional, có default values)
MYSQL_ROOT_PASSWORD=test123
MYSQL_DATABASE=cinema_test_db
MYSQL_USER=test_user
MYSQL_PASSWORD=test_password
```

### **Bước 3: Trigger Workflow**
```bash
# Push code để trigger workflow
git add .
git commit -m "Trigger GitHub Actions"
git push origin main
```

## 📋 **Pipeline Stages**

### **1. Validate Stage** 🔍
- Validate Maven project structure
- Resolve dependencies
- Check code syntax

### **2. Build Stage** 🏗️
- Compile Java source code
- Generate build artifacts
- Cache dependencies

### **3. Test Stage** 🧪
- **Unit Tests**: JUnit tests
- **Integration Tests**: Database integration
- **Authentication Tests**: API endpoint testing
- **Code Quality**: Checkstyle, PMD
- **Security Scan**: OWASP dependency check

### **4. Package Stage** 📦
- Build JAR file
- Create Docker image
- Push to registry

### **5. Deploy Stage** 🚀
- **Staging**: Auto-deploy từ `develop` branch
- **Production**: Manual deploy từ `main` branch

## 🔐 **Authentication Testing trong CI/CD**

### **Test Cases được chạy tự động:**

1. ✅ **Health Check** - Application startup
2. ✅ **Public Endpoint** - No authentication required
3. ✅ **User Registration** - Create new account
4. ✅ **User Login** - Authentication flow
5. ✅ **Protected Endpoint** - JWT token validation
6. ✅ **Role-based Access** - Customer/Admin permissions
7. ✅ **Invalid Token** - Security validation
8. ✅ **User Logout** - Session termination
9. ✅ **Duplicate Registration** - Conflict handling
10. ✅ **Invalid Login** - Error handling

### **Test Results:**
- Logs được lưu trong artifacts
- Failed tests sẽ fail toàn bộ pipeline
- Test coverage reports
- Security scan results

## 📊 **Monitoring và Notifications**

### **GitLab:**
- Pipeline status trong Merge Requests
- Email notifications
- Slack/Discord webhooks
- Pipeline badges

### **GitHub:**
- Status checks trong Pull Requests
- GitHub notifications
- Integration với Slack/Teams
- Action badges

## 🔧 **Customization**

### **Thêm Test Cases:**
```bash
# Trong test-auth-ci.sh
run_test "Custom Test Name" \
    "curl -s '$BASE_URL/custom/endpoint' | jq -e '.success == true'" \
    "true"
```

### **Thêm Environment Variables:**
```yaml
# GitLab CI
variables:
  CUSTOM_VAR: "custom_value"

# GitHub Actions
env:
  CUSTOM_VAR: "custom_value"
```

### **Thêm Deployment Targets:**
```yaml
# Thêm staging environment
deploy-staging:
  stage: deploy
  script:
    - echo "Deploy to staging"
  environment:
    name: staging
    url: http://staging.example.com
```

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. Pipeline Timeout**
```yaml
# Tăng timeout
timeout: 30m
```

#### **2. Database Connection Failed**
```yaml
# Kiểm tra MySQL service health
options: --health-cmd="mysqladmin ping" --health-interval=10s
```

#### **3. Authentication Tests Failed**
```bash
# Check application logs
- mvn spring-boot:run > app.log 2>&1 &
- tail -f app.log
```

#### **4. Docker Build Failed**
```yaml
# Enable Docker debug
variables:
  DOCKER_BUILDKIT: 1
  BUILDKIT_PROGRESS: plain
```

### **Debug Commands:**
```bash
# Local testing
./test-auth-ci.sh

# Check pipeline logs
gitlab-ci-multi-runner exec docker auth-tests

# Validate GitLab CI syntax
gitlab-ci-lint .gitlab-ci.yml
```

## 📈 **Best Practices**

### **1. Branch Strategy**
- `main` → Production deployments
- `develop` → Staging deployments
- `feature/*` → Run tests only

### **2. Security**
- Không commit secrets vào code
- Sử dụng environment variables
- Regular security scans

### **3. Performance**
- Cache dependencies
- Parallel job execution
- Optimize Docker layers

### **4. Monitoring**
- Set up alerts cho failed pipelines
- Monitor deployment health
- Track test coverage trends

## 🎉 **Next Steps**

1. **Setup Monitoring**: Prometheus + Grafana
2. **Add E2E Tests**: Selenium/Cypress
3. **Performance Testing**: JMeter integration
4. **Blue-Green Deployment**: Zero-downtime deployments
5. **Multi-environment**: Dev/Staging/Prod pipelines

## 📞 **Support**

Nếu gặp vấn đề với CI/CD setup:
1. Check pipeline logs
2. Verify environment variables
3. Test locally với `test-auth-ci.sh`
4. Review documentation
5. Contact team lead 
# Admin Movie Management - Troubleshooting Guide

## 🔧 Common Issues and Solutions

### 1. **"Test Login" Button Shows CORS/Network Errors**

**Problem:** When clicking "🔑 Test Login", you see errors like:
- `CORS policy blocked`
- `Request failed with status 403`
- `Network Error`

**Solution:**
1. **Start the Backend Server:**
   ```bash
   # Navigate to your backend project directory
   cd /path/to/your/backend
   
   # Start the server (usually on port 8080)
   npm start
   # OR
   java -jar your-app.jar
   # OR
   mvn spring-boot:run
   ```

2. **Verify Backend is Running:**
   - Open browser to `http://localhost:8080`
   - Should see backend API response or health page

3. **Check Backend CORS Configuration:**
   - Ensure backend allows `http://localhost:3000` in CORS settings
   - Verify API endpoints are accessible

### 2. **"Invalid Credentials" Error**

**Problem:** Login fails with 401 Unauthorized

**Solution:**
1. **Default Credentials:**
   - Username: `admin`
   - Password: `123456`

2. **If default doesn't work, check:**
   - Backend user database
   - Admin user creation scripts
   - Password encoding/hashing

### 3. **"DEV MODE" Won't Switch to Admin Mode**

**Problem:** Page stays in dev mode even after successful login

**Solution:**
1. **Check Authentication Token:**
   - Open browser DevTools → Application → Local Storage
   - Look for `accessToken` key
   - Should contain a valid JWT token

2. **Verify API Response Structure:**
   - Login should return proper token in response
   - API calls should return paginated data structure

### 4. **Backend Server Setup**

**If you don't have a backend server running:**

1. **Java/Spring Boot Backend:**
   ```bash
   # Clone backend repository
   git clone [backend-repo-url]
   cd backend-project
   
   # Install dependencies
   mvn install
   
   # Run application
   mvn spring-boot:run
   ```

2. **Node.js Backend:**
   ```bash
   # Install dependencies
   npm install
   
   # Start server
   npm start
   ```

3. **Docker Backend:**
   ```bash
   # If using Docker
   docker-compose up
   ```

## 🎯 Quick Test Checklist

- [ ] Backend server running at `http://localhost:8080`
- [ ] Can access `http://localhost:8080/cinema/api/health` (or similar endpoint)
- [ ] CORS configured to allow `http://localhost:3000`
- [ ] Admin user exists with credentials `admin/123456`
- [ ] API endpoints return proper JSON responses

## 🔍 Debugging Steps

1. **Open Browser DevTools (F12)**
2. **Go to Console tab**
3. **Click "🔑 Test Login" button**
4. **Check console output for specific error messages**
5. **Go to Network tab to see failed requests**

## 📞 Support

If issues persist:
1. Check the browser console for detailed error logs
2. Verify backend server logs
3. Ensure all environment variables are set correctly
4. Try testing API endpoints directly with tools like Postman

---

*This guide helps troubleshoot the Movie Management admin interface when switching from mock data to live API data.*

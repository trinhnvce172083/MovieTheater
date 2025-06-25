import axios from "axios";
import { store } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { clearAuthCookies, getAuthTokenFromCookies } from "@/utils/authCookies";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/cinema/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để tự động gắn token vào header
axiosClient.interceptors.request.use(
  (config) => {
    // Check multiple possible token locations including cookies
    const token = localStorage.getItem("accessToken") || 
                 localStorage.getItem("access_token") || 
                 localStorage.getItem("authToken") ||
                 sessionStorage.getItem("accessToken") ||
                 getAuthTokenFromCookies(); // Add cookies check
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached to request from:', 
        localStorage.getItem("accessToken") ? 'localStorage(accessToken)' :
        localStorage.getItem("access_token") ? 'localStorage(access_token)' :
        localStorage.getItem("authToken") ? 'localStorage(authToken)' :
        sessionStorage.getItem("accessToken") ? 'sessionStorage(accessToken)' :
        getAuthTokenFromCookies() ? 'cookies(authToken)' : 'unknown');
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No token found in localStorage, sessionStorage, or cookies');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý lỗi response
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Kiểm tra nếu lỗi là Unauthorized (401)
    if (error.response && error.response.status === 401) {
      // Xóa token từ localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
      
      // Xóa cookies
      clearAuthCookies();
      
      // Đăng xuất khỏi Redux store
      store.dispatch(logout());
      
      // Nếu không phải trang đăng nhập, có thể chuyển hướng
      if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/Login")) {
        window.location.href = "/auth/Login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

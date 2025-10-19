import axios from "axios";
import { AuthUtils } from "@/utils/authUtils";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/cinema/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để tự động gắn token vào header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý response
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error for debugging
    console.error("API Error:", {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle server errors (5xx)
    if (error.response?.status >= 500) {
      console.error("Server error detected:", error.response.status);
      // You can add custom server error handling here
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error("Network/Connection error:", error.message);
      // You can add custom network error handling here
    }

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            "http://localhost:8080/cinema/api/auth/refresh-token",
            { refreshToken }
          );

          if (response.data.success) {
            localStorage.setItem("accessToken", response.data.data.accessToken);
            localStorage.setItem("refreshToken", response.data.data.refreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
            return axiosClient(originalRequest);
          }
        }
      } catch (refreshError: unknown) {
        // Nếu refresh token cũng fail, sử dụng AuthUtils để logout
        console.warn("Refresh token failed, performing safe logout", refreshError);
        AuthUtils.clearAllAuthData();
        
        if (typeof window !== "undefined") {
          window.location.href = "/auth/Login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;


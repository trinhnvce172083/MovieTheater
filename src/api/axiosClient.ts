import axios from "axios";

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
      } catch (refreshError) {
        // Nếu refresh token cũng fail, logout user
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("isLoggedIn");
        
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;


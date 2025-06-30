import axios from "axios";
import { store } from "@/store";
import { login, logout } from "@/store/slices/authSlice";
import { refreshToken } from "@/api/auth/Refresh_Token_API";

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
  (error) => Promise.reject(error)
);

// Xử lý lỗi response và tự động refresh token
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Nếu lỗi là 401 và chưa thử refresh
    if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (storedRefreshToken) {
        try {
          const data = await refreshToken(storedRefreshToken);
          const newAccessToken = data?.data?.accessToken;
          const newRefreshToken = data?.data?.refreshToken;
          if (newAccessToken) {
            localStorage.setItem("accessToken", newAccessToken);
            if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
            store.dispatch(login({ token: newAccessToken }));
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosClient(originalRequest); // Thử lại request với token mới
          }
        } catch {
          // Nếu refresh thất bại, tiếp tục logout bên dưới
        }
      }
      // Nếu không có refreshToken hoặc refresh thất bại
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("isLoggedIn");
      store.dispatch(logout());
      if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/Login")) {
        window.location.href = "/auth/Login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

import { refreshToken } from "@/api/auth/Refresh_Token_API";
import { store } from "@/store";
import { login, logout } from "@/store/slices/authSlice";
import axios from "axios";

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

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
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        // Không có refreshToken, logout luôn
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("isLoggedIn");
        store.dispatch(logout());
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/auth/Login")
        ) {
          window.location.href = "/auth/Login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Nếu đang refresh, chờ token mới rồi retry
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;
      return new Promise(async (resolve, reject) => {
        try {
          const data = await refreshToken(storedRefreshToken);
          const newAccessToken = data?.data?.accessToken;
          const newRefreshToken = data?.data?.refreshToken;
          if (newAccessToken) {
            localStorage.setItem("accessToken", newAccessToken);
            if (newRefreshToken)
              localStorage.setItem("refreshToken", newRefreshToken);
            store.dispatch(login({ token: newAccessToken }));
            axiosClient.defaults.headers["Authorization"] = `Bearer ${newAccessToken}`;
            onRefreshed(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(axiosClient(originalRequest));
          } else {
            onRefreshed("");
            reject(error);
          }
        } catch {
          onRefreshed("");
          // Nếu refresh thất bại, logout
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userInfo");
          localStorage.removeItem("isLoggedIn");
          store.dispatch(logout());
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/auth/Login")
          ) {
            window.location.href = "/auth/Login";
          }
          reject(error);
        } finally {
          isRefreshing = false;
        }
      });
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

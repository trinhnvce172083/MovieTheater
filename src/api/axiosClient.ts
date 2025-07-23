import { refreshToken } from "@/api/auth/Refresh_Token_API";
import { store } from "@/store";
import { login, logout } from "@/store/slices/authSlice";
import axios from "axios";
import ROUTES from "@/constants/routes";

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function handleLogoutAndRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("isLoggedIn");
  store.dispatch(logout());
  if (
    typeof window !== "undefined" &&
    !window.location.pathname.includes(ROUTES.LOGIN)
  ) {
    window.location.href = ROUTES.LOGIN;
  }
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

// Khi run dev kiểm tra accessToken và refreshToken có valid không
if (
  typeof window !== "undefined" &&
  localStorage.getItem("isLoggedIn") === "true"
) {
  const accessToken = localStorage.getItem("accessToken");
  const refreshTokenValue = localStorage.getItem("refreshToken");

  if (!accessToken || !refreshTokenValue) {
    // Nếu không có token, logout
    handleLogoutAndRedirect();
  }
}

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
        handleLogoutAndRedirect();
        return Promise.reject(error);
      }

      // //Nếu refreshToken bị lỗi error.response.status === 403
      // if (error.response.status === 403) {
      //   handleLogoutAndRedirect();
      //   return Promise.reject(error);
      // }

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

      // Nếu chưa refresh, bắt đầu refresh token
      // Đánh dấu là đang refresh để tránh nhiều request cùng lúc
      isRefreshing = true;
      return new Promise(async (resolve, reject) => {
        try {
          const data = await refreshToken(storedRefreshToken);
          const newAccessToken = data?.data?.accessToken;
          const newRefreshToken = data?.data?.refreshToken;
          // Lưu  accessToken mới vào localStorage và Redux store
          if (newAccessToken) {
            localStorage.setItem("accessToken", newAccessToken);
            // Cập nhật refreshToken nếu có
            if (newRefreshToken)
              localStorage.setItem("refreshToken", newRefreshToken);
            store.dispatch(login({ token: newAccessToken }));
            onRefreshed(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(axiosClient(originalRequest));
            return;
          } else {
            onRefreshed("");
            handleLogoutAndRedirect();
            reject(error);
            return;
          }
        } catch {
          onRefreshed("");
          // Nếu refresh thất bại, logout
          handleLogoutAndRedirect();
          reject(error);
          return;
        } finally {
          isRefreshing = false;
        }
      });
    }
    return Promise.reject(error);
  }
);

// Debug response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API Success [${response.config.method?.toUpperCase()}] ${response.config.url}`,
      {
        status: response.status,
        data: response.data,
      }
    );
    return response;
  },
  (error) => {
    console.error(
      `🔴 API Error [${error.config?.method?.toUpperCase()}] ${error.config?.url}`,
      {
        status: error.response?.status,
        data: error.response?.data,
      }
    );
    return Promise.reject(error);
  }
);

export default axiosClient;

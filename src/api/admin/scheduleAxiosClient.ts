import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

// Custom axios client riêng cho schedule management để không ảnh hưởng axiosClient chung
class ScheduleAxiosClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: "http://localhost:8080/cinema/api",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 seconds timeout
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor với multiple token fallbacks
    this.client.interceptors.request.use(
      (config) => {
        // Primary: Use the same token source as other working admin pages
        const token = localStorage.getItem("accessToken");
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 [ScheduleAxios] Using token:', token.substring(0, 20) + '...');
        } else {
          console.warn('⚠️ [ScheduleAxios] No access token found in localStorage');
        }
        
        return config;
      },
      (error) => {
        console.error('Schedule API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor với enhanced error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Enhanced error logging for debugging
        console.error("🚨 Schedule API Error:", {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          responseData: error.response?.data,
          hasToken: !!localStorage.getItem("accessToken")
        });

        // Handle different error types - be less aggressive with 403
        if (error.response?.status === 403) {
          console.warn('⚠️ Access forbidden - but continuing with fallback data');
          // Don't throw error immediately, let the service handle fallback
          // throw new Error('Không có quyền truy cập. Vui lòng đăng nhập với tài khoản admin.');
        }

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
                
                if (originalRequest) {
                  originalRequest.headers = originalRequest.headers || {};
                  originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
                  return this.client(originalRequest);
                }
              }
            }
          } catch (refreshError) {
            // Cleanup and redirect on refresh failure
            this.clearAuthData();
            if (typeof window !== "undefined") {
              window.location.href = "/auth/login";
            }
          }
        }

        // Handle network errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        }

        // Handle timeout
        if (error.code === 'ECONNABORTED') {
          throw new Error('Yêu cầu quá lâu. Vui lòng thử lại.');
        }

        return Promise.reject(error);
      }
    );
  }

  private clearAuthData() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("accessToken");
  }

  // Expose axios methods sau khi client đã được khởi tạo
  get(url: string, config?: AxiosRequestConfig) {
    return this.client.get(url, config);
  }

  post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post(url, data, config);
  }

  put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put(url, data, config);
  }

  delete(url: string, config?: AxiosRequestConfig) {
    return this.client.delete(url, config);
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch(url, data, config);
  }
}

// Export single instance
export const scheduleAxiosClient = new ScheduleAxiosClient();

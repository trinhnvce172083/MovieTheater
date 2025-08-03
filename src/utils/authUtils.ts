/**
 * Utility functions for authentication management
 */

export const AuthUtils = {
  /**
   * Xóa tất cả dữ liệu xác thực khỏi localStorage
   */
  clearAllAuthData: () => {
    if (typeof window !== "undefined") {
      // Xóa các token chính
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("isLoggedIn");
      
      // Xóa persist:auth của Redux Persist
      localStorage.removeItem("persist:auth");
      
      // Xóa persist:root nếu có
      localStorage.removeItem("persist:root");
      
      // Tìm và xóa tất cả keys liên quan đến auth
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes("auth") || 
          key.includes("user") || 
          key.includes("token") ||
          key.startsWith("persist:")
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed localStorage key: ${key}`);
      });
      
      // Xóa sessionStorage cũng vậy
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("userInfo");
    }
  },

  /**
   * Thực hiện logout an toàn - luôn xóa data local dù API có lỗi
   */
  safeLogout: async (logoutApiCall?: () => Promise<unknown>) => {
    try {
      // Thử gọi API logout nếu có
      if (logoutApiCall) {
        await logoutApiCall();
      }
    } catch (error) {
      console.warn("Logout API failed, but continuing with local cleanup:", error);
    } finally {
      // Luôn xóa dữ liệu local dù API có lỗi hay không
      AuthUtils.clearAllAuthData();
      
      // Redirect về trang login
      if (typeof window !== "undefined") {
        // Sử dụng window.location.href thay vì router để force reload
        window.location.href = "/auth/Login";
      }
    }
  },

  /**
   * Kiểm tra trạng thái đăng nhập
   */
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    
    const token = localStorage.getItem("accessToken");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    return !!(token && isLoggedIn === "true");
  },

  /**
   * Force reload component bằng cách clear cache và reload page
   */
  forceReload: () => {
    if (typeof window !== "undefined") {
      // Clear các cache có thể
      if ("caches" in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Reload với force refresh
      window.location.reload();
    }
  },

  /**
   * Xử lý lỗi authentication - tự động logout nếu gặp 401/403
   */
  handleAuthError: (error: unknown) => {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError?.response?.status === 401 || axiosError?.response?.status === 403) {
      console.warn("Authentication error detected, performing safe logout");
      AuthUtils.safeLogout();
      return true; // Đã xử lý lỗi
    }
    return false; // Không phải lỗi auth
  }
};

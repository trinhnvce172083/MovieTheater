import axiosClient from "../axiosClient";
import { AxiosError } from "axios";
import { AuthUtils } from "@/utils/authUtils";

export const Logout_API = async () => {
  try {
    const response = await axiosClient.post("/auth/logout");
    
    // Nếu API thành công, vẫn xóa data local
    AuthUtils.clearAllAuthData();
    
    return response.data;
  }
  catch (error: unknown) {
    const axiosError = error as AxiosError;
    
    // Nếu lỗi 403 (Forbidden) hoặc 401, vẫn thực hiện logout
    if (axiosError?.response?.status === 403 || axiosError?.response?.status === 401) {
      console.warn("Logout API failed with 403/401, clearing local storage anyway");
      
      // Xóa tất cả dữ liệu xác thực
      AuthUtils.clearAllAuthData();
      
      // Reload page để reset state
      if (typeof window !== "undefined") {
        window.location.reload();
      }
      
      return { success: true, message: "Logged out successfully" };
    }
    
    // Với các lỗi khác, vẫn xóa data và reload
    console.error("Logout failed:", error);
    AuthUtils.clearAllAuthData();
    
    if (typeof window !== "undefined") {
      window.location.reload();
    }
    
    throw error;
  }
};

/**
 * Safe logout function - sử dụng AuthUtils để logout an toàn
 * Hàm này luôn thành công dù API có lỗi
 */
export const SafeLogout_API = async () => {
  await AuthUtils.safeLogout(async () => {
    return await axiosClient.post("/auth/logout");
  });
};

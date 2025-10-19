import { useSelector } from "react-redux";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RootState } from "@/store";
import { AuthUtils } from '@/utils/authUtils';
import ROUTES from "@/constants/routes";

export function useAuth() {
  return useSelector((state: RootState) => state.auth);
}

/**
 * Hook để tự động xử lý lỗi authentication
 * Sử dụng trong các component cần auth để tự động logout khi gặp 403/401
 */
export const useAuthErrorHandler = () => {
  const router = useRouter();

  useEffect(() => {
    // Lắng nghe lỗi axios global nếu có
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      if (AuthUtils.handleAuthError(error)) {
        event.preventDefault(); // Ngăn console error
      }
    };

    // Lắng nghe lỗi JavaScript chung
    const handleError = (event: ErrorEvent) => {
      if (event.error && AuthUtils.handleAuthError(event.error)) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [router]);

  // Trả về function để manual handle error
  return {
    handleAuthError: AuthUtils.handleAuthError,
    forceLogout: () => AuthUtils.safeLogout(),
    clearAuth: AuthUtils.clearAllAuthData
  };
};

/**
 * Hook để kiểm tra auth status và redirect nếu cần
 */
export const useAuthCheck = (requireAuth: boolean = true) => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAuth = () => {
      const isAuthenticated = AuthUtils.isAuthenticated();
      
      if (requireAuth && !isAuthenticated) {
        // Cần auth nhưng không có -> redirect login
        router.push(ROUTES.LOGIN);
      } else if (!requireAuth && isAuthenticated) {
        // Không cần auth nhưng đã login -> redirect home
        router.push(ROUTES.HOME);
      }
    };

    // Check ngay lập tức
    checkAuth();

    // Check định kỳ mỗi 30 giây
    const interval = setInterval(checkAuth, 30000);

    return () => clearInterval(interval);
  }, [requireAuth, router]);

  return {
    isAuthenticated: AuthUtils.isAuthenticated()
  };
};

/**
 * Hook để xử lý logout với UI feedback
 */
export const useLogout = () => {
  const router = useRouter();

  const logout = async (showNotification?: (message: string) => void) => {
    try {
      if (showNotification) {
        showNotification('Đang đăng xuất...');
      }

      await AuthUtils.safeLogout();

      if (showNotification) {
        showNotification('Đăng xuất thành công');
      }
    } catch (error) {
      console.error("Logout error:", error);
      
      if (showNotification) {
        showNotification('Có lỗi xảy ra, nhưng đã đăng xuất thành công');
      }

      // Force redirect dù có lỗi
      router.push(ROUTES.LOGIN);
    }
  };

  return { logout };
};
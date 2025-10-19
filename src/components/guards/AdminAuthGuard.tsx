"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/constants/roles";
import ROUTES from "@/constants/routes";
import { Spin, message } from "antd";
import { AuthUtils } from "@/utils/authUtils";
import { useLogout } from "@/hooks/useAuth";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

/**
 * Admin Authentication Guard
 * Only allows users with ADMIN role to access admin pages
 * Redirects non-admin users to homepage
 */
export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const { userInfo, isLoggedIn } = useAuth();
  const { logout: performLogout } = useLogout();

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        // Check if user is authenticated
        if (!isLoggedIn || !AuthUtils.isAuthenticated()) {
          router.replace(ROUTES.HOME);
          return;
        }

        // Check user role from Redux state first
        if (userInfo?.Role === Role.ADMIN) {
          console.log("✅ Admin role confirmed from Redux state");
          setIsChecking(false);
          return;
        }

        // Fallback: Check localStorage for userInfo
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          try {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            if (parsedUserInfo.Role === Role.ADMIN) {
              setIsChecking(false);
              return;
            }
          } catch (error) {
            console.error("Error parsing stored user info:", error);
          }
        }

        // Show warning message
        message.warning({
          content: "Access denied. You do not have admin privileges. You will be logged out.",
          duration: 4,
          style: {
            marginTop: '20vh',
          },
        });

        // Perform logout after showing message
        setTimeout(async () => {
          try {
            await performLogout((msg) => {
              console.log(msg);
            });
            router.replace(ROUTES.HOME);
          } catch (error) {
            console.error("Logout error:", error);
            AuthUtils.clearAllAuthData();
            router.replace(ROUTES.HOME);
          }
        }, 2000);

        return;
      } catch (error) {
        console.error("Error in admin auth check:", error);
        router.replace(ROUTES.HOME);
      }
    };

    // Small delay to ensure Redux state is initialized
    const timer = setTimeout(checkAdminAccess, 100);

    return () => clearTimeout(timer);
  }, [userInfo, isLoggedIn, router, performLogout]);

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          <Spin size="large" style={{ marginBottom: 16 }} />
          <div>Verifying admin access...</div>
        </div>
      </div>
    );
  }

  // If we reach here, user has admin access
  return <>{children}</>;
}

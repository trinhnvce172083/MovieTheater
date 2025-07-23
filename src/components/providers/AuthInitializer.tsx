"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/store/slices/authSlice";
import { decodeJwt } from "@/hooks/decodeJwt";

/**
 * Component to restore authentication state from localStorage
 * This should be placed high in the component tree
 */
export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          // Validate token before using it
          const payload = decodeJwt(accessToken);
          const currentTime = Date.now() / 1000;
          
          console.log('🔍 AuthInitializer - Token payload:', payload);
          
          // Check if token is expired
          if (payload && payload.exp && Number(payload.exp) > currentTime) {
            // Token is valid, restore auth state
            dispatch(login({ token: accessToken }));
            console.log('✅ AuthInitializer - Auth state restored');
          } else {
            // Token is expired, clear it
            console.log('⚠️ AuthInitializer - Token expired, clearing storage');
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userInfo");
            localStorage.removeItem("isLoggedIn");
          }
        } catch (error) {
          console.log('❌ AuthInitializer - Error decoding token:', error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userInfo");
          localStorage.removeItem("isLoggedIn");
        }
      }
    }
  }, [dispatch]);

  // This is a utility component, it doesn't render anything
  return null;
}

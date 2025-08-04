"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/store/slices/authSlice";
import { decodeJwt } from "@/hooks/decodeJwt";

/**
 * Component to restore authentication state from localStorage
 * This handles auth state restoration on app startup
 */
export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userInfoStr = localStorage.getItem('userInfo');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (!token || !isLoggedIn) {
          // Clear any invalid data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('isLoggedIn');
          return;
        }

        const payload = decodeJwt(token);
        if (!payload) {
          // Invalid token, clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('isLoggedIn');
          return;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          // Token expired, clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('isLoggedIn');
          return;
        }

        // Token is valid, restore auth state
        let userInfo = null;
        if (userInfoStr) {
          try {
            userInfo = JSON.parse(userInfoStr);
          } catch {
            // Invalid userInfo, ignore it
          }
        }

        dispatch(login({ token, userInfo }));
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Error decoding token, clear storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('isLoggedIn');
      }
    };

    initializeAuth();
  }, [dispatch]);

  // This is a utility component, it doesn't render anything
  return null;
}

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
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const payload = decodeJwt(token);
        if (!payload) return;

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
        dispatch(login({ token }));
      } catch (error) {
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

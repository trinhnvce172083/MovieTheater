"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/store/slices/authSlice";

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
        // Restore auth state from localStorage
        dispatch(login({ token: accessToken }));
      }
    }
  }, [dispatch]);

  // This is a utility component, it doesn't render anything
  return null;
}

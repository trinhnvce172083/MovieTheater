import { useCallback } from "react";
import verifyEmail from "@/api/auth/verify-email";

export const useVerifyEmail = () => {
  const verify = useCallback(async (token: string) => {
    try {
      const response = await verifyEmail(token);
      return response;
    } catch (error) {
      console.error("Error verifying email:", error);
      throw error;
    }
  }, []);

  return { verify };
};
import { useEffect } from "react";
import { Login_API } from "@/api/auth/Login_API";

const useLogin = () => {
  useEffect(() => {
    const login = async () => {
      try {
        const data = await Login_API({ email: "test@example.com", password: "password", rememberMe: true });
        console.log("Login successful:", data);
      } catch (error) {
        console.error("Login failed:", error);
      }
    };

    login();
  }, []);
};

export default useLogin;
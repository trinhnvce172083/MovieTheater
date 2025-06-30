import { useState } from "react";
import { Login_API } from "@/api/auth/Login_API";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown>(null);

  const login = async (params: { username: string; password: string; rememberMe?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await Login_API({
        username: params.username,
        password: params.password,
        rememberMe: params.rememberMe ?? false,
      });
      setData(result);
      setLoading(false);
      return result;
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message?: string }).message || "Login failed");
      } else {
        setError("Login failed");
      }
      setLoading(false);
      return null;
    }
  };

  return { login, loading, error, data };
};

export default useLogin;
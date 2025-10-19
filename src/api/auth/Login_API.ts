import axiosClient from "../axiosClient";

export const Login_API = async (credentials: { username: string; password: string; rememberMe: boolean }) => {
  try {
    const response = await axiosClient.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

import axiosClient from "../axiosClient";
import { ResetPasswordFormData } from "@/types/ResetPassword/types";

const resetPassword = async (data: ResetPasswordFormData) => {
  const response = await axiosClient.post("/auth/reset-password", data);
  return response.data;
};

export default resetPassword;

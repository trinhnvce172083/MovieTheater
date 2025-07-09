import axiosClient from "../axiosClient";

const forgotPassword = async (data: { email: string }) => {
  const response = await axiosClient.post("/auth/forgot-password", data);
  return response.data;
};

export default forgotPassword;

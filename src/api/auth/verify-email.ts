import axiosClient from "../axiosClient";

const verifyEmail = async (token: string) => {
    try {
        const response = await axiosClient.get(`/api/auth/verify-email?token=${token}`);
        return response.data;
    } catch (error) {
        console.error("Error verifying email:", error);
        throw error;
    }
};

export default verifyEmail;

import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/cinema';

export interface RegisterRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  agreeToTerms: boolean;
  acceptMarketing: boolean;
}

export const authApi = {
  register: async (data: RegisterRequest) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw new Error(error.message);
      }
      throw error;
    }
  }
}; 
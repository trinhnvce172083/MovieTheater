import { AxiosError } from 'axios';
import axiosClient from '../axiosClient';

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
  role?: string;
}

export const authApi = {
  register: async (data: RegisterRequest) => {
    try {
      console.log('Making register request to: /auth/register');
      const response = await axiosClient.post('/auth/register', data);
      console.log('Register API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Register API error:', error);
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
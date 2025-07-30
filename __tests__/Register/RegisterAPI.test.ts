import { authApi } from '@/api/auth/Register_API';
import { InputData, SuccessResponse, WrongInputResponse, ExistingUserResponse } from './Register_API.mock';

jest.mock('@/api/axiosClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

describe('Register API', () => {
  const mockAxiosClient = require('@/api/axiosClient').default;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should register user successfully with valid data', async () => {
    mockAxiosClient.post.mockResolvedValue({
      data: SuccessResponse
    });

    const result = await authApi.register(InputData.validRegisterData);

    expect(mockAxiosClient.post).toHaveBeenCalledWith('/auth/register', InputData.validRegisterData);
    expect(result).toEqual(SuccessResponse);
  });

  test('should handle invalid input data error', async () => {
    const error = {
      response: {
        data: WrongInputResponse
      }
    };
    mockAxiosClient.post.mockRejectedValue(error);

    await expect(authApi.register(InputData.invalidRegisterData)).rejects.toThrow(WrongInputResponse.message);
    expect(mockAxiosClient.post).toHaveBeenCalledWith('/auth/register', InputData.invalidRegisterData);
  });

  test('should handle existing username error', async () => {
    const error = {
      response: {
        data: ExistingUserResponse
      }
    };
    mockAxiosClient.post.mockRejectedValue(error);

    await expect(authApi.register(InputData.existingUserData)).rejects.toThrow(ExistingUserResponse.message);
    expect(mockAxiosClient.post).toHaveBeenCalledWith('/auth/register', InputData.existingUserData);
  });

  test('should handle network error', async () => {
    const networkError = new Error('Network Error');
    mockAxiosClient.post.mockRejectedValue(networkError);

    await expect(authApi.register(InputData.validRegisterData)).rejects.toThrow('Network Error');
    expect(mockAxiosClient.post).toHaveBeenCalledWith('/auth/register', InputData.validRegisterData);
  });

  test('should handle axios error without response data', async () => {
    const axiosError = new Error('Axios Error');
    mockAxiosClient.post.mockRejectedValue(axiosError);

    await expect(authApi.register(InputData.validRegisterData)).rejects.toThrow('Axios Error');
    expect(mockAxiosClient.post).toHaveBeenCalledWith('/auth/register', InputData.validRegisterData);
  });

  test('should handle non-axios error', async () => {
    const genericError = new Error('Generic Error');
    mockAxiosClient.post.mockRejectedValue(genericError);

    await expect(authApi.register(InputData.validRegisterData)).rejects.toThrow('Generic Error');
    expect(mockAxiosClient.post).toHaveBeenCalledWith('/auth/register', InputData.validRegisterData);
  });
}); 
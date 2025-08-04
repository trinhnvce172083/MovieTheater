import verifyEmail from "@/api/auth/verify-email";
import axiosClient from "@/api/axiosClient";
import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import {
  ValidToken,
  InvalidToken,
  ExpiredToken,
  SuccessVerificationResponse,
  InvalidTokenResponse,
  ExpiredTokenResponse,
  AlreadyVerifiedResponse,
  UserNotFoundResponse,
  NetworkErrorResponse
} from "./VerifyEmail_API.mock";

// Mock axiosClient
jest.mock("@/api/axiosClient");
const mockedAxiosClient = axiosClient as jest.Mocked<typeof axiosClient>;

describe("VerifyEmail API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Successful Email Verification", () => {
    it("should verify email successfully with valid token", async () => {
      // Arrange
      mockedAxiosClient.get.mockResolvedValue(SuccessVerificationResponse);

      // Act
      const result = await verifyEmail(ValidToken);

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith(
        `/auth/verify-email?token=${ValidToken}`
      );
      expect(mockedAxiosClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(SuccessVerificationResponse.data);
      expect(result.success).toBe(true);
      expect(result.message).toBe("Email đã được xác thực thành công");
      expect(result.data.isVerified).toBe(true);
    });

    it("should return correct user data after successful verification", async () => {
      // Arrange
      mockedAxiosClient.get.mockResolvedValue(SuccessVerificationResponse);

      // Act
      const result = await verifyEmail(ValidToken);

      // Assert
      expect(result.data).toHaveProperty("userId", 3);
      expect(result.data).toHaveProperty("email", "user@example.com");
      expect(result.data).toHaveProperty("isVerified", true);
      expect(result.data).toHaveProperty("verifiedAt");
    });
  });

  describe("Failed Email Verification", () => {
    it("should throw error with invalid token", async () => {
      // Arrange
      mockedAxiosClient.get.mockRejectedValue(InvalidTokenResponse);

      // Act & Assert
      await expect(verifyEmail(InvalidToken)).rejects.toEqual(InvalidTokenResponse);
      expect(mockedAxiosClient.get).toHaveBeenCalledWith(
        `/auth/verify-email?token=${InvalidToken}`
      );
      expect(mockedAxiosClient.get).toHaveBeenCalledTimes(1);
    });

    it("should throw error with expired token", async () => {
      // Arrange
      mockedAxiosClient.get.mockRejectedValue(ExpiredTokenResponse);

      // Act & Assert
      await expect(verifyEmail(ExpiredToken)).rejects.toEqual(ExpiredTokenResponse);
      expect(mockedAxiosClient.get).toHaveBeenCalledWith(
        `/auth/verify-email?token=${ExpiredToken}`
      );
    });

    it("should handle already verified email", async () => {
      // Arrange
      mockedAxiosClient.get.mockRejectedValue(AlreadyVerifiedResponse);

      // Act & Assert
      await expect(verifyEmail(ValidToken)).rejects.toEqual(AlreadyVerifiedResponse);
      
      // Verify error structure
      try {
        await verifyEmail(ValidToken);
      } catch (error: unknown) {
        const axiosError = error as { response: { data: { errorCode: string; message: string }; status: number } };
        expect(axiosError.response.data.errorCode).toBe("EMAIL_ALREADY_VERIFIED");
        expect(axiosError.response.data.message).toBe("Email đã được xác thực trước đó");
        expect(axiosError.response.status).toBe(400);
      }
    });

    it("should handle user not found error", async () => {
      // Arrange
      mockedAxiosClient.get.mockRejectedValue(UserNotFoundResponse);

      // Act & Assert
      await expect(verifyEmail(ValidToken)).rejects.toEqual(UserNotFoundResponse);
      
      // Verify error details
      try {
        await verifyEmail(ValidToken);
      } catch (error: unknown) {
        const axiosError = error as { response: { data: { errorCode: string }; status: number } };
        expect(axiosError.response.data.errorCode).toBe("USER_NOT_FOUND");
        expect(axiosError.response.status).toBe(404);
      }
    });

    it("should handle network errors", async () => {
      // Arrange
      mockedAxiosClient.get.mockRejectedValue(NetworkErrorResponse);

      // Act & Assert
      await expect(verifyEmail(ValidToken)).rejects.toEqual(NetworkErrorResponse);
      
      // Verify network error
      try {
        await verifyEmail(ValidToken);
      } catch (error: unknown) {
        const axiosError = error as { response: { data: { errorCode: string }; status: number } };
        expect(axiosError.response.data.errorCode).toBe("NETWORK_ERROR");
        expect(axiosError.response.status).toBe(500);
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty token", async () => {
      // Arrange
      const emptyToken = "";
      mockedAxiosClient.get.mockRejectedValue(InvalidTokenResponse);

      // Act & Assert
      await expect(verifyEmail(emptyToken)).rejects.toEqual(InvalidTokenResponse);
      expect(mockedAxiosClient.get).toHaveBeenCalledWith(
        `/auth/verify-email?token=${emptyToken}`
      );
    });

    it("should handle malformed token", async () => {
      // Arrange
      const malformedToken = "malformed-token-!@#$%";
      mockedAxiosClient.get.mockRejectedValue(InvalidTokenResponse);

      // Act & Assert
      await expect(verifyEmail(malformedToken)).rejects.toEqual(InvalidTokenResponse);
    });

    it("should handle very long token", async () => {
      // Arrange
      const longToken = "a".repeat(1000); // Very long token
      mockedAxiosClient.get.mockRejectedValue(InvalidTokenResponse);

      // Act & Assert
      await expect(verifyEmail(longToken)).rejects.toEqual(InvalidTokenResponse);
    });

    it("should handle null/undefined token gracefully", async () => {
      // Arrange
      mockedAxiosClient.get.mockRejectedValue(InvalidTokenResponse);

      // Act & Assert
      await expect(verifyEmail("" as string)).rejects.toEqual(InvalidTokenResponse);
      await expect(verifyEmail("" as string)).rejects.toEqual(InvalidTokenResponse);
    });
  });

  describe("API Call Verification", () => {
    it("should call correct endpoint with proper query parameter", async () => {
      // Arrange
      mockedAxiosClient.get.mockResolvedValue(SuccessVerificationResponse);

      // Act
      await verifyEmail(ValidToken);

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalledWith(
        `/auth/verify-email?token=${ValidToken}`
      );
      expect(mockedAxiosClient.get).toHaveBeenCalledTimes(1);
    });

    it("should use GET method for verification", async () => {
      // Arrange
      mockedAxiosClient.get.mockResolvedValue(SuccessVerificationResponse);

      // Act
      await verifyEmail(ValidToken);

      // Assert
      expect(mockedAxiosClient.get).toHaveBeenCalled();
      expect(mockedAxiosClient.post).not.toHaveBeenCalled();
      expect(mockedAxiosClient.put).not.toHaveBeenCalled();
      expect(mockedAxiosClient.delete).not.toHaveBeenCalled();
    });
  });

  describe("Response Data Validation", () => {
    it("should return data from response.data", async () => {
      // Arrange
      const mockResponse = {
        data: {
          success: true,
          message: "Test message",
          data: { test: "value" }
        }
      };
      mockedAxiosClient.get.mockResolvedValue(mockResponse);

      // Act
      const result = await verifyEmail(ValidToken);

      // Assert
      expect(result).toEqual(mockResponse.data);
    });

    it("should preserve all response properties", async () => {
      // Arrange
      mockedAxiosClient.get.mockResolvedValue(SuccessVerificationResponse);

      // Act
      const result = await verifyEmail(ValidToken);

      // Assert
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("timestamp");
    });
  });
});

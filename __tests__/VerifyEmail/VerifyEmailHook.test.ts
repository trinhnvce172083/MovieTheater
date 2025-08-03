import { renderHook } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useVerifyEmail } from "@/hooks/VerifyEmail/use-verify-email";
import verifyEmail from "@/api/auth/verify-email";
import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import {
  ValidToken,
  InvalidToken,
  SuccessVerificationResponse,
  InvalidTokenResponse,
  ExpiredTokenResponse
} from "./VerifyEmail_API.mock";

// Mock the verify email API
jest.mock("@/api/auth/verify-email");
const mockedVerifyEmail = verifyEmail as jest.MockedFunction<typeof verifyEmail>;

describe("useVerifyEmail Hook Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Successful Verification", () => {
    it("should return verify function", () => {
      // Arrange & Act
      const { result } = renderHook(() => useVerifyEmail());

      // Assert
      expect(result.current).toHaveProperty("verify");
      expect(typeof result.current.verify).toBe("function");
    });

    it("should call verifyEmail API with correct token", async () => {
      // Arrange
      mockedVerifyEmail.mockResolvedValue(SuccessVerificationResponse.data);
      const { result } = renderHook(() => useVerifyEmail());

      // Act
      await result.current.verify(ValidToken);

      // Assert
      expect(mockedVerifyEmail).toHaveBeenCalledWith(ValidToken);
      expect(mockedVerifyEmail).toHaveBeenCalledTimes(1);
    });

    it("should return success response for valid token", async () => {
      // Arrange
      mockedVerifyEmail.mockResolvedValue(SuccessVerificationResponse.data);
      const { result } = renderHook(() => useVerifyEmail());

      // Act
      const response = await result.current.verify(ValidToken);

      // Assert
      expect(response).toEqual(SuccessVerificationResponse.data);
      expect(response.success).toBe(true);
      expect(response.message).toBe("Email đã được xác thực thành công");
    });

    it("should return user data after successful verification", async () => {
      // Arrange
      mockedVerifyEmail.mockResolvedValue(SuccessVerificationResponse.data);
      const { result } = renderHook(() => useVerifyEmail());

      // Act
      const response = await result.current.verify(ValidToken);

      // Assert
      expect(response.data).toHaveProperty("userId", 3);
      expect(response.data).toHaveProperty("email", "user@example.com");
      expect(response.data).toHaveProperty("isVerified", true);
      expect(response.data).toHaveProperty("verifiedAt");
    });
  });

  describe("Failed Verification", () => {
    it("should throw error for invalid token", async () => {
      // Arrange
      mockedVerifyEmail.mockRejectedValue(InvalidTokenResponse);
      const { result } = renderHook(() => useVerifyEmail());

      // Act & Assert
      await expect(result.current.verify(InvalidToken)).rejects.toEqual(InvalidTokenResponse);
      expect(mockedVerifyEmail).toHaveBeenCalledWith(InvalidToken);
    });

    it("should throw error for expired token", async () => {
      // Arrange
      mockedVerifyEmail.mockRejectedValue(ExpiredTokenResponse);
      const { result } = renderHook(() => useVerifyEmail());

      // Act & Assert
      await expect(result.current.verify("expired-token")).rejects.toEqual(ExpiredTokenResponse);
    });

    it("should handle API errors gracefully", async () => {
      // Arrange
      const apiError = new Error("API Error");
      mockedVerifyEmail.mockRejectedValue(apiError);
      const { result } = renderHook(() => useVerifyEmail());

      // Act & Assert
      await expect(result.current.verify(ValidToken)).rejects.toThrow("API Error");
    });

    it("should log error when verification fails", async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockedVerifyEmail.mockRejectedValue(InvalidTokenResponse);
      const { result } = renderHook(() => useVerifyEmail());

      // Act
      try {
        await result.current.verify(InvalidToken);
      } catch {
        // Expected to throw
      }

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error verifying email:",
        InvalidTokenResponse
      );

      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty token", async () => {
      // Arrange
      mockedVerifyEmail.mockRejectedValue(InvalidTokenResponse);
      const { result } = renderHook(() => useVerifyEmail());

      // Act & Assert
      await expect(result.current.verify("")).rejects.toEqual(InvalidTokenResponse);
      expect(mockedVerifyEmail).toHaveBeenCalledWith("");
    });

    it("should handle malformed token", async () => {
      // Arrange
      const malformedToken = "invalid-!@#$%";
      mockedVerifyEmail.mockRejectedValue(InvalidTokenResponse);
      const { result } = renderHook(() => useVerifyEmail());

      // Act & Assert
      await expect(result.current.verify(malformedToken)).rejects.toEqual(InvalidTokenResponse);
      expect(mockedVerifyEmail).toHaveBeenCalledWith(malformedToken);
    });

    it("should handle very long token", async () => {
      // Arrange
      const longToken = "a".repeat(1000);
      mockedVerifyEmail.mockRejectedValue(InvalidTokenResponse);
      const { result } = renderHook(() => useVerifyEmail());

      // Act & Assert
      await expect(result.current.verify(longToken)).rejects.toEqual(InvalidTokenResponse);
      expect(mockedVerifyEmail).toHaveBeenCalledWith(longToken);
    });
  });

  describe("Multiple Calls", () => {
    it("should handle multiple verification calls", async () => {
      // Arrange
      mockedVerifyEmail.mockResolvedValue(SuccessVerificationResponse.data);
      const { result } = renderHook(() => useVerifyEmail());

      // Act
      await result.current.verify(ValidToken);
      await result.current.verify(ValidToken);

      // Assert
      expect(mockedVerifyEmail).toHaveBeenCalledTimes(2);
      expect(mockedVerifyEmail).toHaveBeenNthCalledWith(1, ValidToken);
      expect(mockedVerifyEmail).toHaveBeenNthCalledWith(2, ValidToken);
    });

    it("should handle mixed success and failure calls", async () => {
      // Arrange
      const { result } = renderHook(() => useVerifyEmail());
      
      mockedVerifyEmail
        .mockResolvedValueOnce(SuccessVerificationResponse.data)
        .mockRejectedValueOnce(InvalidTokenResponse);

      // Act
      const successResult = await result.current.verify(ValidToken);
      
      // Assert first call
      expect(successResult).toEqual(SuccessVerificationResponse.data);
      
      // Act & Assert second call
      await expect(result.current.verify(InvalidToken)).rejects.toEqual(InvalidTokenResponse);
      
      expect(mockedVerifyEmail).toHaveBeenCalledTimes(2);
    });
  });

  describe("Hook Stability", () => {
    it("should return stable verify function reference", () => {
      // Arrange & Act
      const { result, rerender } = renderHook(() => useVerifyEmail());
      const firstVerify = result.current.verify;
      
      rerender();
      const secondVerify = result.current.verify;

      // Assert
      expect(firstVerify).toBe(secondVerify);
    });

    it("should maintain function identity across rerenders", () => {
      // Arrange
      const { result, rerender } = renderHook(() => useVerifyEmail());
      const functionReferences = [result.current.verify];

      // Act - multiple rerenders
      for (let i = 0; i < 5; i++) {
        rerender();
        functionReferences.push(result.current.verify);
      }

      // Assert - all references should be the same
      const firstReference = functionReferences[0];
      functionReferences.forEach(ref => {
        expect(ref).toBe(firstReference);
      });
    });
  });

  describe("Return Value Structure", () => {
    it("should return object with verify property", () => {
      // Arrange & Act
      const { result } = renderHook(() => useVerifyEmail());

      // Assert
      expect(result.current).toEqual({
        verify: expect.any(Function)
      });
      expect(Object.keys(result.current)).toEqual(["verify"]);
    });

    it("should not return additional properties", () => {
      // Arrange & Act
      const { result } = renderHook(() => useVerifyEmail());

      // Assert
      expect(Object.keys(result.current)).toHaveLength(1);
      expect(result.current).not.toHaveProperty("loading");
      expect(result.current).not.toHaveProperty("error");
      expect(result.current).not.toHaveProperty("data");
    });
  });
});

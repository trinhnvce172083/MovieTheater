import { Login_API } from "@/api/auth/Login_API";
import axiosClient from "@/api/axiosClient";
import { describe, it, expect, afterEach, jest } from "@jest/globals";
import { InputData, NoUserFoundResponse, SuccessResponse, WrongInputResponse } from "./Login_API.mock";

describe("Login API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Right input response", async () => {
    jest.spyOn(axiosClient, "post").mockResolvedValueOnce(SuccessResponse);

    const result = await Login_API(InputData);

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("message", "Đăng nhập thành công");
    expect(result.data).toHaveProperty("accessToken");
    expect(result.data.user).toHaveProperty("username", "admin1");
  });

  it("Wrong input response", async () => {
    jest.spyOn(axiosClient, "post").mockRejectedValueOnce(WrongInputResponse);

    try {
      await Login_API(InputData);
    } catch (err: unknown) {
      type ErrorResponse = {
        response: {
          data: {
            success: boolean;
            code: number;
            message: string;
            errorCode: string;
            timestamp: string;
          };
        };
      };
      const error = err as ErrorResponse;
      expect(error.response.data).toMatchObject({
        success: false,
        message: "Thông tin đăng nhập không đúng",
        errorCode: "INVALID_CREDENTIALS",
      });
    }
  });

  it("No user found response", async () => {
    jest.spyOn(axiosClient, "post").mockRejectedValueOnce(NoUserFoundResponse);

    try {
      await Login_API(InputData);
    } catch (err: unknown) {
      type ErrorResponse = {
        response: {
          data: {
            success: boolean;
            code: number;
            message: string;
            errorCode: string;
            timestamp: string;
          };
        };
      };
      const error = err as ErrorResponse;
      expect(error.response.data).toMatchObject({
        success: false,
        message: "Thông tin đăng nhập không đúng",
        errorCode: "INVALID_CREDENTIALS",
          timestamp: expect.any(String),
          });
      }
    });
  });
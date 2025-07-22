"use client";

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import LoginPage from "@/app/auth/Login/page";
import { Login_API } from "@/api/auth/Login_API";
import axiosClient from "@/api/axiosClient";
import { describe, it, expect, afterEach, jest } from "@jest/globals";
import {
  InputData,
  NoUserFoundResponse,
  SuccessResponse,
  WrongInputResponse,
} from "./Login_API.mock";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock react-redux
jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
}));

// Type definitions for mocked components
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  valuePropName?: string;
  htmlType?: string;
  loading?: boolean;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  htmlType?: string;
  valuePropName?: string;
  children: React.ReactNode;
}

interface TypographyTitleProps {
  children: React.ReactNode;
  [key: string]: unknown;
}

interface CardProps {
  children: React.ReactNode;
  [key: string]: unknown;
}

interface FormItemProps {
  children: React.ReactNode;
  valuePropName?: string;
  name?: string;
  rules?: unknown[];
  label?: string;
  [key: string]: unknown;
}

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onFinish?: () => void;
  children: React.ReactNode;
}

// Improved Ant Design mocks
jest.mock("antd", () => {
  // Helper function to filter out Ant Design specific props
  const filterAntdProps = (props: InputProps) => {
    const { valuePropName, htmlType, loading, children, ...validProps } = props;
    // These props are filtered out but not used in the mock
    void valuePropName;
    void htmlType;
    void loading;
    void children;
    return validProps;
  };

  // Input mock
  const Input = Object.assign(
    (props: InputProps) => {
      const validProps = filterAntdProps(props);
      return <input {...validProps} />;
    },
    {
      Password: (props: InputProps) => {
        const validProps = filterAntdProps(props);
        return <input type="password" {...validProps} />;
      },
    }
  );

  // Checkbox mock
  const Checkbox = (props: InputProps) => {
    const validProps = filterAntdProps(props);
    return <input type="checkbox" {...validProps} />;
  };

  // Button mock
  const Button = (props: ButtonProps) => {
    const { loading, htmlType, valuePropName, children, ...validProps } = props;
    // These props are filtered out but not used in the mock
    void loading;
    void htmlType;
    void valuePropName;
    return <button {...validProps}>{children}</button>;
  };

  // Typography mock
  const Typography = {
    Title: (props: TypographyTitleProps) => {
      const { children, ...validProps } = props;
      return <h2 {...validProps}>{children}</h2>;
    },
  };

  // Card mock
  const Card = (props: CardProps) => {
    const { children, ...validProps } = props;
    return <div {...validProps}>{children}</div>;
  };

  // Form.Item mock
  const FormItem = (props: FormItemProps) => {
    const { children, valuePropName, name, rules, label, ...validProps } =
      props;
    // These props are filtered out but not used in the mock
    void valuePropName;
    void name;
    void rules;
    return (
      <div {...validProps}>
        {label && <label>{label}</label>}
        {children}
      </div>
    );
  };

  // Form mock
  const useForm = () => [
    {
      getFieldDecorator: jest.fn(),
      getFieldsValue: jest.fn(),
      setFieldsValue: jest.fn(),
      validateFields: jest
        .fn<() => Promise<Record<string, unknown>>>()
        .mockResolvedValue({}),
      resetFields: jest.fn(),
      submit: jest.fn(),
    },
    jest.fn(),
  ];

  const Form = Object.assign(
    (props: FormProps) => {
      const { onFinish, children, ...validProps } = props;
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onFinish) onFinish();
      };
      return (
        <form {...validProps} onSubmit={handleSubmit}>
          {children}
        </form>
      );
    },
    {
      useForm,
      Item: FormItem,
    }
  );

  return {
    Input,
    Checkbox,
    Button,
    Typography,
    Card,
    Form,
    message: {
      error: jest.fn(),
      info: jest.fn(),
      success: jest.fn(),
    },
  };
});

// Login API Tests
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

// Login Component Tests
describe("LoginPage", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("renders the login form", () => {
    render(<LoginPage />);

    // Check for the heading (h2 element)
    expect(screen.getByRole("heading", { name: "Log In", level: 2 })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your username")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("submits the form with correct values", () => {
    render(<LoginPage />);

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const loginButton = screen.getByRole("button", { name: "Log In" });

    fireEvent.change(usernameInput, { target: { value: "admin1" } });
    fireEvent.change(passwordInput, { target: { value: "12345Aa@" } });
    fireEvent.click(loginButton);

    // Add assertions based on your component's behavior
    expect(usernameInput).toHaveValue("admin1");
    expect(passwordInput).toHaveValue("12345Aa@");
  });

  it("handles form validation", () => {
    render(<LoginPage />);

    const loginButton = screen.getByRole("button", { name: "Log In" });

    // Try to submit without filling fields
    fireEvent.click(loginButton);

    // Add assertions for validation behavior
  });

  it("handles remember me checkbox", () => {
    render(<LoginPage />);

    const rememberCheckbox = screen.getByRole("checkbox");

    expect(rememberCheckbox).not.toBeChecked();

    fireEvent.click(rememberCheckbox);

    expect(rememberCheckbox).toBeChecked();
  });
});

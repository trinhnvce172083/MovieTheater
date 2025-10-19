"use client";

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import RegisterPage from "@/app/auth/Register/page";
import { authApi } from "@/api/auth/Register_API";
import axiosClient from "@/api/axiosClient";
import { describe, it, expect, afterEach, jest, beforeEach } from "@jest/globals";
import {
  InputData,
  SuccessResponse,
  WrongInputResponse,
  ExistingUserResponse,
  EmailExistsResponse,
  ServerErrorResponse,
  ValidationErrors,
} from "./Register_API.mock";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
}));

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  valuePropName?: string;
  htmlType?: string;
  loading?: boolean;
  prefix?: React.ReactNode;
  placeholder?: string;
  size?: string;
  className?: string;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  htmlType?: string;
  valuePropName?: string;
  children: React.ReactNode;
  type?: string;
  size?: string;
  className?: string;
}

interface TypographyTitleProps {
  children: React.ReactNode;
  level?: number;
  className?: string;
  [key: string]: unknown;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

interface FormItemProps {
  children: React.ReactNode;
  valuePropName?: string;
  name?: string;
  rules?: unknown[];
  label?: string;
  className?: string;
  [key: string]: unknown;
}

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onFinish?: (values: any) => void;
  children: React.ReactNode;
  form?: any;
  layout?: string;
  autoComplete?: string;
  requiredMark?: boolean;
  className?: string;
}

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  format?: string;
  placeholder?: string;
  size?: string;
  className?: string;
  disabledDate?: (date: any) => boolean;
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  children?: React.ReactNode;
  [key: string]: unknown;
}

jest.mock("antd", () => {
  const filterAntdProps = (props: InputProps) => {
    const { valuePropName, htmlType, loading, children, prefix, size, className, ...validProps } = props;
    void valuePropName;
    void htmlType;
    void loading;
    void children;
    void prefix;
    void size;
    void className;
    return validProps;
  };

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
      TextArea: (props: InputProps) => {
        const validProps = filterAntdProps(props);
        return <textarea {...validProps} />;
      },
    }
  );

  const Checkbox = (props: CheckboxProps) => {
    const { children, ...validProps } = props;
    return (
      <label>
        <input type="checkbox" {...validProps} />
        {children}
      </label>
    );
  };

  const Button = (props: ButtonProps) => {
    const { loading, htmlType, valuePropName, children, type, size, className, ...validProps } = props;
    void loading;
    void htmlType;
    void valuePropName;
    void type;
    void size;
    void className;
    return <button {...validProps}>{children}</button>;
  };

  const Card = (props: CardProps) => {
    const { children, className, ...validProps } = props;
    void className;
    return <div {...validProps}>{children}</div>;
  };

  const FormItem = (props: FormItemProps) => {
    const { children, valuePropName, name, rules, label, className, ...validProps } = props;
    void valuePropName;
    void name;
    void rules;
    void label;
    void className;
    return <div {...validProps}>{children}</div>;
  };

  const Form = (props: FormProps) => {
    const { onFinish, children, form, layout, autoComplete, requiredMark, className, ...validProps } = props;
    void form;
    void layout;
    void autoComplete;
    void requiredMark;
    void className;
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onFinish) {
        const formData = new FormData(e.target as HTMLFormElement);
        const values: any = {};
        for (const [key, value] of formData.entries()) {
          values[key] = value;
        }
        onFinish(values);
      }
    };

    return <form {...validProps} onSubmit={handleSubmit}>{children}</form>;
  };

  const DatePicker = (props: DatePickerProps) => {
    const { format, placeholder, size, className, disabledDate, ...validProps } = props;
    void format;
    void placeholder;
    void size;
    void className;
    void disabledDate;
    return <input type="date" {...validProps} />;
  };

  const Typography = {
    Title: (props: TypographyTitleProps) => {
      const { children, level, className, ...validProps } = props;
      void level;
      void className;
      return <h1 {...validProps}>{children}</h1>;
    },
  };

  const useForm = () => [
    {
      getFieldValue: jest.fn(),
      setFieldsValue: jest.fn(),
      validateFields: jest.fn(),
      resetFields: jest.fn(),
    },
  ];

  return {
    Input,
    Button,
    Card,
    Form,
    FormItem,
    DatePicker,
    Checkbox,
    Typography,
    useForm,
  };
});

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className, ...props }: any) => {
    void className;
    return <div {...props}>{children}</div>;
  },
}));

jest.mock("@/lib/utils", () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

jest.mock("dayjs", () => {
  const mockDayjs = (date: any) => ({
    format: (format: string) => {
      if (format === "YYYY-MM-DD") {
        return "1990-01-01";
      }
      return date;
    },
    isAfter: () => false,
    isBefore: () => false,
    isSame: () => true,
  });
  
  mockDayjs.extend = jest.fn();
  return mockDayjs;
});

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/api/auth/Register_API", () => ({
  authApi: {
    register: jest.fn(),
  },
}));

jest.mock("@/api/axiosClient", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

describe("RegisterPage", () => {
  const mockRouter = { push: jest.fn() };
  const mockToast = require("react-toastify").toast;
  const mockAuthApi = require("@/api/auth/Register_API").authApi;
  const mockAxiosClient = require("@/api/axiosClient").default;

  beforeEach(() => {
    jest.clearAllMocks();
    require("next/navigation").useRouter.mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Form Validation", () => {
    it("should show validation errors for empty required fields", async () => {
      render(<RegisterPage />);

      const submitButton = screen.getByText("Save password");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Please enter your full name!")).toBeInTheDocument();
        expect(screen.getByText("Please select your date of birth!")).toBeInTheDocument();
        expect(screen.getByText("Please enter your phone number!")).toBeInTheDocument();
        expect(screen.getByText("Please enter your email!")).toBeInTheDocument();
        expect(screen.getByText("Please enter your username!")).toBeInTheDocument();
        expect(screen.getByText("Please enter your password!")).toBeInTheDocument();
        expect(screen.getByText("Please confirm your password!")).toBeInTheDocument();
        expect(screen.getByText("Bạn phải đồng ý với điều khoản dịch vụ!")).toBeInTheDocument();
      });
    });

    it("should validate email format", async () => {
      render(<RegisterPage />);

      const emailInput = screen.getByPlaceholderText("Email");
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText("Invalid email!")).toBeInTheDocument();
      });
    });

    it("should validate password length", async () => {
      render(<RegisterPage />);

      const passwordInput = screen.getByPlaceholderText("Password");
      fireEvent.change(passwordInput, { target: { value: "123" } });
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText("Password must be at least 6 characters!")).toBeInTheDocument();
      });
    });

    it("should validate password confirmation", async () => {
      render(<RegisterPage />);

      const passwordInput = screen.getByPlaceholderText("Password");
      const confirmInput = screen.getByPlaceholderText("Confirm Password");
      
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmInput, { target: { value: "different" } });
      fireEvent.blur(confirmInput);

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match!")).toBeInTheDocument();
      });
    });
  });

  describe("Tab Navigation", () => {
    it("should switch between Personal Information and Account tabs", () => {
      render(<RegisterPage />);

      const accountTab = screen.getByText("Account");
      fireEvent.click(accountTab);

      expect(accountTab).toHaveClass("bg-white");
    });

    it("should show Personal Information tab by default", () => {
      render(<RegisterPage />);

      const personalInfoTab = screen.getByText("Personal Information");
      expect(personalInfoTab).toHaveClass("bg-white");
    });
  });

  describe("Form Submission", () => {
    it("should submit form with valid data successfully", async () => {
      mockAuthApi.register.mockResolvedValue(SuccessResponse);

      render(<RegisterPage />);

      const fullNameInput = screen.getByPlaceholderText("Full Name");
      const emailInput = screen.getByPlaceholderText("Email");
      const phoneInput = screen.getByPlaceholderText("Phone Number");
      const addressInput = screen.getByPlaceholderText("Enter your address");

      fireEvent.change(fullNameInput, { target: { value: InputData.validRegisterData.fullName } });
      fireEvent.change(emailInput, { target: { value: InputData.validRegisterData.email } });
      fireEvent.change(phoneInput, { target: { value: InputData.validRegisterData.phoneNumber } });
      fireEvent.change(addressInput, { target: { value: InputData.validRegisterData.address } });

      const accountTab = screen.getByText("Account");
      fireEvent.click(accountTab);

      const usernameInput = screen.getByPlaceholderText("Username");
      const passwordInput = screen.getByPlaceholderText("Password");
      const confirmInput = screen.getByPlaceholderText("Confirm Password");
      const termsCheckbox = screen.getByText("I agree to the Terms of Service");

      fireEvent.change(usernameInput, { target: { value: InputData.validRegisterData.username } });
      fireEvent.change(passwordInput, { target: { value: InputData.validRegisterData.password } });
      fireEvent.change(confirmInput, { target: { value: InputData.validRegisterData.confirmPassword } });
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByText("Save password");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAuthApi.register).toHaveBeenCalledWith({
          username: InputData.validRegisterData.username,
          fullName: InputData.validRegisterData.fullName,
          email: InputData.validRegisterData.email,
          password: InputData.validRegisterData.password,
          confirmPassword: InputData.validRegisterData.confirmPassword,
          phoneNumber: InputData.validRegisterData.phoneNumber,
          dateOfBirth: "1990-01-01",
          address: InputData.validRegisterData.address,
          agreeToTerms: true,
          acceptMarketing: false,
          role: "MEMBER",
        });
      });

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(SuccessResponse.message);
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/auth/Login");
      }, { timeout: 2000 });
    });

    it("should handle API error for existing username", async () => {
      const error = new Error(ExistingUserResponse.message);
      mockAuthApi.register.mockRejectedValue(error);

      render(<RegisterPage />);

      const fullNameInput = screen.getByPlaceholderText("Full Name");
      const emailInput = screen.getByPlaceholderText("Email");
      const phoneInput = screen.getByPlaceholderText("Phone Number");

      fireEvent.change(fullNameInput, { target: { value: InputData.existingUserData.fullName } });
      fireEvent.change(emailInput, { target: { value: InputData.existingUserData.email } });
      fireEvent.change(phoneInput, { target: { value: InputData.existingUserData.phoneNumber } });

      const accountTab = screen.getByText("Account");
      fireEvent.click(accountTab);

      const usernameInput = screen.getByPlaceholderText("Username");
      const passwordInput = screen.getByPlaceholderText("Password");
      const confirmInput = screen.getByPlaceholderText("Confirm Password");
      const termsCheckbox = screen.getByText("I agree to the Terms of Service");

      fireEvent.change(usernameInput, { target: { value: InputData.existingUserData.username } });
      fireEvent.change(passwordInput, { target: { value: InputData.existingUserData.password } });
      fireEvent.change(confirmInput, { target: { value: InputData.existingUserData.confirmPassword } });
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByText("Save password");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(ExistingUserResponse.message);
      });
    });

    it("should handle API error for existing email", async () => {
      const error = new Error(EmailExistsResponse.message);
      mockAuthApi.register.mockRejectedValue(error);

      render(<RegisterPage />);

      const fullNameInput = screen.getByPlaceholderText("Full Name");
      const emailInput = screen.getByPlaceholderText("Email");
      const phoneInput = screen.getByPlaceholderText("Phone Number");

      fireEvent.change(fullNameInput, { target: { value: InputData.validRegisterData.fullName } });
      fireEvent.change(emailInput, { target: { value: "existing@example.com" } });
      fireEvent.change(phoneInput, { target: { value: InputData.validRegisterData.phoneNumber } });

      const accountTab = screen.getByText("Account");
      fireEvent.click(accountTab);

      const usernameInput = screen.getByPlaceholderText("Username");
      const passwordInput = screen.getByPlaceholderText("Password");
      const confirmInput = screen.getByPlaceholderText("Confirm Password");
      const termsCheckbox = screen.getByText("I agree to the Terms of Service");

      fireEvent.change(usernameInput, { target: { value: InputData.validRegisterData.username } });
      fireEvent.change(passwordInput, { target: { value: InputData.validRegisterData.password } });
      fireEvent.change(confirmInput, { target: { value: InputData.validRegisterData.confirmPassword } });
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByText("Save password");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(EmailExistsResponse.message);
      });
    });

    it("should handle server error", async () => {
      const error = new Error(ServerErrorResponse.message);
      mockAuthApi.register.mockRejectedValue(error);

      render(<RegisterPage />);

      const fullNameInput = screen.getByPlaceholderText("Full Name");
      const emailInput = screen.getByPlaceholderText("Email");
      const phoneInput = screen.getByPlaceholderText("Phone Number");

      fireEvent.change(fullNameInput, { target: { value: InputData.validRegisterData.fullName } });
      fireEvent.change(emailInput, { target: { value: InputData.validRegisterData.email } });
      fireEvent.change(phoneInput, { target: { value: InputData.validRegisterData.phoneNumber } });

      const accountTab = screen.getByText("Account");
      fireEvent.click(accountTab);

      const usernameInput = screen.getByPlaceholderText("Username");
      const passwordInput = screen.getByPlaceholderText("Password");
      const confirmInput = screen.getByPlaceholderText("Confirm Password");
      const termsCheckbox = screen.getByText("I agree to the Terms of Service");

      fireEvent.change(usernameInput, { target: { value: InputData.validRegisterData.username } });
      fireEvent.change(passwordInput, { target: { value: InputData.validRegisterData.password } });
      fireEvent.change(confirmInput, { target: { value: InputData.validRegisterData.confirmPassword } });
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByText("Save password");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(ServerErrorResponse.message);
      });
    });

    it("should handle unknown error", async () => {
      const error = "Unknown error occurred";
      mockAuthApi.register.mockRejectedValue(error);

      render(<RegisterPage />);

      const fullNameInput = screen.getByPlaceholderText("Full Name");
      const emailInput = screen.getByPlaceholderText("Email");
      const phoneInput = screen.getByPlaceholderText("Phone Number");

      fireEvent.change(fullNameInput, { target: { value: InputData.validRegisterData.fullName } });
      fireEvent.change(emailInput, { target: { value: InputData.validRegisterData.email } });
      fireEvent.change(phoneInput, { target: { value: InputData.validRegisterData.phoneNumber } });

      const accountTab = screen.getByText("Account");
      fireEvent.click(accountTab);

      const usernameInput = screen.getByPlaceholderText("Username");
      const passwordInput = screen.getByPlaceholderText("Password");
      const confirmInput = screen.getByPlaceholderText("Confirm Password");
      const termsCheckbox = screen.getByText("I agree to the Terms of Service");

      fireEvent.change(usernameInput, { target: { value: InputData.validRegisterData.username } });
      fireEvent.change(passwordInput, { target: { value: InputData.validRegisterData.password } });
      fireEvent.change(confirmInput, { target: { value: InputData.validRegisterData.confirmPassword } });
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByText("Save password");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Registration failed. Please try again!");
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading state during form submission", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockAuthApi.register.mockReturnValue(promise);

      render(<RegisterPage />);

      const fullNameInput = screen.getByPlaceholderText("Full Name");
      const emailInput = screen.getByPlaceholderText("Email");
      const phoneInput = screen.getByPlaceholderText("Phone Number");

      fireEvent.change(fullNameInput, { target: { value: InputData.validRegisterData.fullName } });
      fireEvent.change(emailInput, { target: { value: InputData.validRegisterData.email } });
      fireEvent.change(phoneInput, { target: { value: InputData.validRegisterData.phoneNumber } });

      const accountTab = screen.getByText("Account");
      fireEvent.click(accountTab);

      const usernameInput = screen.getByPlaceholderText("Username");
      const passwordInput = screen.getByPlaceholderText("Password");
      const confirmInput = screen.getByPlaceholderText("Confirm Password");
      const termsCheckbox = screen.getByText("I agree to the Terms of Service");

      fireEvent.change(usernameInput, { target: { value: InputData.validRegisterData.username } });
      fireEvent.change(passwordInput, { target: { value: InputData.validRegisterData.password } });
      fireEvent.change(confirmInput, { target: { value: InputData.validRegisterData.confirmPassword } });
      fireEvent.click(termsCheckbox);

      const submitButton = screen.getByText("Save password");
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();

      resolvePromise!(SuccessResponse);

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("UI Elements", () => {
    it("should render all form fields", () => {
      render(<RegisterPage />);

      expect(screen.getByText("Register")).toBeInTheDocument();
      expect(screen.getByText("Personal Information")).toBeInTheDocument();
      expect(screen.getByText("Account")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Phone Number")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter your address")).toBeInTheDocument();
    });

    it("should render account tab fields when clicked", () => {
      render(<RegisterPage />);

      const accountTab = screen.getByText("Account");
      fireEvent.click(accountTab);

      expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
      expect(screen.getByText("I agree to the Terms of Service")).toBeInTheDocument();
      expect(screen.getByText("I want to receive marketing emails")).toBeInTheDocument();
      expect(screen.getByText("Save password")).toBeInTheDocument();
    });

    it("should render links to terms and login", () => {
      render(<RegisterPage />);

      expect(screen.getByText("Terms of Service")).toBeInTheDocument();
      expect(screen.getByText("Login")).toBeInTheDocument();
    });
  });
}); 
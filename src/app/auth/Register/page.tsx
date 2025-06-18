"use client";
import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  DatePicker,
  Typography,
  Checkbox,
} from "antd";
import { Card } from "@/components/ui/card";
import {
  UserOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { authApi, RegisterRequest } from "@/api/auth";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { toast } from "react-toastify";

type TabsProps = {
  tabs: string[];
  current: 0 | 1;
  onChange: (idx: 0 | 1) => void;
};

function Tabs({ tabs, current, onChange }: TabsProps) {
  return (
    <div className="mb-0">
      <div className="flex gap-2 mb-0">
        {tabs.map((tab, idx) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 ${
              current === idx
                ? "bg-white !text-[#000000] shadow-sm"
                : "bg-gray-100 !text-[#000000] hover:bg-gray-200"
            }`}
            onClick={() => onChange(idx as 0 | 1)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

interface RegisterFormValues {
  fullname: string;
  dob: string;
  identity: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  confirm: string;
  address: string;
  agreeToTerms: boolean;
  acceptMarketing: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<0 | 1>(0);
  const [form] = Form.useForm();

  const handleTabChange = (idx: 0 | 1) => {
    setTab(idx);
  };

  const onFinish = async (values: RegisterFormValues) => {
    console.log("Values received in onFinish:", values);
    try {
      setLoading(true);

      const registerData: RegisterRequest = {
        username: values.username,
        fullName: values.fullname,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirm,
        phoneNumber: values.phone,
        dateOfBirth: dayjs(values.dob).format("YYYY-MM-DD"),
        address: values.address || "",
        agreeToTerms: values.agreeToTerms || false,
        acceptMarketing: values.acceptMarketing || false,
      };

      console.log("Sending register data:", registerData);
      const response = await authApi.register(registerData);
      console.log("Register response:", response);

      if (response) {
        toast.success("Registration successful! Please log in to continue.");
        setTimeout(() => {
          router.push("/auth/Login");
        }, 1500);
      }
    } catch (errorInfo: unknown) {
      console.error("Register error:", errorInfo);
      if (errorInfo instanceof AxiosError) {
        const errorMessage =
          errorInfo.response?.data?.message ||
          "Registration failed. Please try again!";
        toast.error(errorMessage);
      } else if (
        typeof errorInfo === "object" &&
        errorInfo !== null &&
        "errorFields" in errorInfo
      ) {
        (errorInfo as { errorFields: { errors: string[] }[] }).errorFields.forEach(field => {
          field.errors.forEach(err => toast.error(err));
        });
      } else {
        toast.error("Registration failed. Please try again!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Card
        className={cn(
          "w-full max-w-md shadow-lg p-8 bg-white/60 backdrop-blur-sm rounded-2xl"
        )}
      >
        <div className="flex flex-col items-center mb-0">
          <Typography.Title level={4} className="text-white mb-0">
            Register
          </Typography.Title>
        </div>
        <Tabs
          tabs={["Personal Information", "Account"]}
          current={tab}
          onChange={handleTabChange}
        />
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
          className="flex-grow"
        >
          <div className="relative">
            <div
              className={cn(
                "w-full transition-all duration-300",
                tab === 0
                  ? "opacity-100 relative translate-x-0"
                  : "opacity-0 absolute top-0 left-0 -translate-x-full pointer-events-none"
              )}
            >
              <div className="flex gap-4">
                <Form.Item
                  label="Full Name"
                  name="fullname"
                  className="flex-1 !mb-0"
                  rules={[
                    { required: true, message: "Please enter your full name!" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Full Name"
                    size="large"
                    className="border-2 border-white focus:border-purple-500"
                  />
                </Form.Item>
              </div>
              <div className="flex gap-4">
                <Form.Item
                  label="Date of Birth"
                  name="dob"
                  className="flex-1 !mb-0"
                  rules={[
                    {
                      required: true,
                      message: "Please select your date of birth!",
                    },
                  ]}
                >
                  <DatePicker
                    format="DD-MM-YYYY"
                    placeholder="DD-MM-YYYY"
                    size="large"
                    className="w-full"
                    disabledDate={(d) => d && d > dayjs()}
                  />
                </Form.Item>
                <Form.Item
                  label="ID Card"
                  name="identity"
                  className="flex-1 !mb-0"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your ID card number!",
                    },
                  ]}
                >
                  <Input
                    prefix={<IdcardOutlined />}
                    placeholder="ID Card"
                    size="large"
                    className="border-2 border-white focus:border-purple-500"
                  />
                </Form.Item>
              </div>
              <Form.Item
                label="Phone Number"
                name="phone"
                className="!mb-0"
                rules={[
                  {
                    required: true,
                    message: "Please enter your phone number!",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Phone Number"
                  size="large"
                  className="border-2 border-white focus:border-purple-500"
                />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                className="!mb-0"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Invalid email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email"
                  size="large"
                  className="border-2 border-white focus:border-purple-500"
                />
              </Form.Item>
              <Form.Item label="Address" name="address" className="!mb-0">
                <Input.TextArea
                  placeholder="Enter your address"
                  size="large"
                  className="border-2 border-white focus:border-purple-500"
                  rows={3}
                />
              </Form.Item>
              <Form.Item className="mt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full mt-2 bg-gradient-to-r from-purple-500 to-orange-400 text-white font-semibold"
                  size="large"
                  loading={loading}
                >
                  Save changes
                </Button>
              </Form.Item>
            </div>
            <div
              className={cn(
                "w-full transition-all duration-300",
                tab === 1
                  ? "opacity-100 relative translate-x-0"
                  : "opacity-0 absolute top-0 left-0 translate-x-full pointer-events-none"
              )}
            >
              <Form.Item
                label="Username"
                name="username"
                className="!mb-0"
                rules={[
                  { required: true, message: "Please enter your username!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Username"
                  size="large"
                  className="border-2 border-white focus:border-purple-500"
                />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                className="!mb-0"
                rules={[
                  { required: true, message: "Please enter your password!" },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters!",
                  },
                ]}
                extra={
                  <span className="text-xs text-gray-400">
                    Minimum length is 6 characters.
                  </span>
                }
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  size="large"
                  className="border-2 border-white focus:border-purple-500"
                />
              </Form.Item>
              <Form.Item
                label="Confirm Password"
                name="confirm"
                className="!mb-0"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm Password"
                  size="large"
                  className="border-2 border-white focus:border-purple-600"
                />
              </Form.Item>
              <Form.Item
                name="agreeToTerms"
                valuePropName="checked"
                className="!mb-0"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Bạn phải đồng ý với điều khoản dịch vụ!")
                          ),
                  },
                ]}
              >
                <Checkbox>I agree to the Terms of Service</Checkbox>
              </Form.Item>
              <Form.Item name="acceptMarketing" valuePropName="checked" className="!mb-0">
                <Checkbox>I want to receive marketing emails</Checkbox>
              </Form.Item>
              <Form.Item className="mt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full mt-2 bg-gradient-to-r from-purple-500 to-orange-400 text-white font-semibold"
                  size="large"
                  loading={loading}
                >
                  Save password
                </Button>
              </Form.Item>
            </div>
          </div>
        </Form>
        <div className="mt-2 text-xs text-gray-600 text-center">
          By creating an account, you agree to the{" "}
          <a href="#" className="underline text-white">
            Terms of Service
          </a>
          .
        </div>
        <div className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/auth/Login" className="text-yellow-400 hover:underline">
            Login
          </a>
        </div>
      </Card>
    </div>
  );
}

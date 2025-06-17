"use client";
import React, { useState } from "react";
import { Button, Form, Input, Typography, message, Checkbox } from "antd";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";
import { Login_API } from "@/api/auth/Login_API";
import { useDispatch } from "react-redux";
import { login } from "@/store/authSlice";
import { decodeJwt } from "@/hooks/decodeJwt";
import nookies from "nookies";
import { LoginFormValues } from "@/types/Login/LoginFormValues";

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useDispatch();

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      const data = await Login_API({
        username: values.username,
        password: values.password,
        rememberMe: values.rememberMe || false,
      });

      // localStorage.removeItem("authToken");
      const accessToken = data?.data?.accessToken;
      if (accessToken) {
        // Store access token in cookies for SSR compatibility
        sessionStorage.setItem("accessToken", accessToken);
        const userInfo = decodeJwt(accessToken);
        dispatch(login({ token: accessToken, user: userInfo }));
        message.success("Login successful");
        sessionStorage.setItem("userInfo", JSON.stringify(userInfo));

        // Redirect based on user role
        if (userInfo?.role === "MEMBER") {
          router.push(ROUTES.HOME);
        } else if (userInfo?.role === "ADMIN") {
          router.push(ROUTES.ADMIN_DASHBOARD);
        }
        //  else if (userInfo?.role === "EMPLOYEE") {
        //   router.push(ROUTES.EMPLOYEE_HOME);
        // }
      } else {
        message.error(data?.message || "Login failed");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error(
          "Connection error. Please check your internet connection."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row items-center justify-center p-18">
      <Card
        className={cn(
          "w-full max-w-md shadow-lg p-8 bg-white/60 backdrop-blur-sm"
        )}
      >
        <Typography.Title level={2} className="text-center mb-6">
          Login
        </Typography.Title>
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          form={form}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input size="large" placeholder="Enter your username" className="rounded-lg" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              size="large"
              placeholder="Enter your password"
              className="rounded-lg"
            />
          </Form.Item>
          <Form.Item name="rememberMe" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full mt-2"
              size="large"
              loading={loading}
            >
              Log In
            </Button>
          </Form.Item>
        </Form>
        <div className="mt-4 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <a href="/auth/Register" className="text-indigo-600 hover:underline">
            Sign up
          </a>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;

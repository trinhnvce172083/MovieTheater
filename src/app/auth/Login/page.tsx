"use client";
import React, { useState } from "react";
import { Button, Form, Input, Typography, message } from "antd";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";
import Link from "next/link";

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const { username, password } = values;

      const response = await fetch(
        "https://60f9a8f9-7d5e-4e39-9668-2ee29759c786.mock.pstmn.io/Login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
          credentials: "include", // Send cookies if needed
        }
      );

      // Parse the JSON response
      const data = await response.json().catch(() => null);

      if (response.ok) {
        // Store auth token if received
        if (data?.token) {
          localStorage.setItem("authToken", data.token);
        }

        message.success("Login successful");
        router.push(ROUTES.BOOKING);
      } else {
        // Handle specific error codes
        if (response.status === 401) {
          message.error("Invalid username or password");
        } else if (response.status === 429) {
          message.error("Too many login attempts. Please try again later.");
        } else {
          message.error(data?.message || "Login failed");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error("Connection error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className={cn("w-full max-w-md shadow-lg p-8 bg-white/60 backdrop-blur-sm")}>
        <Typography.Title level={2} className="text-center mb-6">
          Login
        </Typography.Title>
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input
              size="large"
              placeholder="Enter your username"
              className="rounded-lg"
            />
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
          <a href="/register" className="text-indigo-600 hover:underline">
            Sign up
          </a>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;

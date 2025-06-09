"use client";

import React, { useState } from "react";
import { Button, Form, Input, Typography, message } from "antd";
import { Card } from "@/components/ui/card"; // shadcn/ui Card
import { cn } from "@/lib/utils"; // shadcn/ui utility (optional)
import "antd/dist/reset.css";

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (values.username === "user" && values.password === "password") {
        message.success("Login successful!");
        // Navigate to booking page or dashboard
      } else {
        message.error("Invalid username or password");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-pink-50">
      <Card className={cn("w-full max-w-md shadow-lg p-8")}>
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

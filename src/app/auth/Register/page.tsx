"use client";

import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  DatePicker,
  Radio,
  Typography,
  message,
  Card,
} from "antd";
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
import Image from "next/image";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success("Đăng ký thành công!");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#23234b] to-[#0f0f1c]">
      <Card
        className={cn(
          "w-full max-w-md shadow-lg p-8 bg-black bg-opacity-60 rounded-2xl"
        )}
      >
        <div className="flex flex-col items-center mb-6">
          <Typography.Title level={4} className="text-white mb-2">
            Register with:
          </Typography.Title>
          <div className="flex w-full gap-4 mb-2">
            <Button
              className="flex-1"
              icon={<Image src="/google.svg" alt="Google" width={20} height={20} />}
              size="large"
            >
              Google
            </Button>
            <Button
              className="flex-1"
              icon={<Image src="/2023_Facebook_icon.svg" alt="Facebook" width={20} height={20} />}
              size="large"
            >
              Facebook
            </Button>
          </div>
          <div className="w-full flex items-center my-2">
            <div className="flex-1 h-px bg-gray-600" />
            <span className="mx-2 text-gray-400">Or</span>
            <div className="flex-1 h-px bg-gray-600" />
          </div>
        </div>
        <Form
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          <div className="flex gap-4">
            <Form.Item
              label="Full Name"
              name="fullname"
              className="flex-1"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Full Name"
                size="large"
                className="border-2 border-white focus:border-purple-500"
              />
            </Form.Item>
            <Form.Item
              label="Sex"
              name="sex"
              className="flex-1"
              rules={[{ required: true, message: "Chọn giới tính!" }]}
            >
              <Radio.Group className="flex gap-2">
                <Radio.Button value="male">Male</Radio.Button>
                <Radio.Button value="female">Female</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </div>
          <div className="flex gap-4">
            <Form.Item
              label="Date of Birth"
              name="dob"
              className="flex-1"
              rules={[{ required: true, message: "Chọn ngày sinh!" }]}
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
              label="Identity Card"
              name="identity"
              className="flex-1"
              rules={[{ required: true, message: "Nhập số CMND/CCCD!" }]}
            >
              <Input
                prefix={<IdcardOutlined />}
                placeholder="Identity Card"
                size="large"
                className="border-2 border-white focus:border-purple-500"
              />
            </Form.Item>
          </div>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Nhập tên đăng nhập!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
              className="border-2 border-white focus:border-purple-500"
            />
          </Form.Item>
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[{ required: true, message: "Nhập số điện thoại!" }]}
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
            rules={[
              { required: true, message: "Nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
              className="border-2 border-white focus:border-purple-500"
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
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
            dependencies={["password"]}
            rules={[
              { required: true, message: "Nhập lại mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              size="large"
              className="border-2 border-white focus:border-purple-500"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full mt-2 bg-gradient-to-r from-purple-500 to-orange-400 text-white font-semibold"
              size="large"
              loading={loading}
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>
        <div className="mt-2 text-xs text-gray-400 text-center">
          By creating an account, you agree to the{" "}
          <a href="#" className="underline text-white">
            Terms of Service
          </a>
          .
        </div>
        <div className="mt-2 text-center text-sm text-gray-300">
          Already have an account?{" "}
          <a href="/login" className="text-yellow-400 hover:underline">
            Login
          </a>
        </div>
      </Card>
    </div>
  );
}

  "use client";
import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  DatePicker,
  Typography,
  message,
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

type TabsProps = {
  tabs: string[];
  current: 0 | 1;
  onChange: (idx: 0 | 1) => void;
};

function Tabs({ tabs, current, onChange }: TabsProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-4">
        {tabs.map((tab, idx) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 ${
              current === idx 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
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
  sex: string | null;
  dob: string;
  identity: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  confirm: string;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<0 | 1>(0);
  const [gender, setGender] = useState<string | null>(null);

  const handleTabChange = (idx: 0 | 1) => {
    setTab(idx);
  };

  const onFinish = (values: RegisterFormValues) => {
    values.sex = gender;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success("Đăng ký thành công!");
    }, 1200);
  };

  return (
    <div className="flex items-center justify-center">
      <Card
        className={cn(
          "w-full max-w-md shadow-lg p-8 bg-white/60 backdrop-blur-sm rounded-2xl"
        )}
      >
        <div className="flex flex-col items-center mb-6">
          <Typography.Title level={4} className="text-white mb-2">
            Register
          </Typography.Title>
        </div>
        <Tabs
          tabs={["Personal Information", "Account"]}
          current={tab}
          onChange={handleTabChange}
        />
        <Form
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
          className="flex-grow"
        >
          <div className={`w-full transition-opacity duration-300 ${tab === 0 ? 'opacity-100' : 'hidden pointer-events-none'}`}>
            {tab === 0 && (
              <>
                <div className="flex gap-4">
                  <Form.Item label="Full Name" name="fullname" className="flex-1" rules={[{ required: true, message: "Please enter your full name!" }]}>
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Full Name"
                      size="large"
                      className="border-2 border-white focus:border-purple-500"
                    />
                  </Form.Item>
                  <Form.Item label="Gender" name="sex" className="flex-1" rules={[{ required: true, message: "Please select your gender!" }]}>
                    <div className="flex gap-2 w-full h-16">
                      <button
                        type="button"
                        className={`flex-1 h-10 border-2 rounded-lg text-base flex items-center justify-center px-4 transition-colors duration-200 ${gender === 'male' ? 'border-purple-500 bg-gray-100 text-[#2563eb]' : 'border-white bg-white text-gray-500'}`}
                        onClick={() => setGender('male')}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        className={`flex-1 h-10 border-2 rounded-lg text-base flex items-center justify-center px-4 transition-colors duration-200 ${gender === 'female' ? 'border-purple-500 bg-gray-100 text-[#2563eb]' : 'border-white bg-white text-gray-500'}`}
                        onClick={() => setGender('female')}
                      >
                        Female
                      </button>
                    </div>
                  </Form.Item>
                </div>
                <div className="flex gap-4">
                  <Form.Item label="Date of Birth" name="dob" className="flex-1" rules={[{ required: true, message: "Please select your date of birth!" }]}>
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="DD-MM-YYYY"
                      size="large"
                      className="w-full"
                      disabledDate={(d) => d && d > dayjs()}
                    />
                  </Form.Item>
                  <Form.Item label="ID Card" name="identity" className="flex-1" rules={[{ required: true, message: "Please enter your ID card number!" }]}>
                    <Input
                      prefix={<IdcardOutlined />}
                      placeholder="ID Card"
                      size="large"
                      className="border-2 border-white focus:border-purple-500"
                    />
                  </Form.Item>
                </div>
                <Form.Item label="Phone Number" name="phone" rules={[{ required: true, message: "Please enter your phone number!" }]}>
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Phone Number"
                    size="large"
                    className="border-2 border-white focus:border-purple-500"
                  />
                </Form.Item>
                <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter your email!" }, { type: "email", message: "Invalid email!" }]}>
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    size="large"
                    className="border-2 border-white focus:border-purple-500"
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
              </>
            )}
          </div>
          <div className={`w-full transition-opacity duration-300 ${tab === 1 ? 'opacity-100' : 'hidden pointer-events-none'}`}>
            {tab === 1 && (
              <>
                <Form.Item label="Username" name="username" rules={[{ required: true, message: "Please enter your username!" }]}>
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Username"
                    size="large"
                    className="border-2 border-white focus:border-purple-500"
                  />
                </Form.Item>
                <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please enter your password!" }, { min: 6, message: "Password must be at least 6 characters!" }]} extra={<span className="text-xs text-gray-400">Minimum length is 6 characters.</span>}>
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    size="large"
                    className="border-2 border-white focus:border-purple-500"
                  />
                </Form.Item>
                <Form.Item label="Confirm Password" name="confirm" dependencies={["password"]} rules={[{ required: true, message: "Please confirm your password!" }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue("password") === value) { return Promise.resolve(); } return Promise.reject(new Error("Passwords do not match!")); }, }), ]}>
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm Password"
                    size="large"
                    className="border-2 border-white focus:border-purple-600"
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
                    Save password
                  </Button>
                </Form.Item>
              </>
            )}
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

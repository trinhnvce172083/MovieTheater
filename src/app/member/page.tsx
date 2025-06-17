"use client";

import React, { useState } from "react";
import { Button, Form, Input, Typography, message, Alert } from "antd";
import { MemberCard } from "@/components/member";

interface UserProfile {
  account: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
  sex: string;
  phoneNumber: string;
  address: string;
}

const AccountInformation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [form] = Form.useForm();

  // Mock user data - thực tế sẽ lấy từ API hoặc context
  const [userProfile, setUserProfile] = useState<UserProfile>({
    account: "Alexa123",
    password: "********",
    fullName: "Alexa Rawles",
    dateOfBirth: "25/05/1997",
    sex: "Female",
    phoneNumber: "0962626862",
    address: "District 9"
  });

  const user = {
    name: "Alexa Rawles",
    email: "alexarawles@gmail.com",
    avatar: "/user-avatar.jpg",
    points: 9999
  };

  const onFinish = (values: UserProfile) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setUserProfile(values);
      setHasChanges(false);
      message.success("Profile updated successfully!");
      console.log("Updated profile:", values);
    }, 1000);
  };

  const handleReset = () => {
    form.resetFields();
    setHasChanges(false);
    message.info("Form has been reset to original values");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Title */}
      <Typography.Title level={2} className="text-white mb-8 text-center">
        Account Information
      </Typography.Title>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          {/* User Avatar and Info using MemberCard component */}
          <MemberCard
            name={user.name}
            email={user.email}
            avatar={user.avatar}
            points={user.points}
          />
          
          {/* Current Profile Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Typography.Title level={5} className="mb-3 text-blue-800">
              Current Profile Information
            </Typography.Title>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Account:</span>
                <div className="font-medium">{userProfile.account}</div>
              </div>
              <div>
                <span className="text-gray-600">Full Name:</span>
                <div className="font-medium">{userProfile.fullName}</div>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <div className="font-medium">{userProfile.phoneNumber}</div>
              </div>
              <div>
                <span className="text-gray-600">Date of Birth:</span>
                <div className="font-medium">{userProfile.dateOfBirth}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-gray-50 rounded-xl p-6">
          <Typography.Title level={4} className="mb-2">
            Edit profile
          </Typography.Title>
          <Typography.Text type="secondary" className="block mb-4">
            Make changes to your profile here. Click save when you&lsquo;re done.
          </Typography.Text>
          
          {hasChanges && (
            <Alert
              message="You have unsaved changes"
              description="Don't forget to save your changes before leaving this page."
              type="warning"
              showIcon
              className="mb-4"
            />
          )}

          <Form
            form={form}
            layout="vertical"
            initialValues={userProfile}
            onFinish={onFinish}
            onValuesChange={() => {
              const currentValues = form.getFieldsValue();
              const hasAnyChanges = Object.keys(currentValues).some(
                key => currentValues[key] !== userProfile[key as keyof UserProfile]
              );
              setHasChanges(hasAnyChanges);
            }}
            className="max-w-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                label="Account"
                name="account"
                rules={[
                  { required: true, message: "Please input your account!" },
                  { min: 3, message: "Account must be at least 3 characters!" }
                ]}
              >
                <Input 
                  size="large"
                  placeholder="Enter your account"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                  { min: 6, message: "Password must be at least 6 characters!" }
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Enter your password"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label="Full name"
                name="fullName"
                rules={[
                  { required: true, message: "Please input your full name!" },
                  { min: 2, message: "Full name must be at least 2 characters!" }
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter your full name"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label="Date of Birth"
                name="dateOfBirth"
                rules={[
                  { required: true, message: "Please input your date of birth!" },
                  { pattern: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/, message: "Please enter valid date (DD/MM/YYYY)!" }
                ]}
              >
                <Input
                  size="large"
                  placeholder="DD/MM/YYYY"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label="Sex"
                name="sex"
                rules={[{ required: true, message: "Please select your sex!" }]}
              >
                <Input
                  size="large"
                  placeholder="Male, Female, Other"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label="Phone Number"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Please input your phone number!" },
                  { pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/, message: "Please enter a valid Vietnamese phone number!" }
                ]}
              >
                <Input
                  size="large"
                  placeholder="0xxxxxxxxx"
                  className="rounded-lg"
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Address"
              name="address"
              rules={[
                { required: true, message: "Please input your address!" },
                { min: 5, message: "Address must be at least 5 characters!" }
              ]}
              className="mt-4"
            >
              <Input.TextArea
                size="large"
                placeholder="Enter your full address"
                className="rounded-lg"
                rows={3}
              />
            </Form.Item>

            <Form.Item className="mb-0 mt-6">
              <div className="flex gap-3">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 rounded-lg px-8"
                >
                  Save changes
                </Button>
                <Button
                  type="default"
                  size="large"
                  onClick={handleReset}
                  className="rounded-lg px-6"
                >
                  Reset
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AccountInformation;

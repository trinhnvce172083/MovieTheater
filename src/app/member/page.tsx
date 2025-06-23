"use client";

import React, { useState, useEffect } from "react";
import { Button, Form, Input, Typography, message, Alert } from "antd";
import { MemberCard } from "@/components/member";
import { UserProfile } from "@/types/member/User";
import { profile } from "@/api/auth/profile";
import axiosClient from "@/api/axiosClient";

interface FormValues {
  username: string;
  password: string;
  email: string;
  fullName: string;
  dateOfBirth: string;
  sex: string;
  phoneNumber: string;
  address: string;
}

export default function AccountInformation() {
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await profile();
        setUserProfile(data);

        form.setFieldsValue({
          username: data.username,
          password: data.password,
          email: data.email,
          fullName: data.full_name,
          dateOfBirth: data.date_of_birth,
          sex: "",
          phoneNumber: data.phone_number,
          address: data.address,
        });
      } catch (err) {
        console.error(err);
        message.error("Failed to load profile");
      }
    }

    loadProfile();
  }, [form]);

  const onFinish = async (values: FormValues) => {
    if (!userProfile) return;

    setLoading(true);
    try {
      const payload: UserProfile = {
        username: values.username,
        password: values.password,
        email: values.email,
        full_name: values.fullName,
        date_of_birth: values.dateOfBirth,
        phone_number: values.phoneNumber,
        address: values.address,
      };

      if (
      !payload.username ||
      !payload.password ||
      !payload.email ||
      !payload.full_name ||
      !payload.date_of_birth ||
      !payload.phone_number ||
      !payload.address
    ) {
      message.error("Vui lòng điền đầy đủ thông tin!");
      setLoading(false);
      return;
    }

      await axiosClient.put("/auth/profile", payload);

      setUserProfile(payload);
      setHasChanges(false);
      message.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      message.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (!userProfile) return;
    form.setFieldsValue({
      username: userProfile.username,
      password: userProfile.password,
      email: userProfile.email,
      fullName: userProfile.full_name,
      dateOfBirth: userProfile.date_of_birth,
      sex: "",
      phoneNumber: userProfile.phone_number,
      address: userProfile.address,
    });
    setHasChanges(false);
    message.info("Form reset to original values");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Typography.Title level={2} className="text-white mb-8 text-center">
        Account Information
      </Typography.Title>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        {userProfile && (
          <>
            <MemberCard
              name={userProfile.full_name}
              email={userProfile.email}
              avatar="" // nếu API trả avatar
              points={0} // nếu API trả points
            />

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Typography.Title level={5} className="mb-3 text-blue-800">
                Current Profile Information
              </Typography.Title>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {[
                  ["Account", userProfile.username],
                  ["Full Name", userProfile.full_name],
                  ["Email", userProfile.email],
                  ["Phone", userProfile.phone_number],
                  ["Date of Birth", userProfile.date_of_birth],
                  ["Address", userProfile.address],
                ].map(([label, val]) => (
                  <div key={label}>
                    <span className="text-gray-600">{label}:</span>
                    <div className="font-medium">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="bg-gray-50 rounded-xl p-6">
          <Typography.Title level={4} className="mb-2">
            Account Information
          </Typography.Title>
          <Typography.Text type="secondary" className="block mb-4">
            Make changes to your profile here. Click save when you’re done.
          </Typography.Text>

          {hasChanges && (
            <Alert
              message="You have unsaved changes"
              type="warning"
              showIcon
              className="mb-4"
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onValuesChange={() => {
              setHasChanges(true);
            }}
            className="max-w-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item label="Account" name="username" rules={[{ required: true }]}>
                <Input size="large" className="rounded-lg" />
              </Form.Item>
              <Form.Item label="Password" name="password" rules={[{ required: true }]}>
                <Input.Password size="large" className="rounded-lg" />
              </Form.Item>
              <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
                <Input size="large" className="rounded-lg" />
              </Form.Item>
              <Form.Item label="Full name" name="fullName" rules={[{ required: true }]}>
                <Input size="large" className="rounded-lg" />
              </Form.Item>
              <Form.Item label="Date of Birth" name="dateOfBirth" rules={[{ required: true }]}>
                <Input size="large" className="rounded-lg" />
              </Form.Item>
              <Form.Item label="Sex" name="sex" rules={[{ required: true }]}>
                <Input size="large" className="rounded-lg" />
              </Form.Item>
              <Form.Item label="Phone Number" name="phoneNumber" rules={[{ required: true }]}>
                <Input size="large" className="rounded-lg" />
              </Form.Item>
            </div>
            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true }]}
              className="mt-4"
            >
              <Input.TextArea size="large" className="rounded-lg" rows={3} />
            </Form.Item>

            <Form.Item className="mt-6">
              <div className="flex gap-3">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  className="bg-blue-600 hover:bg-blue-700 rounded-lg px-8"
                >
                  Save changes
                </Button>
                <Button type="default" size="large" onClick={handleReset} className="rounded-lg px-6">
                  Reset
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
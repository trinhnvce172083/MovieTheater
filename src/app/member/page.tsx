"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Typography,
  message,
  Alert,
  Spin,
  Card,
  Upload,
  Avatar,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  CameraOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useMemberProfile } from "@/hooks/member";
import type { ProfileUpdateRequest } from "@/types/member";

interface FormValues {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  username: string;
  // password: string;
  email: string;
}

export default function MemberAccountPage() {
  const [form] = Form.useForm<FormValues>();
  const [hasChanges, setHasChanges] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const {
    profile,
    loading,
    error,
    updateProfile,
    updatingProfile,
    updateError,
    // changePassword,
    // changingPassword,
    // passwordError,
    refetch,
  } = useMemberProfile();

  // Initialize form when profile is loaded
  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        username: profile.username || "",
        // password: profile.password ? profile.password : "********",
        email: profile.email || "",
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        dateOfBirth: profile.dateOfBirth
          ? profile.dateOfBirth.slice(0, 10)
          : "",
        address: profile.address || "",
      });
      setAvatarPreview(profile.avatarUrl || "");
    }
  }, [profile, form]);

  const handleProfileUpdate = async (values: FormValues) => {
    if (!profile) return;

    const updateRequest: ProfileUpdateRequest = {
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      dateOfBirth: values.dateOfBirth,
      address: values.address,
      ...(avatarFile && { avatarFile }),
      // username: values.username,
      // password: values.password,
    };

    await updateProfile(updateRequest);
    setHasChanges(false);
    setAvatarFile(null);
  };

  const handleAvatarChange = (file: File) => {
    setAvatarFile(file);
    setHasChanges(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    return false; // Prevent auto upload
  };

  const handleReset = () => {
    if (!profile) return;

    form.setFieldsValue({
      username: profile.username || "",
      // password: profile.password ? profile.password : "********",
      email: profile.email || "",
      fullName: profile.fullName || "",
      phoneNumber: profile.phoneNumber || "",
      dateOfBirth: profile.dateOfBirth || "",
      address: profile.address || "",
    });
    setAvatarPreview(profile.avatarUrl || "");
    setAvatarFile(null);
    setHasChanges(false);
    message.info("Form reset to original values");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert
          message="Error Loading Profile"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={refetch}>
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert
          message="Profile Not Found"
          description="Unable to load your profile information."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <Typography.Title level={2} className="text-center mb-6 lg:mb-8 mt-8">
        Account Information
      </Typography.Title>

      <Row gutter={[16, 16]} className="lg:gutter-[24, 24]">
        {/* Member Card Section */}
        <Col xs={24} lg={8}>
          <Card className="text-center">
            <div className="mb-4">
              <Upload
                beforeUpload={handleAvatarChange}
                showUploadList={false}
                accept="image/*"
              >
                <div className="relative inline-block cursor-pointer">
                  <Avatar
                    size={120}
                    src={avatarPreview || profile.avatarUrl || undefined}
                    icon={<UserOutlined />}
                    className="mb-2"
                  />
                  <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 text-white hover:bg-blue-600 transition-colors">
                    <CameraOutlined />
                  </div>
                </div>
              </Upload>
            </div>
          </Card>
        </Col>

        {/* Profile Form Section */}
        <Col xs={24} lg={16}>
          <Card>
            <Typography.Title level={4} className="mb-4">
              Edit Profile Information
            </Typography.Title>

            {hasChanges && (
              <Alert
                message="You have unsaved changes"
                type="warning"
                showIcon
                className="mb-4"
              />
            )}

            {updateError && (
              <Alert
                message="Update Failed"
                description={updateError}
                type="error"
                showIcon
                className="mb-4"
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleProfileUpdate}
              onValuesChange={() => setHasChanges(true)}
            >
              <Row gutter={[12, 12]} className="lg:gutter-[16, 16]">
                <Col xs={24} md={12}>
                  <Form.Item label="Username" name="username">
                    <Input size="middle" readOnly />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Please enter your email" },
                    ]}
                  >
                    <Input size="middle" placeholder="Enter your email" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Full Name"
                    name="fullName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your full name",
                      },
                    ]}
                  >
                    <Input size="middle" placeholder="Enter your full name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Phone Number"
                    name="phoneNumber"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your phone number",
                      },
                      {
                        pattern: /^[0-9+\-\s()]+$/,
                        message: "Please enter a valid phone number",
                      },
                    ]}
                  >
                    <Input size="middle" placeholder="Enter your phone number" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Date of Birth"
                    name="dateOfBirth"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your date of birth",
                      },
                    ]}
                  >
                    <Input size="middle" type="date" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="Address"
                    name="address"
                    rules={[
                      { required: true, message: "Please enter your address" },
                    ]}
                  >
                    <Input.TextArea
                      size="middle"
                      rows={3}
                      placeholder="Enter your address"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="middle"
                  loading={updatingProfile}
                  disabled={!hasChanges}
                  icon={updatingProfile ? <LoadingOutlined /> : undefined}
                  className="flex-1 sm:flex-none"
                >
                  {updatingProfile ? "Updating..." : "Save Changes"}
                </Button>
                <Button
                  size="middle"
                  onClick={handleReset}
                  disabled={!hasChanges || updatingProfile}
                  className="flex-1 sm:flex-none"
                >
                  Reset
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

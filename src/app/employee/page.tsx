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
  Statistic,
} from "antd";
import {
  UserOutlined,
  CameraOutlined,
  LoadingOutlined,
  ShoppingCartOutlined,
  ScanOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useMemberProfile } from "@/hooks/member";
import type { ProfileUpdateRequest } from "@/types/member";

const { Title, Text } = Typography;

interface FormValues {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  email: string;
}

export default function EmployeeDashboard() {
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
    refetch,
  } = useMemberProfile();

  // Initialize form when profile is loaded
  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        username: profile.username || "",
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
      email: profile.email || "",
      fullName: profile.fullName || "",
      phoneNumber: profile.phoneNumber || "",
      dateOfBirth: profile.dateOfBirth || "",
      address: profile.address || "",
    });
    setAvatarPreview(profile.avatarUrl || "");
    setAvatarFile(null);
    setHasChanges(false);
    message.info("Đã reset form về giá trị ban đầu");
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
          message="Lỗi tải thông tin"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={refetch}>
              Thử lại
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
          message="Không tìm thấy thông tin"
          description="Không thể tải thông tin tài khoản của bạn."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6">
      <Title level={2} className="mb-6">
        Dashboard Nhân viên
      </Title>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Vé bán hôm nay"
              value={15}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Check-in hôm nay"
              value={8}
              prefix={<ScanOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Thành viên mới"
              value={3}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={98}
              prefix={<CheckCircleOutlined />}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {updateError && (
        <Alert
          message="Lỗi cập nhật thông tin"
          description={updateError}
          type="error"
          showIcon
          closable
          className="mb-6"
        />
      )}

      <Row gutter={[24, 24]}>
        {/* Profile Section */}
        <Col xs={24} lg={8}>
          <Card title="Thông tin cá nhân" className="h-fit">
            <div className="text-center">
              <Upload
                name="avatar"
                showUploadList={false}
                beforeUpload={handleAvatarChange}
                accept="image/*"
              >
                <div className="relative cursor-pointer group">
                  <Avatar
                    size={120}
                    src={avatarPreview}
                    icon={<UserOutlined />}
                    className="mx-auto mb-4"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <CameraOutlined className="text-white text-xl" />
                  </div>
                </div>
              </Upload>
              <Title level={4} className="mb-2">
                {profile.fullName || profile.username}
              </Title>
              <Text type="secondary" className="block mb-2">
                {profile.email}
              </Text>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm inline-block">
                Nhân viên
              </div>
            </div>
          </Card>
        </Col>

        {/* Form Section */}
        <Col xs={24} lg={16}>
          <Card title="Cập nhật thông tin">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleProfileUpdate}
              onValuesChange={() => setHasChanges(true)}
            >
              <Row gutter={[12, 12]} className="lg:gutter-[16, 16]">
                <Col xs={24} md={12}>
                  <Form.Item label="Tên đăng nhập" name="username">
                    <Input size="middle" readOnly />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                    ]}
                  >
                    <Input size="middle" placeholder="Nhập email của bạn" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập họ và tên",
                      },
                    ]}
                  >
                    <Input size="middle" placeholder="Nhập họ và tên" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phoneNumber"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                      {
                        pattern: /^[0-9+\-\s()]+$/,
                        message: "Vui lòng nhập số điện thoại hợp lệ",
                      },
                    ]}
                  >
                    <Input size="middle" placeholder="Nhập số điện thoại" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Ngày sinh"
                    name="dateOfBirth"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập ngày sinh",
                      },
                    ]}
                  >
                    <Input size="middle" type="date" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    label="Địa chỉ"
                    name="address"
                    rules={[
                      { required: true, message: "Vui lòng nhập địa chỉ" },
                    ]}
                  >
                    <Input.TextArea
                      size="middle"
                      rows={3}
                      placeholder="Nhập địa chỉ"
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
                  {updatingProfile ? "Đang cập nhật..." : "Lưu thay đổi"}
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
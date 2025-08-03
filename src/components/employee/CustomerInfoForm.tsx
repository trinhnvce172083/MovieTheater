"use client";

import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Radio,
  Typography,
  Divider,
  Space,
  message,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEmployeeMember } from "@/hooks/employee/useEmployeeMember";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CustomerInfo {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth?: string;
  address?: string;
  membershipType: 'guest' | 'existing_member' | 'new_member';
  memberId?: string;
}

interface CustomerInfoFormProps {
  onSubmit: (customerInfo: CustomerInfo) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function CustomerInfoForm({ 
  onSubmit, 
  onBack, 
  loading = false 
}: CustomerInfoFormProps) {
  const [form] = Form.useForm();
  const [membershipType, setMembershipType] = useState<'guest' | 'existing_member' | 'new_member'>('guest');
  
  const { 
    loading: memberLoading, 
    getMemberByPhone, 
    selectedMember,
    clearSelectedMember
  } = useEmployeeMember();

  const handleFinish = (values: any) => {
    const customerInfo: CustomerInfo = {
      ...values,
      membershipType,
    };
    onSubmit(customerInfo);
  };

  const handleSearchMember = async () => {
    const phoneNumber = form.getFieldValue('phoneNumber');
    if (!phoneNumber) {
      message.warning('Vui lòng nhập số điện thoại để tìm kiếm thành viên');
      return;
    }

    try {
      const member = await getMemberByPhone(phoneNumber);
      
      if (member) {
        form.setFieldsValue({
          fullName: member.fullName,
          email: member.email,
          dateOfBirth: member.dateOfBirth,
          address: member.address,
          memberId: member.memberCode,
        });
        setMembershipType('existing_member');
      }
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <Title level={3} className="text-center mb-6">
          <UserOutlined className="mr-2" />
          Thông tin khách hàng
        </Title>

        {/* Membership Type Selection */}
        <Card className="mb-6" size="small">
          <Text strong>Loại khách hàng:</Text>
                      <Radio.Group 
            value={membershipType} 
            onChange={(e) => {
              setMembershipType(e.target.value);
              if (e.target.value === 'guest') {
                clearSelectedMember();
                form.resetFields(['memberId']);
              }
            }}
            className="mt-2 w-full"
          >
            <Space direction="vertical" className="w-full">
              <Radio value="guest">Khách vãng lai</Radio>
              <Radio value="existing_member">Thành viên hiện có</Radio>
              <Radio value="new_member">Đăng ký thành viên mới</Radio>
            </Space>
          </Radio.Group>
        </Card>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
        >
          {/* Phone Number with Search */}
          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Nhập số điện thoại"
              size="large"
              addonAfter={
                membershipType !== 'guest' ? (
                  <Button
                    icon={<SearchOutlined />}
                    onClick={handleSearchMember}
                    loading={memberLoading}
                    type="link"
                  >
                    Tìm kiếm
                  </Button>
                ) : null
              }
            />
          </Form.Item>

          {/* Member ID for existing members */}
          {membershipType === 'existing_member' && (
            <Form.Item
              label="Mã thành viên"
              name="memberId"
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Mã thành viên (tự động điền sau khi tìm kiếm)"
                size="large"
                readOnly
              />
            </Form.Item>
          )}

          {/* Full Name */}
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập họ và tên đầy đủ"
              size="large"
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: membershipType !== 'guest', message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập địa chỉ email"
              size="large"
            />
          </Form.Item>

          {/* Date of Birth - required for new members */}
          {membershipType === 'new_member' && (
            <Form.Item
              label="Ngày sinh"
              name="dateOfBirth"
              rules={[{ required: true, message: 'Vui lòng nhập ngày sinh' }]}
            >
              <Input
                prefix={<CalendarOutlined />}
                type="date"
                size="large"
              />
            </Form.Item>
          )}

          {/* Address - optional for guests, required for new members */}
          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[
              { 
                required: membershipType === 'new_member', 
                message: 'Vui lòng nhập địa chỉ' 
              }
            ]}
          >
            <TextArea
              placeholder="Nhập địa chỉ"
              rows={3}
            />
          </Form.Item>

          <Divider />

          {/* Action Buttons */}
          <div className="flex justify-between gap-4">
            <Button size="large" onClick={onBack}>
              ← Quay lại
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              loading={loading}
              className="flex-1"
            >
              Tiếp tục thanh toán →
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
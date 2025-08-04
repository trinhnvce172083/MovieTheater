"use client";

import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Space,
  Avatar,
  Modal,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EyeOutlined,
  StarOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import { useEmployeeMember } from "@/hooks/employee/useEmployeeMember";
import type { MemberInfo } from "@/api/employee-api";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

export default function EmployeeMembersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock empty state since API is not available

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Function is disabled - no API available
  };

  const getMembershipLevelColor = (level: string) => {
    const colors = {
      'BRONZE': 'orange',
      'SILVER': 'gray', 
      'GOLD': 'gold',
      'PLATINUM': 'purple',
      'DIAMOND': 'blue',
    };
    return colors[level as keyof typeof colors] || 'default';
  };

  const getMembershipLevelText = (level: string) => {
    const texts = {
      'BRONZE': 'Đồng',
      'SILVER': 'Bạc',
      'GOLD': 'Vàng', 
      'PLATINUM': 'Bạch kim',
      'DIAMOND': 'Kim cương',
    };
    return texts[level as keyof typeof texts] || level;
  };

  const columns: ColumnsType<MemberInfo> = [
    {
      title: 'Thành viên',
      key: 'member',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.fullName}</div>
            <div className="text-gray-500 text-sm">{record.memberCode}</div>
            <Tag 
              color={getMembershipLevelColor(record.membershipLevel)} 
              size="small"
            >
              {getMembershipLevelText(record.membershipLevel)}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PhoneOutlined className="text-gray-500" />
            <span>{record.phoneNumber}</span>
          </div>
          {record.email && (
            <div className="flex items-center gap-2">
              <MailOutlined className="text-gray-500" />
              <span className="text-sm">{record.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Thống kê',
      key: 'stats',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="text-sm">
            <strong>{record.totalBookings}</strong> booking
          </div>
          <div className="text-sm text-green-600">
            <strong>{record.totalSpent?.toLocaleString()}₫</strong>
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6">
      <Title level={2} className="mb-6">
        👥 Quản lý thành viên
      </Title>

      {/* Search */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Search
              placeholder="Tìm kiếm theo tên, số điện thoại, email hoặc mã thành viên..."
              size="large"
              onSearch={handleSearch}
              loading={loading}
              enterButton={
                <Button type="primary" icon={<SearchOutlined />}>
                  Tìm kiếm
                </Button>
              }
            />
          </Col>
          <Col xs={24} md={8}>
            <Text className="text-gray-600">
              {searchQuery && `Kết quả tìm kiếm cho: "${searchQuery}"`}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Feature under development */}
      <Card className="text-center py-12">
        <UserOutlined className="text-6xl text-gray-400 mb-4" />
        <Title level={4} className="text-gray-500">
          Chức năng đang phát triển
        </Title>
        <Text className="text-gray-400">
          API quản lý thành viên chưa có sẵn. Chức năng này sẽ được cập nhật trong phiên bản tiếp theo.
        </Text>
      </Card>
    </div>
  );
}
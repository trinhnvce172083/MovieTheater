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
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    loading,
    members,
    pagination,
    searchMembers,
    getMemberById,
  } = useEmployeeMember();

  const handleSearch = async (value: string) => {
    if (!value.trim()) return;
    
    setSearchQuery(value);
    await searchMembers({
      query: value.trim(),
      page: 0,
      size: 10,
    });
  };

  const handleViewDetail = async (member: MemberInfo) => {
    const detailMember = await getMemberById(member.memberId);
    if (detailMember) {
      setSelectedMember(detailMember);
      setIsDetailModalOpen(true);
    }
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

      {/* Results */}
      {members.length > 0 && (
        <Card>
          <div className="mb-4">
            <Text strong>Tìm thấy {pagination.total} thành viên</Text>
          </div>
          
          <Table
            columns={columns}
            dataSource={members}
            rowKey="memberId"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} thành viên`,
              onChange: (page, pageSize) => {
                searchMembers({
                  query: searchQuery,
                  page: page - 1,
                  size: pageSize,
                });
              },
            }}
          />
        </Card>
      )}

      {/* Empty state */}
      {!loading && members.length === 0 && !searchQuery && (
        <Card className="text-center py-12">
          <UserOutlined className="text-6xl text-gray-400 mb-4" />
          <Title level={4} className="text-gray-500">
            Tìm kiếm thành viên
          </Title>
          <Text className="text-gray-400">
            Nhập thông tin thành viên để bắt đầu tìm kiếm
          </Text>
        </Card>
      )}

      {/* No results */}
      {!loading && members.length === 0 && searchQuery && (
        <Card className="text-center py-12">
          <SearchOutlined className="text-6xl text-gray-400 mb-4" />
          <Title level={4} className="text-gray-500">
            Không tìm thấy thành viên
          </Title>
          <Text className="text-gray-400">
            Không có thành viên nào phù hợp với từ khóa "{searchQuery}"
          </Text>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        title="Chi tiết thành viên"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedMember && (
          <div className="space-y-6">
            {/* Member Info */}
            <Card size="small">
              <Row gutter={[16, 16]}>
                <Col span={24} className="text-center">
                  <Avatar size={80} icon={<UserOutlined />} className="mb-3" />
                  <Title level={4} className="mb-1">{selectedMember.fullName}</Title>
                  <Text className="text-gray-500">{selectedMember.memberCode}</Text>
                  <div className="mt-2">
                    <Tag color={getMembershipLevelColor(selectedMember.membershipLevel)} size="large">
                      <StarOutlined className="mr-1" />
                      {getMembershipLevelText(selectedMember.membershipLevel)}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Contact Info */}
            <Card title="Thông tin liên hệ" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Space direction="vertical" size="small" className="w-full">
                    <div>
                      <Text strong>Số điện thoại:</Text>
                      <br />
                      <Text>{selectedMember.phoneNumber}</Text>
                    </div>
                    {selectedMember.email && (
                      <div>
                        <Text strong>Email:</Text>
                        <br />
                        <Text>{selectedMember.email}</Text>
                      </div>
                    )}
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size="small" className="w-full">
                    {selectedMember.dateOfBirth && (
                      <div>
                        <Text strong>Ngày sinh:</Text>
                        <br />
                        <Text>{dayjs(selectedMember.dateOfBirth).format('DD/MM/YYYY')}</Text>
                      </div>
                    )}
                    {selectedMember.address && (
                      <div>
                        <Text strong>Địa chỉ:</Text>
                        <br />
                        <Text>{selectedMember.address}</Text>
                      </div>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Statistics */}
            <Card title="Thống kê hoạt động" size="small">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic
                    title="Tổng booking"
                    value={selectedMember.totalBookings}
                    prefix={<ShoppingCartOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Tổng chi tiêu"
                    value={selectedMember.totalSpent}
                    formatter={(value) => `${value?.toLocaleString()}₫`}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Trạng thái"
                    value={selectedMember.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    valueStyle={{ 
                      color: selectedMember.isActive ? '#52c41a' : '#f5222d' 
                    }}
                  />
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
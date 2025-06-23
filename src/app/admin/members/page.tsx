"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Pagination,
  Tooltip,
  Popconfirm,
  message,
  Modal,
  Form,
  DatePicker,
  Tag,
  Row,
  Col,
  Typography,
  Avatar,
  Statistic,
} from "antd";
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  UserAddOutlined,
  UserSwitchOutlined,
  UsergroupAddOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { getAllUsers } from "@/api/admin/getAllUsers";

const { Option } = Select;
const { Title, Text } = Typography;

// Interface for Member Data
interface MemberData {
  key: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'inactive';
  type: string;
  avatar: string;
}

// Interface for Member Statistics
interface MemberStatistics {
  totalMembers: number;
  activeMembers: number;
  newMembers: number;
  types: Record<string, number>;
}

export default function AdminMemberManagement() {
  const [memberData, setMemberData] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberData | null>(null);
  const [form] = Form.useForm();

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users...');
      const response = await getAllUsers();
      console.log('API Response:', response);
      
      // Check if response and response.content exist
      if (!response || !response.content) {
        console.warn('No content in API response:', response);
        setMemberData([]);
        return;
      }
      
      // Transform API data to match our table structure
      const transformedData = response.content.map((user, index) => {
        console.log('Processing user:', user);
        return {
          key: user.accountId ? user.accountId.toString() : index.toString(),
          id: user.accountId ? user.accountId.toString() : `MB${String(index + 1).padStart(3, '0')}`,
          name: user.fullName || user.username || 'N/A',
          email: user.email || 'N/A',
          phone: user.phoneNumber || 'N/A',
          joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          status: user.isActive !== false ? 'active' : 'inactive',
          type: user.role || 'CUSTOMER',
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username || 'User')}&background=random`,
        };
      });
      
      console.log('Transformed data:', transformedData);
      setMemberData(transformedData);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to fetch users');
      setMemberData([]);
    } finally {
      setLoading(false);
    }
  };  // Filter and search logic
  const filteredData = useMemo(() => {
    try {
      if (!memberData || !Array.isArray(memberData)) {
        console.log('memberData is not an array:', memberData);
        return [];
      }
      
      return memberData.filter((member) => {
        try {
          const matchesSearch =
            member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member?.id?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = !filterStatus || member?.status === filterStatus;
          const matchesType = !filterType || member?.type === filterType;
          return matchesSearch && matchesStatus && matchesType;
        } catch (error) {
          console.error('Error filtering member:', member, error);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in filteredData calculation:', error);
      return [];
    }
  }, [searchTerm, filterStatus, filterType, memberData]);// Statistics calculations
  const statistics: MemberStatistics = useMemo(() => {
    try {
      const totalMembers = memberData?.length || 0;
      const activeMembers = memberData?.filter(
        (m) => m.status === "active"
      )?.length || 0;
      
      const newMembers = memberData?.filter((m) => {
        try {
          const join = new Date(m.joinDate);
          const now = new Date();
          return (
            join.getMonth() === now.getMonth() &&
            join.getFullYear() === now.getFullYear()
          );
        } catch (error) {
          console.error('Error processing date for member:', m, error);
          return false;
        }
      })?.length || 0;
      
      const types = memberData?.reduce((acc: Record<string, number>, m) => {
        try {
          acc[m.type] = (acc[m.type] || 0) + 1;
          return acc;
        } catch (error) {
          console.error('Error processing type for member:', m, error);
          return acc;
        }
      }, {}) || {};
      
      return { totalMembers, activeMembers, newMembers, types };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return { totalMembers: 0, activeMembers: 0, newMembers: 0, types: {} };
    }
  }, [memberData]);
  const handleEdit = (record: MemberData) => {
    setEditingMember(record);
    form.setFieldsValue({ ...record, joinDate: record.joinDate });
    setIsModalVisible(true);
  };

  const handleDelete = (record: MemberData) => {
    message.success(`Deleted member "${record.name}" successfully`);
  };

  const handleModalOk = () => {
    form.validateFields().then(() => {
      message.success(
        editingMember
          ? "Member updated successfully"
          : "Member added successfully"
      );
      setIsModalVisible(false);
      setEditingMember(null);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingMember(null);
    form.resetFields();
  };
  const columns: ColumnsType<MemberData> = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: 60,
      align: "center" as const,
      render: (_: unknown, record: MemberData, index: number) => (
        <div className="text-center">
          <span className="font-mono text-sm text-gray-500">
            {(currentPage - 1) * pageSize + index + 1}
          </span>
        </div>
      ),
    },
    {
      title: "Member",
      key: "member_info",
      width: 220,
      render: (_: unknown, record: MemberData) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.avatar} size={40} icon={<UserOutlined />} />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 mb-1 truncate text-sm">
              {record.name}
            </div>
            <div className="text-xs text-gray-600 mb-1 truncate">
              {record.email}
            </div>
            <Tag color="blue" className="text-xs m-0">
              {record.id}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 120,
      render: (phone: string) => <span className="text-sm">{phone}</span>,
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
      width: 120,
      render: (date: string) => (
        <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
      ),
    },    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => (
        <Tag
          color={
            type === "ADMIN" ? "red" : 
            type === "STAFF" ? "purple" : 
            type === "EMPLOYEE" ? "orange" : 
            "blue"
          }
          className="text-xs m-0"
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 90,
      align: "center" as const,
      render: (status: string) => (
        <Tag
          color={status === "active" ? "success" : "default"}
          className="font-medium text-xs"
        >
          {status === "active" ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: unknown, record: MemberData) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              className="text-green-600 hover:bg-green-50"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Member"
              description="Are you sure?"
              onConfirm={() => handleDelete(record)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                className="text-red-600 hover:bg-red-50"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={12} lg={6}>
            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
              <Statistic
                title="Total Members"
                value={statistics.totalMembers}
                prefix={<UsergroupAddOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1677ff", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
              <Statistic
                title="Active Members"
                value={statistics.activeMembers}
                prefix={<CheckCircleOutlined className="text-green-600" />}
                valueStyle={{ color: "#52c41a", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
              <Statistic
                title="New This Month"
                value={statistics.newMembers}
                prefix={<UserAddOutlined className="text-purple-600" />}
                valueStyle={{ color: "#722ed1", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
              <Statistic
                title="Admin/Staff/Employee"
                value={Object.entries(statistics.types)
                  .map(([type, count]) => `${type}:${count}`)
                  .join(" ")}
                prefix={<UserSwitchOutlined className="text-gold-600" />}
                valueStyle={{ color: "#faad14", fontSize: "1.1rem" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Card
          className="shadow-sm border-0"
          bodyStyle={{ padding: 0 }}
          style={{ borderRadius: 16 }}
        >
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <Title
                level={2}
                className="m-0 text-gray-900 text-xl xl:text-2xl"
              >
                Member Management
              </Title>              <Text type="secondary" className="text-sm xl:text-base">
                Manage and organize your cinema&apos;s member list
              </Text>
            </div>            <div className="flex items-center gap-3">
              <Button
                icon={<ReloadOutlined />}
                size="middle"
                className="h-10 px-3"
                onClick={fetchUsers}
                loading={loading}
                title="Refresh members list"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm h-10 px-4"
                onClick={() => setIsModalVisible(true)}
              >
                Add New Member
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} lg={10} xl={8}>
                <Input
                  placeholder="Search members, ID, or email..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10"
                  allowClear
                />
              </Col>
              <Col xs={12} sm={6} lg={4} xl={3}>
                <Select
                  placeholder="Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  className="w-full h-10"
                  allowClear
                  size="middle"
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Col>              <Col xs={12} sm={6} lg={4} xl={3}>
                <Select
                  placeholder="Type"
                  value={filterType}
                  onChange={setFilterType}
                  className="w-full h-10"
                  allowClear
                  size="middle"
                >
                  <Option value="ADMIN">Admin</Option>
                  <Option value="STAFF">Staff</Option>
                  <Option value="EMPLOYEE">Employee</Option>
                  <Option value="CUSTOMER">Customer</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={4} xl={3}>
                <Button
                  icon={<ReloadOutlined />}
                  className="w-full h-10"
                  size="middle"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("");
                    setFilterType("");
                    fetchUsers();
                  }}
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </div>

          {/* Table Section */}          
          <div className="bg-white">
            <Table
              dataSource={filteredData}
              columns={columns}
              pagination={false}
              scroll={{ x: 950 }}
              rowClassName="hover:bg-gray-50 transition-colors"
              className="professional-table"
              size="small"
              loading={loading}
            />
            {/* Pagination */}
            <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Text type="secondary" className="text-sm">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                {filteredData.length} members
              </Text>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredData.length}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                showSizeChanger
                showQuickJumper={false}
                pageSizeOptions={["5", "10", "20", "50"]}
                className="professional-pagination"
                size="small"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Add/Edit Member Modal */}
      <Modal
        title={editingMember ? "Edit Member" : "Add New Member"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        className="professional-modal"
        okText={editingMember ? "Update Member" : "Add Member"}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter full name" }]}
              >
                <Input placeholder="Enter full name" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: "Please enter email" }, 
                  { type: "email", message: "Invalid email!" }]}
              >
                <Input placeholder="Enter email" className="h-10" type="email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: "Please enter address" }]}
              >
                <Input.TextArea placeholder="Enter address" className="h-10" rows={2} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: "Please enter phone number" }]}
              >
                <Input placeholder="Enter phone number" className="h-10" type="tel" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="dob"
                label="Date of Birth"
                rules={[{ required: true, message: "Please select date of birth" }]}
              >
                <DatePicker className="w-full h-10" format="DD-MM-YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: "Please select gender" }]}
              >
                <Select placeholder="Select gender" className="h-10">
                  <Option value="M">Male</Option>
                  <Option value="F">Female</Option>
                  <Option value="O">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="idNumber"
                label="ID Number"
                rules={[{ required: true, message: "Please enter ID number" }]}
              >
                <Input placeholder="Enter ID number" className="h-10" type="number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>            <Col xs={24} sm={12}>
              <Form.Item
                name="type"
                label="Role"
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select placeholder="Select role" className="h-10">
                  <Option value="ADMIN">Admin</Option>
                  <Option value="STAFF">Staff</Option>
                  <Option value="EMPLOYEE">Employee</Option>
                  <Option value="CUSTOMER">Customer</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select placeholder="Select status" className="h-10">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="joinDate"
                label="Join Date"
                rules={[{ required: true, message: "Please select join date" }]}
              >
                <DatePicker className="w-full h-10" format="DD-MM-YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <style jsx global>{`
        .professional-table .ant-table-thead > tr > th {
          background: #fafafa;
          border-bottom: 2px solid #f0f0f0;
          font-weight: 600;
          color: #262626;
        }
        .professional-table .ant-table-tbody > tr:hover > td {
          background: #f8faff;
        }
        .professional-pagination .ant-pagination-item-active {
          background: #1677ff;
          border-color: #1677ff;
        }
        .professional-pagination .ant-pagination-item-active a {
          color: white;
        }
        .professional-modal .ant-modal-header {
          border-bottom: 1px solid #f0f0f0;
          padding: 24px 24px 16px;
        }
        .professional-modal .ant-modal-body {
          padding: 24px;
        }
      `}</style>
    </div>
  );
}

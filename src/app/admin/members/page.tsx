"use client";

import React, { useState, useMemo } from "react";
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

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const memberData = [
  {
    key: "1",
    id: "MB001",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "123-456-7890",
    joinDate: "2023-01-15",
    status: "active",
    type: "Gold",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    key: "2",
    id: "MB002",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "987-654-3210",
    joinDate: "2023-03-22",
    status: "inactive",
    type: "Silver",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    key: "3",
    id: "MB003",
    name: "Alice Johnson",
    email: "alice.j@email.com",
    phone: "555-123-4567",
    joinDate: "2024-02-10",
    status: "active",
    type: "Platinum",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    key: "4",
    id: "MB004",
    name: "Bob Brown",
    email: "bob.brown@email.com",
    phone: "444-555-6666",
    joinDate: "2024-04-01",
    status: "active",
    type: "Gold",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
  },
];

export default function AdminMemberManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form] = Form.useForm();

  // Filter and search logic
  const filteredData = useMemo(() => {
    return memberData.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filterStatus || member.status === filterStatus;
      const matchesType = !filterType || member.type === filterType;
      // Date range filter (optional)
      let matchesDate = true;
      if (dateRange && dateRange.length === 2) {
        const join = new Date(member.joinDate);
        matchesDate =
          join >= dateRange[0].startOf("day").toDate() &&
          join <= dateRange[1].endOf("day").toDate();
      }
      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [searchTerm, filterStatus, filterType, dateRange]);

  // Statistics calculations
  const statistics = useMemo(() => {
    const totalMembers = memberData.length;
    const activeMembers = memberData.filter(
      (m) => m.status === "active"
    ).length;
    const newMembers = memberData.filter((m) => {
      const join = new Date(m.joinDate);
      const now = new Date();
      return (
        join.getMonth() === now.getMonth() &&
        join.getFullYear() === now.getFullYear()
      );
    }).length;
    const types = memberData.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {});
    return { totalMembers, activeMembers, newMembers, types };
  }, []);

  const handleEdit = (record) => {
    setEditingMember(record);
    form.setFieldsValue({ ...record, joinDate: record.joinDate });
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    message.success(`Deleted member "${record.name}" successfully`);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
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

  const columns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: 60,
      align: "center" as const,
      render: (_: any, record: any, index: any) => (
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
      render: (_: any, record: any) => (
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
      render: (phone: any) => <span className="text-sm">{phone}</span>,
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
      width: 120,
      render: (date: any) => (
        <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: any) => (
        <Tag
          color={
            type === "Platinum" ? "purple" : type === "Gold" ? "gold" : "silver"
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
      render: (status: any) => (
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
      render: (_: any, record: any) => (
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
          <Col xs={12} sm={12} lg={6}>
            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
              <Statistic
                title="Gold/Platinum/Silver"
                value={Object.entries(statistics.types)
                  .map(([type, count]) => `${type[0]}:${count}`)
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
              </Title>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage and organize your cinema's member list
              </Text>
            </div>            <div className="flex items-center gap-3">
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
              </Col>
              <Col xs={12} sm={6} lg={4} xl={3}>
                <Select
                  placeholder="Type"
                  value={filterType}
                  onChange={setFilterType}
                  className="w-full h-10"
                  allowClear
                  size="middle"
                >
                  <Option value="Platinum">Platinum</Option>
                  <Option value="Gold">Gold</Option>
                  <Option value="Silver">Silver</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} lg={6} xl={6}>
                <RangePicker className="w-full h-10" onChange={setDateRange} />
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
                    setDateRange(null);
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
                rules={[{ required: true, message: "Please enter email" }, { type: "email", message: "Invalid email!" }]}
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
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="type"
                label="Membership Type"
                rules={[{ required: true, message: "Please select membership type" }]}
              >
                <Select placeholder="Select type" className="h-10">
                  <Option value="Platinum">Platinum</Option>
                  <Option value="Gold">Gold</Option>
                  <Option value="Silver">Silver</Option>
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

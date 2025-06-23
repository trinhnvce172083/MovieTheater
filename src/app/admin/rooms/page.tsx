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
  Statistic,
  Row,
  Col,
  Typography,
  Avatar,
} from "antd";
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  ReloadOutlined,
  CalendarOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  HomeOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Enhanced data with more realistic room information
const roomData = [
  {
    key: "1",
    id: "R001",
    name: "Premium Cinema Hall A",
    seats: 48,
    type: "Premium",
    status: "active",
    layout: "6x8",
    features: ["Dolby Atmos", "Recliner Seats", "4K Projection"],
    lastMaintenance: "2024-05-15",
    capacity: "48 seats",
    location: "Floor 1",
  },
  {
    key: "2",
    id: "R002",
    name: "Standard Cinema Hall B",
    seats: 40,
    type: "Standard",
    status: "active",
    layout: "5x8",
    features: ["Surround Sound", "Standard Seats"],
    lastMaintenance: "2024-05-10",
    capacity: "40 seats",
    location: "Floor 1",
  },
  {
    key: "3",
    id: "R003",
    name: "VIP Cinema Hall C",
    seats: 24,
    type: "VIP",
    status: "maintenance",
    layout: "4x6",
    features: ["Premium Leather", "In-seat Service", "Private Lounge"],
    lastMaintenance: "2024-05-20",
    capacity: "24 seats",
    location: "Floor 2",
  },
  {
    key: "4",
    id: "R004",
    name: "IMAX Cinema Hall D",
    seats: 65,
    type: "IMAX",
    status: "active",
    layout: "8x8+1",
    features: ["IMAX Screen", "Enhanced Audio", "Stadium Seating"],
    lastMaintenance: "2024-05-12",
    capacity: "65 seats",
    location: "Floor 2",
  },
];

// Room Management Component
export default function ProfessionalRoomManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form] = Form.useForm();

  // Filter and search logic
  const filteredData = useMemo(() => {
    return roomData.filter((room) => {
      const matchesSearch =
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !filterType || room.type === filterType;
      const matchesStatus = !filterStatus || room.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchTerm, filterType, filterStatus]);

  // Statistics calculations
  const statistics = useMemo(() => {
    const totalRooms = roomData.length;
    const activeRooms = roomData.filter((r) => r.status === "active").length;
    const totalSeats = roomData.reduce((sum, room) => sum + room.seats, 0);
    const avgSeats = Math.round(totalSeats / totalRooms);

    return { totalRooms, activeRooms, totalSeats, avgSeats };
  }, []);

  const handleEdit = (record) => {
    setEditingRoom(record);
    form.setFieldsValue({
      ...record,
      lastMaintenance: record.lastMaintenance,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    message.success(`Deleted "${record.name}" successfully`);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      message.success(
        editingRoom ? "Room updated successfully" : "Room added successfully"
      );
      setIsModalVisible(false);
      setEditingRoom(null);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingRoom(null);
    form.resetFields();
  };

  const columns: ColumnsType<any> = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: 60,
      render: (_: any, record: any, index: any) => (
        <div className="text-center">
          <span className="font-mono text-sm text-gray-500">
            {(currentPage - 1) * pageSize + index + 1}
          </span>
        </div>
      ),
    },
    {
      title: "Room Information",
      key: "room_info",
      width: 280,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            icon={<HomeOutlined />}
            size={40}
            className="bg-blue-100 text-blue-600 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 mb-1 truncate text-sm">
              {record.name}
            </div>
            <div className="text-xs text-gray-600 mb-1 truncate">
              {record.location}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <Tag color="blue" className="text-xs m-0">
                {record.id}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Type & Status",
      key: "type_status",
      width: 120,
      render: (_: any, record: any) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 truncate mb-1">
            {record.type}
          </div>
          <Tag
            color={record.status === "active" ? "success" : "warning"}
            className="text-xs"
          >
            {record.status === "active" ? "Active" : "Maintenance"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Capacity",
      key: "capacity",
      width: 80,
      align: "center",
      render: (_: any, record: any) => (
        <div className="text-center">
          <div className="text-sm font-medium">{record.seats}</div>
          <div className="text-xs text-gray-500">seats</div>
        </div>
      ),
    },
    {
      title: "Features",
      dataIndex: "features",
      key: "features",
      align: "center" as const,
      width: 120,
      render: (features: any) => (
        <div className="flex flex-wrap gap-1">
          {features.slice(0, 2).map((feature: any) => (
            <Tag
              key={feature}
              color="blue"
              className="text-xs m-0"
            >
              {feature}
            </Tag>
          ))}
          {features.length > 2 && (
            <Tag className="text-xs m-0">+{features.length - 2}</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Last Maintenance",
      dataIndex: "lastMaintenance",
      key: "lastMaintenance",
      width: 120,
      render: (date: any) => (
        <div className="text-sm">
          <div className="text-gray-900">{new Date(date).toLocaleDateString()}</div>
        </div>
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
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              className="text-blue-600 hover:bg-blue-50"
            />
          </Tooltip>
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
              title="Delete Room"
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
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Total Rooms"
                value={statistics.totalRooms}
                prefix={<HomeOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1677ff", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Active Rooms"
                value={statistics.activeRooms}
                prefix={<GlobalOutlined className="text-green-600" />}
                valueStyle={{ color: "#52c41a", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Total Seats"
                value={statistics.totalSeats}
                prefix={<VideoCameraOutlined className="text-purple-600" />}
                valueStyle={{ color: "#722ed1", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Avg Seats/Room"
                value={statistics.avgSeats}
                suffix="seats"
                prefix={<ClockCircleOutlined className="text-orange-600" />}
                valueStyle={{ color: "#faad14", fontSize: "1.5rem" }}
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
              <Title level={2} className="m-0 text-gray-900 text-xl xl:text-2xl">
                Room Management
              </Title>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage and organize your cinema's room facilities
              </Text>
            </div>            <div className="flex items-center gap-3">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm h-10 px-4"
                onClick={() => setIsModalVisible(true)}
              >
                Add New Room
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} lg={10} xl={8}>
                <Input
                  placeholder="Search rooms, ID, or names..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 px-4"
                  allowClear
                />
              </Col>
              <Col xs={12} sm={6} lg={4} xl={3}>
                <Select
                  placeholder="Type"
                  value={filterType}
                  onChange={setFilterType}
                  className="w-full h-10 px-4"
                  allowClear
                  size="middle"
                >
                  <Option value="Standard">Standard</Option>
                  <Option value="Premium">Premium</Option>
                  <Option value="VIP">VIP</Option>
                  <Option value="IMAX">IMAX</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={3} xl={3}>
                <Select
                  placeholder="Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  className="w-full h-10 px-4"
                  allowClear
                  size="middle"
                >
                  <Option value="active">Active</Option>
                  <Option value="maintenance">Maintenance</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={3} xl={3}>
                <Button
                  icon={<ReloadOutlined />}
                  className="w-full h-10 px-4"
                  size="middle"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("");
                    setFilterStatus("");
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
                {filteredData.length} rooms
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

      {/* Add/Edit Room Modal */}
      <Modal
        title={editingRoom ? "Edit Room" : "Add New Room"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        className="professional-modal"
        okText={editingRoom ? "Update Room" : "Add Room"}
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-6"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Room Name"
                rules={[{ required: true, message: "Please enter room name" }]}
              >
                <Input placeholder="Enter room name" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="id"
                label="Room ID"
                rules={[{ required: true, message: "Please enter room ID" }]}
              >
                <Input placeholder="Enter room ID" className="h-10" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="type"
                label="Room Type"
                rules={[{ required: true, message: "Please select room type" }]}
              >
                <Select placeholder="Select room type" className="h-10">
                  <Option value="Standard">Standard</Option>
                  <Option value="Premium">Premium</Option>
                  <Option value="VIP">VIP</Option>
                  <Option value="IMAX">IMAX</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="seats"
                label="Seat Capacity"
                rules={[{ required: true, message: "Please enter seat capacity" }]}
              >
                <Input type="number" placeholder="Enter seat capacity" className="h-10" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="layout"
                label="Seat Layout"
                rules={[{ required: true, message: "Please enter seat layout" }]}
              >
                <Input placeholder="e.g., 6x8" className="h-10" />
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
                  <Option value="maintenance">Maintenance</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastMaintenance"
                label="Last Maintenance Date"
                rules={[{ required: true, message: "Please select maintenance date" }]}
              >
                <DatePicker className="w-full h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: "Please enter location" }]}
              >
                <Input placeholder="e.g., Floor 1" className="h-10" />
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

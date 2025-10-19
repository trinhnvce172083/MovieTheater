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
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useIsMobile } from "@/hooks/use-mobile";

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Enhanced data with more realistic booking information
const bookingData = [
  {
    key: "1",
    id: "B001",
    customerName: "John Doe",
    customerEmail: "john.doe@email.com",
    movieTitle: "The Matrix",
    showtime: "2024-03-20 19:00",
    seats: ["A1", "A2"],
    totalAmount: 25.00,
    status: "confirmed",
    paymentMethod: "Credit Card",
    bookingDate: "2024-03-19",
    roomId: "R001",
  },
  {
    key: "2",
    id: "B002",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@email.com",
    movieTitle: "Inception",
    showtime: "2024-03-21 20:30",
    seats: ["B3"],
    totalAmount: 15.00,
    status: "pending",
    paymentMethod: "PayPal",
    bookingDate: "2024-03-19",
    roomId: "R002",
  },
  {
    key: "3",
    id: "B003",
    customerName: "Alice Johnson",
    customerEmail: "alice.j@email.com",
    movieTitle: "Avengers: Endgame",
    showtime: "2024-03-22 18:00",
    seats: ["C5", "C6", "C7"],
    totalAmount: 45.00,
    status: "confirmed",
    paymentMethod: "Credit Card",
    bookingDate: "2024-03-20",
    roomId: "R003",
  },
  {
    key: "4",
    id: "B004",
    customerName: "Bob Brown",
    customerEmail: "bob.brown@email.com",
    movieTitle: "Spider-Man: No Way Home",
    showtime: "2024-03-23 21:00",
    seats: ["D8"],
    totalAmount: 18.00,
    status: "cancelled",
    paymentMethod: "Cash",
    bookingDate: "2024-03-21",
    roomId: "R004",
  },
];



// Booking Management Component
export default function ProfessionalBookingManagement() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Filter and search logic
  const filteredData = useMemo(() => {
    return bookingData.filter((booking) => {
      const matchesSearch =
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.movieTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !filterStatus || booking.status === filterStatus;
      const matchesPaymentMethod = !filterPaymentMethod || booking.paymentMethod === filterPaymentMethod;

      return matchesSearch && matchesStatus && matchesPaymentMethod;
    });
  }, [searchTerm, filterStatus, filterPaymentMethod]);

  // Statistics calculations
  const statistics = useMemo(() => {
    const totalBookings = bookingData.length;
    const confirmedBookings = bookingData.filter((b) => b.status === "confirmed").length;
    const totalRevenue = bookingData.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const avgAmount = Math.round((totalRevenue / totalBookings) * 100) / 100;

    return { totalBookings, confirmedBookings, totalRevenue, avgAmount };
  }, []);

  const handleEdit = (record) => {
    setEditingBooking(record);
    form.setFieldsValue({
      ...record,
      showtime: record.showtime,
      bookingDate: record.bookingDate,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    message.success(`Deleted booking "${record.id}" successfully`);
  };

  const handleModalOk = () => {
    setLoading(true);
    form.validateFields().then((values) => {
      message.success(
        editingBooking ? "Booking updated successfully" : "Booking added successfully"
      );
      setIsModalVisible(false);
      setEditingBooking(null);
      form.resetFields();
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingBooking(null);
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
      title: "Booking Information",
      key: "booking_info",
      width: 280,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            icon={<IdcardOutlined />}
            size={40}
            className="bg-green-100 text-green-600 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 mb-1 truncate text-sm">
              {record.movieTitle}
            </div>
            <div className="text-xs text-gray-600 mb-1 truncate">
              {record.customerName}
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
      title: "Customer",
      key: "customer",
      width: 150,
      render: (_: any, record: any) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 truncate">
            {record.customerName}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {record.customerEmail}
          </div>
        </div>
      ),
    },
    {
      title: "Showtime",
      dataIndex: "showtime",
      key: "showtime",
      width: 120,
      render: (showtime: any) => (
        <div className="text-sm">
          <div className="text-gray-900">{new Date(showtime).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{new Date(showtime).toLocaleTimeString()}</div>
        </div>
      ),
    },
    {
      title: "Seats",
      dataIndex: "seats",
      key: "seats",
      width: 100,
      align: "center" as const,
      render: (seats: any) => (
        <div className="flex flex-wrap gap-1 justify-center">
          {seats.slice(0, 2).map((seat: any) => (
            <Tag key={seat} color="blue" className="text-xs m-0">
              {seat}
            </Tag>
          ))}
          {seats.length > 2 && (
            <Tag className="text-xs m-0">+{seats.length - 2}</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 90,
      align: "right" as const,
      render: (amount: any) => (
        <div className="text-right">
          <span className="font-mono text-sm font-semibold text-green-600">
            ${amount.toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      align: "center" as const,
      render: (status: any) => (
        <div className="text-center">
          <Tag
            color={status === "confirmed" ? "success" : status === "cancelled" ? "error" : "warning"}
            className="font-medium text-xs"
          >
            {status === "confirmed" ? "Confirmed" : status === "cancelled" ? "Cancelled" : "Pending"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Payment",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 100,
      render: (method: any) => (
        <div className="text-sm">
          <div className="text-gray-900">{method}</div>
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
              title="Delete Booking"
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
                title="Total Bookings"
                value={statistics.totalBookings}
                prefix={<CalendarOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1677ff", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Confirmed Bookings"
                value={statistics.confirmedBookings}
                prefix={<UserOutlined className="text-green-600" />}
                valueStyle={{ color: "#52c41a", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Total Revenue"
                value={statistics.totalRevenue}
                prefix={<DollarOutlined className="text-purple-600" />}
                precision={2}
                valueStyle={{ color: "#722ed1", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Average Amount"
                value={statistics.avgAmount}
                prefix="$"
                precision={2}
                valueStyle={{ color: "#faad14", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Card
          className="shadow-sm border-0"
          styles={{ body: { padding: 0 } }}
          style={{ borderRadius: 16 }}
        >
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <Title level={2} className="m-0 text-gray-900 text-xl xl:text-2xl">
                Booking Management
              </Title>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage and track all cinema bookings and reservations
              </Text>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} lg={10} xl={8}>
                <Input
                  placeholder="Search bookings, customer, or movie..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 px-4"
                  allowClear
                />
              </Col>
              <Col xs={12} sm={6} lg={4} xl={3}>
                <Select
                  placeholder="All Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  className="w-full h-10 px-4"
                  allowClear
                  size="middle"
                >
                  <Option value="confirmed">Confirmed</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={3} xl={3}>
                <Select
                  placeholder="All Payment Methods"
                  value={filterPaymentMethod}
                  onChange={setFilterPaymentMethod}
                  className="w-full h-10 px-4"
                  allowClear
                  size="middle"
                >
                  <Option value="Credit Card">Credit Card</Option>
                  <Option value="PayPal">PayPal</Option>
                  <Option value="Cash">Cash</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={3} xl={3}>
                <Button
                  icon={<ReloadOutlined />}
                  className="w-full h-10 px-4"
                  size="middle"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus(undefined);
                    setFilterPaymentMethod(undefined);
                    setCurrentPage(1);
                    message.success("Filters cleared successfully");
                  }}
                  disabled={!searchTerm && !filterStatus && !filterPaymentMethod}
                >
                  Clear Filters
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
                {filteredData.length} bookings
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
                size="default"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Add/Edit Booking Modal */}
      <Modal
        title={editingBooking ? "Edit Booking" : "Add New Booking"}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={handleModalCancel}
        width={800}
        className="professional-modal"
        okText={editingBooking ? "Update Booking" : "Add Booking"}
        cancelText="Cancel"
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalOk}
          initialValues={editingBooking}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerName"
                label="Customer Name"
                rules={[{ required: true, message: 'Please enter customer name' }]}
              >
                <Input placeholder="Enter customer name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customerEmail"
                label="Customer Email"
                rules={[
                  { required: true, message: 'Please enter customer email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter customer email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="movieTitle"
                label="Movie Title"
                rules={[{ required: true, message: 'Please enter movie title' }]}
              >
                <Input placeholder="Enter movie title" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roomId"
                label="Room ID"
                rules={[{ required: true, message: 'Please enter room ID' }]}
              >
                <Input placeholder="Enter room ID" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="showtime"
                label="Showtime"
                rules={[{ required: true, message: 'Please select showtime' }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  placeholder="Select showtime"
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bookingDate"
                label="Booking Date"
                rules={[{ required: true, message: 'Please select booking date' }]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  placeholder="Select booking date"
                  className="w-full"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="seats"
                label="Seats"
                rules={[{ required: true, message: 'Please enter seats' }]}
              >
                <Select
                  mode="tags"
                  placeholder="Select seats"
                  className="w-full"
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <Option key={`A${i + 1}`} value={`A${i + 1}`}>A{i + 1}</Option>
                  ))}
                  {Array.from({ length: 10 }, (_, i) => (
                    <Option key={`B${i + 1}`} value={`B${i + 1}`}>B{i + 1}</Option>
                  ))}
                  {Array.from({ length: 10 }, (_, i) => (
                    <Option key={`C${i + 1}`} value={`C${i + 1}`}>C{i + 1}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="totalAmount"
                label="Total Amount"
                rules={[{ required: true, message: 'Please enter total amount' }]}
              >
                <Input
                  type="number"
                  placeholder="Enter total amount"
                  prefix="$"
                  min={0}
                  step={0.01}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="confirmed">Confirmed</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paymentMethod"
                label="Payment Method"
                rules={[{ required: true, message: 'Please select payment method' }]}
              >
                <Select placeholder="Select payment method">
                  <Option value="Credit Card">Credit Card</Option>
                  <Option value="PayPal">PayPal</Option>
                  <Option value="Cash">Cash</Option>
                </Select>
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
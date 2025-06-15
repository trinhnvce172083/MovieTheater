"use client";

import React, { useState, useEffect } from "react";
import { Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, Card, Row, Col, Statistic, Input as AntInput } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, ReloadOutlined, DollarOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

interface Booking {
  key: string;
  id: string;
  customerName: string;
  movieTitle: string;
  showtime: string;
  seats: string[];
  totalAmount: number;
  status: "confirmed" | "cancelled" | "pending";
  paymentMethod: string;
  bookingDate: string;
}

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        key: "1",
        id: "B001",
        customerName: "John Doe",
        movieTitle: "The Matrix",
        showtime: "2024-03-20 19:00",
        seats: ["A1", "A2"],
        totalAmount: 25.00,
        status: "confirmed",
        paymentMethod: "Credit Card",
        bookingDate: "2024-03-19",
      },
      {
        key: "2",
        id: "B002",
        customerName: "Jane Smith",
        movieTitle: "Inception",
        showtime: "2024-03-21 20:30",
        seats: ["B3"],
        totalAmount: 15.00,
        status: "pending",
        paymentMethod: "PayPal",
        bookingDate: "2024-03-19",
      },
    ];
    setBookings(mockBookings);
  }, []);

  // Calculate statistics
  const statistics = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === "confirmed").length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
    averageAmount: bookings.length > 0 
      ? bookings.reduce((sum, b) => sum + b.totalAmount, 0) / bookings.length 
      : 0
  };

  const columns: ColumnsType<Booking> = [
    {
      title: "Booking ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      width: 150,
    },
    {
      title: "Movie",
      dataIndex: "movieTitle",
      key: "movieTitle",
      width: 150,
    },
    {
      title: "Showtime",
      dataIndex: "showtime",
      key: "showtime",
      width: 150,
    },
    {
      title: "Seats",
      dataIndex: "seats",
      key: "seats",
      width: 120,
      render: (seats: string[]) => (
        <div className="flex flex-wrap gap-1">
          {seats.map(seat => (
            <Tag key={seat} color="blue">{seat}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (amount: number) => (
        <span className="font-medium text-green-600">
          ${amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const color = status === "confirmed" ? "green" : status === "cancelled" ? "red" : "orange";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 120,
    },
    {
      title: "Booking Date",
      dataIndex: "bookingDate",
      key: "bookingDate",
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            className="text-blue-600 hover:bg-blue-50"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-green-600 hover:bg-green-50"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            className="hover:bg-red-50"
          />
        </Space>
      ),
    },
  ];

  const handleView = (booking: Booking) => {
    Modal.info({
      title: 'Booking Details',
      width: 600,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-500">Booking ID</div>
              <div className="font-medium">{booking.id}</div>
            </div>
            <div>
              <div className="text-gray-500">Customer</div>
              <div className="font-medium">{booking.customerName}</div>
            </div>
            <div>
              <div className="text-gray-500">Movie</div>
              <div className="font-medium">{booking.movieTitle}</div>
            </div>
            <div>
              <div className="text-gray-500">Showtime</div>
              <div className="font-medium">{booking.showtime}</div>
            </div>
            <div>
              <div className="text-gray-500">Seats</div>
              <div className="font-medium">{booking.seats.join(", ")}</div>
            </div>
            <div>
              <div className="text-gray-500">Amount</div>
              <div className="font-medium text-green-600">${booking.totalAmount.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-500">Status</div>
              <div>
                <Tag color={booking.status === "confirmed" ? "green" : booking.status === "cancelled" ? "red" : "orange"}>
                  {booking.status.toUpperCase()}
                </Tag>
              </div>
            </div>
            <div>
              <div className="text-gray-500">Payment Method</div>
              <div className="font-medium">{booking.paymentMethod}</div>
            </div>
          </div>
        </div>
      ),
    });
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    form.setFieldsValue(booking);
    setIsModalVisible(true);
  };

  const handleDelete = (booking: Booking) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this booking?',
      content: `This will permanently delete the booking "${booking.id}"`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        // Implement delete logic
        console.log("Delete booking:", booking);
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      // Implement save logic
      console.log("Save booking:", values);
      setIsModalVisible(false);
      form.resetFields();
      setEditingBooking(null);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingBooking(null);
  };

  const filteredBookings = bookings.filter(booking =>
    booking.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchText.toLowerCase()) ||
    booking.movieTitle.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-2 h-10 bg-blue-600 rounded-lg" />
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Booking Management
          </h1>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Bookings"
                value={statistics.totalBookings}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Confirmed Bookings"
                value={statistics.confirmedBookings}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Revenue"
                value={statistics.totalRevenue}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Average Amount"
                value={statistics.averageAmount}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Search and Table Section */}
        <Card className="shadow-sm">
          <div className="mb-4 flex justify-between items-center">
            <AntInput
              placeholder="Search bookings..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setSearchText("")}
            >
              Reset
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={filteredBookings}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`
            }}
            scroll={{ x: 1200 }}
            rowClassName="hover:bg-gray-50"
          />
        </Card>

        {/* Modal */}
        <Modal
          title={editingBooking ? "Edit Booking" : "New Booking"}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={600}
          okText={editingBooking ? "Update" : "Create"}
          cancelText="Cancel"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={editingBooking || {}}
          >
            <Form.Item
              name="customerName"
              label="Customer Name"
              rules={[{ required: true, message: "Please input customer name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="movieTitle"
              label="Movie Title"
              rules={[{ required: true, message: "Please input movie title!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="showtime"
              label="Showtime"
              rules={[{ required: true, message: "Please select showtime!" }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="seats"
              label="Seats"
              rules={[{ required: true, message: "Please select seats!" }]}
            >
              <Select mode="multiple" placeholder="Select seats">
                {/* Add seat options dynamically */}
              </Select>
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status!" }]}
            >
              <Select>
                <Select.Option value="confirmed">Confirmed</Select.Option>
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="cancelled">Cancelled</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="paymentMethod"
              label="Payment Method"
              rules={[{ required: true, message: "Please select payment method!" }]}
            >
              <Select>
                <Select.Option value="Credit Card">Credit Card</Select.Option>
                <Select.Option value="PayPal">PayPal</Select.Option>
                <Select.Option value="Cash">Cash</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default BookingManagement; 
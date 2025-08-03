"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Input,
  Button,
  Select,
  DatePicker,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  message,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  ScanOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEmployeeBooking } from "@/hooks/employee/useEmployeeBooking";
import { useEmployeeStatistics } from "@/hooks/employee/useEmployeeStatistics";
import type { EmployeeBookingRecord, EmployeeBookingFilters } from "@/api/employee-api";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function BookingManagementPage() {
  const { 
    bookings, 
    loading, 
    pagination, 
    fetchBookings, 
    getBookingById,
    checkInBooking 
  } = useEmployeeBooking();
  
  const { statistics } = useEmployeeStatistics();
  
  const [filteredBookings, setFilteredBookings] = useState<EmployeeBookingRecord[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<EmployeeBookingRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Filter states
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Load initial data
  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    setFilteredBookings(bookings);
  }, [bookings]);

  const loadBookings = async (filters?: EmployeeBookingFilters) => {
    const filterParams: EmployeeBookingFilters = {
      ...filters,
      search: searchText || undefined,
      status: statusFilter || undefined,
      paymentStatus: paymentFilter || undefined,
      startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
    };

    await fetchBookings(filterParams);
  };

  // Apply filters when they change
  useEffect(() => {
    const delayedFilter = setTimeout(() => {
      loadBookings();
    }, 500); // Debounce API calls

    return () => clearTimeout(delayedFilter);
  }, [searchText, statusFilter, paymentFilter, dateRange]);

  const handleCheckIn = async (booking: EmployeeBookingRecord) => {
    try {
      await checkInBooking({ bookingId: booking.id });
      // Reload bookings to get updated data
      loadBookings();
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  const handleViewDetail = async (booking: EmployeeBookingRecord) => {
    const detailBooking = await getBookingById(booking.id);
    if (detailBooking) {
      setSelectedBooking(detailBooking);
      setIsDetailModalOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      CONFIRMED: 'blue',
      CHECKED_IN: 'green',
      CANCELLED: 'red',
      NO_SHOW: 'orange',
      PENDING: 'orange',
      COMPLETED: 'green',
      FAILED: 'red',
      REFUNDED: 'purple',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts = {
      CONFIRMED: 'Đã xác nhận',
      CHECKED_IN: 'Đã check-in',
      CANCELLED: 'Đã hủy',
      NO_SHOW: 'Không đến',
      PENDING: 'Chờ thanh toán',
      COMPLETED: 'Đã thanh toán',
      FAILED: 'Thanh toán thất bại',
      REFUNDED: 'Đã hoàn tiền',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const columns: ColumnsType<EmployeeBookingRecord> = [
    {
      title: 'Mã booking',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      width: 120,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.customerName}</div>
          <div className="text-gray-500 text-sm">{record.customerPhone}</div>
          <Tag color={record.customerType === 'member' ? 'gold' : 'default'} size="small">
            {record.customerType === 'member' ? 'Thành viên' : 'Khách vãng lai'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Phim & Suất chiếu',
      key: 'movie',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.movieTitle}</div>
          <div className="text-gray-500 text-sm">
            {record.showDate} - {record.showTime}
          </div>
          <div className="text-gray-500 text-sm">{record.room}</div>
        </div>
      ),
    },
    {
      title: 'Ghế',
      dataIndex: 'seats',
      key: 'seats',
      width: 100,
      render: (seats: string[]) => (
        <div className="text-sm">
          {seats.join(', ')}
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount) => (
        <Text strong className="text-green-600">
          {amount.toLocaleString()}₫
        </Text>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'bookingStatus',
      key: 'bookingStatus',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.bookingStatus === 'CONFIRMED' && record.paymentStatus === 'COMPLETED' && (
            <Tooltip title="Check-in">
              <Button
                icon={<ScanOutlined />}
                size="small"
                type="primary"
                onClick={() => handleCheckIn(record)}
                loading={loading}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Use statistics from API
  const todayBookings = statistics?.todayBookings || 0;
  const todayRevenue = statistics?.todayRevenue || 0;
  const checkedInToday = statistics?.todayCheckIns || 0;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <Title level={2} className="mb-6">
        📋 Quản lý đặt vé
      </Title>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Booking hôm nay"
              value={todayBookings}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu hôm nay"
              value={todayRevenue}
              formatter={(value) => `${value?.toLocaleString()}₫`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Check-in hôm nay"
              value={checkedInToday}
              prefix={<ScanOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng booking"
              value={pagination.total}
              prefix={<FilterOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder="Trạng thái booking"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="CONFIRMED">Đã xác nhận</Option>
              <Option value="CHECKED_IN">Đã check-in</Option>
              <Option value="CANCELLED">Đã hủy</Option>
              <Option value="NO_SHOW">Không đến</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder="Trạng thái thanh toán"
              value={paymentFilter}
              onChange={setPaymentFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="PENDING">Chờ thanh toán</Option>
              <Option value="COMPLETED">Đã thanh toán</Option>
              <Option value="FAILED">Thất bại</Option>
              <Option value="REFUNDED">Đã hoàn tiền</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>
          <Col xs={24} md={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchText("");
                setStatusFilter("");
                setPaymentFilter("");
                setDateRange(null);
                loadBookings();
              }}
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} booking`,
            onChange: (page, pageSize) => {
              loadBookings({ page: page - 1, size: pageSize });
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết booking ${selectedBooking?.bookingCode}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedBooking && (
          <div className="space-y-4">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Khách hàng:</strong>
                <div>{selectedBooking.customerName}</div>
                <div>{selectedBooking.customerPhone}</div>
                {selectedBooking.customerEmail && <div>{selectedBooking.customerEmail}</div>}
              </Col>
              <Col span={12}>
                <strong>Phim:</strong>
                <div>{selectedBooking.movieTitle}</div>
                <div>{selectedBooking.showDate} - {selectedBooking.showTime}</div>
                <div>{selectedBooking.room}</div>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Ghế ngồi:</strong>
                <div>{selectedBooking.seats.join(', ')}</div>
              </Col>
              <Col span={12}>
                <strong>Tổng tiền:</strong>
                <div className="text-green-600 font-bold">
                  {selectedBooking.totalAmount.toLocaleString()}₫
                </div>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Trạng thái thanh toán:</strong>
                <div>
                  <Tag color={getStatusColor(selectedBooking.paymentStatus)}>
                    {getStatusText(selectedBooking.paymentStatus)}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <strong>Trạng thái booking:</strong>
                <div>
                  <Tag color={getStatusColor(selectedBooking.bookingStatus)}>
                    {getStatusText(selectedBooking.bookingStatus)}
                  </Tag>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <strong>Thời gian tạo:</strong>
                <div>{dayjs(selectedBooking.createdAt).format('DD/MM/YYYY HH:mm:ss')}</div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
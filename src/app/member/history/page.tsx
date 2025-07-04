"use client";

import React, { useState } from "react";
import {
  Typography,
  Card,
  Button,
  Tag,
  Empty,
  Spin,
  Alert,
  Row,
  Col,
  Divider,
  Input,
  Select,
  DatePicker,
  Pagination,
  Statistic,
} from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useBookingHistory, useMemberStatistics } from "@/hooks/member";
import type { MemberBooking, HistoryParams } from "@/types/member";
import dayjs from "dayjs";
import Image from "next/image";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function BookingHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Build params for API call
  const params: HistoryParams = {
    page: currentPage,
    size: pageSize,
    sortBy: "showDate",
    sortDirection: "DESC",
    ...(statusFilter !== "all" && { status: [statusFilter as any] }),
    ...(dateRange &&
      dateRange[0] && { startDate: dateRange[0].format("YYYY-MM-DD") }),
    ...(dateRange &&
      dateRange[1] && { endDate: dateRange[1].format("YYYY-MM-DD") }),
    ...(searchQuery && { movieTitle: searchQuery }),
  };

  const { bookings, totalElements, loading, error, refresh } =
    useBookingHistory(params);

  const { data: statistics, loading: statisticsLoading } =
    useMemberStatistics();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "green";
      case "CANCELLED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const renderBookingCard = (booking: MemberBooking) => (
    <Card
      key={booking.bookingId}
      className="mb-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500"
    >
      <Row gutter={16}>
        {/* Movie Poster */}
        <Col xs={24} sm={6} md={4}>
          <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4 sm:mb-0">
            {booking.moviePoster ? (
              <Image
                src={booking.moviePoster}
                alt={booking.movieTitle}
                className="w-full h-full object-cover rounded-lg"
                layout="fill"
              />
            ) : (
              <span className="text-gray-500 text-xs text-center px-2">
                Movie Poster
              </span>
            )}
          </div>
        </Col>

        {/* Booking Details */}
        <Col xs={24} sm={18} md={20}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <Typography.Title level={4} className="mb-1">
                {booking.movieTitle}
              </Typography.Title>
              <div className="flex items-center gap-2 mb-2">
                <Tag color={getStatusColor(booking.status)}>
                  {getStatusText(booking.status)}
                </Tag>
                <span className="text-gray-500 text-sm">
                  {booking.bookingCode}
                </span>
              </div>
            </div>
          </div>

          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <EnvironmentOutlined className="text-blue-500" />
                  <span className="text-sm">{booking.cinemaRoom}</span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarOutlined className="text-green-500" />
                  <span className="text-sm">
                    {formatDateTime(`${booking.showDate} ${booking.startTime}`)}
                  </span>
                </div>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ClockCircleOutlined className="text-orange-500" />
                  <span className="text-sm">
                    Seats:{" "}
                    {booking.seats
                      .map((seat) => `${seat.seatRow}${seat.seatNumber}`)
                      .join(", ")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    Total: {formatPrice(booking.finalAmount)}
                  </span>
                  {booking.discountAmount > 0 && (
                    <span className="text-xs text-green-600">
                      (Saved: {formatPrice(booking.discountAmount)})
                    </span>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          <Divider className="my-4" />

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Booked: {formatDateTime(booking.bookingDate)}
            </span>

            {booking.isCheckedIn && booking.checkInTime && (
              <span className="text-xs text-green-600">
                Checked in: {formatDateTime(booking.checkInTime)}
              </span>
            )}

            {booking.status === "CANCELLED" && (
              <span className="text-xs text-red-600">Cancelled</span>
            )}
          </div>

          {/* Concessions */}
          {booking.concessions && booking.concessions.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <Typography.Text strong className="text-sm">
                Concessions:
              </Typography.Text>
              <div className="mt-1">
                {booking.concessions.map((concession, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    {concession.concessionName} x{concession.quantity} -{" "}
                    {formatPrice(concession.totalPrice)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Typography.Title level={2} className="text-white mb-8 text-center">
        Booking History
      </Typography.Title>

      {/* Statistics Cards */}
      {statistics && !statisticsLoading && (
        <Row gutter={16} className="mb-6">
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Bookings"
                value={statistics.totalBookings}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Spent"
                value={statistics.totalSpent}
                formatter={(value) => formatPrice(Number(value))}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Saved"
                value={statistics.totalSaved}
                formatter={(value) => formatPrice(Number(value))}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Favorite Genre"
                value={statistics.favoriteGenre || "N/A"}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={16} className="mb-4">
          <Col xs={24} md={8}>
            <Search
              placeholder="Search by movie title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>

          <Col xs={24} md={6}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full"
            >
              <Option value="all">All Status</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Col>

          <Col xs={24} md={8}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              placeholder={["Start Date", "End Date"]}
              className="w-full"
            />
          </Col>

          <Col xs={24} md={2}>
            <Button
              icon={<ReloadOutlined />}
              onClick={refresh}
              loading={loading}
              className="w-full"
            >
              Refresh
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert
            message="Error Loading History"
            description={error}
            type="error"
            showIcon
            className="mb-4"
            action={
              <Button size="small" type="primary" onClick={refresh}>
                Retry
              </Button>
            }
          />
        )}
      </Card>

      {/* Booking List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <Empty description="No booking history found" className="py-12" />
        </Card>
      ) : (
        <>
          <div className="space-y-4">{bookings.map(renderBookingCard)}</div>

          {totalElements > pageSize && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage + 1}
                total={totalElements}
                pageSize={pageSize}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} bookings`
                }
                onChange={(page, size) => {
                  setCurrentPage(page - 1);
                  setPageSize(size || 10);
                }}
                onShowSizeChange={(current, size) => {
                  setCurrentPage(0);
                  setPageSize(size);
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

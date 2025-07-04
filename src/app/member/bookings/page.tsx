"use client";

import React, { useState } from "react";
import {
  Typography,
  Card,
  Button,
  Tag,
  Modal,
  Empty,
  Spin,
  Alert,
  Row,
  Col,
  QRCode,
  Divider,
  Input,
  Select,
  Pagination,
} from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useActiveBookings, useBookingActions } from "@/hooks/member";
import type { MemberBooking, BookingListParams } from "@/types/member";
import Image from "next/image";

const { Search } = Input;
const { Option } = Select;

export default function BookedTicketsPage() {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<MemberBooking | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Build params for API call
  const params: BookingListParams = {
    page: currentPage,
    size: pageSize,
    sortBy: "bookingDate",
    sortDirection: "DESC",
    ...(statusFilter !== "all" && { status: [statusFilter as MemberBooking["status"]] }),
  };

  const { bookings, totalElements, loading, error, refresh } =
    useActiveBookings(params);

  const { cancelBooking, cancelling, checkInBooking, checkingIn } =
    useBookingActions(() => {
      refresh(); // Refresh list after action
      setSelectedBooking(null);
      setQrModalVisible(false);
    });

  // Filter bookings by search query
  const filteredBookings = bookings.filter(
    (booking) =>
      !searchQuery ||
      booking.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.cinemaRoom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookingCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShowQR = (booking: MemberBooking) => {
    setSelectedBooking(booking);
    setQrModalVisible(true);
  };

  const handleCancelBooking = async (booking: MemberBooking) => {
    Modal.confirm({
      title: "Cancel Booking",
      content: `Are you sure you want to cancel the booking for "${booking.movieTitle}"?`,
      okText: "Yes, Cancel",
      okType: "danger",
      cancelText: "No",
      onOk: () => cancelBooking({ bookingId: booking.bookingId }),
    });
  };

  const handleCheckIn = async (booking: MemberBooking) => {
    await checkInBooking({
      bookingId: booking.bookingId,
      qrCode: booking.qrCode,
    });
  };

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
      case "CONFIRMED":
        return "blue";
      case "PAID":
        return "green";
      case "PENDING":
        return "orange";
      case "CANCELLED":
        return "red";
      case "COMPLETED":
        return "purple";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmed";
      case "PAID":
        return "Paid";
      case "PENDING":
        return "Pending";
      case "CANCELLED":
        return "Cancelled";
      case "COMPLETED":
        return "Completed";
      default:
        return status;
    }
  };

  const renderBookingCard = (booking: MemberBooking) => (
    <Card
      key={booking.bookingId}
      className="mb-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
    >
      <Row gutter={16}>
        {/* Movie Poster */}
        <Col xs={24} sm={6} md={4}>
          <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4 sm:mb-0">
            {booking.moviePoster ? (
              <Image
                width={128}
                height={192}
                src={booking.moviePoster}
                alt={booking.movieTitle}
                className="w-full h-full object-cover rounded-lg"
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
                  Booking: {booking.bookingCode}
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

          <div className="flex flex-wrap gap-2">
            {booking.canCheckIn && (
              <Button
                type="primary"
                icon={<QrcodeOutlined />}
                onClick={() => handleCheckIn(booking)}
                loading={checkingIn}
                size="small"
              >
                Check In
              </Button>
            )}

            {booking.qrCode && (
              <Button
                icon={<QrcodeOutlined />}
                onClick={() => handleShowQR(booking)}
                size="small"
              >
                Show QR Code
              </Button>
            )}

            {booking.canCancel && (
              <Button
                danger
                onClick={() => handleCancelBooking(booking)}
                loading={cancelling}
                size="small"
              >
                Cancel Booking
              </Button>
            )}

            <span className="text-xs text-gray-500 flex items-center">
              Booked: {formatDateTime(booking.bookingDate)}
            </span>
          </div>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Typography.Title level={2} className="text-white mb-8 text-center">
        Active Bookings
      </Typography.Title>

      <Card className="mb-6">
        <Row gutter={16} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search by movie, cinema, or booking code"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full"
              prefix={<FilterOutlined />}
            >
              <Option value="all">All Status</Option>
              <Option value="CONFIRMED">Confirmed</Option>
              <Option value="PAID">Paid</Option>
              <Option value="PENDING">Pending</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4}>
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
            message="Error Loading Bookings"
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <Empty
            description={
              searchQuery
                ? "No bookings found matching your search"
                : "No active bookings found"
            }
            className="py-12"
          />
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {filteredBookings.map(renderBookingCard)}
          </div>

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

      {/* QR Code Modal */}
      <Modal
        title="Booking QR Code"
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setQrModalVisible(false)}>
            Close
          </Button>,
        ]}
        centered
      >
        {selectedBooking && (
          <div className="text-center">
            <Typography.Title level={4} className="mb-4">
              {selectedBooking.movieTitle}
            </Typography.Title>

            <div className="mb-4">
              <QRCode
                value={selectedBooking.qrCode || selectedBooking.bookingCode}
                size={200}
              />
            </div>

            <Typography.Text className="text-gray-600">
              Booking Code: {selectedBooking.bookingCode}
            </Typography.Text>

            <div className="mt-4 text-sm text-gray-500">
              <p>Show this QR code at the cinema for check-in</p>
              <p>
                Valid for:{" "}
                {formatDateTime(
                  `${selectedBooking.showDate} ${selectedBooking.startTime}`
                )}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

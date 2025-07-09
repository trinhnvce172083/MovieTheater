"use client";

import { useState } from "react";
import { Table, Input, Select, Typography, Pagination, Spin, Alert, Button, Empty } from "antd";
import { useActiveBookings } from "@/hooks/member";
import { ReloadOutlined } from "@ant-design/icons";
import type { MemberBooking } from "@/types/member";

const { Option } = Select;

const columns = [
  {
    title: "#",
    dataIndex: "bookingId",
    key: "bookingId",
    width: 50,
    render: (text: any, record: any, index: number) => index + 1,
  },
  {
    title: "MOVIE NAME",
    dataIndex: "movieTitle",
    key: "movieTitle",
  },
  {
    title: "BOOKING DATE",
    dataIndex: "bookingDate",
    key: "bookingDate",
    render: (date: string) => {
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  {
    title: "TOTAL AMOUNT",
    dataIndex: "finalAmount",
    key: "finalAmount",
    render: (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    },
  },
  {
    title: "STATUS",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const statusConfig = {
        CONFIRMED: { color: "blue", text: "Confirmed" },
        PAID: { color: "green", text: "Paid" },
        COMPLETED: { color: "purple", text: "Completed" },
        PENDING: { color: "orange", text: "Pending" },
      };
      const config = statusConfig[status as keyof typeof statusConfig] || { color: "default", text: status };
      return (
        <span style={{ color: config.color, fontWeight: 500 }}>{config.text}</span>
      );
    },
  },
];

export default function BookedTicketsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);
  const [search, setSearch] = useState("");

  // Lấy dữ liệu booking thực tế từ API - đơn giản hóa params
  const { bookings, loading, error, refresh, totalElements } = useActiveBookings();

  // Lọc dữ liệu theo search
  const filteredData = bookings.filter((item: MemberBooking) =>
    item.movieTitle.toLowerCase().includes(search.toLowerCase()) ||
    item.bookingCode.toLowerCase().includes(search.toLowerCase())
  );

  // Phân trang
  const pagedData = filteredData.slice((current - 1) * pageSize, current * pageSize);

  const handlePageChange = (page: number, size?: number) => {
    setCurrent(page);
    if (size) setPageSize(size);
  };

  // Hiển thị loading chỉ khi lần đầu load
  if (loading && bookings.length === 0) {
    return (
      <div style={{ background: "#f7f8fa", minHeight: "100vh", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001", padding: 24, maxWidth: 1100, margin: "0 auto" }}>
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#f7f8fa", minHeight: "100vh", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001", padding: 24, maxWidth: 1100, margin: "0 auto" }}>
          <Alert
            message="Error Loading Bookings"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" type="primary" onClick={refresh}>
                Retry
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001", padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <Typography.Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
          Booked ticket
        </Typography.Title>
        
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <span style={{ marginRight: 8 }}>Show</span>
          <Select value={pageSize} style={{ width: 70, marginRight: 8 }} onChange={setPageSize}>
            {[10, 20, 50].map((num) => (
              <Option key={num} value={num}>{num}</Option>
            ))}
          </Select>
          <span style={{ marginRight: 16 }}>entries</span>
          <div style={{ flex: 1 }} />
          <span style={{ marginRight: 8 }}>Search:</span>
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrent(1); }}
            style={{ width: 200 }}
            allowClear
            placeholder="Search by movie name or booking code"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={refresh}
            loading={loading}
            style={{ marginLeft: 8 }}
          >
            Refresh
          </Button>
        </div>
        
        {bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Empty
              description="Chưa có vé đã đặt"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={pagedData}
              pagination={false}
              bordered
              size="middle"
              loading={loading}
              rowKey="bookingId"
            />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <span style={{ color: "#666" }}>
                Showing {((current - 1) * pageSize) + 1} to {Math.min(current * pageSize, filteredData.length)} of {filteredData.length} entries
              </span>
              <Pagination
                current={current}
                pageSize={pageSize}
                total={filteredData.length}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

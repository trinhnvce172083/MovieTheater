"use client";

import { useState, useEffect } from "react";
import { Table, Input, Select, Typography, Pagination, Spin, Alert, Button, Empty } from "antd";
import { useMemberBookings } from "@/hooks/member";
import { ReloadOutlined } from "@ant-design/icons";
import type { MemberBooking } from "@/types/member";

const { Option } = Select;

const columns = [
  {
    title: "#",
    key: "index",
    render: (_: any, __: any, idx: number) => idx + 1,
    width: 50,
  },
  {
    title: "BOOKING DATE",
    dataIndex: "bookingDate",
    key: "bookingDate",
    render: (date: string) => {
      if (!date) return "—";
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      const hour = d.getHours().toString().padStart(2, '0');
      const minute = d.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hour}:${minute}`;
    },
  },
  {
    title: "MOVIE NAME",
    dataIndex: "movieTitle",
    key: "movieTitle",
    render: v => v || "—",
  },
  {
    title: "TOTAL AMOUNT",
    dataIndex: "finalAmount",
    key: "finalAmount",
    render: v => v ? new Intl.NumberFormat('vi-VN').format(v) : "—",
  },
  {
    title: "STATUS",
    dataIndex: "status",
    key: "status",
    render: (v: string) => {
      if (!v) return "—";
      if (v === "COMPLETED" || v === "PAID" || v === "DONE") return <span style={{color: "green"}}>DONE</span>;
      if (v === "CANCELLED" || v === "FAILED") return <span style={{color: "red"}}>FAILED</span>;
      if (v === "PENDING" || v === "CONFIRMED") return <span style={{color: "#007bff"}}>WAITING FOR TICKET</span>;
      return v;
    },
  },
];

export default function BookedTicketsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);
  const [search, setSearch] = useState("");

  const { bookings, loading, error, refresh, totalElements } = useMemberBookings();

  // Reset lại trang khi bookings thay đổi
  useEffect(() => {
    setCurrent(1);
  }, [bookings]);

  // Đảm bảo bookings luôn là mảng
  const bookingsArray = Array.isArray(bookings) ? bookings : [];

  // Đảm bảo filter không lỗi khi bookings chưa có dữ liệu
  const filteredData = bookingsArray.filter((item: MemberBooking) =>
    (item.movieTitle || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.bookingCode || "").toLowerCase().includes(search.toLowerCase())
  );

  const pagedData = filteredData.slice((current - 1) * pageSize, current * pageSize);

  // Log kiểm tra dữ liệu
  console.log("bookings thực tế:", bookingsArray);
  console.log("filteredData:", filteredData);
  console.log("pagedData:", pagedData);

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

  // Render Table theo filteredData.length
  return (
    <div style={{ background: "#f7f8fa", minHeight: "100vh", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001", padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <Typography.Title level={4} style={{ textAlign: "center", marginBottom: 24, marginTop: 32 }}>
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
        
        {filteredData.length === 0 ? (
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
              rowKey="bookingCode"
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

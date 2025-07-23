"use client";

import { useState, useEffect } from "react";
import { Table, Input, Select, Typography, Pagination, Spin, Alert, Button, Empty } from "antd";
import type { Breakpoint } from "antd/es/_util/responsiveObserver";
import { useMemberBookings } from "@/hooks/member";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
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
    title: "SHOW TIME",
    key: "showTime",
    render: (_, record: MemberBooking) => {
      // Ưu tiên sử dụng formattedShowDateTime từ schedule nếu có
      if (record.schedule?.formattedShowDateTime) {
        return record.schedule.formattedShowDateTime;
      }
      
      // Fallback: sử dụng showDate + startTime
      if (record.showDate && record.startTime) {
        const showDate = new Date(record.showDate);
        const day = showDate.getDate().toString().padStart(2, '0');
        const month = (showDate.getMonth() + 1).toString().padStart(2, '0');
        const year = showDate.getFullYear();
        return `${day}/${month}/${year} ${record.startTime}`;
      }
      
      // Fallback: sử dụng schedule.showDateTime
      if (record.schedule?.showDateTime) {
        const showDateTime = new Date(record.schedule.showDateTime);
        const day = showDateTime.getDate().toString().padStart(2, '0');
        const month = (showDateTime.getMonth() + 1).toString().padStart(2, '0');
        const year = showDateTime.getFullYear();
        const hour = showDateTime.getHours().toString().padStart(2, '0');
        const minute = showDateTime.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hour}:${minute}`;
      }
      
      return "—";
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
      if (v === "COMPLETED" || v === "PAID") return <span style={{color: "green"}}>DONE</span>;
      if (v === "CANCELLED" || v === "EXPIRED") return <span style={{color: "red"}}>FAILED</span>;
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
  
  // Debug showtime data
  if (pagedData.length > 0) {
    console.log("Sample booking data:", pagedData[0]);
    console.log("showDate:", pagedData[0].showDate);
    console.log("startTime:", pagedData[0].startTime);
    console.log("bookingDate:", pagedData[0].bookingDate);
    console.log("All booking fields:", Object.keys(pagedData[0]));
    console.log("Full booking object:", JSON.stringify(pagedData[0], null, 2));
  }

  const handlePageChange = (page: number, size?: number) => {
    setCurrent(page);
    if (size) setPageSize(size);
  };

  // Hiển thị loading chỉ khi lần đầu load
  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
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
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
        <Typography.Title level={4} className="text-center mb-6 lg:mb-8 mt-8">
          Booked ticket
        </Typography.Title>
        
        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <Select 
              value={pageSize} 
              className="w-20" 
              onChange={setPageSize}
              size="middle"
            >
            {[10, 20, 50].map((num) => (
              <Option key={num} value={num}>{num}</Option>
            ))}
          </Select>
            <span className="text-sm text-gray-600">entries</span>
          </div>

          {/* Search Input */}
          <div className="flex-1 lg:flex-none lg:ml-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden lg:block">Search:</span>
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrent(1); }}
                className="w-full lg:w-64"
            allowClear
            placeholder="Search by movie name or booking code"
                prefix={<SearchOutlined />}
                size="middle"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={refresh}
            loading={loading}
                size="middle"
          >
                <span className="hidden lg:inline">Refresh</span>
          </Button>
            </div>
          </div>
        </div>
        
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <Empty
              description="Chưa có vé đã đặt"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 mb-6">
              {pagedData.map((item: MemberBooking, index: number) => (
                <div key={item.bookingCode} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm text-gray-600">#{((current - 1) * pageSize) + index + 1}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === "COMPLETED" || item.status === "PAID"
                        ? "bg-green-100 text-green-800"
                        : item.status === "CANCELLED" || item.status === "EXPIRED"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {item.status === "COMPLETED" || item.status === "PAID" ? "DONE" :
                       item.status === "CANCELLED" || item.status === "EXPIRED" ? "FAILED" :
                       item.status === "PENDING" || item.status === "CONFIRMED" ? "WAITING FOR TICKET" : item.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Movie:</span>
                      <p className="font-medium">{item.movieTitle || "—"}</p>
                    </div>
                                       <div>
                     <span className="text-xs text-gray-500">Show Time:</span>
                     <p className="text-sm">
                       {(() => {
                         // Ưu tiên sử dụng formattedShowDateTime từ schedule nếu có
                         if (item.schedule?.formattedShowDateTime) {
                           return item.schedule.formattedShowDateTime;
                         }
                         
                         // Fallback: sử dụng showDate + startTime
                         if (item.showDate && item.startTime) {
                           const showDate = new Date(item.showDate);
                           const day = showDate.getDate().toString().padStart(2, '0');
                           const month = (showDate.getMonth() + 1).toString().padStart(2, '0');
                           const year = showDate.getFullYear();
                           return `${day}/${month}/${year} ${item.startTime}`;
                         }
                         
                         // Fallback: sử dụng schedule.showDateTime
                         if (item.schedule?.showDateTime) {
                           const showDateTime = new Date(item.schedule.showDateTime);
                           const day = showDateTime.getDate().toString().padStart(2, '0');
                           const month = (showDateTime.getMonth() + 1).toString().padStart(2, '0');
                           const year = showDateTime.getFullYear();
                           const hour = showDateTime.getHours().toString().padStart(2, '0');
                           const minute = showDateTime.getMinutes().toString().padStart(2, '0');
                           return `${day}/${month}/${year} ${hour}:${minute}`;
                         }
                         
                         return "—";
                       })()}
                     </p>
                   </div>
                    <div>
                      <span className="text-xs text-gray-500">Amount:</span>
                      <p className="font-medium text-green-600">
                        {item.finalAmount ? new Intl.NumberFormat('vi-VN').format(item.finalAmount) : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block">
            <Table
              columns={columns}
              dataSource={pagedData}
              pagination={false}
              bordered
              size="middle"
              loading={loading}
              rowKey="bookingCode"
                scroll={{ x: 800 }}
            />
            </div>
            
            {/* Pagination */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mt-6">
              <span className="text-sm text-gray-600 text-center lg:text-left">
                Showing {((current - 1) * pageSize) + 1} to {Math.min(current * pageSize, filteredData.length)} of {filteredData.length} entries
              </span>
              <Pagination
                current={current}
                pageSize={pageSize}
                total={filteredData.length}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                size="default"
                className="flex justify-center lg:justify-end"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

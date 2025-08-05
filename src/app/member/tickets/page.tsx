"use client";

import { useEffect, useState, useCallback } from "react";
import { Table, Button, message, Tag, Typography, Modal, Card, Alert, Spin, Empty } from "antd";
import { FileTextOutlined, ReloadOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { MemberApiService } from "@/api/member";

interface Ticket {
  bookingId: string | number;
  movieTitle: string;
  showDate: string;
  startTime: string;
  endTime: string;
  cinemaRoom: string;
  seats: Array<{
    seatNumber: string;
    seatType: string;
    seatRow?: string;
    price?: number;
  }>;
  finalAmount: number;
  status: string;
  bookingCode: string;
  qrCode?: string;
  canCancel: boolean;
  schedule?: {
    formattedShowDateTime?: string;
    showDateTime?: string;
  };
}

const CancelledTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cancelled tickets only
  const loadTickets = useCallback(async () => {
    console.log("🎫 Loading cancelled tickets...");
    setLoading(true);
    setError(null);

    try {
      const response = await MemberApiService.getBookings({
        page: 0,
        size: 100,
        sortBy: "bookingDate",
        sortDirection: "DESC",
      });

      console.log("📦 Cancelled tickets response:", response);
      const ticketsData = response.data.content || [];
      
      // Filter chỉ lấy tickets có status CANCELLED
      const cancelledTicketsData = ticketsData.filter((item: any) => 
        item.status === "CANCELLED" || item.bookingStatus === "CANCELLED"
      );
      
      // Transform data to match our interface - chỉ cancelled tickets
      const transformedTickets: Ticket[] = cancelledTicketsData.map((item: any) => ({
        bookingId: item.bookingId || item.id,
        movieTitle: item.movieTitle || "Unknown Movie",
        showDate: item.showDate || "",
        startTime: item.startTime || "",
        endTime: item.endTime || "",
        cinemaRoom: item.cinemaRoom || "",
        seats: item.seats || [],
        finalAmount: item.finalAmount || 0,
        status: item.status || "CANCELLED",
        bookingCode: item.bookingCode || "",
        qrCode: item.qrCode,
        canCancel: false, // Không cho phép cancel nữa
        schedule: item.schedule,
      }));

      setTickets(transformedTickets);
      console.log("✅ Cancelled tickets loaded successfully:", transformedTickets);
    } catch (err: any) {
      console.error("❌ Failed to load cancelled tickets:", err);
      setError("Failed to load cancelled tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, []);

  const formatShowTime = (ticket: Ticket) => {
    // Priority: formattedShowDateTime from schedule
    if (ticket.schedule?.formattedShowDateTime) {
      return ticket.schedule.formattedShowDateTime;
    }
    
    // Fallback: showDate + startTime
    if (ticket.showDate && ticket.startTime) {
      const showDate = new Date(ticket.showDate);
      const day = showDate.getDate().toString().padStart(2, '0');
      const month = (showDate.getMonth() + 1).toString().padStart(2, '0');
      const year = showDate.getFullYear();
      return `${day}/${month}/${year} ${ticket.startTime}`;
    }
    
    // Fallback: schedule.showDateTime
    if (ticket.schedule?.showDateTime) {
      const showDateTime = new Date(ticket.schedule.showDateTime);
      const day = showDateTime.getDate().toString().padStart(2, '0');
      const month = (showDateTime.getMonth() + 1).toString().padStart(2, '0');
      const year = showDateTime.getFullYear();
      const hour = showDateTime.getHours().toString().padStart(2, '0');
      const minute = showDateTime.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hour}:${minute}`;
    }
    
    return "—";
  };

  const formatCancellationDate = (dateString?: string) => {
    if (!dateString) return "—";
    
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hour}:${minute}`;
    } catch {
      return dateString;
    }
  };

    const renderTicketCard = (ticket: Ticket, index: number) => (
    <Card key={ticket.bookingId} className="mb-4 border-red-200 bg-red-50 hover:shadow-md transition-shadow" bordered>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-red-600 text-lg" />
            <span className="font-semibold text-lg">{ticket.movieTitle}</span>
          </div>
          <Tag color="red" className="font-medium">
            CANCELLED
          </Tag>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-600">Show Time:</span>
            <div className="flex items-center gap-1 mt-1">
              <CalendarOutlined className="text-gray-400" />
              <span>{formatShowTime(ticket)}</span>
            </div>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Cinema Room:</span>
            <p className="mt-1">{ticket.cinemaRoom || "—"}</p>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Seats:</span>
            <div className="flex items-center gap-1 mt-1">
              <UserOutlined className="text-gray-400" />
              <span>{ticket.seats?.map(s => s.seatNumber).join(", ") || "—"}</span>
            </div>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Original Price:</span>
            <p className="mt-1 text-gray-600 line-through">
              {new Intl.NumberFormat('vi-VN').format(ticket.finalAmount)}₫
            </p>
          </div>
        </div>

        {ticket.bookingCode && (
          <div>
            <span className="font-medium text-gray-600">Booking Code:</span>
            <p className="mt-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
              {ticket.bookingCode}
            </p>
          </div>
        )}

        <div className="pt-2 border-t">
          <span className="text-sm font-medium text-red-600">
            Ticket Cancelled
          </span>
        </div>
      </div>
    </Card>
  );

    const columns = [
    { 
      title: "Movie", 
      dataIndex: "movieTitle", 
      key: "movieTitle",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-red-600" />
          <span className="font-medium">{text}</span>
        </div>
      )
    },
    { 
      title: "Show Time", 
      key: "showTime", 
      render: (_: any, record: Ticket) => formatShowTime(record)
    },
    { 
      title: "Cinema Room", 
      dataIndex: "cinemaRoom", 
      key: "cinemaRoom",
      render: (text: string) => text || "—"
    },
    { 
      title: "Seats", 
      key: "seats", 
      render: (_: any, record: Ticket) => {
        const seatInfo = record.seats?.map(s => s.seatNumber).join(", ");
        return seatInfo || "—";
      }
    },
    { 
      title: "Original Price", 
      dataIndex: "finalAmount", 
      key: "finalAmount", 
      render: (value: number) => (
        <span className="text-gray-600 line-through">
          {new Intl.NumberFormat('vi-VN').format(value)}₫
        </span>
      )
    },
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status", 
      render: () => (
        <Tag color="red" className="font-medium">
          CANCELLED
        </Tag>
      )
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
            <span className="ml-3">Loading cancelled tickets...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
          <Alert
            message="Error Loading Cancelled Tickets"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" type="primary" onClick={loadTickets}>
                Try Again
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
        <Typography.Title level={2} className="text-center mb-6 lg:mb-8 mt-8 text-red-600">
          Cancelled Tickets
        </Typography.Title>

        {/* Header Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-red-600 text-xl" />
            <span className="text-lg font-medium text-gray-700">Cancelled Bookings</span>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadTickets}
            loading={loading}
            size="middle"
            danger
          >
            Refresh
          </Button>
        </div>

        {/* Tickets List */}
        {tickets.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 mb-6">
              {tickets.map((ticket, index) => renderTicketCard(ticket, index))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table 
                columns={columns} 
                dataSource={tickets} 
                rowKey="bookingId" 
                loading={loading}
                scroll={{ x: 1000 }}
                size="middle"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} cancelled tickets`,
                }}
                rowClassName="bg-red-50"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Empty
              description="No cancelled tickets found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelledTickets;

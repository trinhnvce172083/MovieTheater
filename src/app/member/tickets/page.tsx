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

const ManagedTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [ticketToCancel, setTicketToCancel] = useState<Ticket | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Load tickets
  const loadTickets = useCallback(async () => {
    console.log("🎫 Loading tickets...");
    setLoading(true);
    setError(null);

    try {
      const response = await MemberApiService.getBookings({
        page: 0,
        size: 50,
        sortBy: "bookingDate",
        sortDirection: "DESC",
      });

      console.log("📦 Tickets response:", response);
      const ticketsData = response.data.content || [];
      
      // Transform data to match our interface - backend mới đã có cấu trúc chuẩn
      const transformedTickets: Ticket[] = ticketsData.map((item: any) => ({
        bookingId: item.bookingId || item.id,
        movieTitle: item.movieTitle || "Unknown Movie",
        showDate: item.showDate || "",
        startTime: item.startTime || "",
        endTime: item.endTime || "",
        cinemaRoom: item.cinemaRoom || "",
        seats: item.seats || [],
        finalAmount: item.finalAmount || 0,
        status: item.status || "PENDING",
        bookingCode: item.bookingCode || "",
        qrCode: item.qrCode,
        canCancel: item.canCancel !== undefined ? item.canCancel : (item.status !== "CANCELLED" && item.status !== "COMPLETED"),
        schedule: item.schedule,
      }));

      setTickets(transformedTickets);
      console.log("✅ Tickets loaded successfully:", transformedTickets);
    } catch (err: any) {
      console.error("❌ Failed to load tickets:", err);
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleCancelClick = (ticket: Ticket) => {
    setTicketToCancel(ticket);
    setCancelModalVisible(true);
  };

  const handleCancelConfirm = async () => {
    if (!ticketToCancel) return;

    setCancelling(true);
    try {
      await MemberApiService.cancelBooking({
        bookingId: ticketToCancel.bookingId.toString(),
        reason: "User requested cancellation"
      });

      message.success("Ticket cancelled successfully!");

      // Update local state immediately
      setTickets(prev => prev.map(t => 
        t.bookingId === ticketToCancel.bookingId 
          ? { ...t, status: "CANCELLED", canCancel: false }
          : t
      ));

      setCancelModalVisible(false);
      setTicketToCancel(null);

      // Refresh from server after a delay
      setTimeout(() => {
        loadTickets();
      }, 1000);

    } catch (err: any) {
      console.error("Error cancelling ticket:", err);
      
      let errorMessage = "Failed to cancel ticket";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      message.error(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

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

  const getStatusColor = (status: string) => {
    const statusColors = {
      "PENDING": "orange",
      "CONFIRMED": "blue", 
      "PAID": "green",
      "COMPLETED": "green",
      "CANCELLED": "red",
      "EXPIRED": "red"
    };
    return statusColors[status as keyof typeof statusColors] || "default";
  };

  const canCancelTicket = (ticket: Ticket) => {
    return ticket.status !== "CANCELLED" && ticket.status !== "COMPLETED" && ticket.canCancel;
  };

  const renderTicketCard = (ticket: Ticket, index: number) => (
    <Card key={ticket.bookingId} className="mb-4 hover:shadow-md transition-shadow" bordered>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
                       <FileTextOutlined className="text-blue-600 text-lg" />
           <span className="font-semibold text-lg">{ticket.movieTitle}</span>
          </div>
          <Tag color={getStatusColor(ticket.status)} className="font-medium">
            {ticket.status}
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
            <span className="font-medium text-gray-600">Total Price:</span>
            <p className="mt-1 text-green-600 font-semibold">
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
          {canCancelTicket(ticket) ? (
            <Button 
              danger 
              size="middle" 
              onClick={() => handleCancelClick(ticket)}
              className="w-full md:w-auto"
            >
              Cancel Ticket
            </Button>
          ) : (
            <span className={`text-sm font-medium ${
              ticket.status === "CANCELLED" ? "text-red-500" : 
              ticket.status === "COMPLETED" ? "text-green-500" : 
              "text-gray-400"
            }`}>
              {ticket.status === "CANCELLED" ? "Cancelled" : 
               ticket.status === "COMPLETED" ? "Completed" : 
               "Cannot Cancel"}
            </span>
          )}
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
           <FileTextOutlined className="text-blue-600" />
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
      title: "Total Price", 
      dataIndex: "finalAmount", 
      key: "finalAmount", 
      render: (value: number) => (
        <span className="text-green-600 font-semibold">
          {new Intl.NumberFormat('vi-VN').format(value)}₫
        </span>
      )
    },
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status", 
      render: (status: string) => (
        <Tag color={getStatusColor(status)} className="font-medium">
          {status}
        </Tag>
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Ticket) => {
        return canCancelTicket(record) ? (
          <Button danger size="small" onClick={() => handleCancelClick(record)}>
            Cancel
          </Button>
        ) : (
          <span className={`text-sm font-medium ${
            record.status === "CANCELLED" ? "text-red-500" : 
            record.status === "COMPLETED" ? "text-green-500" : 
            "text-gray-400"
          }`}>
            {record.status === "CANCELLED" ? "Cancelled" : 
             record.status === "COMPLETED" ? "Completed" : 
             "Cannot Cancel"}
          </span>
        );
      },
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
            <span className="ml-3">Loading tickets...</span>
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
            message="Error Loading Tickets"
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
        <Typography.Title level={2} className="text-center mb-6 lg:mb-8 mt-8">
          My Tickets
        </Typography.Title>

        {/* Header Controls */}
        <div className="flex justify-between items-center mb-6">
                     <div className="flex items-center gap-2">
             <FileTextOutlined className="text-blue-600 text-xl" />
             <span className="text-lg font-medium text-gray-700">Booked Tickets</span>
           </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadTickets}
            loading={loading}
            size="middle"
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
                    `${range[0]}-${range[1]} of ${total} tickets`,
                }}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Empty
              description="No tickets found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}

        {/* Cancel Ticket Modal */}
        <Modal
          title="Cancel Ticket"
          open={cancelModalVisible}
          onCancel={() => {
            setCancelModalVisible(false);
            setTicketToCancel(null);
          }}
          onOk={handleCancelConfirm}
          okText="Yes, Cancel"
          cancelText="No"
          okButtonProps={{ danger: true, loading: cancelling }}
          cancelButtonProps={{ disabled: cancelling }}
          width={400}
          centered
        >
          {ticketToCancel && (
            <div className="text-center py-4">
              <p className="text-base mb-4">Are you sure you want to cancel this ticket?</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Movie:</span> {ticketToCancel.movieTitle}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Show Time:</span> {formatShowTime(ticketToCancel)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Seats:</span> {ticketToCancel.seats?.map(s => s.seatNumber).join(", ")}
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ManagedTickets;

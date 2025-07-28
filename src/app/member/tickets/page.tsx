"use client";

import { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Tag, Typography, Modal, Card, Input } from "antd";
import { MemberApiService } from "@/api/member";

const ManagedTickets: React.FC = () => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [managedTickets, setManagedTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [ticketToCancel, setTicketToCancel] = useState<any | null>(null);

  // Lấy danh sách vé thật từ API, không mapping lại object booking
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await MemberApiService.getBookings({});
      setManagedTickets(res.data.content || []);
    } catch (err: any) {
      message.error("Error loading tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCancelClick = (ticket: any) => {
    setTicketToCancel(ticket);
    setCancelModalVisible(true);
  };

    const handleCancelConfirm = async () => {
    if (!ticketToCancel) return;

    try {
      console.log("Attempting to cancel booking:", ticketToCancel.bookingId);
      console.log("Full ticket data:", ticketToCancel);

      // Kiểm tra accessToken
      const accessToken = localStorage.getItem('accessToken');
      console.log("Access token:", accessToken ? "Có token" : "Không có token");
      
      if (!accessToken) {
        throw new Error("Không có access token. Vui lòng đăng nhập lại.");
      }
      
      // Sử dụng MemberApiService thay vì fetch trực tiếp
      const response = await MemberApiService.cancelBooking({
        bookingId: ticketToCancel.bookingId.toString(),
            reason: "User cancelled"
      });

      console.log("Cancel booking response:", response);
      
      message.success("Ticket cancelled successfully!");

      // Cập nhật local state ngay lập tức
      setManagedTickets(prev => prev.map(t => 
        t.bookingId === ticketToCancel.bookingId 
          ? { ...t, status: "CANCELLED", canCancel: false }
          : t
      ));

      // Đóng modal
      setCancelModalVisible(false);
      setTicketToCancel(null);

      // Sau đó fetch lại từ server để đảm bảo đồng bộ
      setTimeout(() => {
        fetchTickets();
      }, 1000);
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      
      // Xử lý lỗi chi tiết hơn
      let errorMessage = "Failed to cancel ticket!";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      message.error(errorMessage);
    }
  };

  const columns = [
    { title: "Movie", dataIndex: "movieTitle", key: "movieTitle" },
    { title: "Show Time", key: "showTime", render: (_, record) => {
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
    }},
    { title: "Seats", key: "seats", render: (_, record) => {
      const seatInfo = record.seats?.map((s: any) => s.seatNumber).join(", ");
      return seatInfo || "—";
    }},
    { title: "Seat Type", key: "seatType", render: (_, record) => {
      const seatTypes = record.seats?.map((s: any) => s.seatType).filter((type: string, index: number, arr: string[]) => arr.indexOf(type) === index);
      return seatTypes?.join(", ") || "—";
    }},
    { title: "Total Price", dataIndex: "finalAmount", key: "finalAmount", render: v => new Intl.NumberFormat('vi-VN').format(v) },
    { title: "Status", dataIndex: "status", key: "status", render: (v: string) => {
      if (!v) return "—";
      const statusColors = {
        "PENDING": "orange",
        "CONFIRMED": "blue", 
        "PAID": "green",
        "COMPLETED": "green",
        "CANCELLED": "red",
        "EXPIRED": "red"
      };
      return <Tag color={statusColors[v as keyof typeof statusColors] || "default"}>{v}</Tag>;
    }},
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        // Check if ticket can be cancelled - always allow cancellation for non-cancelled, non-completed tickets
        const canCancelTicket = () => {
          // Always allow cancellation if status is not CANCELLED or COMPLETED
          return record.status !== "CANCELLED" && record.status !== "COMPLETED";
        };

        return canCancelTicket() ? (
          <Button danger size="small" onClick={() => handleCancelClick(record)}>
            Cancel Ticket
          </Button>
        ) : (
          <span className={`text-sm ${
            record.status === "CANCELLED" ? "text-red-500 font-medium" : 
            record.status === "COMPLETED" ? "text-green-500 font-medium" : 
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

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6">
      <Typography.Title level={2} className="text-center mb-6 lg:mb-8 mt-8">
        Managed Tickets
      </Typography.Title>
      
      <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 mb-6">
          {managedTickets.map((ticket, index) => (
            <Card key={ticket.bookingId} className="border rounded-lg">
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500">Movie:</span>
                  <p className="font-medium">{ticket.movieTitle}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Show Time:</span>
                    <p className="text-sm">
                      {(() => {
                        // Ưu tiên sử dụng formattedShowDateTime từ schedule nếu có
                        if (ticket.schedule?.formattedShowDateTime) {
                          return ticket.schedule.formattedShowDateTime;
                        }
                        
                        // Fallback: sử dụng showDate + startTime
                        if (ticket.showDate && ticket.startTime) {
                          const showDate = new Date(ticket.showDate);
                          const day = showDate.getDate().toString().padStart(2, '0');
                          const month = (showDate.getMonth() + 1).toString().padStart(2, '0');
                          const year = showDate.getFullYear();
                          return `${day}/${month}/${year} ${ticket.startTime}`;
                        }
                        
                        // Fallback: sử dụng schedule.showDateTime
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
                      })()}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Seat Type:</span>
                    <p className="text-sm">
                      {ticket.seats?.map((s: any) => s.seatType).filter((type: string, index: number, arr: string[]) => arr.indexOf(type) === index).join(", ") || "—"}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Seats:</span>
                  <p className="text-sm">{ticket.seats?.map((s: any) => s.seatNumber).join(", ") || "—"}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-500">Total Price:</span>
                    <p className="font-medium text-green-600">
                      {new Intl.NumberFormat('vi-VN').format(ticket.finalAmount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Status:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{ticket.status || "—"}</span>
                      {ticket.status && (
                        <Tag color={
                          ticket.status === "PENDING" ? "orange" :
                          ticket.status === "CONFIRMED" ? "blue" :
                          ticket.status === "PAID" || ticket.status === "COMPLETED" ? "green" :
                          ticket.status === "CANCELLED" || ticket.status === "EXPIRED" ? "red" : "default"
                        }>
                          {ticket.status}
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
                {(() => {
                  // Check if ticket can be cancelled - always allow cancellation for non-cancelled, non-completed tickets
                  const canCancelTicket = () => {
                    // Always allow cancellation if status is not CANCELLED or COMPLETED
                    return ticket.status !== "CANCELLED" && ticket.status !== "COMPLETED";
                  };

                                     return canCancelTicket() ? (
                     <div className="pt-2">
                       <Button danger size="small" className="w-full" onClick={() => handleCancelClick(ticket)}>
                         Cancel Ticket
                       </Button>
                     </div>
                                     ) : (
                     <div className="pt-2">
                       <span className={`text-sm ${
                         ticket.status === "CANCELLED" ? "text-red-500 font-medium" : 
                         ticket.status === "COMPLETED" ? "text-green-500 font-medium" : 
                         "text-gray-400"
                       }`}>
                         {ticket.status === "CANCELLED" ? "Cancelled" : 
                          ticket.status === "COMPLETED" ? "Completed" : 
                          "Cannot Cancel"}
                       </span>
                     </div>
                   );
                })()}
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Table 
            columns={columns} 
            dataSource={managedTickets} 
            rowKey="bookingId" 
            loading={loading}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </div>
      </div>
      
      <Modal
        title="Edit Ticket"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width="90%"
        className="max-w-lg mx-auto"
      >
        {selectedTicket && (
          <div>
            <p>Editing: {selectedTicket.movieTitle}</p>
            {/* Bạn có thể mở rộng form chỉnh sửa ở đây */}
          </div>
        )}
      </Modal>

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
        okButtonProps={{ danger: true }}
        width={400}
        centered
        className="max-w-sm mx-auto"
      >
        {ticketToCancel && (
          <div className="text-center py-4">
            <p className="text-base mb-2">Are you sure you want to cancel this ticket?</p>
            <p className="text-sm text-gray-600">
              Movie: <span className="font-medium">{ticketToCancel.movieTitle}</span>
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagedTickets;

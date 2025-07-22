"use client";

import { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Tag, Typography, Modal, Card } from "antd";
import { MemberApiService } from "@/api/member";

const ManagedTickets: React.FC = () => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [managedTickets, setManagedTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách vé thật từ API, không mapping lại object booking
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await MemberApiService.getBookings({});
      setManagedTickets(res.data.content || []);
      console.log("ManagedTickets data:", res.data.content || []);
    } catch (err: any) {
      message.error("Lỗi khi tải danh sách vé");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCancel = async (ticket: any) => {
    try {
      await MemberApiService.cancelBooking({ bookingId: ticket.bookingId });
      message.success("Hủy vé thành công!");
      fetchTickets();
    } catch (err: any) {
      message.error("Hủy vé thất bại!");
    }
  };

  const columns = [
    { title: "Movie", dataIndex: "movieTitle", key: "movieTitle" },
    { title: "Cinema Room", dataIndex: "cinemaRoom", key: "cinemaRoom", render: v => v || "—" },
    { title: "Showtime", dataIndex: "showDate", key: "showDate", render: v => v || "—" },
    { title: "Seats", key: "seats", render: (_, record) => record.seats?.map((s: any) => s.seatNumber).join(", ") || "—" },
    { title: "Total Price", dataIndex: "finalAmount", key: "finalAmount", render: v => new Intl.NumberFormat('vi-VN').format(v) },
    { title: "Status", dataIndex: "status", key: "status", render: v => v || "—" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) =>
        record.canCancel ? (
          <Popconfirm
            title="Bạn có chắc muốn hủy vé này?"
            onConfirm={() => handleCancel(record)}
            okText="Đồng ý"
            cancelText="Không"
          >
            <Button danger size="small">Hủy vé</Button>
          </Popconfirm>
        ) : "—",
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
                    <span className="text-xs text-gray-500">Cinema Room:</span>
                    <p className="text-sm">{ticket.cinemaRoom || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Showtime:</span>
                    <p className="text-sm">{ticket.showDate || "—"}</p>
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
                    <p className="text-sm">{ticket.status || "—"}</p>
                  </div>
                </div>
                {ticket.canCancel && (
                  <div className="pt-2">
                    <Popconfirm
                      title="Bạn có chắc muốn hủy vé này?"
                      onConfirm={() => handleCancel(ticket)}
                      okText="Đồng ý"
                      cancelText="Không"
                    >
                      <Button danger size="small" className="w-full">
                        Hủy vé
                      </Button>
                    </Popconfirm>
                  </div>
                )}
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
    </div>
  );
};

export default ManagedTickets;

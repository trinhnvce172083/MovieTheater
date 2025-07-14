"use client";

import { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Tag, Typography, Modal } from "antd";
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
    <div className="max-w-6xl mx-auto">
      <Typography.Title level={2} className="text-white mb-8 text-center">
        Managed Tickets
      </Typography.Title>
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <Table columns={columns} dataSource={managedTickets} rowKey="bookingId" loading={loading} />
      </div>
      <Modal
        title="Edit Ticket"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
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

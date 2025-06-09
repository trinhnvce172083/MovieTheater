"use client";

import React, { useState } from "react";
import { Table, Button, Popconfirm, message, Tag, Typography, Space, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";

interface ManagedTicket {
  id: string;
  movieTitle: string;
  cinema: string;
  showtime: string;
  seats: string[];
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  bookingDate: string;
  ticketCode: string;
}

const ManagedTickets: React.FC = () => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ManagedTicket | null>(null);

  const [managedTickets, setManagedTickets] = useState<ManagedTicket[]>([
    {
      id: "1",
      movieTitle: "Dune: Part Two",
      cinema: "Lumiere Cinema District 2",
      showtime: "2024-12-30 18:00",
      seats: ["D7", "D8"],
      totalPrice: 320000,
      status: "pending",
      bookingDate: "2024-12-23",
      ticketCode: "LUM240003",
    },
  ]);

  const handleEdit = (ticket: ManagedTicket) => {
    setSelectedTicket(ticket);
    setEditModalVisible(true);
  };

  const handleCancel = (ticketId: string) => {
    setManagedTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: "cancelled" } : ticket
      )
    );
    message.success("Ticket cancelled successfully");
  };

  const columns: ColumnsType<ManagedTicket> = [
    {
      title: "Movie",
      dataIndex: "movieTitle",
      key: "movieTitle",
    },
    {
      title: "Cinema",
      dataIndex: "cinema",
      key: "cinema",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "pending"
              ? "orange"
              : status === "confirmed"
              ? "green"
              : "red"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm title="Cancel?" onConfirm={() => handleCancel(record.id)}>
            <Button size="small" danger>
              Cancel
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <Typography.Title level={2} className="text-white mb-8 text-center">
        Managed Tickets
      </Typography.Title>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <Table columns={columns} dataSource={managedTickets} rowKey="id" />
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

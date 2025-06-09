"use client";

import React, { useState } from "react";
import { Typography, Card, Button, Tag, QRCode, Modal, Empty, Divider } from "antd";
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, QrcodeOutlined } from "@ant-design/icons";

interface BookedTicket {
  id: string;
  movieTitle: string;
  moviePoster: string;
  cinema: string;
  showtime: string;
  seats: string[];
  totalPrice: number;
  status: 'confirmed' | 'used' | 'expired';
  bookingDate: string;
  ticketCode: string;
}

const BookedTickets: React.FC = () => {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<BookedTicket | null>(null);

  // Mock booked tickets data - thực tế sẽ lấy từ API
  const bookedTickets: BookedTicket[] = [
    {
      id: "1",
      movieTitle: "Avengers: Endgame",
      moviePoster: "/movie-poster-3.jpg",
      cinema: "Lumiere Cinema District 1",
      showtime: "2024-12-25 19:30",
      seats: ["A5", "A6"],
      totalPrice: 300000,
      status: "confirmed",
      bookingDate: "2024-12-20",
      ticketCode: "LUM240001"
    },
    {
      id: "2",
      movieTitle: "Top Gun: Maverick", 
      moviePoster: "/movie-poster-4.jpg",
      cinema: "Lumiere Cinema District 3",
      showtime: "2024-12-28 21:00",
      seats: ["C3", "C4"],
      totalPrice: 280000,
      status: "confirmed",
      bookingDate: "2024-12-22",
      ticketCode: "LUM240002"
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND'
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShowQR = (ticket: BookedTicket) => {
    setSelectedTicket(ticket);
    setQrModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'used': return 'blue';
      case 'expired': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'used': return 'Used';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Typography.Title level={2} className="text-white mb-8 text-center">
        Booked Tickets
      </Typography.Title>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        {bookedTickets.length === 0 ? (
          <Empty
            description="No booked tickets found"
            className="py-12"
          />
        ) : (
          <div className="space-y-6">
            {bookedTickets.map((ticket) => (
              <Card 
                key={ticket.id}
                className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                bodyStyle={{ padding: '24px' }}
              >
                <div className="flex gap-4">
                  {/* Movie Poster */}
                  <div className="w-28 h-40 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-gray-500 text-xs text-center px-2">
                      Movie Poster
                    </span>
                  </div>

                  {/* Ticket Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Typography.Title level={4} className="mb-1">
                          {ticket.movieTitle}
                        </Typography.Title>
                        <Typography.Text type="secondary" className="text-sm">
                          Ticket Code: {ticket.ticketCode}
                        </Typography.Text>
                      </div>
                      <Tag 
                        color={getStatusColor(ticket.status)}
                        className="text-sm px-3 py-1"
                      >
                        {getStatusText(ticket.status)}
                      </Tag>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <EnvironmentOutlined className="text-blue-500" />
                          <span className="text-sm">{ticket.cinema}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CalendarOutlined className="text-green-500" />
                          <span className="text-sm">{formatDateTime(ticket.showtime)}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ClockCircleOutlined className="text-orange-500" />
                          <span className="text-sm">Seats: {ticket.seats.join(', ')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            Total: {formatPrice(ticket.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Divider className="my-4" />

                    <div className="flex justify-between items-center">
                      <Typography.Text type="secondary" className="text-sm">
                        Booked on: {new Date(ticket.bookingDate).toLocaleDateString('vi-VN')}
                      </Typography.Text>
                      
                      <div className="flex gap-2">
                        <Button 
                          type="primary"
                          icon={<QrcodeOutlined />}
                          onClick={() => handleShowQR(ticket)}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          Show QR Code
                        </Button>
                        <Button type="default">
                          Download Ticket
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <Modal
        title="Ticket QR Code"
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        centered
        width={400}
      >
        {selectedTicket && (
          <div className="text-center p-6">
            <Typography.Title level={4} className="mb-4">
              {selectedTicket.movieTitle}
            </Typography.Title>
            <QRCode
              value={`TICKET:${selectedTicket.ticketCode}`}
              size={200}
              className="mb-4"
            />
            <Typography.Text type="secondary" className="block mb-2">
              Ticket Code: {selectedTicket.ticketCode}
            </Typography.Text>
            <Typography.Text type="secondary" className="block">
              Show this QR code at the cinema entrance
            </Typography.Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookedTickets; 
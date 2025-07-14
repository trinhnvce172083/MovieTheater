"use client";

import React from "react";
import { Card, Typography, Button, Divider } from "antd";
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, QrcodeOutlined } from "@ant-design/icons";
import MoviePoster from "./MoviePoster";
import StatusTag from "./StatusTag";
import PriceDisplay from "./PriceDisplay";
import DateTimeDisplay from "./DateTimeDisplay";

interface TicketCardProps {
  id: string;
  movieTitle: string;
  moviePoster?: string;
  cinema: string;
  showtime: string;
  seats: string[];
  totalPrice: number;
  status: 'confirmed' | 'used' | 'expired';
  bookingDate: string;
  ticketCode: string;
  onShowQR?: (ticketId: string) => void;
  onDownload?: (ticketId: string) => void;
  className?: string;
}

const TicketCard: React.FC<TicketCardProps> = ({
  id,
  movieTitle,
  moviePoster,
  cinema,
  showtime,
  seats,
  totalPrice,
  status,
  bookingDate,
  ticketCode,
  onShowQR,
  onDownload,
  className = ""
}) => {
  return (
    <Card 
      className={`shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500 ${className}`}
      styles={{ body: { padding: '24px' } }}
    >
      <div className="flex gap-4">
        <MoviePoster 
          src={moviePoster}
          alt={movieTitle}
          width={112}
          height={160}
        />

        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Typography.Title level={4} className="mb-1">
                {movieTitle}
              </Typography.Title>
              <Typography.Text type="secondary" className="text-sm">
                Ticket Code: {ticketCode}
              </Typography.Text>
            </div>
            <StatusTag status={status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <EnvironmentOutlined className="text-blue-500" />
                <span className="text-sm">{cinema}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CalendarOutlined className="text-green-500" />
                <DateTimeDisplay 
                  dateTime={showtime} 
                  format="short"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ClockCircleOutlined className="text-orange-500" />
                <span className="text-sm">Seats: {seats.join(', ')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">Total: </span>
                <PriceDisplay 
                  amount={totalPrice}
                  size="default"
                  strong
                />
              </div>
            </div>
          </div>

          <Divider className="my-4" />

          <div className="flex justify-between items-center">
            <Typography.Text type="secondary" className="text-sm">
              Booked on: <DateTimeDisplay dateTime={bookingDate} format="date" />
            </Typography.Text>
            
            <div className="flex gap-2">
              {onShowQR && (
                <Button 
                  type="primary"
                  icon={<QrcodeOutlined />}
                  onClick={() => onShowQR(id)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Show QR Code
                </Button>
              )}
              {onDownload && (
                <Button type="default" onClick={() => onDownload(id)}>
                  Download Ticket
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TicketCard; 
"use client";

import React from "react";
import { Typography, Card, List, Tag, Empty } from "antd";
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, DollarOutlined } from "@ant-design/icons";

interface HistoryItem {
  id: string;
  movieTitle: string;
  moviePoster: string;
  cinema: string;
  showtime: string;
  seats: string[];
  totalPrice: number;
  status: 'completed' | 'cancelled';
  bookingDate: string;
}

const History: React.FC = () => {
  // Mock history data - thực tế sẽ lấy từ API
  const historyData: HistoryItem[] = [
    {
      id: "1",
      movieTitle: "Spider-Man: No Way Home",
      moviePoster: "/movie-poster-1.jpg",
      cinema: "Lumiere Cinema District 1",
      showtime: "2024-01-15 19:30",
      seats: ["A1", "A2"],
      totalPrice: 200000,
      status: "completed",
      bookingDate: "2024-01-10"
    },
    {
      id: "2", 
      movieTitle: "Avatar: The Way of Water",
      moviePoster: "/movie-poster-2.jpg",
      cinema: "Lumiere Cinema District 7",
      showtime: "2024-01-20 21:00",
      seats: ["B5", "B6"],
      totalPrice: 250000,
      status: "completed",
      bookingDate: "2024-01-18"
    },
    // Có thể thêm nhiều dữ liệu hơn
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

  return (
    <div className="max-w-4xl mx-auto">
      <Typography.Title level={2} className="text-white mb-8 text-center">
        Booking History
      </Typography.Title>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        {historyData.length === 0 ? (
          <Empty
            description="No booking history found"
            className="py-12"
          />
        ) : (
          <List
            itemLayout="vertical"
            size="large"
            dataSource={historyData}
            renderItem={(item) => (
              <List.Item key={item.id}>
                <Card 
                  className="w-full shadow-sm hover:shadow-md transition-shadow"
                  bodyStyle={{ padding: '20px' }}
                >
                  <div className="flex gap-4">
                    {/* Movie Poster */}
                    <div className="w-24 h-36 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-500 text-xs text-center px-2">
                        Movie Poster
                      </span>
                    </div>

                    {/* Movie Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <Typography.Title level={4} className="mb-1">
                          {item.movieTitle}
                        </Typography.Title>
                        <Tag 
                          color={item.status === 'completed' ? 'green' : 'red'}
                          className="text-sm px-3 py-1"
                        >
                          {item.status === 'completed' ? 'Completed' : 'Cancelled'}
                        </Tag>
                      </div>

                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center gap-2">
                          <EnvironmentOutlined className="text-blue-500" />
                          <span>{item.cinema}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CalendarOutlined className="text-green-500" />
                          <span>{formatDateTime(item.showtime)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <ClockCircleOutlined className="text-orange-500" />
                          <span>Seats: {item.seats.join(', ')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <DollarOutlined className="text-red-500" />
                          <span className="font-semibold text-lg">
                            {formatPrice(item.totalPrice)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <Typography.Text type="secondary" className="text-sm">
                          Booked on: {new Date(item.bookingDate).toLocaleDateString('vi-VN')}
                        </Typography.Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default History; 
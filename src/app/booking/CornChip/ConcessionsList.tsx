"use client";

import React from "react";
import { Card, Button, Typography, Space } from "antd";
import { Minus, Plus } from "lucide-react";

const { Text, Title } = Typography;

interface Concession {
  concessionId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface ConcessionsListProps {
  concessions: Concession[];
  quantities: { [key: number]: number };
  onQuantityChange: (concessionId: number, delta: number) => void;
  loading: boolean;
  error: string | null;
}

export default function ConcessionsList({
  concessions,
  quantities,
  onQuantityChange,
  loading,
  error
}: ConcessionsListProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <Text className="text-gray-400">Đang tải đồ ăn...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Text className="text-red-400 text-lg mb-4">Có lỗi xảy ra khi tải đồ ăn</Text>
        <Button onClick={() => window.location.reload()} className="bg-blue-500 hover:bg-blue-600">
          Thử lại
        </Button>
      </div>
    );
  }

  if (!concessions || concessions.length === 0) {
    return (
      <div className="text-center py-8">
        <Text className="text-gray-400 text-lg">Không có đồ ăn khả dụng</Text>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {concessions.map((concession) => {
        const quantity = quantities[concession.concessionId] || 0;
        
        return (
          <Card
            key={concession.concessionId}
            className="bg-[#2a2f3a] border-gray-600 hover:border-gray-500 transition-colors"
            bodyStyle={{ padding: '16px' }}
          >
            <div className="flex items-start space-x-4">
              <img
                src={concession.imageUrl || "/popcorn.jpg"}
                alt={concession.name}
                className="w-20 h-20 object-cover rounded-lg bg-gray-700"
              />
              
              <div className="flex-1 min-w-0">
                <Title level={4} className="text-white mb-1 truncate">
                  {concession.name}
                </Title>
                <Text className="text-gray-400 text-sm mb-2 block">
                  {concession.description}
                </Text>
                <Text className="text-yellow-400 font-semibold text-lg">
                  {concession.price.toLocaleString()} VND
                </Text>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <Space>
                <Button
                  type="text"
                  icon={<Minus size={16} />}
                  onClick={() => onQuantityChange(concession.concessionId, -1)}
                  disabled={quantity === 0}
                  className="text-white hover:text-red-400"
                />
                
                <Text className="text-white font-semibold text-lg min-w-[2rem] text-center">
                  {quantity}
                </Text>
                
                <Button
                  type="text"
                  icon={<Plus size={16} />}
                  onClick={() => onQuantityChange(concession.concessionId, 1)}
                  className="text-white hover:text-green-400"
                />
              </Space>
              
              {quantity > 0 && (
                <Text className="text-green-400 font-semibold">
                  {(concession.price * quantity).toLocaleString()} VND
                </Text>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
} 
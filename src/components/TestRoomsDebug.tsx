"use client";

import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Spin } from 'antd';
import { getAllRooms } from "@/api/admin/getAllRooms";

const { Title, Text } = Typography;

export default function TestRoomsDebug() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        console.log('🔍 Testing getAllRooms API...');
        const roomData = await getAllRooms(0, 10);
        console.log('🏠 Raw room data received:', roomData);
        setRooms(roomData);
      } catch (err) {
        console.error('❌ Error fetching rooms:', err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) return <Spin size="large" />;

  return (
    <div className="p-4">
      <Title level={3}>Room API Debug</Title>
      
      {error && (
        <Card className="mb-4">
          <Tag color="red">Error</Tag>
          <Text code>{error}</Text>
        </Card>
      )}

      <Card title="Raw Data Structure">
        <pre className="text-xs overflow-auto max-h-96">
          {JSON.stringify(rooms, null, 2)}
        </pre>
      </Card>

      {rooms?.content && (
        <Card title="Parsed Rooms" className="mt-4">
          {rooms.content.map((room: any, index: number) => (
            <div key={index} className="mb-2 p-2 border rounded">
              <Text strong>Room {index + 1}: </Text>
              <Text>{room.cinemaRoomName || room.name || 'No name'}</Text>
              <br />
              <Text type="secondary">
                Capacity: {room.capacity || room.totalSeats || 'Unknown'} | 
                Status: {room.isActive ? 'Active' : 'Inactive'}
              </Text>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

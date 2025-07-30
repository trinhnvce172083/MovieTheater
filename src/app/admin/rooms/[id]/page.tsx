"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Tag,
  Row,
  Col,
  Typography,
  Avatar,
  Descriptions,
  Divider,
  Spin,
  message,
  Space,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SoundOutlined,
  VideoCameraOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { getRoomById, CinemaRoom } from "@/api/admin/getAllRooms";

const { Title, Text, Paragraph } = Typography;

export default function RoomDetailPage() {
  const [roomData, setRoomData] = useState<CinemaRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  useEffect(() => {
    const fetchRoomDetail = async (id: string) => {
      try {
        setLoading(true);
        console.log('Fetching room with ID:', id);
        console.log('Parsed ID:', parseInt(id));
        
        const roomData = await getRoomById(parseInt(id));
        console.log('Room data received:', roomData);
        setRoomData(roomData);
      } catch (error) {
        console.error('Error fetching room details:', error);
        message.error('Failed to load room details');
        router.push('/admin/rooms');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      console.log('Room ID from params:', roomId);
      fetchRoomDetail(roomId);
    }
  }, [roomId, router]);

  const handleBack = () => {
    router.push('/admin/rooms');
  };

  const handleEdit = () => {
    console.log('Navigating to edit room with ID:', roomId);
    router.push(`/admin/rooms?edit=${roomId}`);
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'VIP': return 'gold';
      case 'IMAX': return 'green';
      case '4DX': return 'purple';
      default: return 'blue';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Title level={3}>Room not found</Title>
          <Button type="primary" onClick={handleBack}>
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Space className="mb-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              type="text"
              size="large"
            >
              Back to Rooms
            </Button>
          </Space>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                size={64}
                icon={<HomeOutlined />}
                className="bg-blue-100 text-blue-600"
              />
              <div>
                <Title level={2} className="mb-0">
                  {roomData.cinemaRoomName}
                </Title>
                <Space className="mt-2">
                  <Tag color={getRoomTypeColor(roomData.roomType)} className="text-sm">
                    {roomData.roomType}
                  </Tag>
                  <Tag color={roomData.isActive ? "success" : "error"}>
                    {roomData.isActive ? "Active" : "Inactive"}
                  </Tag>
                </Space>
              </div>
            </div>
            
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              size="large"
            >
              Edit Room
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Row gutter={[24, 24]}>
          {/* Basic Information */}
          <Col span={24} lg={16}>
            <Card title="Room Information" className="mb-6">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Room ID" span={1}>
                  <Text strong>#{roomData.cinemaRoomId}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Room Type" span={1}>
                  <Tag color={getRoomTypeColor(roomData.roomType)}>
                    {roomData.roomType}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Seat Capacity" span={1}>
                  <Text strong>{roomData.seatQuantity} seats</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Layout" span={1}>
                  <Text>{roomData.rows} rows × {roomData.columns} columns</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Price Multiplier" span={1}>
                  <Text strong>{roomData.priceMultiplier}x</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status" span={1}>
                  <Tag 
                    color={roomData.isActive ? "success" : "error"}
                    icon={roomData.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  >
                    {roomData.isActive ? "Active" : "Inactive"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                  <Paragraph>
                    {roomData.description || "No description available for this room."}
                  </Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Features */}
            <Card title="Room Features">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <div className="text-center p-4 border rounded-lg">
                    <Tooltip title="3D Capability">
                      <VideoCameraOutlined 
                        className={`text-2xl mb-2 ${roomData.has3D ? 'text-blue-500' : 'text-gray-300'}`}
                      />
                    </Tooltip>
                    <div className="text-sm">
                      <Text strong>3D Technology</Text>
                      <br />
                      <Text type={roomData.has3D ? "success" : "secondary"}>
                        {roomData.has3D ? "Available" : "Not Available"}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center p-4 border rounded-lg">
                    <Tooltip title="Dolby Atmos Sound">
                      <SoundOutlined 
                        className={`text-2xl mb-2 ${roomData.hasDolbyAtmos ? 'text-green-500' : 'text-gray-300'}`}
                      />
                    </Tooltip>
                    <div className="text-sm">
                      <Text strong>Dolby Atmos</Text>
                      <br />
                      <Text type={roomData.hasDolbyAtmos ? "success" : "secondary"}>
                        {roomData.hasDolbyAtmos ? "Available" : "Not Available"}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center p-4 border rounded-lg">
                    <Tooltip title="Recliner Seats">
                      <StarOutlined 
                        className={`text-2xl mb-2 ${roomData.hasReclinerSeats ? 'text-orange-500' : 'text-gray-300'}`}
                      />
                    </Tooltip>
                    <div className="text-sm">
                      <Text strong>Recliner Seats</Text>
                      <br />
                      <Text type={roomData.hasReclinerSeats ? "success" : "secondary"}>
                        {roomData.hasReclinerSeats ? "Available" : "Not Available"}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Statistics & Dates */}
          <Col span={24} lg={8}>
            {/* Quick Stats */}
            {(roomData.availableSeats !== undefined || roomData.scheduleCount !== undefined) && (
              <Card title="Quick Statistics" className="mb-6">
                <div className="space-y-4">
                  {roomData.availableSeats !== undefined && (
                    <div className="flex justify-between">
                      <Text>Available Seats:</Text>
                      <Text strong className="text-green-600">
                        {roomData.availableSeats}
                      </Text>
                    </div>
                  )}
                  {roomData.occupiedSeats !== undefined && (
                    <div className="flex justify-between">
                      <Text>Occupied Seats:</Text>
                      <Text strong className="text-red-600">
                        {roomData.occupiedSeats}
                      </Text>
                    </div>
                  )}
                  {roomData.temporarilyReservedSeats !== undefined && (
                    <div className="flex justify-between">
                      <Text>Reserved Seats:</Text>
                      <Text strong className="text-orange-600">
                        {roomData.temporarilyReservedSeats}
                      </Text>
                    </div>
                  )}
                  {roomData.scheduleCount !== undefined && (
                    <div className="flex justify-between">
                      <Text>Total Schedules:</Text>
                      <Text strong className="text-blue-600">
                        {roomData.scheduleCount}
                      </Text>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Timestamps */}
            <Card title="Timeline">
              <div className="space-y-4">
                <div>
                  <Text type="secondary" className="block">Created:</Text>
                  <Text strong>{formatDate(roomData.createdAt)}</Text>
                </div>
                <Divider className="my-3" />
                <div>
                  <Text type="secondary" className="block">Last Updated:</Text>
                  <Text strong>{formatDate(roomData.updatedAt)}</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

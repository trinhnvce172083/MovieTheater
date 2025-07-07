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
  HomeOutlined,  CalendarOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SoundOutlined,
  VideoCameraOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import axiosClient from "@/api/axiosClient";

const { Title, Text, Paragraph } = Typography;

// Interface for Cinema Room Response
interface CinemaRoomResponse {
  cinemaRoomId: number;
  cinemaRoomName: string;
  seatQuantity: number;
  roomType: string;
  isActive: boolean;
  description: string;
  rows: number;
  columns: number;
  has3D: boolean;
  hasDolbyAtmos: boolean;
  hasReclinerSeats: boolean;
  priceMultiplier: number;
  createdAt: string;
  updatedAt: string;
  availableSeats?: number;
  occupiedSeats?: number;
  maintenanceSeats?: number;
  scheduleCount?: number;
}

export default function RoomDetailPage() {
  const [roomData, setRoomData] = useState<CinemaRoomResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('id');

  // Sample room data for testing
  const sampleRoom: CinemaRoomResponse = {
    cinemaRoomId: 1,
    cinemaRoomName: "Premium VIP Theater",
    seatQuantity: 48,
    roomType: "VIP",
    isActive: true,
    description: "Premium cinema hall with luxury seating and enhanced viewing experience. Features state-of-the-art sound system, comfortable recliner seats, and 3D projection capabilities for an immersive movie experience.",
    rows: 6,
    columns: 8,
    has3D: true,
    hasDolbyAtmos: true,
    hasReclinerSeats: true,
    priceMultiplier: 1.5,
    createdAt: "2024-01-15T10:00:00",
    updatedAt: "2024-06-20T14:30:00",
    availableSeats: 45,
    occupiedSeats: 3,
    maintenanceSeats: 0,
    scheduleCount: 12,
  };

  const fetchRoomDetail = async (id: string) => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/api/cinema-rooms/${id}`);
      setRoomData(response.data);
    } catch {
      message.warning('Using sample data - API not available');
      // Use sample data as fallback
      setRoomData(sampleRoom);
    } finally {
      setLoading(false);
    }
  };  useEffect(() => {
    if (roomId) {
      fetchRoomDetail(roomId);
    } else {
      // If no ID provided, show sample data
      setRoomData(sampleRoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]); // Only depend on roomId to avoid infinite re-renders

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/admin/rooms?edit=${roomData?.cinemaRoomId}`);
  };

  const getFeatures = () => {
    const features = [];
    if (roomData?.has3D) features.push({ label: '3D Capability', icon: <VideoCameraOutlined />, color: 'blue' });
    if (roomData?.hasDolbyAtmos) features.push({ label: 'Dolby Atmos', icon: <SoundOutlined />, color: 'green' });
    if (roomData?.hasReclinerSeats) features.push({ label: 'Recliner Seats', icon: <StarOutlined />, color: 'purple' });
    return features;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="mb-4"
            size="large"
          >
            Back to Rooms
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                icon={<HomeOutlined />}
                size={64}
                className="bg-blue-100 text-blue-600"
              />
              <div>
                <Title level={2} className="m-0">
                  {roomData.cinemaRoomName}
                </Title>
                <div className="flex items-center gap-2 mt-2">
                  <Tag
                    color={roomData.roomType === 'VIP' ? 'purple' : 'blue'}
                    className="font-medium"
                  >
                    {roomData.roomType}
                  </Tag>
                  <Tag
                    color={roomData.isActive ? 'success' : 'warning'}
                    icon={roomData.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  >
                    {roomData.isActive ? 'Active' : 'Inactive'}
                  </Tag>
                </div>
              </div>
            </div>
            
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                size="large"
              >
                Edit Room
              </Button>
            </Space>
          </div>
        </div>

        {/* Main Content */}
        <Row gutter={[24, 24]}>
          {/* Basic Information */}
          <Col xs={24} lg={12}>
            <Card title="Basic Information" className="h-full">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Room ID">
                  <Text code>{roomData.cinemaRoomId}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Room Name">
                  <Text strong>{roomData.cinemaRoomName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Room Type">
                  <Tag color={roomData.roomType === 'VIP' ? 'purple' : 'blue'}>
                    {roomData.roomType}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={roomData.isActive ? 'success' : 'warning'}
                    icon={roomData.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  >
                    {roomData.isActive ? 'Active' : 'Inactive'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Total Seats">
                  <Text strong className="text-lg">{roomData.seatQuantity}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Layout">
                  <Text>{roomData.rows} rows × {roomData.columns} columns</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Price Multiplier">
                  <Text strong className="text-orange-600">{roomData.priceMultiplier}x</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Features & Statistics */}
          <Col xs={24} lg={12}>
            <Card title="Features & Statistics" className="h-full">
              <div className="space-y-6">
                {/* Features */}
                <div>
                  <Title level={5} className="mb-3">Features</Title>
                  <div className="flex flex-wrap gap-2">
                    {getFeatures().map((feature, index) => (
                      <Tooltip title={feature.label} key={index}>
                        <Tag
                          color={feature.color}
                          icon={feature.icon}
                          className="px-3 py-1"
                        >
                          {feature.label}
                        </Tag>
                      </Tooltip>
                    ))}
                    {getFeatures().length === 0 && (
                      <Text type="secondary">No special features</Text>
                    )}
                  </div>
                </div>

                <Divider />

                {/* Statistics */}
                <div>
                  <Title level={5} className="mb-3">Statistics</Title>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {roomData.availableSeats || roomData.seatQuantity}
                        </div>
                        <div className="text-sm text-gray-600">Available Seats</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {roomData.scheduleCount || 0}
                        </div>
                        <div className="text-sm text-gray-600">Schedules</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Card>
          </Col>          {/* Description */}
          <Col xs={24}>
            <Card title="Description">
              <Paragraph className="text-base leading-relaxed">
                {roomData.description || 'No description available for this room.'}
              </Paragraph>
            </Card>
          </Col>

          {/* Seat Layout Visualization */}
          <Col xs={24}>
            <Card title="Seat Layout">
              <div className="text-center">
                <div className="mb-4">
                  <Text strong className="text-lg">Screen</Text>
                  <div className="w-full h-2 bg-gray-800 rounded-full mb-6 mx-auto max-w-md"></div>
                </div>
                
                <div className="grid gap-1 justify-center mb-4" 
                     style={{
                       gridTemplateColumns: `repeat(${roomData.columns}, 1fr)`,
                       maxWidth: `${Math.min(roomData.columns * 30 + (roomData.columns - 1) * 4, 600)}px`,
                       margin: '0 auto'
                     }}>
                  {Array.from({ length: roomData.seatQuantity }, (_, index) => {
                    const row = Math.floor(index / roomData.columns);
                    const col = index % roomData.columns;
                    const isOccupied = Math.random() < 0.15; // Random occupied seats for demo
                    
                    return (
                      <Tooltip 
                        key={index} 
                        title={`Row ${String.fromCharCode(65 + row)}${col + 1}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-sm border text-xs flex items-center justify-center cursor-pointer transition-colors ${
                            isOccupied 
                              ? 'bg-red-100 border-red-300 text-red-600' 
                              : 'bg-green-100 border-green-300 text-green-600 hover:bg-green-200'
                          }`}
                        >
                          {String.fromCharCode(65 + row)}{col + 1}
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
                
                <div className="flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded-sm"></div>
                    <Text>Available</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded-sm"></div>
                    <Text>Occupied</Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* System Information */}
          <Col xs={24}>
            <Card title="System Information">
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <div className="flex items-center gap-3">
                    <CalendarOutlined className="text-gray-500" />
                    <div>
                      <Text type="secondary" className="block">Created At</Text>
                      <Text strong>{formatDate(roomData.createdAt)}</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="flex items-center gap-3">
                    <SettingOutlined className="text-gray-500" />
                    <div>
                      <Text type="secondary" className="block">Last Updated</Text>
                      <Text strong>{formatDate(roomData.updatedAt)}</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>

      <style jsx global>{`
        .ant-descriptions-item-label {
          font-weight: 500;
          color: #666;
        }
        
        .ant-card-head-title {
          font-weight: 600;
        }
        
        .space-y-6 > * + * {
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}

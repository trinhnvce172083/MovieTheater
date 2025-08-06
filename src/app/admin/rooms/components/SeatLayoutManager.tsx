import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Alert, 
  Spin, 
  message, 
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Select,
  Divider
} from 'antd';
import { 
  SettingOutlined, 
  ReloadOutlined, 
  EyeOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { CinemaRoom } from '@/api/admin/getAllRooms';

const { Option } = Select;
const { confirm } = Modal;

interface SeatPosition {
  row: number;
  column: number;
  seatNumber: string;
  seatType: 'REGULAR' | 'VIP' | 'WHEELCHAIR';
  status: 'AVAILABLE' | 'OCCUPIED' | 'TEMPORARILY_RESERVED' | 'MAINTENANCE';
  isAisle?: boolean;
  isEmergencyExit?: boolean;
}

interface SeatLayout {
  roomId: number;
  rows: number;
  columns: number;
  totalSeats: number;
  seats: SeatPosition[];
  layoutType: 'STANDARD' | 'CUSTOM';
  lastUpdated: string;
}

interface SeatStatistics {
  totalSeats: number;
  availableSeats: number;
  occupiedSeats: number;
  temporarilyReservedSeats: number;
  maintenanceSeats: number;
  vipSeats: number;
  wheelchairSeats: number;
  utilizationRate: number;
}

interface SeatLayoutManagerProps {
  room: CinemaRoom;
  onLayoutUpdate?: () => void;
}

export const SeatLayoutManager: React.FC<SeatLayoutManagerProps> = ({ 
  room, 
  onLayoutUpdate 
}) => {
  const [layout, setLayout] = useState<SeatLayout | null>(null);
  const [statistics, setStatistics] = useState<SeatStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'stats'>('grid');
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [form] = Form.useForm();

  // Mock API calls - In real app, these would call actual backend endpoints
  const fetchSeatLayout = async (roomId: number): Promise<SeatLayout> => {
    // Mock implementation - replace with actual API call
    // GET /cinema-rooms/{id}/seats
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    const mockSeats: SeatPosition[] = [];
    // let seatCounter = 1; // For future use in seat numbering
    
    for (let row = 1; row <= room.rows; row++) {
      for (let col = 1; col <= room.columns; col++) {
        mockSeats.push({
          row,
          column: col,
          seatNumber: `${String.fromCharCode(64 + row)}${col}`,
          seatType: room.roomType === 'VIP' ? 'VIP' : 'REGULAR',
          status: Math.random() > 0.8 ? 'OCCUPIED' : 'AVAILABLE',
          isAisle: col === Math.ceil(room.columns / 2),
          isEmergencyExit: row === 1 || row === room.rows
        });
        // seatCounter++; // For future use
      }
    }

    return {
      roomId,
      rows: room.rows,
      columns: room.columns,
      totalSeats: mockSeats.length,
      seats: mockSeats,
      layoutType: 'STANDARD',
      lastUpdated: new Date().toISOString()
    };
  };

  const fetchSeatStatistics = async (_roomId: number): Promise<SeatStatistics> => {
    // Mock implementation - replace with actual API call
    // GET /cinema-rooms/{id}/seats/statistics
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const totalSeats = room.seatQuantity;
    const occupiedSeats = Math.floor(totalSeats * 0.65);
    const maintenanceSeats = Math.floor(totalSeats * 0.05);
    const temporarilyReserved = Math.floor(totalSeats * 0.1);
    const availableSeats = totalSeats - occupiedSeats - maintenanceSeats - temporarilyReserved;
    
    return {
      totalSeats,
      availableSeats,
      occupiedSeats,
      temporarilyReservedSeats: temporarilyReserved,
      maintenanceSeats,
      vipSeats: room.roomType === 'VIP' ? totalSeats : Math.floor(totalSeats * 0.2),
      wheelchairSeats: Math.floor(totalSeats * 0.05),
      utilizationRate: (occupiedSeats / totalSeats) * 100
    };
  };

  const generateLayout = async (_roomId: number, _rows: number, _columns: number) => {
    // POST /cinema-rooms/{id}/seats/generate
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      message.success('Seat layout generated successfully!');
      await loadData();
      onLayoutUpdate?.();
    } catch (_error) {
      message.error('Failed to generate seat layout');
    } finally {
      setLoading(false);
    }
  };

  const resetLayout = async (_roomId: number) => {
    // POST /cinema-rooms/{id}/seats/reset
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Seat layout reset to default!');
      await loadData();
      onLayoutUpdate?.();
    } catch (_error) {
      message.error('Failed to reset seat layout');
    } finally {
      setLoading(false);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [layoutData, statsData] = await Promise.all([
        fetchSeatLayout(room.cinemaRoomId),
        fetchSeatStatistics(room.cinemaRoomId)
      ]);
      setLayout(layoutData);
      setStatistics(statsData);
    } catch (error) {
      message.error('Failed to load seat data');
    } finally {
      setLoading(false);
    }
  }, [room.cinemaRoomId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerateLayout = () => {
    confirm({
      title: 'Generate New Seat Layout',
      icon: <ExclamationCircleOutlined />,
      content: 'This will replace the current seat layout. Are you sure?',
      onOk: () => generateLayout(room.cinemaRoomId, room.rows, room.columns),
    });
  };

  const handleResetLayout = () => {
    confirm({
      title: 'Reset Seat Layout',
      icon: <ExclamationCircleOutlined />,
      content: 'This will reset the seat layout to default configuration. Are you sure?',
      onOk: () => resetLayout(room.cinemaRoomId),
    });
  };

  const getSeatStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#52c41a';
      case 'OCCUPIED': return '#ff4d4f';
      case 'TEMPORARILY_RESERVED': return '#faad14';
      case 'MAINTENANCE': return '#8c8c8c';
      default: return '#d9d9d9';
    }
  };

  const getSeatTypeIcon = (type: string) => {
    switch (type) {
      case 'VIP': return '👑';
      case 'WHEELCHAIR': return '♿';
      default: return '💺';
    }
  };

  const renderSeatGrid = () => {
    if (!layout) return null;

    return (
      <div className="seat-grid p-4 bg-gray-50 rounded-lg overflow-auto">
        <div className="text-center mb-4">
          <div className="inline-block bg-gray-800 text-white px-8 py-2 rounded-lg">
            🎬 SCREEN
          </div>
        </div>
        
        <div className="grid gap-1" style={{ 
          gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
          maxWidth: 'fit-content',
          margin: '0 auto'
        }}>
          {layout.seats.map((seat) => (
            <Tooltip 
              key={`${seat.row}-${seat.column}`}
              title={`${seat.seatNumber} (${seat.seatType}) - ${seat.status}`}
            >
              <div
                className="w-8 h-8 rounded border-2 flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
                style={{
                  backgroundColor: getSeatStatusColor(seat.status),
                  borderColor: seat.isAisle ? '#1890ff' : 'transparent',
                  opacity: seat.status === 'MAINTENANCE' ? 0.5 : 1
                }}
              >
                {getSeatTypeIcon(seat.seatType)}
              </div>
            </Tooltip>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#52c41a' }}></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff4d4f' }}></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#faad14' }}></div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8c8c8c' }}></div>
            <span>Maintenance</span>
          </div>
        </div>
      </div>
    );
  };

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Total Seats"
              value={statistics.totalSeats}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Available"
              value={statistics.availableSeats}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Occupied"
              value={statistics.occupiedSeats}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card>
            <Statistic
              title="Utilization"
              value={statistics.utilizationRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  if (loading && !layout) {
    return (
      <Spin size="large" spinning={true}>
        <Card className="text-center py-8">
          <div className="text-gray-500">Loading seat layout...</div>
        </Card>
      </Spin>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold mb-2">Seat Layout Management</h3>
            <p className="text-gray-600">
              Room: {room.cinemaRoomName} ({room.rows}×{room.columns} layout)
            </p>
          </div>
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => setViewMode(viewMode === 'grid' ? 'stats' : 'grid')}
            >
              {viewMode === 'grid' ? 'View Stats' : 'View Layout'}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setShowCustomizeModal(true)}
            >
              Customize
            </Button>
          </Space>
        </div>
      </Card>

      {/* Content */}
      <Card loading={loading}>
        {viewMode === 'grid' ? renderSeatGrid() : renderStatistics()}
      </Card>

      {/* Actions */}
      <Card>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleGenerateLayout}
            loading={loading}
          >
            Generate Layout
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={handleResetLayout}
            loading={loading}
          >
            Reset to Default
          </Button>
        </Space>
      </Card>

      {/* Customize Modal */}
      <Modal
        title="Customize Seat Layout"
        open={showCustomizeModal}
        onCancel={() => setShowCustomizeModal(false)}
        footer={null}
      >
        <Alert
          message="Advanced Feature"
          description="Seat layout customization will be available when backend endpoints are fully integrated."
          type="info"
          showIcon
          className="mb-4"
        />
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Rows" name="rows">
                <InputNumber min={1} max={20} defaultValue={room.rows} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Columns" name="columns">
                <InputNumber min={1} max={30} defaultValue={room.columns} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Default Seat Type" name="seatType">
            <Select defaultValue="REGULAR">
              <Option value="REGULAR">Regular</Option>
              <Option value="VIP">VIP</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

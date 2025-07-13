import React from 'react';
import { Card, Input, Select, Button, Row, Col, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { RoomFilters } from '../types';

const { Search } = Input;
const { Option } = Select;

interface RoomFiltersProps {
  filters: RoomFilters;
  onFiltersChange: (filters: Partial<RoomFilters>) => void;
  onClearFilters: () => void;
}

export const RoomFiltersComponent: React.FC<RoomFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  return (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={16} align="middle">
        <Col span={8}>
          <Search
            placeholder="Search by room name..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
            prefix={<SearchOutlined />}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder="Filter by type"
            value={filters.filterType}
            onChange={(value) => onFiltersChange({ filterType: value })}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="STANDARD">Standard</Option>
            <Option value="VIP">VIP</Option>
            <Option value="IMAX">IMAX</Option>
            <Option value="4DX">4DX</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Select
            placeholder="Filter by status"
            value={filters.filterStatus}
            onChange={(value) => onFiltersChange({ filterStatus: value })}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Col>
        <Col span={4}>
          <Space>
            <Button 
              icon={<ClearOutlined />} 
              onClick={onClearFilters}
            >
              Clear
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

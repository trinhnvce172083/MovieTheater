import React from 'react';
import { Input, Select, Button, Row, Col } from 'antd';
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
    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
      <Row gutter={16} align="middle">
        <Col xs={24} sm={8} md={8}>
          <Search
            placeholder="Search by room name..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
            prefix={<SearchOutlined />}
            allowClear
            className="w-full"
          />
        </Col>
        <Col xs={12} sm={6} md={6}>
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
        <Col xs={12} sm={6} md={6}>
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
        <Col xs={24} sm={4} md={4}>
          <Button 
            icon={<ClearOutlined />} 
            onClick={onClearFilters}
            className="w-full"
          >
            Clear Filters
          </Button>
        </Col>
      </Row>
    </div>
  );
};

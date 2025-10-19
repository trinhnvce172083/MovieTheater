import React from 'react';
import { Input, Select, Row, Col, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

interface RoomFiltersProps {
  filters: {
    keyword: string;
    type: string | undefined;
    status: string | undefined;
  };
  onFiltersChange: (filters: {
    keyword?: string;
    type?: string | undefined;
    status?: string | undefined;
  }) => void;
}

const RoomFilters: React.FC<RoomFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleClearFilters = () => {
    onFiltersChange({
      keyword: '',
      type: undefined,
      status: undefined,
    });
  };

  return (
    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={8} md={6}>
          <div className="mb-1">
            <label className="text-sm font-medium text-gray-700">Search by Title</label>
          </div>
          <Search
            placeholder="e.g., Standard Room 1"
            value={filters.keyword}
            onChange={(e) => onFiltersChange({ keyword: e.target.value })}
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-full"
            size="middle"
          />
        </Col>

        <Col xs={24} sm={8} md={4}>
          <div className="mb-1">
            <label className="text-sm font-medium text-gray-700">Filter by Type</label>
          </div>
          <Select
            placeholder="All Types"
            value={filters.type}
            onChange={(value) => onFiltersChange({ type: value })}
            allowClear
            className="w-full"
            size="middle"
          >
            <Option value="STANDARD">Standard</Option>
            <Option value="VIP">VIP</Option>
            <Option value="IMAX">IMAX</Option>
            <Option value="4DX">4DX</Option>
          </Select>
        </Col>

        <Col xs={24} sm={8} md={4}>
          <div className="mb-1">
            <label className="text-sm font-medium text-gray-700">Filter by Status</label>
          </div>
          <Select
            placeholder="All Status"
            value={filters.status}
            onChange={(value) => onFiltersChange({ status: value })}
            allowClear
            className="w-full"
            size="middle"
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Col>

        <Col xs={24} sm={24} md={4}>
          <div className="mb-1">
            <label className="text-sm font-medium text-gray-700 opacity-0">Clear</label>
          </div>
          <Button
            icon={<ClearOutlined />}
            onClick={handleClearFilters}
            className="w-full"
            size="middle"
          >
            Clear Filters
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default RoomFilters;

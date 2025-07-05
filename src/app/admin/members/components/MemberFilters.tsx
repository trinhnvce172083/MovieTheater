import React from 'react';
import { Row, Col, Input, Select, Button, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { MemberFilters } from '../types';

const { Option } = Select;

interface MemberFiltersProps {
  filters: MemberFilters;
  onFiltersChange: (filters: MemberFilters) => void;
}

const MemberFiltersComponent: React.FC<MemberFiltersProps> = ({ 
  filters, 
  onFiltersChange 
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, filterStatus: value });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({ ...filters, filterType: value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      searchTerm: "",
      filterStatus: "",
      filterType: ""
    });
    message.success("Filters cleared successfully");
  };

  const hasActiveFilters = !!(filters.searchTerm || filters.filterStatus || filters.filterType);

  return (
    <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} lg={10} xl={8}>
          <Input
            placeholder="Search members, ID, or email..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-10"
            allowClear
          />
        </Col>
        
        <Col xs={12} sm={6} lg={4} xl={3}>
          <Select
            placeholder="All Status"
            value={filters.filterStatus || undefined}
            onChange={handleStatusChange}
            className="w-full h-10"
            allowClear
            size="middle"
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Col>
        
        <Col xs={12} sm={6} lg={4} xl={3}>
          <Select
            placeholder="All Roles"
            value={filters.filterType || undefined}
            onChange={handleTypeChange}
            className="w-full h-10"
            allowClear
            size="middle"
          >
            <Option value="ADMIN">Admin</Option>
            <Option value="EMPLOYEE">Employee</Option>
            <Option value="MEMBER">Member</Option>
            <Option value="CUSTOMER">Customer</Option>
          </Select>
        </Col>
        
        <Col xs={12} sm={6} lg={4} xl={3}>
          <Button
            icon={<ReloadOutlined />}
            className="w-full h-10 px-4"
            size="middle"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            Clear Filters
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default MemberFiltersComponent;

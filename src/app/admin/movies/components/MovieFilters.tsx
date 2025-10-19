"use client";

import React from 'react';
import { Input, Select, Row, Col } from 'antd';

const { Option } = Select;

interface MovieFiltersProps {
  filters: {
    keyword: string;
    status: string;
    genre: string;
  };
  onFiltersChange: (filters: Partial<MovieFiltersProps['filters']>) => void;
}

export const MovieFilters: React.FC<MovieFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (changedFilters: Partial<MovieFiltersProps['filters']>) => {
    onFiltersChange(changedFilters);
  };

  return (
    <div className="px-6 py-4 border-b border-t border-gray-100 bg-gray-50">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <div className="m-0">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Search by Title</label>
            <Input
              placeholder="e.g., Inception, Spider-Man"
              value={filters.keyword}
              onChange={(e) => handleFilterChange({ keyword: e.target.value })}
              allowClear
              onClear={() => handleFilterChange({ keyword: '' })}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div className="m-0">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Filter by Status</label>
            <Select
              value={filters.status || undefined}
              onChange={(value) => handleFilterChange({ status: value || '' })}
              allowClear
              placeholder="All Statuses"
              className="w-full"
            >
              <Option value="NOW_SHOWING">Now Showing</Option>
              <Option value="COMING_SOON">Coming Soon</Option>
              <Option value="ENDED">Ended</Option>
            </Select>
          </div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div className="m-0">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Filter by Genre</label>
            <Input
              placeholder="e.g., Action, Comedy"
              value={filters.genre}
              onChange={(e) => handleFilterChange({ genre: e.target.value })}
              allowClear
              onClear={() => handleFilterChange({ genre: '' })}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

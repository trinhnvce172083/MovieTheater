"use client";

import React from 'react';
import { Input, Select, Row, Col, Form } from 'antd';

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
      <Form layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Search by Title" className="m-0">
              <Input
                placeholder="e.g., Inception, Spider-Man"
                value={filters.keyword}
                onChange={(e) => handleFilterChange({ keyword: e.target.value })}
                allowClear
                onClear={() => handleFilterChange({ keyword: '' })}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Filter by Status" className="m-0">
              <Select
                value={filters.status || undefined}
                onChange={(value) => handleFilterChange({ status: value || '' })}
                allowClear
                placeholder="All Statuses"
              >
                <Option value="NOW_SHOWING">Now Showing</Option>
                <Option value="COMING_SOON">Coming Soon</Option>
                <Option value="ENDED">Ended</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Filter by Genre" className="m-0">
              <Input
                placeholder="e.g., Action, Comedy"
                value={filters.genre}
                onChange={(e) => handleFilterChange({ genre: e.target.value })}
                allowClear
                onClear={() => handleFilterChange({ genre: '' })}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

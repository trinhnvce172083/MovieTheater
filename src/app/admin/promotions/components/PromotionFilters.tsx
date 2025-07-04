import React from 'react';
import { Row, Col, Input, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { PromotionFiltersProps } from '../types';

export const PromotionFilters: React.FC<PromotionFiltersProps> = ({
  searchTerm,
  onSearchChange,
  onReset,
}) => {
  return (
    <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} lg={10} xl={8}>
          <Input
            placeholder="Search promotions, ID, or names..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 px-4"
            allowClear
          />
        </Col>
        <Col xs={12} sm={6} lg={3} xl={3}>
          <Button
            icon={<ReloadOutlined />}
            className="w-full h-10 px-4"
            size="middle"
            onClick={onReset}
          >
            Reset
          </Button>
        </Col>
      </Row>
    </div>
  );
}; 
import React from 'react';
import { Input, Select, Button, Row, Col } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { MovieFilters } from '../types';

const { Search } = Input;
const { Option } = Select;

interface MovieFiltersProps {
  filters: MovieFilters;
  onFiltersChange: (filters: Partial<MovieFilters>) => void;
  onClearFilters: () => void;
}

export const MovieFiltersComponent: React.FC<MovieFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  return (
    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
      <Row gutter={16} align="middle">
        <Col xs={24} sm={8} md={6}>
          <Search
            placeholder="Search by movie title..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
            prefix={<SearchOutlined />}
            allowClear
            className="w-full"
          />
        </Col>
        <Col xs={12} sm={6} md={5}>
          <Select
            placeholder="Filter by genre"
            value={filters.filterGenre}
            onChange={(value) => onFiltersChange({ filterGenre: value })}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="Action">Action</Option>
            <Option value="Adventure">Adventure</Option>
            <Option value="Drama">Drama</Option>
            <Option value="Comedy">Comedy</Option>
            <Option value="Horror">Horror</Option>
            <Option value="Romance">Romance</Option>
            <Option value="Sci-Fi">Sci-Fi</Option>
            <Option value="Fantasy">Fantasy</Option>
            <Option value="Thriller">Thriller</Option>
          </Select>
        </Col>
        <Col xs={12} sm={6} md={5}>
          <Select
            placeholder="Filter by status"
            value={filters.filterStatus}
            onChange={(value) => onFiltersChange({ filterStatus: value })}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="NOW_SHOWING">Now Showing</Option>
            <Option value="COMING_SOON">Coming Soon</Option>
            <Option value="ENDED">Ended</Option>
          </Select>
        </Col>
        <Col xs={12} sm={4} md={4}>
          <Select
            placeholder="Filter by rating"
            value={filters.filterRating}
            onChange={(value) => onFiltersChange({ filterRating: value })}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="G">G</Option>
            <Option value="PG">PG</Option>
            <Option value="PG-13">PG-13</Option>
            <Option value="R">R</Option>
            <Option value="NC-17">NC-17</Option>
          </Select>
        </Col>
        <Col xs={12} sm={4} md={4}>
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

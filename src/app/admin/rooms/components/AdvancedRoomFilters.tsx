import React, { useState } from 'react';
import { 
  Input, 
  Select, 
  Button, 
  Row, 
  Col, 
  InputNumber, 
  Checkbox, 
  Space, 
  Card, 
  Collapse,
  Badge,
  Tag,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  ClearOutlined, 
  FilterOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface AdvancedFilters {
  searchTerm: string;
  filterType?: string;
  filterStatus?: string;
  minCapacity?: number;
  maxCapacity?: number;
  features?: string[];
  premiumOnly?: boolean;
}

interface AdvancedRoomFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: Partial<AdvancedFilters>) => void;
  onClearFilters: () => void;
  onQuickFilter: (type: 'premium' | 'standard' | 'has3D' | 'dolbyAtmos' | 'recliner') => void;
  activeFiltersCount?: number;
}

export const AdvancedRoomFilters: React.FC<AdvancedRoomFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onQuickFilter,
  activeFiltersCount = 0,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const quickFilters = [
    { 
      key: 'premium', 
      label: 'Premium Rooms', 
      color: 'gold',
      description: 'VIP, IMAX, 4DX rooms'
    },
    { 
      key: 'has3D', 
      label: '3D Capable', 
      color: 'blue',
      description: 'Rooms with 3D projection'
    },
    { 
      key: 'dolbyAtmos', 
      label: 'Dolby Atmos', 
      color: 'purple',
      description: 'Enhanced audio experience'
    },
    { 
      key: 'recliner', 
      label: 'Recliner Seats', 
      color: 'green',
      description: 'Luxury reclining seats'
    },
  ];

  return (
    <Card className="mb-6 shadow-sm">
      {/* Basic Filters */}
      <div className="mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} lg={6}>
            <Search
              placeholder="Search rooms..."
              value={filters.searchTerm}
              onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
              prefix={<SearchOutlined />}
              allowClear
              size="middle"
            />
          </Col>
          
          <Col xs={12} sm={6} lg={4}>
            <Select
              placeholder="Room Type"
              value={filters.filterType}
              onChange={(value) => onFiltersChange({ filterType: value })}
              style={{ width: '100%' }}
              allowClear
              size="middle"
            >
              <Option value="STANDARD">Standard</Option>
              <Option value="VIP">VIP</Option>
              <Option value="IMAX">IMAX</Option>
              <Option value="4DX">4DX</Option>
            </Select>
          </Col>
          
          <Col xs={12} sm={6} lg={4}>
            <Select
              placeholder="Status"
              value={filters.filterStatus}
              onChange={(value) => onFiltersChange({ filterStatus: value })}
              style={{ width: '100%' }}
              allowClear
              size="middle"
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={6} lg={6}>
            <Space size="small">
              <Button 
                icon={<FilterOutlined />}
                onClick={() => setShowAdvanced(!showAdvanced)}
                type={showAdvanced ? "primary" : "default"}
              >
                Advanced
                {showAdvanced ? <UpOutlined /> : <DownOutlined />}
              </Button>
              
              <Badge count={activeFiltersCount} showZero={false}>
                <Button 
                  icon={<ClearOutlined />} 
                  onClick={onClearFilters}
                  disabled={activeFiltersCount === 0}
                >
                  Clear
                </Button>
              </Badge>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Quick Filters */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">Quick Filters:</div>
        <Space size={[8, 8]} wrap>
          {quickFilters.map((filter) => (
            <Tooltip key={filter.key} title={filter.description}>
              <Tag.CheckableTag
                checked={filters.features?.includes(filter.key) || false}
                onChange={() => onQuickFilter(filter.key as 'premium' | 'standard' | 'has3D' | 'dolbyAtmos' | 'recliner')}
                className="px-3 py-1 rounded-full"
              >
                {filter.label}
              </Tag.CheckableTag>
            </Tooltip>
          ))}
        </Space>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Collapse ghost>
          <Panel header="Advanced Filters" key="advanced">
            <Row gutter={[16, 16]}>
              {/* Capacity Range */}
              <Col xs={24} sm={12} lg={8}>
                <div className="mb-2 text-sm font-medium text-gray-700">Capacity Range</div>
                <Space.Compact>
                  <InputNumber
                    placeholder="Min"
                    value={filters.minCapacity}
                    onChange={(value) => onFiltersChange({ minCapacity: value })}
                    min={1}
                    max={1000}
                    style={{ width: '50%' }}
                  />
                  <InputNumber
                    placeholder="Max"
                    value={filters.maxCapacity}
                    onChange={(value) => onFiltersChange({ maxCapacity: value })}
                    min={1}
                    max={1000}
                    style={{ width: '50%' }}
                  />
                </Space.Compact>
              </Col>

              {/* Features */}
              <Col xs={24} sm={12} lg={8}>
                <div className="mb-2 text-sm font-medium text-gray-700">Features</div>
                <Space direction="vertical" size="small">
                  <Checkbox
                    checked={filters.features?.includes('has3D')}
                    onChange={(e) => {
                      const features = filters.features || [];
                      const newFeatures = e.target.checked 
                        ? [...features, 'has3D']
                        : features.filter(f => f !== 'has3D');
                      onFiltersChange({ features: newFeatures });
                    }}
                  >
                    3D Projection
                  </Checkbox>
                  <Checkbox
                    checked={filters.features?.includes('hasDolbyAtmos')}
                    onChange={(e) => {
                      const features = filters.features || [];
                      const newFeatures = e.target.checked 
                        ? [...features, 'hasDolbyAtmos']
                        : features.filter(f => f !== 'hasDolbyAtmos');
                      onFiltersChange({ features: newFeatures });
                    }}
                  >
                    Dolby Atmos
                  </Checkbox>
                  <Checkbox
                    checked={filters.features?.includes('hasReclinerSeats')}
                    onChange={(e) => {
                      const features = filters.features || [];
                      const newFeatures = e.target.checked 
                        ? [...features, 'hasReclinerSeats']
                        : features.filter(f => f !== 'hasReclinerSeats');
                      onFiltersChange({ features: newFeatures });
                    }}
                  >
                    Recliner Seats
                  </Checkbox>
                </Space>
              </Col>

              {/* Premium Only */}
              <Col xs={24} sm={12} lg={8}>
                <div className="mb-2 text-sm font-medium text-gray-700">Room Category</div>
                <Checkbox
                  checked={filters.premiumOnly}
                  onChange={(e) => onFiltersChange({ premiumOnly: e.target.checked })}
                >
                  Premium Rooms Only (VIP, IMAX, 4DX)
                </Checkbox>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      )}
    </Card>
  );
};

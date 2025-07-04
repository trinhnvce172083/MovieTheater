import React from 'react';
import { Card, Row, Col, Statistic, Typography, Button, Popconfirm } from 'antd';
import {
  GiftOutlined,
  CalendarOutlined,
  DollarOutlined,
  PercentageOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PromotionHeaderProps } from '../types';

const { Title, Text } = Typography;

export const PromotionHeader: React.FC<PromotionHeaderProps> = ({
  statistics,
  selectedRowKeys,
  onAdd,
  onExport,
  onBulkDelete,
}) => {
  return (
    <>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={12} lg={6}>
          <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center">
            <Statistic
              title="Total Promotions"
              value={statistics.totalPromotions}
              prefix={<GiftOutlined className="text-blue-600" />}
              valueStyle={{ color: "#1677ff", fontSize: "1.5rem" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center">
            <Statistic
              title="Active Promotions"
              value={statistics.activePromotions}
              prefix={<CalendarOutlined className="text-green-600" />}
              valueStyle={{ color: "#52c41a", fontSize: "1.5rem" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center">
            <Statistic
              title="Points Promotions"
              value={statistics.pointsPromotions}
              prefix={<DollarOutlined className="text-purple-600" />}
              valueStyle={{ color: "#722ed1", fontSize: "1.5rem" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center">
            <Statistic
              title="Featured Promotions"
              value={statistics.featuredPromotions}
              prefix={<PercentageOutlined className="text-orange-600" />}
              valueStyle={{ color: "#faad14", fontSize: "1.5rem" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Header Section */}
      <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <Title level={2} className="m-0 text-gray-900 text-xl xl:text-2xl">
            Promotion Management
          </Title>
          <Text type="secondary" className="text-sm xl:text-base">
            Manage and organize your cinema&apos;s promotional campaigns
          </Text>
        </div>
        <div className="flex items-center gap-3">
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title="Bulk Delete"
              description={`Delete ${selectedRowKeys.length} selected promotions? This action cannot be undone.`}
              onConfirm={onBulkDelete}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger>
                Delete Selected ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          )}
          <Button
            size="middle"
            className="border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-500"
            onClick={onExport}
          >
            Export CSV
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="middle"
            className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm"
            onClick={onAdd}
          >
            Add New Promotion
          </Button>
        </div>
      </div>
    </>
  );
}; 
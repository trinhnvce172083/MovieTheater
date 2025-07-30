'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Alert, Tag, Space, Table } from 'antd';
import { getAllPromotions } from '@/api/admin/getAllPromotions';
import { PromotionDto } from '@/types/Admin/promotion';

const { Title, Paragraph } = Typography;

export default function PromotionTest() {
  const [promotions, setPromotions] = useState<PromotionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAllPromotions({ page: 0, size: 10 });
      
      if (response && response.content) {
        setPromotions(response.content);
      } else {
        setError('Failed to load promotions');
      }
    } catch (error) {
      setError('An error occurred while loading promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'promotionId',
      key: 'promotionId',
      width: 80,
    },
    {
      title: 'Code',
      dataIndex: 'promotionCode',
      key: 'promotionCode',
      width: 120,
      render: (text: string) => (
        <Tag color="blue" style={{ fontWeight: 'bold' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'promotionName',
      key: 'promotionName',
      width: 200,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Discount',
      key: 'discount',
      width: 150,
      render: (record: PromotionDto) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#1677ff' }}>
            {record.discountDisplayText}
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            {record.discountType}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (record: PromotionDto) => (
        <Tag color={record.valid && !record.expired ? 'success' : 'error'}>
          {record.valid && !record.expired ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Usage',
      key: 'usage',
      width: 120,
      render: (record: PromotionDto) => (
        <div>
          <div>{record.currentUsageCount}/{record.maxUsageCount || '∞'}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>used</div>
        </div>
      ),
    },
    {
      title: 'Featured',
      dataIndex: 'isFeatured',
      key: 'isFeatured',
      width: 80,
      render: (isFeatured: boolean) => (
        isFeatured ? <Tag color="orange">★</Tag> : '-'
      ),
    },
    {
      title: 'Points',
      key: 'points',
      width: 100,
      render: (record: PromotionDto) => (
        record.pointsDiscount ? (
          <div>
            <div style={{ color: '#722ed1', fontWeight: 'bold' }}>
              {record.pointsDisplayText}
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {record.pointsRequired} points
            </div>
          </div>
        ) : '-'
      ),
    },
  ];

  return (
    <Card title="🎯 Promotion API Test - Real Data" style={{ margin: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Paragraph>
          Component này hiển thị dữ liệu thật từ API. 
          Kiểm tra console để xem response chi tiết.
        </Paragraph>
        
        <Button 
          type="primary" 
          onClick={loadPromotions} 
          loading={loading}
          size="large"
        >
          Reload Promotions
        </Button>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
          />
        )}

        <div>
          <Title level={4}>Promotions ({promotions.length})</Title>
          
          <Table
            dataSource={promotions}
            columns={columns}
            rowKey="promotionId"
            loading={loading}
            pagination={false}
            scroll={{ x: 1200 }}
            size="small"
          />
        </div>

        {promotions.length === 0 && !loading && !error && (
          <Alert
            message="No promotions found"
            description="No promotions are available or API returned empty data"
            type="info"
            showIcon
          />
        )}
      </Space>
    </Card>
  );
}; 
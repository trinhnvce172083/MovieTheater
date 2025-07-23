'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Alert, Divider } from 'antd';
import { getAllPromotions, createPromotion, updatePromotion, deletePromotion } from '@/api/admin/getAllPromotions';
import { PromotionDto } from '@/types/Admin/promotion';

const { Title, Text, Paragraph } = Typography;

export const PromotionDemo: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const response = await getAllPromotions({ page: 0, size: 5 });
      setPromotions(response.content || []);
      setMessage(`Loaded ${response.content?.length || 0} promotions`);
    } catch (error) {
      setMessage(`Error loading promotions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestPromotion = async () => {
    try {
      const testPromotion = {
        promotionCode: 'DEMO' + Date.now(),
        promotionName: 'Demo Promotion',
        description: 'This is a demo promotion created via API',
        promotionType: 'PUBLIC' as const,
        discountType: 'PERCENTAGE' as const,
        discountValue: 20,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        memberOnly: false,
        isFeatured: false,
      };
      
      const created = await createPromotion(testPromotion);
      setMessage(`Created promotion: ${created.promotionName}`);
      loadPromotions(); // Reload list
    } catch (error) {
      setMessage(`Error creating promotion: ${error.message}`);
    }
  };

  const updateFirstPromotion = async () => {
    if (promotions.length === 0) {
      setMessage('No promotions to update');
      return;
    }
    
    try {
      const firstPromotion = promotions[0];
      const updated = await updatePromotion(firstPromotion.promotionId, {
        promotionName: 'Updated Demo Promotion',
        discountValue: 25,
      });
      setMessage(`Updated promotion: ${updated.promotionName}`);
      loadPromotions(); // Reload list
    } catch (error) {
      setMessage(`Error updating promotion: ${error.message}`);
    }
  };

  const deleteFirstPromotion = async () => {
    if (promotions.length === 0) {
      setMessage('No promotions to delete');
      return;
    }
    
    try {
      const firstPromotion = promotions[0];
      await deletePromotion(firstPromotion.promotionId);
      setMessage(`Deleted promotion: ${firstPromotion.promotionName}`);
      loadPromotions(); // Reload list
    } catch (error) {
      setMessage(`Error deleting promotion: ${error.message}`);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  return (
    <Card title="Promotion API Demo" style={{ margin: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Paragraph>
          This demo shows how to use the Promotion API endpoints.
          You can test CRUD operations and see the results in real-time.
        </Paragraph>

        <Space wrap>
          <Button onClick={loadPromotions} loading={loading}>
            Load Promotions
          </Button>
          <Button type="primary" onClick={createTestPromotion}>
            Create Test Promotion
          </Button>
          <Button onClick={updateFirstPromotion}>
            Update First Promotion
          </Button>
          <Button danger onClick={deleteFirstPromotion}>
            Delete First Promotion
          </Button>
        </Space>

        {message && (
          <Alert
            message={message}
            type={message.includes('Error') ? 'error' : 'success'}
            showIcon
          />
        )}

        <Divider />

        <Title level={4}>Current Promotions ({promotions.length})</Title>
        
        {promotions.map((promotion) => (
          <Card key={promotion.promotionId} size="small" style={{ marginBottom: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>{promotion.promotionName}</Text>
              <Text type="secondary">Code: {promotion.promotionCode}</Text>
              <Text>{promotion.description}</Text>
              <Space>
                <Text>Type: {promotion.discountType}</Text>
                <Text>Value: {promotion.discountValue}</Text>
                <Text>Active: {promotion.isActive ? 'Yes' : 'No'}</Text>
              </Space>
            </Space>
          </Card>
        ))}

        {promotions.length === 0 && (
          <Alert
            message="No promotions found"
            description="Click 'Create Test Promotion' to add some data"
            type="info"
            showIcon
          />
        )}
      </Space>
    </Card>
  );
}; 
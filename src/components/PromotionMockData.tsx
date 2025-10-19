'use client';

import React, { useState } from 'react';
import { Card, Button, Space, Typography, Alert, Switch } from 'antd';
import { PromotionDto } from '@/types/Admin/promotion';

const { Title, Text, Paragraph } = Typography;

// Mock data for testing
const mockPromotions: PromotionDto[] = [
  {
    promotionId: 1,
    promotionCode: 'SUMMER20',
    promotionName: 'Summer Sale 2024',
    description: 'Get 20% off on all movie tickets this summer!',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    maxDiscountAmount: 50000,
    minPurchaseAmount: 100000,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    isActive: true,
    currentUsageCount: 45,
    maxUsageCount: 100,
    maxUsagePerUser: 2,
    memberOnly: false,
    membershipLevels: '',
    bannerUrl: '',
    bannerImageUrl: '',
    promotionType: 'PUBLIC',
    promotionTypeDisplay: 'Public',
    isExpired: false,
    isValid: true,
    isNotStarted: false,
    isUsageLimitReached: false,
    remainingUsage: 55,
    statusDisplay: 'Active',
    discountDisplay: '20% OFF',
    pointsDisplay: '',
    validityDisplay: 'Jun 1 - Aug 31, 2024',
    usageDisplay: '45/100 used',
    membershipDisplay: 'All users',
    applicabilityDisplay: 'All movies, All times',
    isPointsPromotion: false,
    pointsRequired: 0,
    pointsValue: 0,
    codeValidityHours: 0,
    maxCodesPerUser: 0,
    isFeatured: true,
    displayOrder: 1,
    applicableDays: 'ALL',
    applicableTimes: 'ALL',
    applicableMovies: '',
    applicableRooms: '',
    createdAt: '2024-05-15T10:00:00Z',
    updatedAt: '2024-05-15T10:00:00Z',
  },
  {
    promotionId: 2,
    promotionCode: 'WEEKEND50',
    promotionName: 'Weekend Special',
    description: '50,000 VND off on weekend shows',
    discountType: 'FIXED_AMOUNT',
    discountValue: 50000,
    maxDiscountAmount: 50000,
    minPurchaseAmount: 200000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
    currentUsageCount: 23,
    maxUsageCount: 50,
    maxUsagePerUser: 1,
    memberOnly: true,
    membershipLevels: 'GOLD,PLATINUM',
    bannerUrl: '',
    bannerImageUrl: '',
    promotionType: 'PUBLIC',
    promotionTypeDisplay: 'Public',
    isExpired: false,
    isValid: true,
    isNotStarted: false,
    isUsageLimitReached: false,
    remainingUsage: 27,
    statusDisplay: 'Active',
    discountDisplay: '50,000₫ OFF',
    pointsDisplay: '',
    validityDisplay: 'Jan 1 - Dec 31, 2024',
    usageDisplay: '23/50 used',
    membershipDisplay: 'Gold & Platinum members',
    applicabilityDisplay: 'Weekends only',
    isPointsPromotion: false,
    pointsRequired: 0,
    pointsValue: 0,
    codeValidityHours: 0,
    maxCodesPerUser: 0,
    isFeatured: false,
    displayOrder: 2,
    applicableDays: 'WEEKENDS',
    applicableTimes: 'ALL',
    applicableMovies: '',
    applicableRooms: '',
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
  },
  {
    promotionId: 3,
    promotionCode: 'POINTS100',
    promotionName: 'Points Redemption',
    description: 'Redeem 100 points for 50,000 VND discount',
    discountType: 'FIXED_AMOUNT',
    discountValue: 50000,
    maxDiscountAmount: 50000,
    minPurchaseAmount: 0,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
    currentUsageCount: 12,
    maxUsageCount: 200,
    maxUsagePerUser: 5,
    memberOnly: true,
    membershipLevels: 'BRONZE,SILVER,GOLD,PLATINUM',
    bannerUrl: '',
    bannerImageUrl: '',
    promotionType: 'POINT_BASED',
    promotionTypeDisplay: 'Point Based',
    isExpired: false,
    isValid: true,
    isNotStarted: false,
    isUsageLimitReached: false,
    remainingUsage: 188,
    statusDisplay: 'Active',
    discountDisplay: '50,000₫ OFF',
    pointsDisplay: '100 points required',
    validityDisplay: 'Jan 1 - Dec 31, 2024',
    usageDisplay: '12/200 used',
    membershipDisplay: 'All members',
    applicabilityDisplay: 'All movies, All times',
    isPointsPromotion: true,
    pointsRequired: 100,
    pointsValue: 50000,
    codeValidityHours: 72,
    maxCodesPerUser: 5,
    isFeatured: true,
    displayOrder: 3,
    applicableDays: 'ALL',
    applicableTimes: 'ALL',
    applicableMovies: '',
    applicableRooms: '',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
  },
];

interface PromotionMockDataProps {
  onToggleMockData: (enabled: boolean) => void;
  isMockDataEnabled: boolean;
}

export const PromotionMockData: React.FC<PromotionMockDataProps> = ({
  onToggleMockData,
  isMockDataEnabled,
}) => {
  return (
    <Card title="🧪 Mock Data Control" style={{ margin: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Paragraph>
          Bật/tắt mock data để test UI khi API chưa sẵn sàng.
          Mock data sẽ hiển thị 3 promotions mẫu.
        </Paragraph>
        
        <Space>
          <Text>Enable Mock Data:</Text>
          <Switch 
            checked={isMockDataEnabled}
            onChange={onToggleMockData}
          />
        </Space>

        {isMockDataEnabled && (
          <Alert
            message="Mock Data Active"
            description="Đang sử dụng mock data. Các thao tác CRUD sẽ không thực sự gọi API."
            type="warning"
            showIcon
          />
        )}

        <div>
          <Title level={5}>Mock Data Preview:</Title>
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {mockPromotions.map((promotion) => (
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
          </div>
        </div>
      </Space>
    </Card>
  );
};

// Export mock data for use in other components
export { mockPromotions }; 
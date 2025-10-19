'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Tag, Button, Modal, message, Input, Typography, Empty } from 'antd';
import { GiftOutlined, ReloadOutlined } from '@ant-design/icons';

// Mock data types
interface MockMemberPromotion {
  promotionId: string;
  promotionCode: string;
  description: string;
  discountValue: number;
  pointsRequired: number;
  startDate: string;
  endDate: string;
  currentUsageCount: number;
  maxUsageCount: number;
  isActive: boolean;
}

// Mock data
const mockPromotions: MockMemberPromotion[] = [
  {
    promotionId: '1',
    promotionCode: 'PROMO001',
    description: 'Giảm giá 50,000₫ cho vé xem phim bất kỳ',
    discountValue: 50000,
    pointsRequired: 100,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    currentUsageCount: 45,
    maxUsageCount: 100,
    isActive: true
  },
  {
    promotionId: '2',
    promotionCode: 'PROMO002',
    description: 'Giảm giá 100,000₫ cho combo bắp nước',
    discountValue: 100000,
    pointsRequired: 200,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    currentUsageCount: 23,
    maxUsageCount: 50,
    isActive: true
  },
  {
    promotionId: '3',
    promotionCode: 'PROMO003',
    description: 'Giảm giá 150,000₫ cho vé VIP',
    discountValue: 150000,
    pointsRequired: 300,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    currentUsageCount: 12,
    maxUsageCount: 30,
    isActive: true
  },
  {
    promotionId: '4',
    promotionCode: 'PROMO004',
    description: 'Giảm giá 200,000₫ cho gói gia đình',
    discountValue: 200000,
    pointsRequired: 400,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    currentUsageCount: 8,
    maxUsageCount: 20,
    isActive: true
  },
  {
    promotionId: '5',
    promotionCode: 'PROMO005',
    description: 'Giảm giá 75,000₫ cho vé 3D',
    discountValue: 75000,
    pointsRequired: 150,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    currentUsageCount: 67,
    maxUsageCount: 150,
    isActive: false
  }
];

export default function MemberPromotionsPage() {
  // Mock state
  const [currentPoints, setCurrentPoints] = useState<number>(850);
  const [memberLevel] = useState<string>('Gold');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemCode, setRedeemCode] = useState<string | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [redeemedPromotions, setRedeemedPromotions] = useState<Set<string>>(new Set());

  const handleRedeem = (promotion: MockMemberPromotion) => {
    // Check if points are sufficient
    if (currentPoints < promotion.pointsRequired) {
      message.error(`Insufficient points. You need ${promotion.pointsRequired} points but only have ${currentPoints} points.`);
      return;
    }

    Modal.confirm({
      title: 'Confirm Redemption',
      content: (
        <div>
          <p>Are you sure you want to redeem this promotion?</p>
          <div className="mt-2 p-3 bg-gray-50 rounded">
            <p><strong>Points Required:</strong> {promotion.pointsRequired}</p>
            <p><strong>Current Points:</strong> {currentPoints}</p>
            <p><strong>Points After Redemption:</strong> {currentPoints - promotion.pointsRequired}</p>
            <p><strong>Discount:</strong> {promotion.discountValue.toLocaleString()}₫</p>
          </div>
        </div>
      ),
      okText: 'Yes, Redeem',
      cancelText: 'Cancel',
      onOk: async () => {
        setRedeemLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          // Generate mock code
          const mockCode = `PROMO${Date.now().toString().slice(-6)}`;
          
          // Cập nhật điểm ngay lập tức
          const newPoints = currentPoints - promotion.pointsRequired;
          setCurrentPoints(newPoints);
          
          // Lưu mã code và hiển thị modal
          setRedeemCode(mockCode);
          setShowCodeModal(true);
          
          // Đánh dấu promotion đã được redeem
          setRedeemedPromotions(prev => new Set(prev).add(promotion.promotionId));
          
          message.success(`Redemption successful! You now have ${newPoints} points remaining.`);
        } catch (err: any) {
          message.error('Redemption failed');
        } finally {
          setRedeemLoading(false);
        }
      },
    });
  };

  const renderPromotionCard = (promotion: MockMemberPromotion) => (
    <Card
      key={promotion.promotionId}
      className="mb-4 hover:shadow-md transition-shadow"
      variant="bordered"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <GiftOutlined className="text-purple-600 text-lg" />
          <span className="font-semibold text-lg">Point Redemption Offer</span>
        </div>
        <Tag color="purple" className="font-semibold text-sm px-3 py-1">
          {promotion.pointsRequired} Points
        </Tag>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-gray-700">{promotion.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-600">Discount:</span>
            <span className="ml-2 text-green-600 font-semibold">
              {promotion.discountValue.toLocaleString()}₫
            </span>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Validity:</span>
            <span className="ml-2">{promotion.startDate} to {promotion.endDate}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Usage:</span>
            <span className="ml-2">{promotion.currentUsageCount}/{promotion.maxUsageCount}</span>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Status:</span>
            <span className={`ml-2 font-medium ${promotion.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {promotion.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <Button
        type="primary"
        size="middle"
        disabled={!promotion.isActive || redeemLoading || currentPoints < promotion.pointsRequired || redeemedPromotions.has(promotion.promotionId)}
        loading={redeemLoading}
        onClick={() => handleRedeem(promotion)}
        className="w-full md:w-auto"
      >
        {redeemedPromotions.has(promotion.promotionId) ? 'Redeemed' : 'Redeem'}
      </Button>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
        <Typography.Title level={2} className="text-center mb-6 lg:mb-8 mt-8">
          Redeem Promotions with Points
        </Typography.Title>

        {/* Points & Stats Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap justify-center gap-4">
            <Tag color="gold" className="text-base font-semibold px-4 py-2">
              Your Points: {currentPoints}
            </Tag>
            <Tag color="blue" className="text-base font-semibold px-4 py-2">
              Level: {memberLevel}
            </Tag>
            {redeemedPromotions.size > 0 && (
              <Tag color="green" className="text-base font-semibold px-4 py-2">
                Redeemed Today: {redeemedPromotions.size}
              </Tag>
            )}
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <GiftOutlined className="text-purple-600 text-xl" />
            <span className="text-lg font-medium text-gray-700">Available Promotions</span>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => message.info('Page refreshed')}
            size="middle"
          >
            Refresh
          </Button>
        </div>

        {/* Success Modal */}
        <Modal
          open={showCodeModal}
          onCancel={() => setShowCodeModal(false)}
          footer={null}
          title="🎉 Promotion Code Generated!"
          centered
          width={500}
        >
          <div className="text-center p-6">
            <div className="text-green-600 text-xl font-bold mb-4">✅ Redemption Successful!</div>
            <div className="mb-6 text-gray-600">
              <p>Your promotion code has been generated successfully!</p>
              <p className="text-sm mt-2">Use this code when booking to get your discount:</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="text-xs text-gray-500 mb-2">PROMOTION CODE</div>
              <Input 
                value={redeemCode || ''} 
                readOnly 
                className="text-center font-bold text-2xl mb-3" 
                size="large"
                style={{ fontSize: '24px', fontWeight: 'bold' }}
              />
              <div className="text-xs text-gray-500">
                Copy this code and use it during booking
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  if (redeemCode) {
                    navigator.clipboard.writeText(redeemCode);
                    message.success('✅ Code copied to clipboard!');
                  }
                }}
                className="w-full"
                icon={<span>📋</span>}
              >
                Copy Code to Clipboard
              </Button>
              
              <Button
                size="middle"
                onClick={() => setShowCodeModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>

        {/* Promotions List */}
        <div>
          {mockPromotions.filter(promotion => promotion.pointsRequired > 0).length > 0 ? (
            <div className="space-y-4">
              {mockPromotions
                .filter(promotion => promotion.pointsRequired > 0)
                .map(promotion => renderPromotionCard(promotion))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Empty
                description="No point-redeemable promotions available"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
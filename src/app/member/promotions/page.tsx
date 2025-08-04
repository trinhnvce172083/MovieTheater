'use client';

import React, { useState } from 'react';
import { Card, Spin, Alert, Row, Col, Tag, Button, Modal, message, Input, Typography, Empty } from 'antd';
import { GiftOutlined, ReloadOutlined } from '@ant-design/icons';
import { memberPromotionApi } from '../../../api/member/promotionApi';
import { useMemberPromotions } from '../../../hooks/member/useMemberPromotions';
import { MemberPromotion } from '../../../api/member/promotionApi';

export default function MemberPromotionsPage() {

  const {
    promotions,
    memberPoints,
    memberInfo,
    loading,
    error,
    refetch: refetchPromotions
  } = useMemberPromotions();

  const [redeemLoading, setRedeemLoading] = useState(false);
  // Biến riêng để lưu mã code vừa redeem, không bị ghi đè bởi refetch
  const [redeemCode, setRedeemCode] = useState<string | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<number | null>(null);

  // Luôn đồng bộ currentPoints với memberPoints khi memberPoints thay đổi (sau khi refetch),
  // nhưng không ghi đè nếu currentPoints đã được cập nhật sau redeem
  React.useEffect(() => {
    setCurrentPoints(memberPoints);
  }, [memberPoints]);

  const handleRedeem = (promotion: MemberPromotion) => {
    Modal.confirm({
      title: 'Confirm Redeem',
      content: `Are you sure you want to redeem ${promotion.pointsRequired} points for this promotion?`,
      okText: 'Yes',
      cancelText: 'Cancel',
      onOk: async () => {
        setRedeemLoading(true);
        try {
          const res = await memberPromotionApi.redeemPromotion(promotion.promotionCode);
          setRedeemCode(res.data); // Lưu mã code vừa redeem từ backend
          setCurrentPoints(currentPoints !== null ? currentPoints - promotion.pointsRequired : memberPoints - promotion.pointsRequired);
          setShowCodeModal(true);
          message.success('Redeem successful!');
          // Refetch promotions and points to sync with backend, nhưng không reset redeemCode
          if (typeof refetchPromotions === 'function') {
            await refetchPromotions();
          }
        } catch (err: any) {
          message.error(err?.response?.data?.message || err.message || 'Redeem failed');
        } finally {
          setRedeemLoading(false);
        }
      },
    });
  };

  const renderPromotionCard = (promotion: MemberPromotion) => (
    <Card
      key={promotion.promotionId}
      className="mb-4 hover:shadow-md transition-shadow"
      bordered
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <GiftOutlined className="text-purple-600 text-lg" />
          <span className="font-semibold text-lg">Point Redeem Offer</span>
        </div>
        <Tag color="purple" className="font-semibold text-sm px-3 py-1">
          {promotion.pointsRequired} Points
        </Tag>
      </div>
      
      <div className="space-y-2 mb-4">
        {/* Giữ description từ API (tiếng Việt) */}
        <p className="text-gray-700">{promotion.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-600">Discount:</span>
            <span className="ml-2 text-green-600 font-semibold">
              {promotion.discountValue.toLocaleString()}₫ OFF
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
        disabled={!promotion.isActive || redeemLoading || (currentPoints !== null && currentPoints < promotion.pointsRequired)}
        loading={redeemLoading}
        onClick={() => handleRedeem(promotion)}
        className="w-full md:w-auto"
      >
        Redeem
      </Button>
    </Card>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
            <span className="ml-3">Loading promotions...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
          <Alert
            message="Error Loading Promotions"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" type="primary" onClick={refetchPromotions}>
                Try Again
              </Button>
            }
          />
        </div>
      </div>
    );
  }

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
              Your Points: {currentPoints !== null ? currentPoints : memberPoints}
            </Tag>
            <Tag color="blue" className="text-base font-semibold px-4 py-2">
              Level: {memberInfo?.membershipLevel || 'N/A'}
            </Tag>
            <Tag color="green" className="text-base font-semibold px-4 py-2">
              Total Bookings: {memberInfo?.totalBookings ?? 0}
            </Tag>
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
            onClick={refetchPromotions}
            loading={loading}
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
          title="Your Promotion Code"
          centered
        >
          <div className="text-center p-4">
            <div className="text-green-600 text-lg font-semibold mb-3">Redeem Successful!</div>
            <div className="mb-4 text-gray-600">Use this code when booking to get your discount:</div>
            <Input 
              value={redeemCode || ''} 
              readOnly 
              className="text-center font-bold text-xl mb-4" 
              size="large"
            />
            <Button
              type="primary"
              size="large"
              onClick={() => {
                if (redeemCode) {
                  navigator.clipboard.writeText(redeemCode);
                  message.success('Code copied!');
                }
              }}
              className="w-full"
            >
              Copy Code
            </Button>
          </div>
        </Modal>

        {/* Promotions List */}
        <div>
          {/* Filter chỉ hiển thị promotions có pointsRequired > 0 */}
          {promotions.filter(promotion => promotion.pointsRequired > 0).length > 0 ? (
            <div className="space-y-4">
              {promotions
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
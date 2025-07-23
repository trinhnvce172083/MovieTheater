"use client";

import { useState } from "react";
import { Card, Button, Row, Col, Typography, Tag, message, Modal, Spin, Alert } from "antd";
import { useMemberPromotions } from "@/hooks/member/useMemberPromotions";
import { MemberPromotion } from "@/api/member/promotionApi";

export default function MemberPromotionsPage() {
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  const [showCode, setShowCode] = useState<{ code: string; promoName: string } | null>(null);
  
  const {
    promotions,
    memberPoints,
    memberInfo,
    loading,
    error,
    purchasePromotion,
    refreshPromotions,
  } = useMemberPromotions();

  // Function to check if promotion can be redeemed
  const canRedeemPromotion = (promo: MemberPromotion): boolean => {
    // Check if user has enough points
    if (memberPoints < (promo.pointsRequired || 0)) {
      return false;
    }
    
    // Check if promotion is active
    if (!promo.isActive) {
      return false;
    }
    
    // Check if promotion is not expired
    const now = new Date();
    const endDate = new Date(promo.endDate);
    if (now > endDate) {
      return false;
    }
    
    // Check if promotion has started
    const startDate = new Date(promo.startDate);
    if (now < startDate) {
      return false;
    }
    
    // Check if usage limit is not reached
    if (promo.currentUsageCount >= promo.maxUsageCount) {
      return false;
    }
    
    return true;
  };

  const handleRedeem = async (promo: MemberPromotion) => {
    if (memberPoints < (promo.pointsRequired || 0)) {
      message.error("Not enough points to redeem this promotion.");
      return;
    }
    
    Modal.confirm({
      title: "Are you sure?",
      content: `Do you want to redeem '${promo.promotionName}' for ${promo.pointsRequired} points?`,
      okText: "Yes, redeem",
      cancelText: "Cancel",
      onOk: async () => {
        setRedeemingId(promo.promotionId);
        try {
          const uniqueCode = await purchasePromotion(promo.promotionCode);
          if (uniqueCode) {
            setShowCode({ code: uniqueCode, promoName: promo.promotionName });
          }
        } catch (error) {
          console.error('Error redeeming promotion:', error);
        } finally {
          setRedeemingId(null);
        }
      },
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <div className="text-center py-12">
          <Spin size="large" />
          <Typography.Text className="block mt-4">Loading promotions...</Typography.Text>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <Alert
          message="Error Loading Promotions"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={refreshPromotions}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <Typography.Title level={2} className="mb-2 text-center mt-8">
        Redeem Promotions with Points
      </Typography.Title>
      <div
        className="sticky top-16 lg:top-16 z-10 bg-white py-4 lg:py-4 border-b border-gray-200 -mx-4 lg:-mx-6 px-4 lg:px-6"
      >
        <div className="text-center">
          <Tag color="gold" className="text-base lg:text-lg px-4 lg:px-5 py-2 lg:py-2">
            Your Points: <b>{memberPoints}</b>
          </Tag>
          {memberInfo && (
            <div className="mt-2">
              <Tag color="blue" className="text-sm px-3 py-1">
                Level: {memberInfo.membershipLevel}
              </Tag>
              <Tag color="green" className="text-sm px-3 py-1 ml-2">
                Total Bookings: {memberInfo.totalBookings}
              </Tag>
            </div>
          )}
        </div>
      </div>
      <Row gutter={[16, 16]} className="lg:gutter-[24, 24]">
        {promotions.length === 0 ? (
          <Col span={24} className="text-center">
            <Typography.Text type="secondary">
              No point-based promotions available at the moment.
            </Typography.Text>
          </Col>
        ) : (
          promotions.map((promo) => (
            <Col xs={24} md={12} key={promo.promotionId}>
              <Card
                title={promo.promotionName}
                extra={<Tag color="purple" className="text-xs lg:text-sm">{promo.pointsRequired} Points</Tag>}
                bordered={false}
                className="mb-4"
                size="small"
              >
                <div className="mb-2 text-sm lg:text-base">{promo.description}</div>
                <div className="mb-2 text-sm lg:text-base">
                  <b>Discount:</b> {promo.discountDisplay || `${promo.discountValue}${promo.discountType === 'PERCENTAGE' ? '%' : '₫'} OFF`}
                </div>
                <div className="mb-2 text-sm lg:text-base">
                  <b>Validity:</b> {promo.validityDisplay || `${promo.startDate} to ${promo.endDate}`}
                </div>
                <div className="mb-2 text-sm lg:text-base">
                  <b>Usage:</b> {promo.usageDisplay || `${promo.currentUsageCount}/${promo.maxUsageCount}`}
                </div>
                <Button
                  type="primary"
                  loading={redeemingId === promo.promotionId}
                  onClick={() => handleRedeem(promo)}
                  disabled={redeemingId !== null || memberPoints < (promo.pointsRequired || 0) || !canRedeemPromotion(promo)}
                  size="middle"
                  className="w-full sm:w-auto"
                >
                  {!canRedeemPromotion(promo) ? 'Not Available' : 'Redeem'}
                </Button>
              </Card>
            </Col>
          ))
        )}
      </Row>
      <Modal
        open={!!showCode}
        title="Promotion Code"
        onCancel={() => setShowCode(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setShowCode(null)}>
            Close
          </Button>,
        ]}
        width="90%"
        className="max-w-md mx-auto"
      >
        <div className="text-center">
          <Typography.Title level={4}>
            {showCode?.promoName}
          </Typography.Title>
          <div className="text-xl lg:text-2xl font-bold tracking-wider my-6 break-all bg-gray-100 p-4 rounded">
            {showCode?.code}
          </div>
          <Typography.Text type="secondary" className="text-sm block mb-4">
            ✅ Promotion successfully redeemed! Your points have been deducted.
          </Typography.Text>
          <div className="text-left bg-blue-50 p-4 rounded">
            <Typography.Title level={5} className="mb-2">How to use this code:</Typography.Title>
            <ul className="text-sm space-y-1">
              <li>• Go to movie booking page</li>
              <li>• Select your movie and showtime</li>
              <li>• Choose your seats</li>
              <li>• At checkout, enter this code in the "Promotion Code" field</li>
              <li>• The discount will be applied automatically</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
} 
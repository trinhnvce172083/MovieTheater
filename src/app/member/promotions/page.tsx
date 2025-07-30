'use client';

import React, { useState } from 'react';
import { Card, Spin, Alert, Row, Col, Tag, Button, Modal, message, Input } from 'antd';
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
      title: 'Are you sure you want to redeem this promotion?',
      content: `This will cost ${promotion.pointsRequired} points. Continue?`,
      okText: 'Yes',
      cancelText: 'No',
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
      style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px #f0f1f2' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 18 }}>Đổi điểm ưu đãi</span>
        <Tag color="purple" style={{ fontWeight: 600, fontSize: 14 }}>{promotion.pointsRequired} Points</Tag>
      </div>
      <div style={{ marginBottom: 8 }}>{promotion.description}</div>
      <div style={{ marginBottom: 8 }}>
        <b>Discount:</b> {promotion.discountValue.toLocaleString()}₫ OFF
      </div>
      <div style={{ marginBottom: 8 }}>
        <b>Validity:</b> {promotion.startDate} to {promotion.endDate}
      </div>
      <div style={{ marginBottom: 8 }}>
        <b>Usage:</b> {promotion.currentUsageCount}/{promotion.maxUsageCount}
      </div>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
        Active: <b>{promotion.isActive ? 'Yes' : 'No'}</b><br />
        Start: {promotion.startDate}<br />
        End: {promotion.endDate}<br />
        Can Redeem: <b>{promotion.isActive ? 'Yes' : 'No'}</b>
      </div>
      <Button
        type="primary"
        style={{ background: '#1677ff', fontWeight: 600 }}
        disabled={!promotion.isActive || redeemLoading || (currentPoints !== null && currentPoints < promotion.pointsRequired)}
        loading={redeemLoading}
        onClick={() => handleRedeem(promotion)}
      >
        Redeem
      </Button>
    </Card>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading promotions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 24 }}>Redeem Promotions with Points</h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
        <Tag color="gold" style={{ fontSize: 16, fontWeight: 600 }}>
          Your Points: {currentPoints !== null ? currentPoints : memberPoints}
        </Tag>
        <Tag color="blue" style={{ fontSize: 15, fontWeight: 600 }}>Level: {memberInfo?.membershipLevel || 'N/A'}</Tag>
        <Tag color="green" style={{ fontSize: 15, fontWeight: 600 }}>Total Bookings: {memberInfo?.totalBookings ?? 0}</Tag>
      </div>
      <Modal
        open={showCodeModal}
        onCancel={() => {
          setShowCodeModal(false);
          // Không reset currentPoints hoặc redeemCode ở đây để giữ lại mã code cho user copy
        }}
        footer={null}
        title="Your Promotion Code"
      >
        <div style={{ textAlign: 'center', margin: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Redeem Successful!</div>
          <div style={{ marginBottom: 8 }}>Use this code when booking to get your discount:</div>
          <Input value={redeemCode || ''} readOnly style={{ textAlign: 'center', fontWeight: 700, fontSize: 20, marginBottom: 12 }} />
          <Button
            type="primary"
            onClick={() => {
              if (redeemCode) {
                navigator.clipboard.writeText(redeemCode);
                message.success('Copied!');
              }
            }}
          >Copy Code</Button>
        </div>
      </Modal>
      <Row gutter={[16, 16]} justify="center">
        {promotions.length > 0 ? promotions.map(promotion => (
          <Col xs={24} md={18} lg={16} key={promotion.promotionId}>
            {renderPromotionCard(promotion)}
          </Col>
        )) : (
          <Col span={24}><Alert message="No promotions available" type="info" showIcon /></Col>
        )}
      </Row>
    </div>
  );
} 
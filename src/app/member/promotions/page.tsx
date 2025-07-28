'use client';

import React from 'react';
import { Card, Spin, Alert, Row, Col } from 'antd';
import { useMemberPromotions } from '../../../hooks/member/useMemberPromotions';
import { MemberPromotion } from '../../../api/member/promotionApi';

export default function MemberPromotionsPage() {
  const {
    promotions,
    memberPoints,
    memberInfo,
    loading,
    error,
  } = useMemberPromotions();

  const renderPromotionCard = (promotion: MemberPromotion) => (
    <Card
      key={promotion.promotionId}
      title={promotion.promotionName}
      style={{ marginBottom: 16 }}
    >
      <p><strong>Code:</strong> {promotion.promotionCode}</p>
      <p><strong>Description:</strong> {promotion.description}</p>
      <p><strong>Discount:</strong> {promotion.discountType} - {promotion.discountValue}</p>
      <p><strong>Points Required:</strong> {promotion.pointsRequired}</p>
      <p><strong>Valid:</strong> {promotion.startDate} - {promotion.endDate}</p>
      <p><strong>Status:</strong> {promotion.isActive ? 'Active' : 'Inactive'}</p>
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
    <div style={{ padding: '20px' }}>
      <h1>All Promotions</h1>
      <Row gutter={[16, 16]}>
        {promotions.length > 0 ? promotions.map(promotion => (
          <Col xs={24} md={12} lg={8} key={promotion.promotionId}>
            {renderPromotionCard(promotion)}
          </Col>
        )) : (
          <Col span={24}><Alert message="No promotions available" type="info" showIcon /></Col>
        )}
      </Row>
    </div>
  );
} 
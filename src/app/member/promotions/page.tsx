"use client";

import { useState } from "react";
import { Card, Button, Row, Col, Typography, Tag, message, Modal } from "antd";

// Mock data cho promotions có thể đổi bằng điểm
const mockPromotions = [
  {
    promotionId: 1,
    promotionName: "Free Popcorn",
    description: "Get a free large popcorn with any ticket purchase!",
    pointsRequired: 200,
    discountDisplay: "100% off Popcorn",
    validityDisplay: "2024-06-01 to 2024-06-30",
  },
  {
    promotionId: 2,
    promotionName: "Buy 1 Get 1 Drink",
    description: "Buy one drink, get one free!",
    pointsRequired: 150,
    discountDisplay: "Buy 1 Get 1",
    validityDisplay: "2024-06-01 to 2024-06-30",
  },
  {
    promotionId: 3,
    promotionName: "Movie Ticket Discount",
    description: "Get 20% off your next movie ticket.",
    pointsRequired: 300,
    discountDisplay: "20% off Ticket",
    validityDisplay: "2024-06-01 to 2024-06-30",
  },
];

const MOCK_START_POINTS = 500;

function generateFakeCode() {
  // Tạo mã code giả lập
  return (
    Math.random().toString(36).substring(2, 8).toUpperCase() +
    '-' +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
}

export default function MemberPromotionsPage() {
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  const [memberPoints, setMemberPoints] = useState<number>(MOCK_START_POINTS);
  const [showCode, setShowCode] = useState<{ code: string; promoName: string } | null>(null);

  const handleRedeem = (promo: typeof mockPromotions[0]) => {
    if (memberPoints < promo.pointsRequired) {
      message.error("Not enough points to redeem this promotion.");
      return;
    }
    Modal.confirm({
      title: "Are you sure?",
      content: `Do you want to redeem '${promo.promotionName}' for ${promo.pointsRequired} points?`,
      okText: "Yes, redeem",
      cancelText: "Cancel",
      onOk: () => {
        setRedeemingId(promo.promotionId);
        setTimeout(() => {
          const code = generateFakeCode();
          setShowCode({ code, promoName: promo.promotionName });
          setMemberPoints((prev) => prev - promo.pointsRequired);
          setRedeemingId(null);
        }, 1000);
      },
    });
  };

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
        </div>
      </div>
      <Row gutter={[16, 16]} className="lg:gutter-[24, 24]">
        {mockPromotions.length === 0 ? (
          <Col span={24} className="text-center">
            <Typography.Text type="secondary">
              No point-based promotions available at the moment.
            </Typography.Text>
          </Col>
        ) : (
          mockPromotions.map((promo) => (
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
                  <b>Discount:</b> {promo.discountDisplay}
                </div>
                <div className="mb-2 text-sm lg:text-base">
                  <b>Validity:</b> {promo.validityDisplay}
                </div>
                <Button
                  type="primary"
                  loading={redeemingId === promo.promotionId}
                  onClick={() => handleRedeem(promo)}
                  disabled={redeemingId !== null || memberPoints < promo.pointsRequired}
                  size="middle"
                  className="w-full sm:w-auto"
                >
                  Redeem
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
          <div className="text-xl lg:text-2xl font-bold tracking-wider my-6 break-all">
            {showCode?.code}
          </div>
          <Typography.Text type="secondary" className="text-sm">
            Use this code at checkout to redeem your promotion.
          </Typography.Text>
        </div>
      </Modal>
    </div>
  );
} 
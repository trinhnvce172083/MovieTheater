import React from 'react';
import { Modal, Row, Col, Tag, Button } from 'antd';
import Image from 'next/image';
import { PromotionViewModalProps } from '../types';

export const PromotionViewModal: React.FC<PromotionViewModalProps> = ({
  isVisible,
  promotion,
  onClose,
  onEdit,
}) => {
  if (!promotion) return null;

  return (
    <Modal
      title={`Promotion Details: ${promotion.promotionName || ""}`}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="edit"
          type="primary"
          onClick={() => onEdit(promotion)}
        >
          Edit Promotion
        </Button>,
      ]}
      width={900}
      className="professional-modal"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Basic Information
          </h3>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Promotion Code
                </label>
                <div className="text-base font-mono bg-gray-50 p-2 rounded">
                  {promotion.promotionCode}
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Promotion Name
                </label>
                <div className="text-base bg-gray-50 p-2 rounded">
                  {promotion.promotionName}
                </div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Description
                </label>
                <div className="text-base bg-gray-50 p-2 rounded">
                  {promotion.description}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Discount Information */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Discount Information
          </h3>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Discount Type
                </label>
                <div className="text-base bg-gray-50 p-2 rounded">
                  <Tag
                    color={
                      promotion.discountType === "PERCENTAGE"
                        ? "blue"
                        : promotion.discountType === "FIXED_AMOUNT"
                        ? "green"
                        : "purple"
                    }
                  >
                    {promotion.discountType}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Discount Value
                </label>
                <div className="text-base bg-gray-50 p-2 rounded font-medium">
                  {promotion.discountType === 'FIXED' || promotion.discountType === 'FIXED_AMOUNT'
                    ? `${Number(promotion.discountValue).toLocaleString('vi-VN')}₫ OFF`
                    : promotion.discountType === 'PERCENTAGE'
                    ? `${promotion.discountValue}% OFF`
                    : promotion.discountType === 'POINTS' || promotion.pointsDiscount
                    ? `Đổi ${promotion.pointsRequired || promotion.discountValue} điểm`
                    : promotion.discountDisplayText}
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Min Purchase
                </label>
                <div className="text-base bg-gray-50 p-2 rounded">
                  {promotion.minPurchaseAmount?.toLocaleString()}₫
                </div>
              </div>
            </Col>
            {promotion.maxDiscountAmount && (
              <Col xs={24} sm={8}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Max Discount
                  </label>
                  <div className="text-base bg-gray-50 p-2 rounded">
                    {promotion.maxDiscountAmount.toLocaleString()}₫
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </div>

        {/* Validity & Usage */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Validity & Usage
          </h3>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Validity Period
                </label>
                <div className="text-base bg-gray-50 p-2 rounded">
                  {promotion.validityDisplay}
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <div className="text-base bg-gray-50 p-2 rounded">
                  <Tag
                    color={
                      promotion.valid && !promotion.expired
                        ? "success"
                        : promotion.expired
                        ? "error"
                        : "warning"
                    }
                  >
                    {promotion.valid && !promotion.expired ? "Active" : promotion.expired ? "Expired" : "Inactive"}
                  </Tag>
                  {promotion.isFeatured && (
                    <Tag color="orange" className="ml-2">
                      Featured
                    </Tag>
                  )}
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Usage
                </label>
                <div className="text-base bg-gray-50 p-2 rounded">
                  {promotion.currentUsageCount}/{promotion.maxUsageCount || '∞'} used
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Membership
                </label>
                <div className="text-base bg-gray-50 p-2 rounded">
                  {promotion.pointsDiscount ? "Points-based" : "Public"}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Points Information (if applicable) */}
        {promotion.pointsDiscount && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Points Information
            </h3>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Points Required
                  </label>
                  <div className="text-base bg-gray-50 p-2 rounded">
                    {promotion.pointsDisplayText}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Code Validity
                  </label>
                  <div className="text-base bg-gray-50 p-2 rounded">
                    {promotion.codeValidityHours} hours
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Applicability */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Applicability
          </h3>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Promotion Type
                </label>
                <div className="text-base bg-gray-50 p-2 rounded">
                  <Tag color="cyan">
                    {promotion.pointsDiscount ? "Points-based" : "Public"}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Restrictions
                </label>
                <div className="text-base bg-gray-50 p-2 rounded">
                  All movies, All times
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Banner */}
        {promotion.bannerImageUrl && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Banner
            </h3>
            <Image
              width={600}
              height={200}
              className="w-full h-auto object-cover rounded"
              src={promotion.bannerImageUrl}
              alt="Promotion Banner"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}; 
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Promotion, 
  PromotionCreateRequest, 
  PromotionUpdateRequest 
} from '@/types/Admin/promotion';
import { createPromotion, updatePromotion } from '@/api/admin/getAllPromotions';
import { toast } from 'react-toastify';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promotion?: Promotion | null;
}

export default function PromotionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  promotion 
}: PromotionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PromotionCreateRequest>({
    promotionCode: '',
    promotionName: '',
    description: '',
    promotionType: 'PUBLIC',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    maxDiscountAmount: 0,
    minPurchaseAmount: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    maxUsageCount: 0,
    maxUsagePerUser: 1,
    applicableDays: 'ALL',
    applicableTimes: 'ALL',
    applicableMovies: '',
    applicableRooms: '',
    memberOnly: false,
    membershipLevels: '',
    isFeatured: false,
    displayOrder: 0,
    pointsRequired: 0,
    pointsValue: 0,
    codeValidityHours: 72,
    maxCodesPerUser: 1
  });

  const isEdit = !!promotion;

  useEffect(() => {
    if (promotion) {
      setFormData({
        promotionCode: promotion.promotionCode,
        promotionName: promotion.promotionName,
        description: promotion.description || '',
        promotionType: promotion.promotionType,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        maxDiscountAmount: promotion.maxDiscountAmount || 0,
        minPurchaseAmount: promotion.minPurchaseAmount || 0,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        isActive: promotion.isActive,
        maxUsageCount: promotion.maxUsageCount || 0,
        maxUsagePerUser: promotion.maxUsagePerUser || 1,
        applicableDays: promotion.applicableDays || 'ALL',
        applicableTimes: promotion.applicableTimes || 'ALL',
        applicableMovies: promotion.applicableMovies || '',
        applicableRooms: promotion.applicableRooms || '',
        memberOnly: promotion.memberOnly,
        membershipLevels: promotion.membershipLevels || '',
        isFeatured: promotion.isFeatured,
        displayOrder: promotion.displayOrder,
        pointsRequired: promotion.pointsRequired || 0,
        pointsValue: promotion.pointsValue || 0,
        codeValidityHours: promotion.codeValidityHours || 72,
        maxCodesPerUser: promotion.maxCodesPerUser || 1
      });
    } else {
      // Reset form for new promotion
      setFormData({
        promotionCode: '',
        promotionName: '',
        description: '',
        promotionType: 'PUBLIC',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        maxDiscountAmount: 0,
        minPurchaseAmount: 0,
        startDate: '',
        endDate: '',
        isActive: true,
        maxUsageCount: 0,
        maxUsagePerUser: 1,
        applicableDays: 'ALL',
        applicableTimes: 'ALL',
        applicableMovies: '',
        applicableRooms: '',
        memberOnly: false,
        membershipLevels: '',
        isFeatured: false,
        displayOrder: 0,
        pointsRequired: 0,
        pointsValue: 0,
        codeValidityHours: 72,
        maxCodesPerUser: 1
      });
    }
  }, [promotion, isOpen]);

  const handleInputChange = (field: keyof PromotionCreateRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.promotionCode || !formData.promotionName || !formData.startDate || !formData.endDate) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setLoading(true);
      
      if (isEdit && promotion) {
        const updateData: PromotionUpdateRequest = { ...formData };
        await updatePromotion(promotion.promotionId, updateData);
        toast.success('Cập nhật khuyến mãi thành công');
      } else {
        await createPromotion(formData);
        toast.success('Tạo khuyến mãi thành công');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error('Không thể lưu khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promotionCode">Mã khuyến mãi *</Label>
              <Input
                id="promotionCode"
                value={formData.promotionCode}
                onChange={(e) => handleInputChange('promotionCode', e.target.value)}
                placeholder="Nhập mã khuyến mãi"
                disabled={isEdit}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotionName">Tên khuyến mãi *</Label>
              <Input
                id="promotionName"
                value={formData.promotionName}
                onChange={(e) => handleInputChange('promotionName', e.target.value)}
                placeholder="Nhập tên khuyến mãi"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Mô tả chi tiết về khuyến mãi"
              rows={3}
            />
          </div>

          {/* Promotion Type and Discount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promotionType">Loại khuyến mãi</Label>
              <select
                id="promotionType"
                value={formData.promotionType}
                onChange={(e) => handleInputChange('promotionType', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="PUBLIC">Công khai</option>
                <option value="POINT_BASED">Điểm thưởng</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountType">Loại giảm giá</Label>
              <select
                id="discountType"
                value={formData.discountType}
                onChange={(e) => handleInputChange('discountType', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED_AMOUNT">Số tiền cố định (₫)</option>
                <option value="BUY_ONE_GET_ONE">Mua 1 tặng 1</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue">Giá trị giảm *</Label>
              <Input
                id="discountValue"
                type="number"
                value={formData.discountValue}
                onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          {/* Discount Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxDiscountAmount">Giảm giá tối đa (₫)</Label>
              <Input
                id="maxDiscountAmount"
                type="number"
                value={formData.maxDiscountAmount}
                onChange={(e) => handleInputChange('maxDiscountAmount', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minPurchaseAmount">Giá trị đơn hàng tối thiểu (₫)</Label>
              <Input
                id="minPurchaseAmount"
                type="number"
                value={formData.minPurchaseAmount}
                onChange={(e) => handleInputChange('minPurchaseAmount', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Ngày bắt đầu *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Ngày kết thúc *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUsageCount">Số lượt sử dụng tối đa</Label>
              <Input
                id="maxUsageCount"
                type="number"
                value={formData.maxUsageCount}
                onChange={(e) => handleInputChange('maxUsageCount', parseInt(e.target.value) || 0)}
                placeholder="0 (không giới hạn)"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUsagePerUser">Số lượt sử dụng mỗi người</Label>
              <Input
                id="maxUsagePerUser"
                type="number"
                value={formData.maxUsagePerUser}
                onChange={(e) => handleInputChange('maxUsagePerUser', parseInt(e.target.value) || 1)}
                placeholder="1"
                min="1"
              />
            </div>
          </div>

          {/* Applicability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicableDays">Ngày áp dụng</Label>
              <select
                id="applicableDays"
                value={formData.applicableDays}
                onChange={(e) => handleInputChange('applicableDays', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="ALL">Tất cả ngày</option>
                <option value="WEEKDAYS">Thứ 2-6</option>
                <option value="WEEKENDS">Cuối tuần</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicableTimes">Thời gian áp dụng</Label>
              <select
                id="applicableTimes"
                value={formData.applicableTimes}
                onChange={(e) => handleInputChange('applicableTimes', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="ALL">Tất cả thời gian</option>
                <option value="MORNING">Buổi sáng</option>
                <option value="AFTERNOON">Buổi chiều</option>
                <option value="EVENING">Buổi tối</option>
              </select>
            </div>
          </div>

          {/* Membership Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="memberOnly"
                checked={formData.memberOnly}
                onCheckedChange={(checked) => handleInputChange('memberOnly', checked)}
              />
              <Label htmlFor="memberOnly">Chỉ dành cho thành viên</Label>
            </div>

            {formData.memberOnly && (
              <div className="space-y-2">
                <Label htmlFor="membershipLevels">Cấp độ thành viên</Label>
                <Input
                  id="membershipLevels"
                  value={formData.membershipLevels}
                  onChange={(e) => handleInputChange('membershipLevels', e.target.value)}
                  placeholder="BRONZE,SILVER,GOLD,PLATINUM (để trống = tất cả)"
                />
              </div>
            )}
          </div>

          {/* Points Settings (for POINT_BASED promotions) */}
          {formData.promotionType === 'POINT_BASED' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pointsRequired">Điểm cần thiết</Label>
                <Input
                  id="pointsRequired"
                  type="number"
                  value={formData.pointsRequired}
                  onChange={(e) => handleInputChange('pointsRequired', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pointsValue">Giá trị điểm</Label>
                <Input
                  id="pointsValue"
                  type="number"
                  value={formData.pointsValue}
                  onChange={(e) => handleInputChange('pointsValue', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codeValidityHours">Thời hạn mã (giờ)</Label>
                <Input
                  id="codeValidityHours"
                  type="number"
                  value={formData.codeValidityHours}
                  onChange={(e) => handleInputChange('codeValidityHours', parseInt(e.target.value) || 72)}
                  placeholder="72"
                  min="1"
                />
              </div>
            </div>
          )}

          {/* Display Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Kích hoạt</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
              />
              <Label htmlFor="isFeatured">Nổi bật</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
            <Input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
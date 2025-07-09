'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Users, 
  Tag, 
  Star, 
  Clock, 
  TrendingUp,
  DollarSign,
  Percent,
  Gift,
  Shield,
  Eye,
  BarChart3
} from 'lucide-react';
import { PromotionDto } from '@/types/Admin/promotion';
import { getPromotionUsage } from '@/api/admin/getAllPromotions';

interface PromotionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion: PromotionDto;
}

export default function PromotionDetailModal({ 
  isOpen, 
  onClose, 
  promotion 
}: PromotionDetailModalProps) {
  if (!promotion) return null;
  const [usageData, setUsageData] = useState<any>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

  useEffect(() => {
    if (isOpen && promotion) {
      fetchUsageData();
    }
  }, [isOpen, promotion]);

  const fetchUsageData = async () => {
    try {
      setLoadingUsage(true);
      const data = await getPromotionUsage(promotion.promotionId);
      setUsageData(data);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  const getStatusBadge = () => {
    if (!promotion.isActive) return <Badge variant="secondary">Không hoạt động</Badge>;
    if (promotion.isExpired) return <Badge variant="destructive">Đã hết hạn</Badge>;
    if (promotion.isNotStarted) return <Badge variant="outline">Chưa bắt đầu</Badge>;
    if (promotion.isUsageLimitReached) return <Badge variant="destructive">Hết lượt</Badge>;
    return <Badge variant="default">Đang hoạt động</Badge>;
  };

  const getDiscountTypeIcon = () => {
    switch (promotion.discountType) {
      case 'PERCENTAGE': return <Percent className="w-5 h-5" />;
      case 'FIXED_AMOUNT': return <DollarSign className="w-5 h-5" />;
      case 'BUY_ONE_GET_ONE': return <Gift className="w-5 h-5" />;
      default: return <Tag className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Chi tiết khuyến mãi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{promotion.promotionName}</CardTitle>
                  <p className="text-muted-foreground mt-1">{promotion.promotionCode}</p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge()}
                  {promotion.isFeatured && (
                    <Badge variant="default" className="bg-yellow-500">
                      <Star className="w-3 h-3 mr-1" />
                      Nổi bật
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {promotion.description && (
                <p className="text-muted-foreground mb-4">{promotion.description}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  {getDiscountTypeIcon()}
                  <span className="font-semibold">{promotion.discountDisplay}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{promotion.validityDisplay}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{promotion.usageDisplay}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discount Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Thông tin giảm giá
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Loại giảm giá</h4>
                  <p className="text-muted-foreground">{promotion.discountType}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Giá trị giảm</h4>
                  <p className="text-muted-foreground">
                    {promotion.discountType === 'PERCENTAGE' 
                      ? `${promotion.discountValue}%` 
                      : formatCurrency(promotion.discountValue)
                    }
                  </p>
                </div>
                {promotion.maxDiscountAmount && (
                  <div>
                    <h4 className="font-medium mb-2">Giảm giá tối đa</h4>
                    <p className="text-muted-foreground">{formatCurrency(promotion.maxDiscountAmount)}</p>
                  </div>
                )}
                {promotion.minPurchaseAmount && (
                  <div>
                    <h4 className="font-medium mb-2">Giá trị đơn hàng tối thiểu</h4>
                    <p className="text-muted-foreground">{formatCurrency(promotion.minPurchaseAmount)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage and Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Giới hạn sử dụng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Số lượt đã sử dụng</h4>
                  <p className="text-muted-foreground">{promotion.currentUsageCount}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Số lượt tối đa</h4>
                  <p className="text-muted-foreground">
                    {promotion.maxUsageCount ? promotion.maxUsageCount : 'Không giới hạn'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Số lượt mỗi người</h4>
                  <p className="text-muted-foreground">
                    {promotion.maxUsagePerUser ? promotion.maxUsagePerUser : 'Không giới hạn'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Số lượt còn lại</h4>
                  <p className="text-muted-foreground">{promotion.remainingUsage}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applicability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Điều kiện áp dụng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Đối tượng</h4>
                  <p className="text-muted-foreground">{promotion.membershipDisplay}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Điều kiện áp dụng</h4>
                  <p className="text-muted-foreground">{promotion.applicabilityDisplay}</p>
                </div>
                {promotion.applicableMovies && (
                  <div>
                    <h4 className="font-medium mb-2">Phim áp dụng</h4>
                    <p className="text-muted-foreground">{promotion.applicableMovies}</p>
                  </div>
                )}
                {promotion.applicableRooms && (
                  <div>
                    <h4 className="font-medium mb-2">Phòng áp dụng</h4>
                    <p className="text-muted-foreground">{promotion.applicableRooms}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Points Information (for POINT_BASED promotions) */}
          {promotion.isPointsPromotion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Thông tin điểm thưởng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Điểm cần thiết</h4>
                    <p className="text-muted-foreground">{promotion.pointsRequired} điểm</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Giá trị điểm</h4>
                    <p className="text-muted-foreground">{promotion.pointsValue} điểm</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Thời hạn mã</h4>
                    <p className="text-muted-foreground">{promotion.codeValidityHours} giờ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Statistics */}
          {usageData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Thống kê sử dụng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Tổng lượt sử dụng</h4>
                    <p className="text-2xl font-bold">{usageData.totalUsage}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Tổng doanh thu</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(usageData.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Tổng giảm giá</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(usageData.totalDiscount)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Giá trị đơn hàng TB</h4>
                    <p className="text-2xl font-bold">
                      {formatCurrency(usageData.averageOrderValue)}
                    </p>
                  </div>
                </div>

                {usageData.recentBookings && usageData.recentBookings.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Đơn hàng gần đây</h4>
                    <div className="space-y-2">
                      {usageData.recentBookings.slice(0, 5).map((booking) => (
                        <div key={booking.bookingId} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">#{booking.bookingId}</p>
                            <p className="text-sm text-muted-foreground">{booking.customerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(booking.orderAmount)}</p>
                            <p className="text-sm text-red-600">-{formatCurrency(booking.discountAmount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin hệ thống</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Ngày tạo</h4>
                  <p className="text-muted-foreground">{formatDateTime(promotion.createdAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Ngày cập nhật</h4>
                  <p className="text-muted-foreground">{formatDateTime(promotion.updatedAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Thứ tự hiển thị</h4>
                  <p className="text-muted-foreground">{promotion.displayOrder}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Loại khuyến mãi</h4>
                  <p className="text-muted-foreground">{promotion.promotionTypeDisplay}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <Button onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
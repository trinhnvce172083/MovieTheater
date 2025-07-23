import React from 'react';
import { Table, Button, Tooltip, Popconfirm, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PromotionDto } from '@/types/Admin/promotion';
import { PromotionTableProps } from '../types';

export const PromotionTable: React.FC<PromotionTableProps> = ({
  promotions,
  loading,
  currentPage,
  pageSize,
  totalCount,
  selectedRowKeys,
  onEdit,
  onView,
  onDelete,
  onSelectionChange,
  onPageChange,
}) => {
  const formatVND = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const columns: ColumnsType<PromotionDto> = [
    {
      title: "#",
      dataIndex: "promotionId",
      key: "promotionId",
      width: 60,
      align: "center",
      render: (_: unknown, record: PromotionDto, index: number) => (
        <span className="font-mono text-sm text-gray-500">
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: "Promotion Name",
      dataIndex: "promotionName",
      key: "promotionName",
      width: 220,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {record.bannerImageUrl && (
            <img src={record.bannerImageUrl} alt={record.promotionName} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, background: '#fff', border: '1px solid #eee' }} />
          )}
          <div>
            <div style={{ fontWeight: 600 }}>{record.promotionName}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Code",
      dataIndex: "promotionCode",
      key: "promotionCode",
      width: 160,
      align: "center",
      render: (text) => (
        <Tag
          color="blue"
          style={{
            fontWeight: 700,
            fontSize: 15,
            padding: '4px 18px',
            letterSpacing: 1,
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(22,119,255,0.08)',
            display: 'inline-block',
            minWidth: 100,
            textAlign: 'center',
            margin: 0,
            marginRight: 28,
            background: '#e6f4ff',
            border: '1.5px solid #1677ff',
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Discount",
      key: "discount",
      width: 160,
      align: "left",
      render: (_: unknown, record: PromotionDto) => (
        <div style={{ paddingLeft: 12 }}>
          {record.discountType === 'FIXED' || record.discountType === 'FIXED_AMOUNT' ? (
            <div>
              <span style={{ color: '#1677ff', fontWeight: 600 }}>
                {formatVND(record.discountValue)} OFF
              </span>
              <div style={{ fontSize: 12, color: '#888' }}>Fixed Amount</div>
            </div>
          ) : record.discountType === 'PERCENTAGE' ? (
            <div>
              <span style={{ color: '#1677ff', fontWeight: 600 }}>
                {record.discountValue}% OFF
              </span>
              <div style={{ fontSize: 12, color: '#888' }}>Percentage</div>
            </div>
          ) : record.discountType === 'POINTS' || record.pointsDiscount ? (
            <div>
              <span style={{ color: '#722ed1', fontWeight: 600 }}>
                Đổi {record.pointsRequired || record.discountValue} điểm
              </span>
              <div style={{ fontSize: 12, color: '#888' }}>Points</div>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: "Validity Period",
      key: "period",
      width: 140,
      align: "center",
      render: (_: unknown, record: PromotionDto) => (
        <div className="text-center text-sm">
          <div className="text-gray-900">
            {new Date(record.startDate).toLocaleDateString('vi-VN')}
          </div>
          <div className="text-xs text-gray-500">to</div>
          <div className="text-gray-900">
            {new Date(record.endDate).toLocaleDateString('vi-VN')}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      align: "center",
      render: (_: unknown, record: PromotionDto) => {
        let color = "default";
        let text = "Inactive";
        
        if (record.valid && !record.expired) {
          color = "success";
          text = "Active";
        } else if (record.expired) {
          color = "error";
          text = "Expired";
        }
        
        return (
          <div className="text-center">
            <Tag color={color} className="text-xs">
              {text}
            </Tag>
            {record.isFeatured && (
              <div className="text-xs text-orange-500 mt-1">★ Featured</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Usage",
      key: "usage",
      width: 80,
      align: "center",
      render: (_: unknown, record: PromotionDto) => (
        <div className="text-center text-sm">
          <div className="font-medium">{record.currentUsageCount || 0}</div>
          <div className="text-xs text-gray-500">times</div>
        </div>
      ),
    },
    {
      title: "Min Purchase",
      key: "min_purchase",
      width: 110,
      align: "right",
      render: (_: unknown, record: PromotionDto) => (
        <div className="text-right text-sm">
          {record.minPurchaseAmount && record.minPurchaseAmount > 0
            ? `${Number(record.minPurchaseAmount).toLocaleString("vi-VN")}₫`
            : "No minimum"}
        </div>
      ),
    },
    {
      title: "Type",
      key: "type",
      width: 100,
      align: "center",
      render: (_: unknown, record: PromotionDto) => (
        <div className="text-center">
          <Tag color={record.pointsDiscount ? "purple" : "blue"} className="text-xs">
            {record.pointsDiscount ? "Points" : "Public"}
          </Tag>
          {record.isFeatured && (
            <div className="text-xs text-orange-600 mt-1">Featured</div>
          )}
        </div>
      ),
    },
    {
      title: "Max Discount",
      key: "max_discount",
      width: 110,
      align: "right",
      render: (_: unknown, record: PromotionDto) => (
        <div className="text-right text-sm">
          {record.maxDiscountAmount ? `${Number(record.maxDiscountAmount).toLocaleString('vi-VN')}₫` : '-'}
        </div>
      ),
    },
    {
      title: "Max Usage",
      key: "max_usage",
      width: 90,
      align: "center",
      render: (_: unknown, record: PromotionDto) => (
        <div className="text-center text-sm">
          {record.maxUsageCount || '-'}
        </div>
      ),
    },
    {
      title: "Max Usage/User",
      key: "max_usage_user",
      width: 90,
      align: "center",
      render: (_: unknown, record: PromotionDto) => (
        <div className="text-center text-sm">
          {record.maxUsagePerUser || '-'}
        </div>
      ),
    },
    {
      title: "Points Required",
      key: "points_required",
      width: 90,
      align: "center",
      render: (_: unknown, record: PromotionDto) => (
        <div className="text-center text-sm">
          {record.pointsRequired || '-'}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      align: "center",
      render: (_: unknown, record: PromotionDto) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              className="text-green-600 hover:bg-green-50"
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Promotion"
              description={`Are you sure you want to delete "${record.promotionName}"?`}
              onConfirm={() => onDelete(record)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                className="text-red-600 hover:bg-red-50"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white">
      <Table
        dataSource={promotions}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalCount,
          onChange: onPageChange,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          size: 'default',
        }}
        scroll={{ x: 1000 }}
        className="professional-table"
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectionChange,
          getCheckboxProps: (record: PromotionDto) => ({
            name: record.promotionCode,
          }),
        }}
        rowKey="promotionId"
        tableLayout="fixed"
      />
    </div>
  );
}; 
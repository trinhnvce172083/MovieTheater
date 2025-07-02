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
    if (typeof amount !== 'number') amount = Number(amount);
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
      key: "promotion_name",
      width: 200,
      render: (_: unknown, record: PromotionDto) => (
        <div>
          <div className="font-medium text-gray-900 text-sm">
            {record.promotionName}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Code: {record.promotionCode}
          </div>
        </div>
      ),
    },
    {
      title: "Discount",
      key: "discount",
      width: 120,
      align: "center",
      render: (_: unknown, record: PromotionDto) => {
        if (record.discountType === 'FIXED_AMOUNT') {
          return (
            <div>
              <span style={{ color: '#1677ff', fontWeight: 600 }}>
                {formatVND(record.discountValue)} OFF
              </span>
              <div style={{ fontSize: 12, color: '#888' }}>Fixed Amount</div>
            </div>
          );
        }
        if (record.discountType === 'PERCENTAGE') {
          return (
            <div>
              <span style={{ color: '#1677ff', fontWeight: 600 }}>
                {record.discountValue}% OFF
              </span>
              <div style={{ fontSize: 12, color: '#888' }}>Percentage</div>
            </div>
          );
        }
        return null;
      },
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
        
        if (record.isActive && !record.isExpired) {
          color = "success";
          text = "Active";
        } else if (record.isExpired) {
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
          <Tag color={record.memberOnly ? "green" : "blue"} className="text-xs">
            {record.memberOnly ? "Members" : "Public"}
          </Tag>
          {record.isPointsPromotion && (
            <div className="text-xs text-purple-600 mt-1">Points</div>
          )}
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
      />
    </div>
  );
}; 
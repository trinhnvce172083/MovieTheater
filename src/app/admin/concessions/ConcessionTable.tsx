import React from "react";
import { Table, Button, Space, Tooltip, Popconfirm, Typography, Image } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Concession } from "@/types/Concession";

const { Text } = Typography;

interface ConcessionTableProps {
  data: Concession[];
  loading: boolean;
  onEdit: (concession: Concession) => void;
  onDelete: (id: number) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ConcessionTable: React.FC<ConcessionTableProps> = ({ data, loading, onEdit, onDelete }) => {
  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: unknown, record: Concession, index: number) => (
        <Text type="secondary">{index + 1}</Text>
      ),
    },
    {
      title: 'Name & Description',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Concession, b: Concession) => a.name.localeCompare(b.name),
      render: (name: string, record: Concession) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image
            src={record.imageUrl || '/popcorn.jpg'}
            alt={record.name}
            width={50}
            height={50}
            style={{ 
              objectFit: 'cover', 
              borderRadius: 8, 
              background: '#fff', 
              border: '1px solid #eee'
            }}
            fallback="/popcorn.jpg"
            placeholder={
              <div style={{
                width: 50,
                height: 50,
                background: '#f0f0f0',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text type="secondary" style={{fontSize: '12px'}}>Loading...</Text>
              </div>
            }
          />
          <div>
            <Text strong>{name}</Text>
            <br/>
            <Text type="secondary" style={{fontSize: '12px'}}>{record.description}</Text>
            <br/>
            <Text type="secondary" style={{fontSize: '11px'}}>{record.category}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      align: 'right' as const,
      render: (price: number) => formatPrice(price),
      sorter: (a: Concession, b: Concession) => a.price - b.price,
    },
    {
      title: 'Stock',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 100,
      align: 'center' as const,
      render: (stock: number) => (
        <Text style={{ 
          color: stock > 10 ? '#52c41a' : stock > 0 ? '#faad14' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {stock || 0}
        </Text>
      ),
      sorter: (a: Concession, b: Concession) => (a.stockQuantity || 0) - (b.stockQuantity || 0),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: Concession) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text style={{ 
            color: record.isAvailable ? '#52c41a' : '#ff4d4f',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {record.isAvailable ? 'Available' : 'Unavailable'}
          </Text>
          <Text style={{ 
            color: record.isActive ? '#52c41a' : '#ff4d4f',
            fontSize: '11px'
          }}>
            {record.isActive ? 'Active' : 'Inactive'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_: unknown, record: Concession) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} className="text-blue-600 hover:bg-blue-50" onClick={() => onEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Concession"
              description={`Are you sure to delete "${record.name}"?`}
              onConfirm={() => onDelete(record.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} className="hover:bg-red-50" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={record => (typeof record.id !== 'undefined' ? record.id : (record as any).concessionId)}
      loading={loading}
      pagination={{ 
        pageSize: 10, 
        showSizeChanger: true, 
        size: 'default',
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
      }}
      bordered
      scroll={{ x: 1000 }}
    />
  );
};

export default ConcessionTable; 
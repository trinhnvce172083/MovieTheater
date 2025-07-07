import React from "react";
import { Table, Button, Space, Tooltip, Popconfirm, Typography } from "antd";
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
          <img
            src={record.imageUrl || '/popcorn.jpg'}
            alt={record.name}
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, background: '#fff', border: '1px solid #eee', marginRight: 8 }}
            onError={e => { (e.currentTarget as HTMLImageElement).src = '/popcorn.jpg'; }}
          />
          <div>
            <Text strong>{name}</Text>
            <br/>
            <Text type="secondary" style={{fontSize: '12px'}}>{record.description}</Text>
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
      title: 'Actions',
      key: 'actions',
      width: 100,
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
      pagination={{ pageSize: 10, showSizeChanger: true, size: 'default' }}
      bordered
    />
  );
};

export default ConcessionTable; 
"use client";

import React from 'react';
import { Button, Tag, Space, Avatar, Tooltip } from 'antd';
import { EditOutlined, EyeOutlined, DeleteOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { MovieData } from '../types';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'NOW_SHOWING':
      return 'green';
    case 'COMING_SOON':
      return 'blue';
    case 'ENDED':
      return 'red';
    default:
      return 'default';
  }
};

export const createMovieColumns = (
  handleViewDetail: (record: MovieData) => void,
  handleEdit: (record: MovieData) => void,
  handleDelete: (record: MovieData) => void,
  handleToggleFeature: (record: MovieData) => void,
  featuredCount: number,
) => [
  {
    title: '#',
    dataIndex: 'id',
    key: 'id',
    width: 60,
    sorter: (a: MovieData, b: MovieData) => a.id - b.id,
    render: (_text: unknown, record: MovieData) => (
      <span className="font-mono text-gray-600">#{record.id}</span>
    ),
  },
  {
    title: 'Poster',
    dataIndex: 'posterUrl',
    key: 'posterUrl',
    render: (posterUrl: string, record: MovieData) => (
      <Avatar shape="square" size={64} src={posterUrl || '/placeholder.png'} alt={record.title} />
    ),
  },
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    sorter: (a: MovieData, b: MovieData) => a.title.localeCompare(b.title),
  },
  {
    title: 'Genre',
    dataIndex: 'genre',
    key: 'genre',
    sorter: (a: MovieData, b: MovieData) => a.genre.localeCompare(b.genre),
  },
  {
    title: 'Duration',
    dataIndex: 'duration',
    key: 'duration',
    render: (duration: number) => `${duration} min`,
    sorter: (a: MovieData, b: MovieData) => a.duration - b.duration,
  },
  {
    title: 'Release Date',
    dataIndex: 'releaseDate',
    key: 'releaseDate',
    sorter: (a: MovieData, b: MovieData) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime(),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => <Tag color={getStatusColor(status)}>{status.replace('_', ' ')}</Tag>,
    sorter: (a: MovieData, b: MovieData) => a.status.localeCompare(b.status),
  },
  {
    title: 'Featured',
    dataIndex: 'isFeatured',
    key: 'isFeatured',
    width: 80,
    align: 'center' as const,
    render: (isFeatured: boolean, record: MovieData) => (
      <Tooltip title={isFeatured ? "Remove from Featured" : "Add to Featured"}>
        <Button 
          icon={isFeatured ? <StarFilled /> : <StarOutlined />} 
          type={isFeatured ? "primary" : "default"}
          size="small"
          style={{ 
            color: isFeatured ? "#faad14" : undefined,
            borderColor: isFeatured ? "#faad14" : undefined,
            backgroundColor: isFeatured ? "#fff7e6" : undefined
          }}
          onClick={() => handleToggleFeature(record)}
          disabled={!isFeatured && featuredCount >= 5}
        />
      </Tooltip>
    ),
  },
  {
    title: <div style={{ textAlign: 'center' }}>Actions</div>,
    key: 'actions',
    align: 'center' as const,
    render: (_: unknown, record: MovieData) => (
      <Space size="small">
        <Tooltip title="View Details">
          <Button 
            type="text"
            icon={<EyeOutlined />} 
            size="small"
            className="text-blue-600 hover:bg-blue-50"
            onClick={() => handleViewDetail(record)} 
          />
        </Tooltip>
        <Tooltip title="Edit Movie">
          <Button 
            type="text"
            icon={<EditOutlined />} 
            size="small"
            className="text-green-600 hover:bg-green-50"
            onClick={() => handleEdit(record)} 
          />
        </Tooltip>
        <Tooltip title="Delete Movie">
          <Button 
            type="text"
            icon={<DeleteOutlined />} 
            size="small"
            className="text-red-600 hover:bg-red-50"
            onClick={() => handleDelete(record)} 
          />
        </Tooltip>
      </Space>
    ),
  },
];

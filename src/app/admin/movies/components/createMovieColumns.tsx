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
    render: (isFeatured: boolean, record: any) => (
      <Tag
        color={isFeatured ? "gold" : "default"}
        className="font-medium"
      >
        {isFeatured ? "Featured" : "Regular"}
      </Tag>
    ),
  },
  {
    title: <div style={{ textAlign: 'center' }}>Actions</div>,
    key: 'actions',
    align: 'center' as const,
    render: (_: unknown, record: MovieData) => (
      <Space size="middle">
        <Tooltip title="View Details">
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} />
        </Tooltip>
        <Tooltip title="Edit Movie">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
        </Tooltip>
        <Tooltip title="Delete Movie">
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
        </Tooltip>
      </Space>
    ),
  },
];

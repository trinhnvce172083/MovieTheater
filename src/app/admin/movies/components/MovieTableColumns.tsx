import React from 'react';
import { Space, Button, Tag, Popconfirm, Tooltip, Divider, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, StarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MovieResponse } from '../types';
import { formatMovieStatus, getStatusColor, getRatingColor, formatDuration } from '../utils';

interface MovieTableColumnsProps {
  onEdit: (movie: MovieResponse) => void;
  onDelete: (movieId: string) => void;
  onView: (movie: MovieResponse) => void;
}

export const createMovieTableColumns = ({
  onEdit,
  onDelete,
  onView,
}: MovieTableColumnsProps): ColumnsType<MovieResponse> => [
  {
    title: <div style={{ textAlign: 'center' }}>Movie</div>,
    key: 'movie_info',
    width: 300,
    render: (_, record) => (
      <div className="flex items-center gap-3">
        <Avatar
          src={record.posterUrl}
          shape="square"
          size={60}
          icon={<StarOutlined />}
        />
        <div>
          <div className="font-semibold text-sm">{record.title}</div>
          <div className="text-xs text-gray-500 mt-1">
            {Array.isArray(record.genre) 
              ? record.genre.slice(0, 2).join(', ') + (record.genre.length > 2 ? ` +${record.genre.length - 2}` : '')
              : record.genre || 'No genre'
            }
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {formatDuration(record.duration)}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Rating',
    dataIndex: 'rating',
    key: 'rating',
    render: (rating: string) => (
      <Tag color={getRatingColor(rating)}>
        {rating}
      </Tag>
    ),
    filters: [
      { text: 'G', value: 'G' },
      { text: 'PG', value: 'PG' },
      { text: 'PG-13', value: 'PG-13' },
      { text: 'R', value: 'R' },
      { text: 'NC-17', value: 'NC-17' },
    ],
    onFilter: (value, record) => record.rating === value,
    width: 100,
  },
  {
    title: 'IMDB Rating',
    dataIndex: 'imdbRating',
    key: 'imdbRating',
    render: (rating: number) => (
      <div className="flex items-center gap-1">
        <StarOutlined style={{ color: '#faad14' }} />
        <span className="font-medium">{rating}</span>
      </div>
    ),
    sorter: (a, b) => a.imdbRating - b.imdbRating,
    width: 120,
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    render: (price: number) => (
      <span className="font-medium">
        {price.toLocaleString('vi-VN')} VNĐ
      </span>
    ),
    sorter: (a, b) => a.price - b.price,
    width: 120,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={getStatusColor(status)}>
        {formatMovieStatus(status)}
      </Tag>
    ),
    filters: [
      { text: 'Now Showing', value: 'NOW_SHOWING' },
      { text: 'Coming Soon', value: 'COMING_SOON' },
      { text: 'Ended', value: 'ENDED' },
    ],
    onFilter: (value, record) => record.status === value,
    width: 120,
  },
  {
    title: 'Release Date',
    dataIndex: 'releaseDate',
    key: 'releaseDate',
    render: (date: string) => (
      <span className="text-sm">
        {new Date(date).toLocaleDateString('vi-VN')}
      </span>
    ),
    sorter: (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime(),
    width: 120,
  },
  {
    title: 'Actions',
    key: 'actions',
    align: 'center',
    render: (_, record) => (
      <div className="flex items-center justify-center">
        <Space size={8}>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              size="small"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
              }}
            />
          </Tooltip>
          <Divider type="vertical" style={{ margin: 0 }} />
          <Tooltip title="Edit Movie">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
              }}
            />
          </Tooltip>
          <Divider type="vertical" style={{ margin: 0 }} />
          <Tooltip title="Delete Movie">
            <Popconfirm
              title="Delete Movie"
              description="Are you sure you want to delete this movie?"
              onConfirm={() => onDelete(record.movieId)}
              okText="Yes"
              cancelText="No"
              placement="left"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                size="small"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      </div>
    ),
    width: 150,
    fixed: 'right',
  },
];

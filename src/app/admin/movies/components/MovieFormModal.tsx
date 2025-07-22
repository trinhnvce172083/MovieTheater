"use client";

import React, { useEffect } from 'react';
import { 
  Modal, Form, Input, Select, DatePicker, InputNumber, Switch, Button, 
  Row, Col, Tabs, Space, Typography, Tooltip
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { MovieData, MovieCreateRequest, MovieUpdateRequest } from '../types';
import dayjs, { Dayjs } from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;


const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance',
  'Science Fiction', 'Thriller', 'War', 'Western', 'Superhero', 'Musical', 'Sports'
];

// Language options
const LANGUAGE_OPTIONS = [
  'English', 'Vietnamese', 'French', 'Spanish', 'Chinese', 'Japanese', 'Korean',
  'German', 'Italian', 'Russian', 'Portuguese', 'Arabic', 'Hindi', 'Thai'
];

// Country options
const COUNTRY_OPTIONS = [
  'United States', 'Vietnam', 'United Kingdom', 'France', 'China', 'Japan', 'South Korea',
  'Canada', 'Australia', 'Germany', 'Spain', 'Italy', 'Russia', 'India', 'Brazil', 'Thailand'
];

interface MovieFormModalProps {
  open: boolean;
  editingMovie: MovieData | null;
  onSubmit: (movieData: MovieCreateRequest | MovieUpdateRequest) => void;
  onCancel: () => void;
  loading: boolean;
}

export const MovieFormModal: React.FC<MovieFormModalProps> = ({
  open,
  editingMovie,
  onSubmit,
  onCancel,
  loading
}) => {
  const [form] = Form.useForm();

  // Initialize form with editing data
  useEffect(() => {
    if (editingMovie && open) {
      form.setFieldsValue({
        ...editingMovie,
        releaseDate: editingMovie.releaseDate ? dayjs(editingMovie.releaseDate) : null,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [editingMovie, form, open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  // Smart status calculation
  const calculateStatus = (releaseDate: Dayjs | null): string => {
    if (!releaseDate) return 'COMING_SOON';
    const today = dayjs();
    return releaseDate.isAfter(today) ? 'COMING_SOON' : 'NOW_SHOWING';
  };

  // Handle release date change
  const handleReleaseDateChange = (date: Dayjs | null) => {
    if (date) {
      const newStatus = calculateStatus(date);
      form.setFieldValue('status', newStatus);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const movieData = {
        ...values,
        releaseDate: values.releaseDate ? (values.releaseDate as Dayjs).format('YYYY-MM-DD') : null,
        genre: Array.isArray(values.genre) ? values.genre.join(', ') : values.genre,
        status: values.status || calculateStatus(values.releaseDate)
      };

      if (editingMovie) {
        onSubmit({ id: editingMovie.id, ...movieData });
      } else {
        onSubmit(movieData);
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const items = [
    {
      key: 'basic',
      label: 'Basic Information',
      children: (
        <>
          {/* Title */}
          <Form.Item 
            name="title" 
            label="Movie Title"
            rules={[{ required: true, message: 'Please enter movie title!' }, { max: 200 }]}
          >
            <Input placeholder="Enter movie title..." />
          </Form.Item>

          {/* Genre */}
          <Form.Item 
            name="genre" 
            label="Genre"
            rules={[{ required: true, message: 'Please select at least one genre!' }]}
          >
            <Select
              mode="tags"
              placeholder="Select or add genres..."
              options={GENRE_OPTIONS.map(genre => ({ value: genre, label: genre }))}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false
              }
              maxTagCount="responsive"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="duration" 
                label="Duration"
                rules={[{ required: true, message: 'Please enter duration!' }, { type: 'number', min: 1, max: 600 }]}
              >
                <InputNumber min={1} max={600} style={{ width: '100%' }} addonAfter="min" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="releaseDate" 
                label="Release Date"
                rules={[{ required: true, message: 'Please select release date!' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  onChange={handleReleaseDateChange}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="price" 
                label="Ticket Price"
                rules={[{ required: true, message: 'Please enter ticket price!' }, { type: 'number', min: 1000, max: 500000 }]}
              >
                <InputNumber 
                  min={1000} 
                  max={500000}
                  step={1000}
                  style={{ width: '100%' }} 
                  addonAfter="VND"
                  formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Description */}
          <Form.Item 
            name="description" 
            label="Description"
            rules={[{ max: 2000 }]}
          >
            <TextArea rows={4} placeholder="Enter movie description..." maxLength={2000} showCount />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'advanced',
      label: 'Advanced Information',
      children: (
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="director" label="Director" rules={[{ max: 100 }]}>
                <Input placeholder="Enter director name..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="language" label="Language" rules={[{ max: 50 }]}>
                <Select
                  placeholder="Select language"
                  allowClear
                  showSearch
                  options={LANGUAGE_OPTIONS.map(lang => ({ value: lang, label: lang }))}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="country" label="Country" rules={[{ max: 50 }]}>
                <Select
                  placeholder="Select country"
                  allowClear
                  showSearch
                  options={COUNTRY_OPTIONS.map(country => ({ value: country, label: country }))}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="rating" label="Rating">
                <Select placeholder="Select rating" allowClear>
                  <Select.Option value="G">G - General Audiences</Select.Option>
                  <Select.Option value="PG">PG - Parental Guidance Suggested</Select.Option>
                  <Select.Option value="PG-13">PG-13 - Parents Strongly Cautioned</Select.Option>
                  <Select.Option value="R">R - Restricted</Select.Option>
                  <Select.Option value="NC-17">NC-17 - Adults Only</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Status">
                <Select placeholder="Automatically calculated from release date">
                  <Select.Option value="NOW_SHOWING">Now Showing</Select.Option>
                  <Select.Option value="COMING_SOON">Coming Soon</Select.Option>
                  <Select.Option value="ENDED">Ended</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="cast" label="Cast" rules={[{ max: 1000 }]}>
                <Input placeholder="Enter cast list..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="productionCompany" label="Production Company" rules={[{ max: 100 }]}>
                <Input placeholder="Enter production company..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="budget" label="Budget" rules={[{ type: 'number', min: 0 }]}>
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  addonAfter="$"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="boxOffice" label="Box Office" rules={[{ type: 'number', min: 0 }]}>
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  addonAfter="$"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="posterUrl" label="Poster URL">
                <Input placeholder="Enter poster image URL..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trailerUrl" label="Trailer URL">
                <Input placeholder="Enter trailer URL..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="isFeatured" valuePropName="checked">
                <Space>
                  <Switch checkedChildren="Có" unCheckedChildren="Không" />
                  <Text>Featured Movie</Text>
                </Space>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isAdultContent" valuePropName="checked">
                <Space>
                  <Switch checkedChildren="Có" unCheckedChildren="Không" />
                  <Text>Adult Content</Text>
                </Space>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
                <Space>
                  <Switch checkedChildren="Có" unCheckedChildren="Không" defaultChecked />
                  <Text>Active</Text>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
  ];

  return (
    <Modal
      title={editingMovie ? 'Edit Movie' : 'Add New Movie'}
      open={open}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          {editingMovie ? 'Update' : 'Create'}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        scrollToFirstError
        name="movieForm"
        preserve={false}
      >
        <Tabs items={items} />
      </Form>
    </Modal>
  );
};

// Helper component for required labels
const RequiredLabel: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <span>
    <Text strong>{children}</Text>
    <Tooltip title="Required field">
      <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
    </Tooltip>
  </span>
);

export default MovieFormModal;

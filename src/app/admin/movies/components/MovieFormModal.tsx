"use client";

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Switch, Button, Row, Col } from 'antd';
import { MovieData, MovieCreateRequest, MovieUpdateRequest } from '../types';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

interface MovieFormModalProps {
  open: boolean;
  editingMovie: MovieData | null;
  onSubmit: (movieData: MovieCreateRequest | MovieUpdateRequest) => void;
  onCancel: () => void;
  loading: boolean;
}

export const MovieFormModal: React.FC<MovieFormModalProps> = ({ open, editingMovie, onSubmit, onCancel, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (editingMovie) {
        form.setFieldsValue({
          ...editingMovie,
          releaseDate: editingMovie.releaseDate ? moment(editingMovie.releaseDate) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [editingMovie, form, open]);

  const handleOk = () => {
    form.validateFields().then(values => {
      const releaseDate = values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : undefined;
      const payload = { ...values, releaseDate };
      onSubmit(payload);
    }).catch(() => {
      // Form validation failed - handled by Ant Design form validation display
    });
  };

  return (
    <Modal
      title={editingMovie ? 'Edit Movie' : 'Add New Movie'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
          {editingMovie ? 'Save Changes' : 'Create Movie'}
        </Button>,
      ]}
      width={800}
    >
      <Form form={form} layout="vertical" name="movieForm">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="title" 
              label="Title" 
              rules={[
                { required: true, message: 'Movie title is required!' },
                { max: 200, message: 'Title cannot exceed 200 characters' }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="genre" 
              label="Genre" 
              rules={[
                { required: true, message: 'Genre is required!' },
                { max: 100, message: 'Genre cannot exceed 100 characters' }
              ]}
            >
              <Input placeholder="e.g., Action, Comedy, Sci-Fi" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item 
          name="description" 
          label="Description"
          rules={[
            { max: 2000, message: 'Description cannot exceed 2000 characters' }
          ]}
        >
          <TextArea rows={4} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item 
              name="duration" 
              label="Duration (minutes)" 
              rules={[
                { required: true, message: 'Duration is required!' },
                { type: 'number', min: 1, max: 600, message: 'Duration must be between 1 and 600 minutes' }
              ]}
            >
              <InputNumber min={1} max={600} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="releaseDate" label="Release Date">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item 
              name="price" 
              label="Ticket Price" 
              rules={[
                { required: true, message: 'Price is required!' },
                { type: 'number', min: 0.01, max: 1000000, message: 'Price must be between 0.01 and 1,000,000' }
              ]}
            >
              <InputNumber 
                min={0.01} 
                max={1000000}
                step={0.01}
                precision={2}
                style={{ width: '100%' }} 
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item 
              name="status" 
              label="Status" 
              rules={[
                { required: true, message: 'Status is required!' }
              ]}
              initialValue="COMING_SOON"
            >
              <Select>
                <Option value="NOW_SHOWING">Now Showing</Option>
                <Option value="COMING_SOON">Coming Soon</Option>
                <Option value="ENDED">Ended</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item 
              name="rating" 
              label="Rating" 
              rules={[
                { pattern: /^(G|PG|PG-13|R|NC-17)$/, message: 'Rating must be G, PG, PG-13, R, or NC-17' }
              ]}
            >
              <Select placeholder="Select rating">
                <Option value="G">G</Option>
                <Option value="PG">PG</Option>
                <Option value="PG-13">PG-13</Option>
                <Option value="R">R</Option>
                <Option value="NC-17">NC-17</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item 
              name="imdbRating" 
              label="IMDB Rating"
              rules={[
                { type: 'number', min: 0, max: 10, message: 'IMDB rating must be between 0.0 and 10.0' }
              ]}
            >
              <InputNumber 
                min={0} 
                max={10}
                step={0.1}
                precision={1}
                style={{ width: '100%' }} 
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item 
                  name="director" 
                  label="Director"
                  rules={[
                    { max: 100, message: 'Director name cannot exceed 100 characters' }
                  ]}
                >
                    <Input />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item 
                  name="cast" 
                  label="Cast"
                  rules={[
                    { max: 1000, message: 'Cast list cannot exceed 1000 characters' }
                  ]}
                >
                    <Input />
                </Form.Item>
            </Col>
        </Row>
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item 
                  name="language" 
                  label="Language"
                  rules={[
                    { max: 50, message: 'Language cannot exceed 50 characters' }
                  ]}
                >
                    <Input />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item 
                  name="country" 
                  label="Country"
                  rules={[
                    { max: 50, message: 'Country cannot exceed 50 characters' }
                  ]}
                >
                    <Input />
                </Form.Item>
            </Col>
        </Row>
        <Form.Item 
          name="productionCompany" 
          label="Production Company"
          rules={[
            { max: 100, message: 'Production company name cannot exceed 100 characters' }
          ]}
        >
            <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="isFeatured" label="Featured" valuePropName="checked" initialValue={false}>
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isAdultContent" label="Adult Content" valuePropName="checked" initialValue={false}>
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Checkbox, Row, Col, DatePicker, Upload, Button } from 'antd';
import { UploadOutlined, StarOutlined } from '@ant-design/icons';
import { MovieResponse, MovieCreateRequest } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface MovieFormModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  editingMovie: MovieResponse | null;
  loading: boolean;
  form: any;
}

export const MovieFormModal: React.FC<MovieFormModalProps> = ({
  visible,
  onOk,
  onCancel,
  editingMovie,
  loading,
  form,
}) => {

  useEffect(() => {
    if (visible && editingMovie) {
      form.setFieldsValue({
        title: editingMovie.title,
        genre: editingMovie.genre,
        duration: editingMovie.duration,
        releaseDate: dayjs(editingMovie.releaseDate),
        rating: editingMovie.rating,
        posterUrl: editingMovie.posterUrl,
        price: editingMovie.price,
        status: editingMovie.status,
        imdbRating: editingMovie.imdbRating,
        isFeatured: editingMovie.isFeatured,
        isAdultContent: editingMovie.isAdultContent,
      });
    } else if (visible && !editingMovie) {
      form.setFieldsValue({
        genre: [],
        price: 100000,
        status: 'NOW_SHOWING',
        imdbRating: 5.0,
        isFeatured: false,
        isAdultContent: false,
        rating: 'PG'
      });
    }
  }, [visible, editingMovie, form]);

  return (
    <Modal
      title={editingMovie ? "Edit Movie" : "Add New Movie"}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={900}
      className="professional-modal"
      okText={editingMovie ? "Update Movie" : "Add Movie"}
      cancelText="Cancel"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" className="mt-6">
        <Row gutter={16}>
          <Col xs={24} sm={16}>
            <Form.Item
              name="title"
              label="Movie Title"
              rules={[
                { required: true, message: "Please enter movie title" },
                { max: 100, message: "Title cannot exceed 100 characters" },
              ]}
            >
              <Input placeholder="Enter movie title" className="h-10" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[
                { required: true, message: "Please enter duration" },
                {
                  type: "number",
                  min: 30,
                  max: 300,
                  message: "Duration must be between 30 and 300 minutes",
                },
              ]}
            >
              <InputNumber
                placeholder="Enter duration"
                className="w-full h-10"
                min={30}
                max={300}
                addonAfter="min"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="genre"
              label="Genres"
              rules={[
                { required: true, message: "Please select at least one genre" },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select genres"
                className="h-10"
                maxTagCount={3}
              >
                <Option value="Action">Action</Option>
                <Option value="Adventure">Adventure</Option>
                <Option value="Drama">Drama</Option>
                <Option value="Comedy">Comedy</Option>
                <Option value="Horror">Horror</Option>
                <Option value="Romance">Romance</Option>
                <Option value="Sci-Fi">Sci-Fi</Option>
                <Option value="Fantasy">Fantasy</Option>
                <Option value="Thriller">Thriller</Option>
                <Option value="Animation">Animation</Option>
                <Option value="Documentary">Documentary</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item
              name="rating"
              label="Age Rating"
              rules={[{ required: true, message: "Please select rating" }]}
            >
              <Select placeholder="Select rating" className="h-10">
                <Option value="G">G - General</Option>
                <Option value="PG">PG - Parental Guidance</Option>
                <Option value="PG-13">PG-13 - Ages 13+</Option>
                <Option value="R">R - Restricted</Option>
                <Option value="NC-17">NC-17 - Adults Only</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select placeholder="Select status" className="h-10">
                <Option value="NOW_SHOWING">Now Showing</Option>
                <Option value="COMING_SOON">Coming Soon</Option>
                <Option value="ENDED">Ended</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="releaseDate"
              label="Release Date"
              rules={[{ required: true, message: "Please select release date" }]}
            >
              <DatePicker
                className="w-full h-10"
                placeholder="Select release date"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="price"
              label="Ticket Price (VNĐ)"
              rules={[
                { required: true, message: "Please enter ticket price" },
                {
                  type: "number",
                  min: 50000,
                  max: 500000,
                  message: "Price must be between 50,000 and 500,000 VNĐ",
                },
              ]}
            >
              <InputNumber
                placeholder="Enter ticket price"
                className="w-full h-10"
                min={50000}
                max={500000}
                step={10000}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                addonAfter="VNĐ"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="imdbRating"
              label="IMDB Rating"
              rules={[
                { required: true, message: "Please enter IMDB rating" },
                {
                  type: "number",
                  min: 1,
                  max: 10,
                  message: "Rating must be between 1 and 10",
                },
              ]}
            >
              <InputNumber
                placeholder="Enter IMDB rating"
                className="w-full h-10"
                min={1}
                max={10}
                step={0.1}
                precision={1}
                addonBefore={<StarOutlined />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              name="posterUrl"
              label="Poster URL"
              rules={[
                { required: true, message: "Please enter poster URL" },
                { type: 'url', message: 'Please enter a valid URL' }
              ]}
            >
              <Input 
                placeholder="Enter poster image URL" 
                className="h-10"
                addonAfter={
                  <Upload
                    showUploadList={false}
                    beforeUpload={() => false}
                    accept="image/*"
                  >
                    <Button icon={<UploadOutlined />} size="small">
                      Upload
                    </Button>
                  </Upload>
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="isFeatured" valuePropName="checked">
              <Checkbox>Featured Movie</Checkbox>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="isAdultContent" valuePropName="checked">
              <Checkbox>Adult Content (18+)</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

"use client";

import React, { useEffect, useState } from 'react';
import { 
  Modal, Form, Input, Select, DatePicker, InputNumber, Switch, Button,
  Row, Col, Space, Typography, Tooltip, message, Image
} from 'antd';
import { 
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

// Define types based on your actual API structure
interface MovieFormData {
  movieId?: number;
  title: string;
  description?: string;
  duration: number;
  genre: string;
  director?: string;
  cast?: string;
  language?: string;
  country?: string;
  releaseDate: string;
  endDate?: string;
  rating?: string;  // Make rating optional to match MovieData
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  price: number;
  status: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED';
  isFeatured: boolean;
  imdbRating?: number;
  productionCompany?: string;
  budget?: number;
  boxOffice?: number;
  isActive?: boolean;
}

interface MovieFormModalProps {
  open: boolean;
  editingMovie: MovieFormData | null;
  onSubmit: (movieData: Partial<MovieFormData>) => void;
  onCancel: () => void;
  loading: boolean;
}

// Pre-defined options
const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Science Fiction',
  'Thriller', 'War', 'Western'
];

const LANGUAGE_OPTIONS = [
  'English', 'Vietnamese', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese'
];

const COUNTRY_OPTIONS = [
  'USA', 'Vietnam', 'United Kingdom', 'France', 'Germany', 'Japan', 'South Korea', 'China'
];

const RATING_OPTIONS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

const STATUS_OPTIONS = [
  { value: 'COMING_SOON', label: '⏳ Coming Soon' },
  { value: 'NOW_SHOWING', label: '🎬 Now Showing' },
  { value: 'ENDED', label: '🛑 Ended' }
];

export const MovieFormModal: React.FC<MovieFormModalProps> = ({
  open,
  editingMovie,
  onSubmit,
  onCancel,
  loading
}) => {
  const [form] = Form.useForm();
  const [posterPreview, setPosterPreview] = useState<string>('');
  const [backdropPreview, setBackdropPreview] = useState<string>('');
  const [trailerPreview, setTrailerPreview] = useState<string>('');

  // Initialize form when modal opens or editing movie changes
  useEffect(() => {
    if (open) {
      if (editingMovie) {
        // Transform data for form
        const formData = {
          ...editingMovie,
          releaseDate: editingMovie.releaseDate ? dayjs(editingMovie.releaseDate) : null,
          endDate: editingMovie.endDate ? dayjs(editingMovie.endDate) : null,
          genre: editingMovie.genre ? editingMovie.genre.split(', ') : [], // Convert string to array for multi-select
        };
        form.setFieldsValue(formData);
        
        // Set previews
        if (editingMovie.posterUrl) setPosterPreview(editingMovie.posterUrl);
        if (editingMovie.backdropUrl) setBackdropPreview(editingMovie.backdropUrl);
        if (editingMovie.trailerUrl) setTrailerPreview(getYouTubeEmbedUrl(editingMovie.trailerUrl));
      } else {
        // Reset form for new movie
        form.resetFields();
        form.setFieldsValue({
          isActive: true,
          isFeatured: false,
          status: 'COMING_SOON',
          rating: 'PG-13',
          price: 50000
        });
        setPosterPreview('');
        setBackdropPreview('');
        setTrailerPreview('');
      }
    }
  }, [open, editingMovie, form]);

  // Clean up when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setPosterPreview('');
      setBackdropPreview('');
      setTrailerPreview('');
    }
  }, [open, form]);

  // Utility functions
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : '';
  };

  const handleTrailerUrlChange = (url: string) => {
    const embedUrl = getYouTubeEmbedUrl(url);
    setTrailerPreview(embedUrl);
  };

  // Handle release date change to auto-set status and end date
  const handleReleaseDateChange = (date: Dayjs | null) => {
    if (date) {
      const today = dayjs().startOf('day');
      const releaseDate = date.startOf('day');
      
      // Auto set status based on release date
      let autoStatus = 'COMING_SOON';
      if (releaseDate.isSame(today) || releaseDate.isBefore(today)) {
        autoStatus = 'NOW_SHOWING';
      }
      
      // Auto set end date to 1 month after release date
      const autoEndDate = date.add(1, 'month');
      
      form.setFieldsValue({ 
        status: autoStatus,
        endDate: autoEndDate
      });
    }
  };

  // Form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Transform data for API
      const movieData = {
        ...values,
        releaseDate: values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        genre: Array.isArray(values.genre) ? values.genre.join(', ') : values.genre, // Convert array back to string
        isAdultContent: values.rating === 'R' || values.rating === 'NC-17', // Auto-set based on rating
        // Ensure required fields have default values
        description: values.description || '',
        director: values.director || '',
        cast: values.cast || '',
        language: values.language || 'English',
        country: values.country || 'USA',
        rating: values.rating || 'PG-13',
        status: values.status || 'COMING_SOON',
        isFeatured: values.isFeatured || false,
      };

      // Remove movieId for create, keep it for update
      if (!editingMovie) {
        delete movieData.movieId;
      }

      onSubmit(movieData);
    } catch (errorInfo) {
      console.error('Form validation failed:', errorInfo);
      message.error('Please check all required fields and fix any validation errors.');
    }
  };

  return (
    <Modal
      title={editingMovie ? 'Edit Movie' : 'Create New Movie'}
      open={open}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {editingMovie ? 'Update Movie' : 'Create Movie'}
        </Button>,
      ]}
      destroyOnHidden={true}
    >
      <Form
        form={form}
        layout="vertical"
        name="movieForm"
        scrollToFirstError
      >
        {/* Basic Information */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ fontSize: 16, color: '#1890ff' }}>Basic Information</Text>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Movie Title"
                rules={[
                  { required: true, message: 'Movie title is required!' },
                  { max: 255, message: 'Title cannot exceed 255 characters' }
                ]}
              >
                <Input placeholder="Enter movie title" showCount maxLength={255} />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Duration (minutes)"
                rules={[
                  { required: true, message: 'Duration is required!' },
                  { type: 'number', min: 1, max: 600, message: 'Duration must be between 1-600 minutes' }
                ]}
              >
                <InputNumber
                  min={1}
                  max={600}
                  style={{ width: '100%' }}
                  placeholder="120"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: 'Description is required!' },
                  { min: 10, message: 'Description must be at least 10 characters' },
                  { max: 2000, message: 'Description cannot exceed 2000 characters' }
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Enter movie description"
                  showCount
                  maxLength={2000}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="genre"
                label="Genres"
                rules={[{ required: true, message: 'At least one genre is required!' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select genres"
                  options={GENRE_OPTIONS.map(genre => ({ value: genre, label: genre }))}
                />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="language"
                label="Language"
                rules={[{ required: true, message: 'Language is required!' }]}
              >
                <Select
                  showSearch
                  placeholder="Select language"
                  options={LANGUAGE_OPTIONS.map(lang => ({ value: lang, label: lang }))}
                />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: 'Country is required!' }]}
              >
                <Select
                  showSearch
                  placeholder="Select country"
                  options={COUNTRY_OPTIONS.map(country => ({ value: country, label: country }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="director"
                label={<span>Director <span style={{ color: 'red' }}>*</span></span>}
                rules={[{ max: 100, message: 'Director name cannot exceed 100 characters' }]}
              >
                <Input placeholder="Enter director name" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="cast"
                label={<span>Cast <span style={{ color: 'red' }}>*</span></span>}
                rules={[{ max: 1000, message: 'Cast list cannot exceed 1000 characters' }]}
              >
                <Input placeholder="Enter main cast members" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Scheduling & Status */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ fontSize: 16, color: '#1890ff' }}>Scheduling & Status</Text>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Form.Item
                name="releaseDate"
                label="Release Date"
                rules={[{ required: true, message: 'Release date is required!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  onChange={handleReleaseDateChange}
                />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item 
                name="endDate" 
                label={
                  <span>
                    End Date
                    <Tooltip title="Auto-set to 1 month after release date. You can modify if needed.">
                      <InfoCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Status is required!' }]}
              >
                <Select 
                  options={STATUS_OPTIONS} 
                  disabled
                  placeholder="Auto-set based on release date"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="rating"
                label="Rating"
                rules={[{ required: true, message: 'Rating is required!' }]}
              >
                <Select options={RATING_OPTIONS.map(r => ({ value: r, label: r }))} />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="price"
                label="Price (VND)"
                rules={[
                  { required: true, message: 'Price is required!' },
                  { type: 'number', min: 1, message: 'Price must be greater than 0' },
                  { type: 'number', max: 1000000, message: 'Price cannot exceed 1,000,000 VND' }
                ]}
              >
                <InputNumber
                  min={1}
                  max={1000000}
                  step={1000}
                  style={{ width: '100%' }}
                  formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  parser={(value: string | undefined) => value ? Number(value.replace(/,/g, '')) : 0}
                />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item name="imdbRating" label="IMDb Rating">
                <InputNumber
                  min={0}
                  max={10}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="8.5"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isActive" valuePropName="checked">
                <Space>
                  <Switch />
                  <Text>Active</Text>
                  <Tooltip title="Whether this movie is active in the system">
                    <InfoCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </Space>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item name="isFeatured" valuePropName="checked">
                <Space>
                  <Switch />
                  <Text>Featured</Text>
                  <Tooltip title="Featured movies appear prominently on the homepage">
                    <InfoCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Media & Links */}
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ fontSize: 16, color: '#1890ff' }}>Media & Links</Text>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Form.Item
                name="posterUrl"
                label={
                  <span>
                    Poster URL
                    <Tooltip title="Main poster image URL">
                      <InfoCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
                rules={[
                  { required: true, message: 'Poster URL is required!' },
                  { type: 'url', message: 'Please enter a valid URL' }
                ]}
              >
                <Input
                  placeholder="https://example.com/poster.jpg"
                  onChange={(e) => setPosterPreview(e.target.value)}
                />
              </Form.Item>
              {posterPreview && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <Image
                    width={100}
                    height={150}
                    src={posterPreview}
                    alt="Poster Preview"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="backdropUrl"
                label="Backdrop URL"
                rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
              >
                <Input
                  placeholder="https://example.com/backdrop.jpg"
                  onChange={(e) => setBackdropPreview(e.target.value)}
                />
              </Form.Item>
              {backdropPreview && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <Image
                    width={200}
                    height={113}
                    src={backdropPreview}
                    alt="Backdrop Preview"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="trailerUrl"
                label="Trailer URL (YouTube)"
                rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
              >
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  onChange={(e) => handleTrailerUrlChange(e.target.value)}
                />
              </Form.Item>
              {trailerPreview && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <iframe
                    width="300"
                    height="169"
                    src={trailerPreview}
                    title="Trailer Preview"
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              )}
            </Col>
          </Row>
        </div>

        {/* Optional Fields */}
        <div>
          <Text strong style={{ fontSize: 16, color: '#1890ff' }}>Additional Information</Text>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Form.Item name="productionCompany" label="Production Company">
                <Input placeholder="Warner Bros., Disney, etc." />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item name="budget" label="Budget (USD)">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  parser={(value: string | undefined) => value ? Number(value.replace(/,/g, '')) : 0}
                />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item name="boxOffice" label="Box Office (USD)">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  parser={(value: string | undefined) => value ? Number(value.replace(/,/g, '')) : 0}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
};

export default MovieFormModal;
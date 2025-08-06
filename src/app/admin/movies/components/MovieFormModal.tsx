"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Modal, Form, Input, Select, DatePicker, InputNumber, Switch, Button, message,
  Row, Col, Tabs, Space, Upload, Image
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { MovieData, MovieCreateRequest, MovieUpdateRequest } from '../types';
import dayjs, { Dayjs } from 'dayjs';

const { TextArea } = Input;


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
  // Only render the modal when open to prevent useForm warning
  if (!open) {
    return null;
  }

  return (
    <MovieFormContent
      open={open}
      editingMovie={editingMovie}
      onSubmit={onSubmit}
      onCancel={onCancel}
      loading={loading}
    />
  );
};

// Separate form component to properly handle useForm
const MovieFormContent: React.FC<MovieFormModalProps> = ({
  open,
  editingMovie,
  onSubmit,
  onCancel,
  loading
}) => {
  const [form] = Form.useForm();
  const [posterFileList, setPosterFileList] = useState<UploadFile[]>([]);
  const [backdropFileList, setBackdropFileList] = useState<UploadFile[]>([]);
  const [posterPreview, setPosterPreview] = useState<string>('');
  const [backdropPreview, setBackdropPreview] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFeaturedState, setIsFeaturedState] = useState(false); // Add controlled state

  // Cleanup function
  const resetFormState = useCallback(() => {
    setIsInitialized(false);
    setPosterPreview('');
    setBackdropPreview('');
    setPosterFileList([]);
    setBackdropFileList([]);
    setIsFeaturedState(false); // Reset controlled state
    form.resetFields();
    // Explicitly set default values for boolean fields
    form.setFieldsValue({
      isFeatured: false,
      isAdultContent: false,
      status: 'COMING_SOON'
    });
  }, [form]);

  // Initialize form with editing data
  useEffect(() => {
    if (!open) {
      // Reset when modal closes
      resetFormState();
      return;
    }

    // Reset initialization flag when a new movie is selected or modal opens
    if (open) {
      setIsInitialized(false);
    }
  }, [open, editingMovie?.id, resetFormState]);

  // Separate effect for initializing form data
  useEffect(() => {
    if (!open || isInitialized) return;

    if (editingMovie) {
      // Transform data for form fields
      const formData = {
        title: editingMovie.title || '',
        originalTitle: editingMovie.originalTitle || '',
        description: editingMovie.description || '',
        director: editingMovie.director || '',
        cast: editingMovie.cast || '',
        language: editingMovie.language || '',
        country: editingMovie.country || '',
        rating: editingMovie.rating || '',
        duration: editingMovie.duration || undefined,
        price: editingMovie.price || undefined,
        releaseDate: editingMovie.releaseDate ? dayjs(editingMovie.releaseDate) : null,
        endDate: editingMovie.endDate ? dayjs(editingMovie.endDate) : null,
        status: editingMovie.status || 'COMING_SOON',
        genre: editingMovie.genre ? 
          (typeof editingMovie.genre === 'string' ? 
            editingMovie.genre.split(', ').filter(g => g.trim()) : 
            editingMovie.genre) : 
          [],
        trailerUrl: editingMovie.trailerUrl || '',
        productionCompany: editingMovie.productionCompany || '',
        imdbRating: editingMovie.imdbRating || undefined,
        isFeatured: Boolean(editingMovie.isFeatured),
      };
      
      form.setFieldsValue(formData);
      setIsFeaturedState(Boolean(editingMovie.isFeatured)); // Sync controlled state
      
      // Set image previews for editing
      if (editingMovie.posterUrl) {
        setPosterPreview(editingMovie.posterUrl);
      }
      if (editingMovie.backdropUrl) {
        setBackdropPreview(editingMovie.backdropUrl);
      }
      
      // Clear file lists since we're showing existing images
      setPosterFileList([]);
      setBackdropFileList([]);
      setIsInitialized(true);
    } else {
      // For new movie creation
      resetFormState();
      setIsInitialized(true);
    }
  }, [open, editingMovie, isInitialized, form, resetFormState]);

  // Reset form when modal closes - Remove duplicate useEffect
  // This is now handled in the main useEffect above

  // Upload handlers
  const handlePosterUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPosterPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setPosterFileList([{
      uid: '-1',
      name: file.name,
      status: 'done',
      originFileObj: file,
    } as UploadFile]);
    return false; // Prevent auto upload
  };

  const handleBackdropUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setBackdropPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setBackdropFileList([{
      uid: '-1',
      name: file.name,
      status: 'done',
      originFileObj: file,
    } as UploadFile]);
    return false; // Prevent auto upload
  };

  const handleRemovePoster = () => {
    setPosterPreview('');
    setPosterFileList([]);
  };

  const handleRemoveBackdrop = () => {
    setBackdropPreview('');
    setBackdropFileList([]);
  };

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
      form.setFieldsValue({ status: newStatus });
      
      // Always auto-set end date to 1 month after release date when release date changes
      const autoEndDate = date.add(1, 'month');
      form.setFieldsValue({ endDate: autoEndDate });
    } else {
      // Clear end date if release date is cleared
      form.setFieldValue('endDate', null);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const movieData = {
        ...values,
        releaseDate: values.releaseDate ? (values.releaseDate as Dayjs).format('YYYY-MM-DD') : null,
        endDate: values.endDate ? (values.endDate as Dayjs).format('YYYY-MM-DD') : null,
        genre: Array.isArray(values.genre) ? values.genre.join(', ') : values.genre,
        status: values.status || calculateStatus(values.releaseDate),
        isFeatured: Boolean(values.isFeatured), // Ensure boolean value
        isAdultContent: false // Always false since we removed the field
      };

      // Check if there are image files to upload
      const hasImages = posterFileList.length > 0 || backdropFileList.length > 0;
      
      if (editingMovie) {
        // For editing, pass the movie data along with image files for backend to handle upload
        onSubmit({ 
          id: editingMovie.id, 
          ...movieData,
          posterFile: posterFileList[0]?.originFileObj,
          backdropFile: backdropFileList[0]?.originFileObj,
          hasImages
        });
      } else {
        // For creating, include image files
        onSubmit({
          ...movieData,
          posterFile: posterFileList[0]?.originFileObj,
          backdropFile: backdropFileList[0]?.originFileObj,
          hasImages
        });
      }
    } catch (error) {
      console.error('Form validation error:', error);
      message.error('Please fill all required fields correctly!');
    }
  };

  // Handle cancel with proper cleanup
  const handleCancel = () => {
    resetFormState();
    onCancel();
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

          {/* Original Title */}
          <Form.Item 
            name="originalTitle" 
            label="Original Title"
            rules={[{ max: 200 }]}
          >
            <Input placeholder="Enter original title (if different)..." />
          </Form.Item>

          {/* Description */}
          <Form.Item 
            name="description" 
            label="Description"
            rules={[
              { required: true, message: 'Please enter movie description!' },
              { max: 2000, message: 'Description cannot exceed 2000 characters!' },
              { min: 10, message: 'Description must be at least 10 characters!' }
            ]}
          >
            <TextArea rows={4} placeholder="Enter movie description..." maxLength={2000} showCount />
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
            <Col span={8}>
              <Form.Item 
                name="rating" 
                label="Rating"
                rules={[{ required: true, message: 'Please select rating!' }]}
              >
                <Select placeholder="Select rating">
                  <Select.Option value="G">G - General Audiences</Select.Option>
                  <Select.Option value="PG">PG - Parental Guidance Suggested</Select.Option>
                  <Select.Option value="PG-13">PG-13 - Parents Strongly Cautioned</Select.Option>
                  <Select.Option value="R">R - Restricted</Select.Option>
                  <Select.Option value="NC-17">NC-17 - Adults Only</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
                  disabledDate={(current) => {
                    // Disable dates before today
                    return current && current < dayjs().startOf('day');
                  }}
                  placeholder="Select future release date"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="endDate" 
                label="End Date"
                rules={[{ required: false }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="YYYY-MM-DD"
                  disabledDate={(current) => {
                    const releaseDate = form.getFieldValue('releaseDate');
                    // End date must be after release date
                    return current && releaseDate && current <= releaseDate;
                  }}
                  placeholder="Auto: +1 month from release"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Status">
                <Select placeholder="Auto-calculated from release date">
                  <Select.Option value="NOW_SHOWING">Now Showing</Select.Option>
                  <Select.Option value="COMING_SOON">Coming Soon</Select.Option>
                  <Select.Option value="ENDED">Ended</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'people',
      label: 'People & Production',
      children: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="director" 
                label="Director" 
                rules={[
                  { required: true, message: 'Please enter director name!' },
                  { max: 100, message: 'Director name cannot exceed 100 characters!' }
                ]}
              >
                <Input placeholder="Enter director name..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="productionCompany" label="Production Company" rules={[{ max: 100 }]}>
                <Input placeholder="Enter production company..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="cast" 
            label="Cast" 
            rules={[
              { required: true, message: 'Please enter cast information!' },
              { max: 1000, message: 'Cast information cannot exceed 1000 characters!' }
            ]}
          >
            <TextArea rows={3} placeholder="Enter main cast members..." maxLength={1000} showCount />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="language" 
                label="Language" 
                rules={[{ required: true, message: 'Please select language!' }]}
              >
                <Select
                  placeholder="Select language"
                  showSearch
                  options={LANGUAGE_OPTIONS.map(lang => ({ value: lang, label: lang }))}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="country" 
                label="Country" 
                rules={[{ required: true, message: 'Please select country!' }]}
              >
                <Select
                  placeholder="Select country"
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
            <Col span={12}>
              <Form.Item name="trailerUrl" label="Trailer URL">
                <Input placeholder="Enter trailer URL..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="imdbRating" 
                label="IMDB Rating"
                rules={[
                  { type: 'number', min: 0, max: 10, message: 'Rating must be between 0 and 10!' }
                ]}
              >
                <InputNumber 
                  min={0} 
                  max={10} 
                  step={0.1} 
                  style={{ width: '100%' }} 
                  placeholder="Enter IMDB rating..."
                  precision={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isFeatured" label="Featured Movie" valuePropName="checked" initialValue={false}>
                <Space>
                  <Switch 
                    checked={isFeaturedState}
                    checkedChildren="Featured" 
                    unCheckedChildren="Normal"
                    onChange={(checked) => {
                      setIsFeaturedState(checked);
                      form.setFieldsValue({ isFeatured: checked });
                    }}
                  />
                </Space>
              </Form.Item>
            </Col>
            <Col span={12}>
              <div className="text-sm text-gray-500 mt-8">
                {isFeaturedState ? 'This movie will be featured on homepage' : 'Regular movie display'}
              </div>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'images',
      label: 'Images & Media',
      children: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Poster Image">
                <Upload
                  listType="picture-card"
                  fileList={posterFileList}
                  beforeUpload={handlePosterUpload}
                  onRemove={handleRemovePoster}
                  maxCount={1}
                  accept="image/*"
                >
                  {posterFileList.length === 0 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload Poster</div>
                    </div>
                  )}
                </Upload>
                {posterPreview && (
                  <Image
                    width={200}
                    src={posterPreview}
                    alt="Poster Preview"
                    style={{ marginTop: 8 }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Backdrop Image">
                <Upload
                  listType="picture-card"
                  fileList={backdropFileList}
                  beforeUpload={handleBackdropUpload}
                  onRemove={handleRemoveBackdrop}
                  maxCount={1}
                  accept="image/*"
                >
                  {backdropFileList.length === 0 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload Backdrop</div>
                    </div>
                  )}
                </Upload>
                {backdropPreview && (
                  <Image
                    width={200}
                    src={backdropPreview}
                    alt="Backdrop Preview"
                    style={{ marginTop: 8 }}
                  />
                )}
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
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          {editingMovie ? 'Update' : 'Create'}
        </Button>
      ]}
      destroyOnHidden={true}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        scrollToFirstError
        name={`movieForm-${editingMovie?.id || 'new'}`}
        preserve={false}
        validateTrigger={['onChange', 'onBlur']}
      >
        <Tabs items={items} />
      </Form>
    </Modal>
  );
};

export default MovieFormModal;

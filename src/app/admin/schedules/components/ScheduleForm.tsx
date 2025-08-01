import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Checkbox,
  Switch,
  Row,
  Col,
  Alert,
  Divider,
  Typography,
  Card,
  Space,
  Button
} from 'antd';
import { 
  ClockCircleOutlined, 
  CalendarOutlined, 
  DollarOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import {
  ScheduleCreateRequest,
  ScheduleUpdateRequest,
  MovieOption,
  RoomOption,
  ScheduleConflict,
  AdminSchedule
} from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

interface ScheduleFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: ScheduleCreateRequest | ScheduleUpdateRequest) => Promise<void>;
  onCheckConflicts: (data: ScheduleCreateRequest) => Promise<ScheduleConflict[]>;
  movieOptions: MovieOption[];
  roomOptions: RoomOption[];
  editingSchedule?: AdminSchedule | null;
  loading?: boolean;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  onCheckConflicts,
  movieOptions,
  roomOptions,
  editingSchedule,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieOption | null>(null);
  const [autoEndTime, setAutoEndTime] = useState(true);

  // Form values watchers
  const movieId = Form.useWatch('movieId', form);
  const startTime = Form.useWatch('startTime', form);

  useEffect(() => {
    if (visible && editingSchedule) {
      // Populate form for editing
      form.setFieldsValue({
        movieId: editingSchedule.movieId,
        cinemaRoomId: editingSchedule.cinemaRoomId,
        showDate: dayjs(editingSchedule.showDate),
        startTime: dayjs(editingSchedule.startTime, 'HH:mm'),
        endTime: dayjs(editingSchedule.endTime, 'HH:mm'),
        price: editingSchedule.price,
        is3D: editingSchedule.is3D,
        isIMAX: editingSchedule.isIMAX,
        is4DX: editingSchedule.is4DX,
        subtitleLanguage: editingSchedule.subtitleLanguage,
        audioLanguage: editingSchedule.audioLanguage
      });
      
      const movie = movieOptions.find(m => m.movieId === editingSchedule.movieId);
      setSelectedMovie(movie || null);
      setAutoEndTime(false);
    } else if (visible) {
      // Reset form for new schedule
      form.resetFields();
      setSelectedMovie(null);
      setAutoEndTime(true);
      setConflicts([]);
    }
  }, [visible, editingSchedule, movieOptions, form]);

  // Auto-calculate end time based on movie duration
  useEffect(() => {
    if (autoEndTime && selectedMovie && startTime) {
      const endTimeCalculated = startTime.add(selectedMovie.duration + 30, 'minute'); // Add 30 min buffer
      form.setFieldValue('endTime', endTimeCalculated);
    }
  }, [selectedMovie, startTime, autoEndTime, form]);

  // Update selected movie when movieId changes
  useEffect(() => {
    const movie = movieOptions.find(m => m.movieId === movieId);
    setSelectedMovie(movie || null);
  }, [movieId, movieOptions]);

  const handleMovieChange = (value: number) => {
    const movie = movieOptions.find(m => m.movieId === value);
    setSelectedMovie(movie || null);
    
    // Auto-set default price based on special features
    const formValues = form.getFieldsValue();
    if (!formValues.price) {
      let basePrice = 80000; // Default price
      
      if (formValues.is3D) basePrice += 20000;
      if (formValues.isIMAX) basePrice += 30000;
      if (formValues.is4DX) basePrice += 50000;
      
      form.setFieldValue('price', basePrice);
    }
  };

  const handleSpecialFeatureChange = () => {
    // Recalculate price when special features change
    const formValues = form.getFieldsValue();
    let basePrice = 80000;
    
    if (formValues.is3D) basePrice += 20000;
    if (formValues.isIMAX) basePrice += 30000;
    if (formValues.is4DX) basePrice += 50000;
    
    form.setFieldValue('price', basePrice);
  };

  const handleCheckConflicts = async () => {
    try {
      const values = await form.validateFields();
      setCheckingConflicts(true);
      
      const requestData: ScheduleCreateRequest = {
        movieId: values.movieId,
        cinemaRoomId: values.cinemaRoomId,
        showDate: values.showDate.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm:ss'),
        endTime: values.endTime?.format('HH:mm:ss'),
        price: values.price,
        is3D: values.is3D || false,
        isIMAX: values.isIMAX || false,
        is4DX: values.is4DX || false,
        subtitleLanguage: values.subtitleLanguage || 'Vietnamese',
        audioLanguage: values.audioLanguage || 'Vietnamese'
      };
      
      const foundConflicts = await onCheckConflicts(requestData);
      setConflicts(foundConflicts);
      
    } catch (error) {
      console.error('Error checking conflicts:', error);
    } finally {
      setCheckingConflicts(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const requestData: ScheduleCreateRequest | ScheduleUpdateRequest = {
        ...(editingSchedule && { scheduleId: editingSchedule.scheduleId }),
        movieId: values.movieId,
        cinemaRoomId: values.cinemaRoomId,
        showDate: values.showDate.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm:ss'),
        endTime: values.endTime?.format('HH:mm:ss'),
        price: values.price,
        is3D: values.is3D || false,
        isIMAX: values.isIMAX || false,
        is4DX: values.is4DX || false,
        subtitleLanguage: values.subtitleLanguage || 'Vietnamese',
        audioLanguage: values.audioLanguage || 'Vietnamese'
      };
      
      await onSubmit(requestData);
      
      // Reset form and close modal
      form.resetFields();
      setConflicts([]);
      onCancel();
      
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const renderConflictAlerts = () => {
    if (conflicts.length === 0) return null;

    return (
      <div style={{ marginBottom: 16 }}>
        {conflicts.map((conflict, index) => (
          <Alert
            key={index}
            type={conflict.severity === 'HIGH' ? 'error' : conflict.severity === 'MEDIUM' ? 'warning' : 'info'}
            message={conflict.description}
            description={conflict.suggestions.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {conflict.suggestions.map((suggestion, idx) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            )}
            style={{ marginBottom: 8 }}
            icon={<ExclamationCircleOutlined />}
          />
        ))}
      </div>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined />
          {editingSchedule ? 'Chỉnh sửa lịch chiếu' : 'Tạo lịch chiếu mới'}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="check"
          type="default"
          icon={<InfoCircleOutlined />}
          onClick={handleCheckConflicts}
          loading={checkingConflicts}
        >
          Kiểm tra xung đột
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          disabled={conflicts.some(c => c.severity === 'HIGH')}
        >
          {editingSchedule ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      ]}
      width={800}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          subtitleLanguage: 'Vietnamese',
          audioLanguage: 'Vietnamese',
          is3D: false,
          isIMAX: false,
          is4DX: false,
          price: 80000
        }}
      >
        {renderConflictAlerts()}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="movieId"
              label="Phim"
              rules={[{ required: true, message: 'Vui lòng chọn phim' }]}
            >
              <Select
                placeholder="Chọn phim"
                onChange={handleMovieChange}
                showSearch
                filterOption={(input, option) => {
                  const label = option?.label || '';
                  return label.toString().toLowerCase().includes(input.toLowerCase());
                }}
              >
                {movieOptions.map(movie => (
                  <Option key={movie.movieId} value={movie.movieId}>
                    <Space>
                      <span>{movie.title}</span>
                      <Text type="secondary">({movie.duration} phút)</Text>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="cinemaRoomId"
              label="Phòng chiếu"
              rules={[{ required: true, message: 'Vui lòng chọn phòng chiếu' }]}
            >
              <Select placeholder="Chọn phòng chiếu">
                {roomOptions.map(room => (
                  <Option key={room.cinemaRoomId} value={room.cinemaRoomId} disabled={!room.isActive}>
                    <Space>
                      <span>{room.roomName}</span>
                      <Text type="secondary">({room.roomType} - {room.totalSeats} chỗ)</Text>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="showDate"
              label="Ngày chiếu"
              rules={[{ required: true, message: 'Vui lòng chọn ngày chiếu' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={current => current && current < dayjs().startOf('day')}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              name="startTime"
              label={
                <Space>
                  <ClockCircleOutlined />
                  Giờ bắt đầu
                </Space>
              }
              rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu' }]}
            >
              <TimePicker
                style={{ width: '100%' }}
                format="HH:mm"
                placeholder="Chọn giờ"
                minuteStep={15}
              />
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              name="endTime"
              label={
                <Space>
                  <ClockCircleOutlined />
                  Giờ kết thúc
                  <Switch
                    size="small"
                    checked={autoEndTime}
                    onChange={setAutoEndTime}
                    title="Tự động tính"
                  />
                </Space>
              }
              rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc' }]}
            >
              <TimePicker
                style={{ width: '100%' }}
                format="HH:mm"
                placeholder="Chọn giờ"
                disabled={autoEndTime}
                minuteStep={15}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Tùy chọn chiếu</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title="Định dạng đặc biệt">
              <Space direction="vertical">
                <Form.Item name="is3D" valuePropName="checked" style={{ margin: 0 }}>
                  <Checkbox onChange={handleSpecialFeatureChange}>3D (+20,000đ)</Checkbox>
                </Form.Item>
                <Form.Item name="isIMAX" valuePropName="checked" style={{ margin: 0 }}>
                  <Checkbox onChange={handleSpecialFeatureChange}>IMAX (+30,000đ)</Checkbox>
                </Form.Item>
                <Form.Item name="is4DX" valuePropName="checked" style={{ margin: 0 }}>
                  <Checkbox onChange={handleSpecialFeatureChange}>4DX (+50,000đ)</Checkbox>
                </Form.Item>
              </Space>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card size="small" title="Ngôn ngữ">
              <Form.Item
                name="subtitleLanguage"
                label="Phụ đề"
                style={{ marginBottom: 8 }}
              >
                <Select>
                  <Option value="Vietnamese">Tiếng Việt</Option>
                  <Option value="English">English</Option>
                  <Option value="None">Không có</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="audioLanguage"
                label="Âm thanh"
                style={{ margin: 0 }}
              >
                <Select>
                  <Option value="Vietnamese">Tiếng Việt</Option>
                  <Option value="English">English</Option>
                  <Option value="Original">Ngôn ngữ gốc</Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Form.Item
              name="price"
              label={
                <Space>
                  <DollarOutlined />
                  Giá vé (VNĐ)
                </Space>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập giá vé' },
                { type: 'number', min: 1000, message: 'Giá vé phải lớn hơn 1,000đ' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => {
                  const parsed = value!.replace(/\$\s?|(,*)/g, '');
                  return parsed ? Number(parsed) as any : 0 as any;
                }}
                placeholder="Nhập giá vé"
                min={1000}
                step={5000}
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            {selectedMovie && (
              <div style={{ padding: '8px 0' }}>
                <Text strong>Thông tin phim:</Text>
                <br />
                <Text>Thời lượng: {selectedMovie.duration} phút</Text>
                <br />
                <Text>Trạng thái: {selectedMovie.status}</Text>
              </div>
            )}
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

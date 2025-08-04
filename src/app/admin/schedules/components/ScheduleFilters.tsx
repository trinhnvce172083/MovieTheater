import React from 'react';
import {
  Card,
  Form,
  Row,
  Col,
  Select,
  DatePicker,
  Input,
  Button,
  Space,
  Typography
} from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  CalendarOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { ScheduleFilters, MovieOption, RoomOption } from '../types';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ScheduleFiltersProps {
  filters: ScheduleFilters;
  movieOptions: MovieOption[];
  roomOptions: RoomOption[];
  onFiltersChange: (filters: ScheduleFilters) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

export const ScheduleFiltersComponent: React.FC<ScheduleFiltersProps> = ({
  filters,
  movieOptions,
  roomOptions,
  onFiltersChange,
  onClearFilters,
  loading = false
}) => {
  const [form] = Form.useForm();

  const handleSearch = () => {
    const formValues = form.getFieldsValue();
    const newFilters: ScheduleFilters = {
      movieId: formValues.movieId,
      cinemaRoomId: formValues.cinemaRoomId,
      status: formValues.status,
      searchTerm: formValues.searchTerm?.trim(),
      startDate: formValues.dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: formValues.dateRange?.[1]?.format('YYYY-MM-DD')
    };

    // Remove undefined values
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key as keyof ScheduleFilters] === undefined || 
          newFilters[key as keyof ScheduleFilters] === '') {
        delete newFilters[key as keyof ScheduleFilters];
      }
    });

    onFiltersChange(newFilters);
  };

  const handleClear = () => {
    form.resetFields();
    onClearFilters();
  };

  // Set initial form values when filters change
  React.useEffect(() => {
    const dateRange = filters.startDate && filters.endDate 
      ? [dayjs(filters.startDate), dayjs(filters.endDate)]
      : undefined;

    form.setFieldsValue({
      movieId: filters.movieId,
      cinemaRoomId: filters.cinemaRoomId,
      status: filters.status,
      searchTerm: filters.searchTerm,
      dateRange
    });
  }, [filters, form]);

  return (
    <Card 
      title={
        <Space>
          <FilterOutlined />
          <Title level={5} style={{ margin: 0 }}>
            Search Filters
          </Title>
        </Space>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name="searchTerm"
              label="Search"
            >
              <Input
                placeholder="Search by movie, room..."
                prefix={<SearchOutlined />}
                allowClear
                onPressEnter={handleSearch}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name="movieId"
              label="Movie"
            >
              <Select
                placeholder="Select Movie"
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const label = option?.label || '';
                  return label.toString().toLowerCase().includes(input.toLowerCase());
                }}
              >
                {movieOptions.map(movie => (
                  <Option key={movie.movieId} value={movie.movieId} label={movie.title}>
                    {movie.title}
                    <span style={{ color: '#8c8c8c', marginLeft: 8 }}>
                      ({movie.duration}min)
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name="cinemaRoomId"
              label="Cinema Room"
            >
              <Select
                placeholder="Select Room"
                allowClear
              >
                {roomOptions.map(room => (
                  <Option key={room.cinemaRoomId} value={room.cinemaRoomId}>
                    {room.roomName}
                    <span style={{ color: '#8c8c8c', marginLeft: 8 }}>
                      ({room.roomType})
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name="status"
              label="Status"
            >
              <Select
                placeholder="Select Status"
                allowClear
              >
                <Option value="SCHEDULED">Scheduled</Option>
                <Option value="ONGOING">In Progress</Option>
                <Option value="COMPLETED">Completed</Option>
                <Option value="CANCELLED">Cancelled</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name="dateRange"
              label="Date Range"
            >
              <RangePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder={['From Date', 'To Date']}
                prefix={<CalendarOutlined />}
                allowClear
                disabledDate={current => {
                  // Don't allow selecting dates too far in the future (6 months)
                  return current && current > dayjs().add(6, 'month');
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item label=" " style={{ marginBottom: 0 }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  loading={loading}
                >
                  Search
                </Button>
                <Button
                  type="default"
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                >
                  Clear Filters
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

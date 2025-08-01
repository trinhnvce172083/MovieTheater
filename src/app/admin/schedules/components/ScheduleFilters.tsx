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
            Bộ lọc tìm kiếm
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
              label="Tìm kiếm"
            >
              <Input
                placeholder="Tên phim, phòng chiếu..."
                prefix={<SearchOutlined />}
                allowClear
                onPressEnter={handleSearch}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name="movieId"
              label="Phim"
            >
              <Select
                placeholder="Chọn phim"
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
                      ({movie.duration}p)
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name="cinemaRoomId"
              label="Phòng chiếu"
            >
              <Select
                placeholder="Chọn phòng"
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
              label="Trạng thái"
            >
              <Select
                placeholder="Chọn trạng thái"
                allowClear
              >
                <Option value="SCHEDULED">Đã lên lịch</Option>
                <Option value="ONGOING">Đang chiếu</Option>
                <Option value="COMPLETED">Đã hoàn thành</Option>
                <Option value="CANCELLED">Đã hủy</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item
              name="dateRange"
              label="Khoảng thời gian"
            >
              <RangePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                prefix={<CalendarOutlined />}
                allowClear
                disabledDate={current => {
                  // Không cho chọn ngày quá xa trong tương lai (6 tháng)
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
                  Tìm kiếm
                </Button>
                <Button
                  type="default"
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                >
                  Xóa bộ lọc
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

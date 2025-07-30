import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Checkbox, Row, Col, Tooltip, Tag } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { CinemaRoomResponse } from '../types';
import type { FormInstance } from 'antd/es/form';

const { Option } = Select;
const { TextArea } = Input;

interface RoomFormModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  editingRoom: CinemaRoomResponse | null;
  loading: boolean;
  form: FormInstance;
}

export const RoomFormModal: React.FC<RoomFormModalProps> = ({
  visible,
  onOk,
  onCancel,
  editingRoom,
  loading,
  form,
}) => {
  const handleRoomTypeChange = (value: string) => {
    const multipliers = {
      STANDARD: 1.0,
      VIP: 1.5,
      IMAX: 2.5,
      '4DX': 3.0,
    };
    form.setFieldsValue({ priceMultiplier: multipliers[value as keyof typeof multipliers] });
  };

  useEffect(() => {
    if (visible && editingRoom) {
      form.setFieldsValue({
        cinemaRoomName: editingRoom.cinemaRoomName,
        roomType: editingRoom.roomType,
        seatQuantity: editingRoom.seatQuantity,
        rows: editingRoom.rows,
        columns: editingRoom.columns,
        description: editingRoom.description,
        has3D: editingRoom.has3D,
        hasDolbyAtmos: editingRoom.hasDolbyAtmos,
        hasReclinerSeats: editingRoom.hasReclinerSeats,
        priceMultiplier: editingRoom.priceMultiplier,
        isActive: editingRoom.isActive,
      });
    } else if (visible && !editingRoom) {
      form.setFieldsValue({
        roomType: undefined,
        priceMultiplier: 1.0,
        isActive: true,
        has3D: false,
        hasDolbyAtmos: false,
        hasReclinerSeats: false,
        seatQuantity: undefined,
        rows: undefined,
        columns: undefined,
      });
    }
  }, [visible, editingRoom, form]);


  // Auto-calculate seatQuantity when rows or columns change
  const handleValuesChange = (changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => {
    if (
      (Object.prototype.hasOwnProperty.call(changedValues, 'rows') ||
        Object.prototype.hasOwnProperty.call(changedValues, 'columns')) &&
      typeof allValues.rows === 'number' && allValues.rows > 0 &&
      typeof allValues.columns === 'number' && allValues.columns > 0
    ) {
      const calculatedSeats = allValues.rows * allValues.columns;
      form.setFieldsValue({ seatQuantity: calculatedSeats });
    }
  };

  // Custom validation for seat calculation
  const validateSeatCalculation = async (_: unknown, value: number) => {
    const formValues = form.getFieldsValue();
    const { rows, columns } = formValues;
    
    if (typeof rows === 'number' && typeof columns === 'number' && value !== rows * columns) {
      throw new Error('Seat quantity must equal rows × columns');
    }
    return Promise.resolve();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span>{editingRoom ? "Edit Room" : "Add New Room"}</span>
          {editingRoom && (
            <Tag color="blue" className="ml-2">
              ID: {editingRoom.cinemaRoomId}
            </Tag>
          )}
        </div>
      }
      
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={800}
      className="professional-modal"
      okText={editingRoom ? "Update Room" : "Add Room"}
      cancelText="Cancel"
      confirmLoading={loading}
      destroyOnHidden={true}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" className="mt-6" onValuesChange={handleValuesChange}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="cinemaRoomName"
              label="Room Name"
              rules={[
                { required: true, message: "Please enter room name" },
                { max: 50, message: "Room name cannot exceed 50 characters" },
                { min: 2, message: "Room name must be at least 2 characters" },
                {
                  pattern: /^[A-Za-z0-9\s\-_]+$/,
                  message: "Room name can only contain letters, numbers, spaces, hyphens, and underscores"
                },
              ]}
              tooltip="Use a unique, descriptive name for the room"
            >
              <Input placeholder="Enter room name" className="h-10" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="roomType"
              label="Room Type"
              rules={[{ required: true, message: "Please select room type" }]}
            >
              <Select 
                placeholder="Select room type" 
                className="h-10"
                onChange={handleRoomTypeChange}
              >
                <Option value="STANDARD">Standard (1.0x)</Option>
                <Option value="VIP">VIP (1.5x)</Option>
                <Option value="IMAX">IMAX (2.5x)</Option>
                <Option value="4DX">4DX (3.0x)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="seatQuantity"
              label="Total Seats"
              rules={[
                { required: true, message: "Please enter total seats" },
                {
                  type: "number",
                  min: 1,
                  max: 500,
                  message: "Seats must be between 1 and 500",
                },
                { validator: validateSeatCalculation },
              ]}
            >
              <InputNumber
                placeholder="Total seats = Rows × Columns"
                className="w-full h-10"
                min={1}
                max={500}
                readOnly
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="rows"
              label="Rows"
              rules={[
                { required: true, message: "Please enter number of rows" },
                {
                  type: "number",
                  min: 1,
                  max: 30,
                  message: "Rows must be between 1 and 30",
                },
              ]}
            >
              <InputNumber
                placeholder="Enter rows"
                className="w-full h-10"
                min={1}
                max={30}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="columns"
              label="Columns"
              rules={[
                { required: true, message: "Please enter number of columns" },
                {
                  type: "number",
                  min: 1,
                  max: 50,
                  message: "Columns must be between 1 and 50",
                },
              ]}
            >
              <InputNumber
                placeholder="Enter columns"
                className="w-full h-10"
                min={1}
                max={50}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  max: 1000,
                  message: "Description cannot exceed 1000 characters",
                },
              ]}
            >
              <TextArea
                placeholder="Enter room description"
                rows={3}
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="priceMultiplier"
              label={
                <span>
                  Price Multiplier (Hệ số nhân giá){" "}
                  <Tooltip title="Giá vé cuối cùng = Giá vé cơ bản × Price Multiplier. Ví dụ: 100,000 VNĐ × 1.5 = 150,000 VNĐ">
                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </span>
              }
              rules={[
                { required: true, message: "Please enter price multiplier" },
                {
                  type: "number",
                  min: 0.1,
                  max: 10,
                  message: "Multiplier must be between 0.1 and 10",
                },
              ]}
              extra="Tự động điền khi chọn Room Type. Có thể chỉnh sửa thủ công."
            >
              <InputNumber
                placeholder="Auto-filled based on room type"
                className="w-full h-10"
                min={0.1}
                max={10}
                step={0.1}
                addonAfter="x"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
              initialValue={true}
            >
              <Checkbox>Active</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="has3D" valuePropName="checked">
              <Checkbox>3D Capability</Checkbox>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="hasDolbyAtmos" valuePropName="checked">
              <Checkbox>Dolby Atmos</Checkbox>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="hasReclinerSeats" valuePropName="checked">
              <Checkbox>Recliner Seats</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

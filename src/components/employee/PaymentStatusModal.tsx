"use client";

import { useState } from "react";
import { Modal, Form, Select, Input, InputNumber, message } from "antd";

interface PaymentStatusModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (
    paymentStatus: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIAL_REFUNDED' | 'EXPIRED',
    options?: {
      paymentReference?: string;
      paymentMethod?: string;
      notes?: string;
      refundAmount?: number;
    }
  ) => Promise<boolean>;
  currentStatus?: string;
  bookingId?: number;
  loading?: boolean;
}

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  visible,
  onClose,
  onUpdate,
  currentStatus,
  bookingId,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const paymentStatusOptions = [
    { value: 'PENDING', label: '⏳ Chờ thanh toán', color: '#faad14' },
    { value: 'PROCESSING', label: '🔄 Đang xử lý', color: '#1890ff' },
    { value: 'SUCCESS', label: '✅ Thành công', color: '#52c41a' },
    { value: 'FAILED', label: '❌ Thất bại', color: '#ff4d4f' },
    { value: 'CANCELLED', label: '🚫 Đã hủy', color: '#8c8c8c' },
    { value: 'REFUNDED', label: '💰 Đã hoàn tiền', color: '#722ed1' },
    { value: 'PARTIAL_REFUNDED', label: '💵 Hoàn tiền một phần', color: '#eb2f96' },
    { value: 'EXPIRED', label: '⏰ Hết hạn', color: '#fa541c' },
  ];

  const paymentMethodOptions = [
    { value: 'CASH', label: 'Tiền mặt' },
    { value: 'CARD', label: 'Thẻ tín dụng' },
    { value: 'VNPAY', label: 'VNPay' },
    { value: 'MOMO', label: 'MoMo' },
    { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
  ];

  // Validate trạng thái có thể chuyển đổi
  const getValidStatuses = (current: string) => {
    switch (current) {
      case 'PENDING':
        return paymentStatusOptions; // Có thể chuyển sang bất kỳ trạng thái nào
      case 'PROCESSING':
        return paymentStatusOptions.filter(opt => 
          ['SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(opt.value)
        );
      case 'SUCCESS':
        return paymentStatusOptions.filter(opt => 
          ['REFUNDED', 'PARTIAL_REFUNDED'].includes(opt.value)
        );
      case 'FAILED':
      case 'CANCELLED':
      case 'EXPIRED':
        return paymentStatusOptions.filter(opt => 
          ['PENDING', 'PROCESSING'].includes(opt.value)
        );
      case 'REFUNDED':
      case 'PARTIAL_REFUNDED':
        return []; // Không thể thay đổi
      default:
        return paymentStatusOptions;
    }
  };

  const validStatuses = getValidStatuses(currentStatus || '');

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const success = await onUpdate(values.paymentStatus, {
        paymentReference: values.paymentReference,
        paymentMethod: values.paymentMethod,
        notes: values.notes,
        refundAmount: values.refundAmount,
      });

      if (success) {
        form.resetFields();
        setSelectedStatus("");
        onClose();
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedStatus("");
    onClose();
  };

  const isRefundStatus = ['REFUNDED', 'PARTIAL_REFUNDED'].includes(selectedStatus);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span>💳 Cập nhật trạng thái thanh toán</span>
          {bookingId && (
            <span className="text-sm text-gray-500">#{bookingId}</span>
          )}
        </div>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Cập nhật"
      cancelText="Hủy"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          label="Trạng thái hiện tại"
          className="mb-4"
        >
          <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
            {paymentStatusOptions.find(opt => opt.value === currentStatus)?.label || currentStatus}
          </div>
        </Form.Item>

        <Form.Item
          name="paymentStatus"
          label="Trạng thái mới"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái mới' }]}
        >
          <Select
            placeholder="Chọn trạng thái mới"
            onChange={setSelectedStatus}
            disabled={validStatuses.length === 0}
          >
            {validStatuses.map(option => (
              <Select.Option 
                key={option.value} 
                value={option.value}
                style={{ color: option.color }}
              >
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {validStatuses.length === 0 && (
          <div className="text-sm text-gray-500 mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
            ⚠️ Trạng thái {currentStatus} không thể thay đổi
          </div>
        )}

        <Form.Item
          name="paymentMethod"
          label="Phương thức thanh toán"
        >
          <Select placeholder="Chọn phương thức (tùy chọn)">
            {paymentMethodOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="paymentReference"
          label="Mã tham chiếu"
        >
          <Input placeholder="Mã giao dịch / Reference (tùy chọn)" />
        </Form.Item>

        {isRefundStatus && (
          <Form.Item
            name="refundAmount"
            label="Số tiền hoàn"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền hoàn' },
              { type: 'number', min: 0, message: 'Số tiền hoàn phải lớn hơn 0' }
            ]}
          >
            <InputNumber
              placeholder="Nhập số tiền hoàn"
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VNĐ"
            />
          </Form.Item>
        )}

        <Form.Item
          name="notes"
          label="Ghi chú"
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Lý do thay đổi trạng thái (tùy chọn)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaymentStatusModal;
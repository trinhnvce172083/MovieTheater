import React from "react";
import { Modal, Form, Input, InputNumber, message, Select } from "antd";
import ConcessionImageUpload from "./ConcessionImageUpload";
import { Concession } from "@/types/Concession";

interface ConcessionFormProps {
  visible: boolean;
  initialValues?: Partial<Concession>;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading: boolean;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  isEdit?: boolean;
}

const ConcessionForm: React.FC<ConcessionFormProps> = ({
  visible,
  initialValues,
  onSubmit,
  onCancel,
  loading,
  imageFile,
  setImageFile,
  isEdit
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          // Ensure boolean values are properly set
          isAvailable: initialValues.isAvailable ?? true,
          isActive: initialValues.isActive ?? true,
          // Ensure numeric values are properly set
          price: initialValues.price ?? 0,
          stockQuantity: initialValues.stockQuantity ?? 0,
          displayOrder: initialValues.displayOrder ?? 0,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          name: '',
          description: '',
          price: 0,
          imageUrl: '',
          category: 'POPCORN',
          stockQuantity: 0,
          isAvailable: true,
          isActive: true,
          size: '',
          flavor: '',
          displayOrder: 0
        });
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Validate required fields
      if (!values.name || !values.description || !values.price || !values.category) {
        message.error('Please fill in all required fields');
        return;
      }

      // Validate price
      if (values.price <= 0) {
        message.error('Price must be greater than 0');
        return;
      }

      // Validate stock quantity
      if (values.stockQuantity < 0) {
        message.error('Stock quantity cannot be negative');
        return;
      }

      onSubmit(values);
    } catch (error) {
      console.error('Form validation error:', error);
      message.error('Please check your input and try again');
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit Concession" : "Add New Concession"}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Save"
      cancelText="Cancel"
      confirmLoading={loading}
      destroyOnHidden
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <Form.Item name="imageUrl" label="Image">
              <ConcessionImageUpload onFileChange={setImageFile} />
            </Form.Item>
            <Form.Item 
              name="name" 
              label="Name" 
              rules={[{ required: true, message: 'Please enter the concession name!' }]}
            >                
              <Input placeholder="Enter concession name" />
            </Form.Item>
            <Form.Item 
              name="description" 
              label="Description" 
              rules={[{ required: true, message: 'Please enter a description!' }]}
            >                
              <Input.TextArea rows={4} placeholder="Enter description" />
            </Form.Item>
            <Form.Item 
              name="price" 
              label="Price (VND)" 
              rules={[{ required: true, message: 'Please enter the price!' }]}
            >                
              <InputNumber 
                style={{ width: '100%' }} 
                min={0} 
                placeholder="Enter price"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
            <Form.Item 
              name="category" 
              label="Category" 
              rules={[{ required: true, message: 'Please select a category!' }]}
            >                
              <Select placeholder="Select category">
                <Select.Option value="POPCORN">POPCORN</Select.Option>
                <Select.Option value="DRINKS">DRINKS</Select.Option>
                <Select.Option value="COMBO">COMBO</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div>
            <Form.Item 
              name="stockQuantity" 
              label="Stock Quantity" 
              rules={[{ required: true, message: 'Please enter stock quantity!' }]}
            >                
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter stock quantity" />
            </Form.Item>
            <Form.Item name="size" label="Size">
              <Select placeholder="Select size" allowClear>
                <Select.Option value="S">Small (S)</Select.Option>
                <Select.Option value="M">Medium (M)</Select.Option>
                <Select.Option value="L">Large (L)</Select.Option>
                <Select.Option value="XL">Extra Large (XL)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="flavor" label="Flavor">
              <Input placeholder="Enter flavor (e.g., Butter, Caramel, Cheese)" />
            </Form.Item>
            <Form.Item name="displayOrder" label="Display Order">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter display order" />
            </Form.Item>
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              <Form.Item 
                name="isAvailable" 
                label="Available" 
                valuePropName="checked" 
                style={{ marginBottom: 0 }}
              >
                <input type="checkbox" />
              </Form.Item>
              <Form.Item 
                name="isActive" 
                label="Active" 
                valuePropName="checked" 
                style={{ marginBottom: 0 }}
              >
                <input type="checkbox" />
              </Form.Item>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default ConcessionForm; 
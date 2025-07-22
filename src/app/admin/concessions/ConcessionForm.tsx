import React from "react";
import { Modal, Form, Input, InputNumber } from "antd";
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
  const [form] = Form.useForm(); // Create form instance internally

  React.useEffect(() => {
    if (visible) {
      if (initialValues) form.setFieldsValue(initialValues);
      else form.resetFields();
    }
  }, [visible, initialValues, form]);

  return (
    <Modal
      title={isEdit ? "Edit Concession" : "Add New Concession"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Save"
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={initialValues || { name: '', description: '', price: 0, imageUrl: '', category: 'POPCORN', stockQuantity: 0, isAvailable: true, isActive: true }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <Form.Item name="imageUrl" label="Image">
              <ConcessionImageUpload onFileChange={setImageFile} />
            </Form.Item>
            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter the concession name!' }]}>                
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter a description!' }]}>                
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Please enter the price!' }]}>                
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please select a category!' }]}>                
              <select className="ant-input">
                <option value="POPCORN">POPCORN</option>
                <option value="DRINKS">DRINKS</option>
                <option value="COMBO">COMBO</option>
              </select>
            </Form.Item>
          </div>
          <div>
            <Form.Item name="stockQuantity" label="Stock Quantity" rules={[{ required: true, message: 'Please enter stock quantity!' }]}>                
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="size" label="Size">
              <select className="ant-input">
                <option value="">--None--</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
              </select>
            </Form.Item>
            <Form.Item name="flavor" label="Flavor">
              <Input />
            </Form.Item>
            <Form.Item name="displayOrder" label="Display Order">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item name="isAvailable" label="Available" valuePropName="checked" style={{ marginBottom: 0 }}>
                <input type="checkbox" />
              </Form.Item>
              <Form.Item name="isActive" label="Active" valuePropName="checked" style={{ marginBottom: 0 }}>
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
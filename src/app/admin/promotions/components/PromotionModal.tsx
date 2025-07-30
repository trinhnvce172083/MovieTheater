import React from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Switch, Upload, Button } from 'antd';
import { PlusOutlined, ReloadOutlined, GiftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PromotionDto } from '@/types/Admin/promotion';
import { useIsMobile } from '@/hooks/use-mobile';

// Function to generate random promotion code
const generateRandomCode = () => {
  console.log('generateRandomCode called!');
  
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const allChars = letters + numbers;
  
  // Tạo độ dài ngẫu nhiên từ 6-10 ký tự
  const length = Math.floor(Math.random() * 5) + 6; // 6-10 ký tự
  console.log('Length:', length);
  
  let code = '';
  
  // Tạo code với ít nhất 2 chữ và 2 số
  const letterCount = Math.floor(Math.random() * 3) + 2; // 2-4 chữ
  const numberCount = Math.floor(Math.random() * 3) + 2; // 2-4 số
  
  // Thêm chữ cái
  for (let i = 0; i < letterCount; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Thêm số
  for (let i = 0; i < numberCount; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  // Thêm ký tự ngẫu nhiên để đạt độ dài
  while (code.length < length) {
    code += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Xáo trộn code
  const shuffled = code.split('');
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  const finalCode = shuffled.join('');
  console.log('Generated code:', finalCode);
  return finalCode;
};

interface PromotionModalProps {
  isVisible: boolean;
  editingPromotion: PromotionDto | null;
  onOk: (values: any) => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isVisible,
  editingPromotion,
  onOk,
  onCancel,
}) => {
  const isMobile = useIsMobile();
  
  const handleSubmit = async (values: any) => {
    onOk(values);
  };

  // Only render the modal when visible to prevent useForm warning
  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <GiftOutlined className="text-white text-sm sm:text-lg" />
          </div>
          <span className="text-base sm:text-lg font-semibold text-gray-800">
            {editingPromotion ? "Edit Promotion" : "Add New Promotion"}
          </span>
        </div>
      }
      open={isVisible}
      onCancel={onCancel}
      width={isMobile ? "95vw" : "90vw"}
      style={{ 
        maxWidth: isMobile ? '95vw' : '800px', 
        top: isMobile ? '1vh' : '5vh',
        margin: '0 auto'
      }}
      className="professional-modal"
      footer={null}
      destroyOnHidden
      centered
      styles={{
        body: {
          maxHeight: isMobile ? '90vh' : '85vh',
          overflowY: 'auto',
          padding: isMobile ? '16px' : '20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }
      }}
    >
      <PromotionForm
        editingPromotion={editingPromotion}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </Modal>
  );
  };

// Separate form component to properly handle useForm
const PromotionForm: React.FC<{
  editingPromotion: PromotionDto | null;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}> = ({ editingPromotion, onSubmit, onCancel }) => {
  const isMobile = useIsMobile();
  const [form] = Form.useForm();
  const [promotionType, setPromotionType] = React.useState<string>('PUBLIC');
  const [discountType, setDiscountType] = React.useState<string>('');
  const [generatedCode, setGeneratedCode] = React.useState<string>('');

  // Reset form when editingPromotion changes
  React.useEffect(() => {
    if (editingPromotion) {
      const formValues = {
        promoCode: editingPromotion.promotionCode,
        name: editingPromotion.promotionName,
        description: editingPromotion.description,
        discountType: editingPromotion.discountType,
        discountValue: editingPromotion.discountValue,
        startDate: editingPromotion.startDate ? dayjs(editingPromotion.startDate) : null,
        endDate: editingPromotion.endDate ? dayjs(editingPromotion.endDate) : null,
        minPurchase: editingPromotion.minPurchaseAmount,
        maxDiscount: editingPromotion.maxDiscountAmount,
        status: editingPromotion.isActive ? 'ACTIVE' : 'INACTIVE',
        promotionType: editingPromotion.pointsDiscount ? 'POINT_BASED' : 'PUBLIC',
        memberOnly: false,
        membershipLevels: '',
        maxUsageCount: editingPromotion.maxUsageCount,
        maxUsagePerUser: editingPromotion.maxUsagePerUser,
        pointsRequired: editingPromotion.pointsRequired,
        isFeatured: editingPromotion.isFeatured,
        banner: editingPromotion.bannerImageUrl ? [
          {
            uid: '-1',
            name: 'banner.jpg',
            status: 'done',
            url: editingPromotion.bannerImageUrl,
          }
        ] : [],
      };
      form.setFieldsValue(formValues);
      setGeneratedCode(editingPromotion.promotionCode || '');
      setPromotionType(editingPromotion.pointsDiscount ? 'POINT_BASED' : 'PUBLIC');
      setDiscountType(editingPromotion.discountType || '');
    } else {
      form.resetFields();
      // Auto-generate a random code for new promotions
      const randomCode = generateRandomCode();
      form.setFieldsValue({ promoCode: randomCode });
      setGeneratedCode(randomCode);
      setPromotionType('PUBLIC');
      setDiscountType('');
    }
  }, [editingPromotion?.promotionId, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      className={`mt-4 sm:mt-6 space-y-4 sm:space-y-6`}
      onFinish={onSubmit}
      initialValues={{
        promoCode: '',
        name: '',
        description: '',
        discountType: undefined,
        discountValue: undefined,
        startDate: null,
        endDate: null,
        minPurchase: undefined,
        maxDiscount: undefined,
        status: 'ACTIVE',
        promotionType: 'PUBLIC',
        memberOnly: false,
        membershipLevels: '',
        maxUsageCount: undefined,
        maxUsagePerUser: undefined,
        pointsRequired: undefined,
        isFeatured: false,
        banner: []
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Form.Item
          name="promoCode"
          label={
            <span className="text-gray-700 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Promotion Code
            </span>
          }
          rules={[{ required: true, message: 'Please enter promotion code!' }]}
        >
          <div className="flex flex-col gap-2 sm:gap-3">
            <Input 
              placeholder="Enter promotion code" 
              className="w-full h-10 sm:h-12 text-base sm:text-lg font-mono border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 rounded-lg transition-all duration-200"
              value={generatedCode}
              onChange={(e) => {
                setGeneratedCode(e.target.value);
                form.setFieldsValue({ promoCode: e.target.value });
              }}
            />
            {!editingPromotion && (
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => {
                  console.log('Generate button clicked!');
                  const randomCode = generateRandomCode();
                  console.log('Setting form value:', randomCode);
                  form.setFieldsValue({ promoCode: randomCode });
                  setGeneratedCode(randomCode);
                  console.log('Form value set successfully');
                }}
                title="Generate random code"
                className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 rounded-lg font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
              >
                {isMobile ? '🎲 Generate' : '🎲 Generate Random Code'}
              </Button>
            )}
          </div>
        </Form.Item>

        <Form.Item
          name="name"
          label={
            <span className="text-gray-700 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Promotion Name
            </span>
          }
          rules={[{ required: true, message: 'Please enter promotion name!' }]}
        >
          <Input 
            placeholder="Enter promotion name" 
            className="h-10 sm:h-12 border-2 border-gray-200 hover:border-green-400 focus:border-green-500 rounded-lg transition-all duration-200"
          />
        </Form.Item>
      </div>

      <Form.Item
        name="description"
        label={
          <span className="text-gray-700 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Description
          </span>
        }
        rules={[{ required: true, message: 'Please enter description!' }]}
      >
        <Input.TextArea 
          rows={4} 
          placeholder="Enter promotion description" 
          className="border-2 border-gray-200 hover:border-purple-400 focus:border-purple-500 rounded-lg transition-all duration-200 resize-none"
        />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Form.Item
          name="discountType"
          label="Discount Type"
          rules={[{ required: true, message: 'Please select discount type!' }]}
        >
          <Select 
            placeholder="Select discount type"
            onChange={(value) => setDiscountType(value)}
          >
            <Select.Option value="PERCENTAGE">Percentage</Select.Option>
            <Select.Option value="FIXED">Fixed Amount</Select.Option>
            <Select.Option value="POINTS">Points</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="discountValue"
          label="Discount Value"
          rules={[{ required: true, message: 'Please enter discount value!' }]}
        >
          <InputNumber
            placeholder={
              discountType === 'PERCENTAGE' 
                ? "Enter percentage (1-100)" 
                : discountType === 'POINTS'
                ? "Enter points value"
                : "Enter discount amount"
            }
            min={0}
            max={discountType === 'PERCENTAGE' ? 100 : undefined}
            className="w-full"
          />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Form.Item
          name="startDate"
          label="Start Date"
          rules={[{ required: true, message: 'Please select start date!' }]}
        >
          <DatePicker
            placeholder="Select start date"
            className="w-full"
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          name="endDate"
          label="End Date"
          rules={[{ required: true, message: 'Please select end date!' }]}
        >
          <DatePicker
            placeholder="Select end date"
            className="w-full"
            format="YYYY-MM-DD"
          />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Form.Item
          name="minPurchase"
          label="Minimum Purchase Amount"
          rules={[{ required: true, message: 'Please enter minimum purchase amount!' }]}
        >
          <InputNumber
            placeholder="Enter minimum purchase amount"
            min={0}
            className="w-full"
          />
        </Form.Item>

        <Form.Item
          name="maxDiscount"
          label="Maximum Discount Amount"
          rules={[{ required: true, message: 'Please enter maximum discount amount!' }]}
        >
          <InputNumber
            placeholder="Enter maximum discount amount"
            min={0}
            className="w-full"
          />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status!' }]}
        >
          <Select placeholder="Select status">
            <Select.Option value="ACTIVE">Active</Select.Option>
            <Select.Option value="INACTIVE">Inactive</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="promotionType"
          label="Promotion Type"
          rules={[{ required: true, message: 'Please select promotion type!' }]}
        >
          <Select 
            placeholder="Select promotion type"
            onChange={(value) => setPromotionType(value)}
          >
            <Select.Option value="PUBLIC">Public</Select.Option>
            <Select.Option value="POINT_BASED">Point Based</Select.Option>
          </Select>
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Form.Item
          name="maxUsageCount"
          label="Maximum Usage Count"
          rules={[{ required: true, message: 'Please enter maximum usage count!' }]}
        >
          <InputNumber
            placeholder="Enter maximum usage count"
            min={1}
            className="w-full"
          />
        </Form.Item>

        <Form.Item
          name="maxUsagePerUser"
          label="Maximum Usage Per User"
          rules={[{ required: true, message: 'Please enter maximum usage per user!' }]}
        >
          <InputNumber
            placeholder="Enter maximum usage per user"
            min={1}
            className="w-full"
          />
        </Form.Item>
      </div>

      {promotionType === 'POINT_BASED' && (
        <Form.Item
          name="pointsRequired"
          label="Points Required"
          rules={[{ required: true, message: 'Please enter points required!' }]}
        >
          <InputNumber
            placeholder="Enter points required"
            min={0}
            className="w-full"
          />
        </Form.Item>
      )}

      <Form.Item
        name="isFeatured"
        label="Featured Promotion"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        name="banner"
        label={
          <span className="text-gray-700 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            Promotion Banner
          </span>
        }
        valuePropName="fileList"
        getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList || []}
      >
        <Upload
          name="banner"
          listType="picture-card"
          maxCount={1}
          beforeUpload={() => false}
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={info => form.setFieldsValue({ banner: info.fileList })}
          className="w-full"
        >
          <div className="text-center p-3 sm:p-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <PlusOutlined className="text-white text-lg sm:text-xl" />
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600">Upload Banner</div>
            <div className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</div>
          </div>
        </Upload>
      </Form.Item>

      <div className="flex flex-col gap-2 sm:gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
        <Button 
          type="primary" 
          htmlType="submit" 
          className="w-full h-10 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
        >
          {editingPromotion 
            ? (isMobile ? '🔄 Update' : '🔄 Update Promotion')
            : (isMobile ? '✨ Create' : '✨ Create Promotion')
          }
        </Button>
        <Button 
          onClick={onCancel} 
          className="w-full h-10 sm:h-12 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg font-medium text-gray-700 transition-all duration-200 text-sm sm:text-base"
        >
          ❌ Cancel
        </Button>
      </div>
    </Form>
  );
}; 
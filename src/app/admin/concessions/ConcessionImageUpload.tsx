import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";

interface ConcessionImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onFileChange?: (file: File | null) => void;
}

const ConcessionImageUpload: React.FC<ConcessionImageUploadProps> = ({ value, onChange, onFileChange }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);

  const handleImageUpload = async (file: File) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }

    // Validate file size (max 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }

    setUploading(true);
    try {
      if (onFileChange) onFileChange(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (onChange) onChange(url);
      message.success('Image selected successfully');
    } catch (error) {
      message.error('Failed to process image');
    } finally {
      setUploading(false);
    }
    return false; // Prevent default upload behavior
  };

  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    if (onFileChange) onFileChange(null);
    if (onChange) onChange('');
    message.success('Image removed');
  };

  React.useEffect(() => {
    if (value) setPreviewUrl(value);
    else setPreviewUrl(undefined);
  }, [value]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <Upload
          beforeUpload={handleImageUpload}
          showUploadList={false}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />} loading={uploading}>
            {previewUrl ? "Change Image" : "Upload Image"}
          </Button>
        </Upload>
        {previewUrl && (
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={handleRemoveImage}
            size="small"
          >
            Remove
          </Button>
        )}
      </div>
      {previewUrl && (
        <div style={{ 
          border: '1px solid #d9d9d9', 
          borderRadius: 8, 
          padding: 8, 
          background: '#fafafa',
          display: 'inline-block'
        }}>
          <img
            src={previewUrl}
            alt="preview"
            style={{ 
              width: 120, 
              height: 120, 
              objectFit: "cover", 
              borderRadius: 4,
              border: '1px solid #eee'
            }}
            onError={(e) => {
              // e.currentTarget.src = '/popcorn.jpg';
              // message.error('Failed to load image preview');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ConcessionImageUpload; 
import React, { useState } from "react";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

interface ConcessionImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onFileChange?: (file: File | null) => void;
}

const ConcessionImageUpload: React.FC<ConcessionImageUploadProps> = ({ value, onChange, onFileChange }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    if (onFileChange) onFileChange(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploading(false);
    return false;
  };

  React.useEffect(() => {
    if (value) setPreviewUrl(value);
    else setPreviewUrl(undefined);
  }, [value]);

  return (
    <div>
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
        <img
          src={previewUrl}
          alt="preview"
          style={{ marginTop: 8, width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
        />
      )}
    </div>
  );
};

export default ConcessionImageUpload; 
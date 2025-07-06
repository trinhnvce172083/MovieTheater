import React, { useState } from "react";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

interface ConcessionImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
}

const ConcessionImageUpload: React.FC<ConcessionImageUploadProps> = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    // TODO: Thay thế API upload phù hợp với backend của bạn
    const formData = new FormData();
    formData.append("file", file);
    // Ví dụ: gọi API backend trả về { url: "https://..." }
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setPreviewUrl(data.url);
    setUploading(false);
    if (onChange) onChange(data.url);
    return false; // Ngăn upload mặc định của Ant Design
  };

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
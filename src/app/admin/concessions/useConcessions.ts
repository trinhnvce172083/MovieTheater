import { useState, useEffect, useMemo } from 'react';
import { message } from 'antd';
import { Concession } from '@/types/Concession';
import { getAllConcessions, addConcession, updateConcession, deleteConcession } from './concessionService';

export default function useConcessions() {
  const [concessions, setConcessions] = useState<Concession[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingConcession, setEditingConcession] = useState<Concession | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchConcessions = async () => {
    try {
      setLoading(true);
      const data = await getAllConcessions();
      setConcessions(data);
    } catch (error) {
      message.error('Failed to fetch concessions. Please check the API connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcessions();
  }, []);

  const filteredData = useMemo(() =>
    concessions.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [concessions, searchTerm]
  );

  const showModal = (concession: Concession | null = null) => {
    setEditingConcession(concession);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingConcession(null);
    setImageFile(null);
  };

  // Hàm upload ảnh riêng biệt
  const uploadImage = async (concessionId: number, file: File): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(`http://localhost:8080/cinema/api/concessions/${concessionId}/image`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        message.success('Image uploaded successfully');
        return true;
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      message.error('Failed to upload image. Please try again.');
      return false;
    }
  };

  const handleFormSubmit = async (values: Omit<Concession, 'id'> & { imageUrl?: string }) => {
    try {
      setFormLoading(true);
      let concessionId: number | undefined;
      let uploadSuccess = true;

      if (editingConcession) {
        // Update existing concession
        await updateConcession(editingConcession.id, values);
        concessionId = editingConcession.id;
        
        // Upload image if provided
        if (imageFile && concessionId) {
          uploadSuccess = await uploadImage(concessionId, imageFile);
        }
        
        // if (uploadSuccess) {
        //   message.success('Đã chỉnh sửa thành công');
        // }
      } else {
        // Create new concession
        const res = await addConcession(values);
        concessionId = res.data.data?.concessionId;
        
        // Upload image if provided
        if (imageFile && concessionId) {
          uploadSuccess = await uploadImage(concessionId, imageFile);
        }
        
        if (uploadSuccess) {
          message.success('Đã thêm thành công');
        }
      }

      // Refresh data to show updated image
      await fetchConcessions();
      handleCancel();
    } catch (error) {
      console.error('Form submit error:', error);
      message.error('Failed to save concession. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await deleteConcession(id);
      message.success('Đã xóa thành công');
      fetchConcessions();
    } catch (error) {
      message.error('Failed to delete concession. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    concessions,
    loading,
    formLoading,
    searchTerm,
    setSearchTerm,
    isModalVisible,
    editingConcession,
    imageFile,
    setImageFile,
    filteredData,
    showModal,
    handleCancel,
    handleFormSubmit,
    handleDelete,
  };
} 
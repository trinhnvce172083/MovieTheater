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

  const handleFormSubmit = async (values: Omit<Concession, 'id'> & { imageUrl?: string }) => {
    try {
      setFormLoading(true);
      let concessionId: number | undefined;
      if (editingConcession) {
        await updateConcession(editingConcession.id, values);
        concessionId = editingConcession.id;
        if (imageFile && concessionId) {
          const formData = new FormData();
          formData.append('file', imageFile);
          const token = localStorage.getItem("accessToken");
          await fetch(`http://localhost:8080/cinema/api/concessions/${concessionId}/image`, {
            method: 'PUT',
            body: formData,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
        message.success('Đã chỉnh sửa thành công');
      } else {
        const res = await addConcession(values);
        concessionId = res.data.id || res.data.concessionId;
        if (imageFile && concessionId) {
          const formData = new FormData();
          formData.append('file', imageFile);
          const token = localStorage.getItem("accessToken");
          await fetch(`http://localhost:8080/cinema/api/concessions/${concessionId}/image`, {
            method: 'POST',
            body: formData,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
        message.success('Đã thêm thành công');
      }
      fetchConcessions();
      handleCancel();
    } catch (error) {
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
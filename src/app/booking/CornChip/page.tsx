"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header/Header';
import concessionApi from '@/api/concessionApi';
import ConcessionsList from './ConcessionsList';
import OrderSummary from './OrderSummary';
import Image from 'next/image';

interface Concession {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

const mockMovieDetails = {
  title: 'SPIDER-MAN: NO WAY HOME',
  date: '10:00 28/05/2025',
  details: 'Screening room 02 - Seat H18',
  image: '/popcorn.jpg'
};

export default function CornChipPage() {
  const [concessions, setConcessions] = useState<Concession[]>([]);
  const [quantities, setQuantities] = useState<{[key: number]: number}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConcessions = async () => {
      try {
        setLoading(true);
        const response = await concessionApi.getAll();
        const fetchedConcessions = (response.data.data || response.data).map(item => ({
          ...item,
          id: item.id ?? item.concessionId
        }));
        setConcessions(fetchedConcessions);
        const initialQuantities = fetchedConcessions.reduce(
          (acc, item, idx) => ({ ...acc, [item.id ?? idx]: 0 }),
          {}
        );
        setQuantities(initialQuantities);
        setError(null);
      } catch (error) {
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchConcessions();
  }, []);

  const handleQuantityChange = (id, delta) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const totalOrder = concessions.reduce((total, item) => {
    return total + (quantities[item.id] || 0) * item.price;
  }, 0);

  return (
    <>
      <Header />
      <div className="bg-gray-900 text-white min-h-screen p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ConcessionsList
            concessions={concessions}
            quantities={quantities}
            onQuantityChange={handleQuantityChange}
            loading={loading}
            error={error}
          />
          <div className="lg:col-span-1">
            <OrderSummary movieDetails={mockMovieDetails} totalOrder={totalOrder} />
          </div>
        </div>
      </div>
    </>
  );
} 
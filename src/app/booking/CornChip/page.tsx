"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header/Header';
import concessionApi from '@/api/concessionApi';
import ConcessionsList from './ConcessionsList';
import OrderSummary from './OrderSummary';

interface Concession {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string; // Optional: if your API provides images for concessions
}

// Mock data for movie details, you might want to fetch this from an API as well
const mockMovieDetails = {
    title: 'SPIDER-MAN: NO WAY HOME',
    date: '10:00 28/05/2025',
    details: 'Screening room 02 - Seat H18',
    image: '/popcorn.jpg' 
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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
        // Assuming the data is nested under a `data` property
        const fetchedConcessions = (response.data.data || response.data).map(item => ({
          ...item,
          id: item.id ?? item.concessionId // Ưu tiên id, fallback concessionId
        }));
        setConcessions(fetchedConcessions);
        const initialQuantities = fetchedConcessions.reduce(
          (acc, item, idx) => ({ ...acc, [item.id ?? idx]: 0 }),
          {}
        );
        setQuantities(initialQuantities);
        setError(null);
        console.log('concessions:', fetchedConcessions);
      } catch (error) {
        console.error("Failed to fetch concessions:", error);
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
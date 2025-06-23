"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header/Header';
import concessionApi from '@/api/concessionApi';

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
        const fetchedConcessions = response.data.data || response.data;
        setConcessions(fetchedConcessions);
        const initialQuantities = fetchedConcessions.reduce((acc: any, item: Concession) => ({ ...acc, [item.id]: 0 }), {});
        setQuantities(initialQuantities);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch concessions:", error);
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchConcessions();
  }, []);

  const handleQuantityChange = (id: number, delta: number) => {
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
          
          {/* Left Column: Concessions List */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-3 gap-x-4 mb-4 font-bold text-gray-400">
              <div>COMBO</div>
              <div className="text-right">PRICE</div>
              <div className="text-center">QUANTITY</div>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="space-y-4">
                {concessions.map((item) => (
                  <div key={item.id}>
                    <div className="grid grid-cols-3 gap-x-4 items-center">
                      <div>
                        <h3 className="font-bold">{item.name}</h3>
                        {item.description && <p className="text-sm text-gray-400">{item.description}</p>}
                      </div>
                      <div className="text-right font-semibold">
                        {formatPrice(item.price).replace('₫', 'VND')}
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <Button variant="outline" size="icon" className="bg-gray-700 hover:bg-gray-600 border-gray-600" onClick={() => handleQuantityChange(item.id, -1)} disabled={(quantities[item.id] || 0) <= 0}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-lg w-8 text-center">{quantities[item.id] || 0}</span>
                        <Button variant="outline" size="icon" className="bg-gray-700 hover:bg-gray-600 border-gray-600" onClick={() => handleQuantityChange(item.id, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Separator className="mt-4 bg-gray-700" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <Image src={mockMovieDetails.image} alt={mockMovieDetails.title} width={400} height={250} className="rounded-t-lg object-cover" />
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2 text-center">
                  <CardTitle className="text-xl">{mockMovieDetails.title}</CardTitle>
                  <p className="text-gray-300">{mockMovieDetails.date}</p>
                  <p className="text-gray-300">{mockMovieDetails.details}</p>
                </div>
                <Separator className="bg-gray-700"/>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Total Order</h3>
                  <p className="text-3xl font-extrabold">{formatPrice(totalOrder).replace('₫', 'VND')}</p>
                </div>
                <div className="flex items-center gap-3 pt-6 w-full">
                  <Button variant="outline" size="icon" className="border-purple-600 bg-gray-700 hover:bg-purple-100 hover:border-purple-700 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
                    <ArrowLeft className="h-5 w-5 text-purple-600" />
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold shadow-lg hover:from-purple-600 hover:to-purple-800 border-0 rounded-lg px-6 py-2 text-base min-h-0 h-auto">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

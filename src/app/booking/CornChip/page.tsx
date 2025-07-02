"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header/Header';
import concessionApi from '@/api/concessionApi';
import ConcessionsList from './ConcessionsList';
import OrderSummary from './OrderSummary';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import ROUTES from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Concession {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

export default function CornChipPage() {
  const [concessions, setConcessions] = useState<Concession[]>([]);
  const [quantities, setQuantities] = useState<{[key: number]: number}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bookingData = useSelector((state: RootState) => state.booking);
  const router = useRouter();

  // // Kiểm tra dữ liệu booking
  // useEffect(() => {
  //   if (!bookingData.scheduleId || bookingData.selectedSeats.length === 0) {
  //     router.replace(ROUTES.MOVIES);
  //     return;
  //   }
  // }, [bookingData.scheduleId, bookingData.selectedSeats.length, router]);

  // Lấy danh sách concessions
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
        
        // Khởi tạo số lượng về 0 cho mỗi item
        const initialQuantities = fetchedConcessions.reduce(
          (acc, item) => ({ ...acc, [item.id]: 0 }),
          {}
        );
        setQuantities(initialQuantities);
        setError(null);
      } catch (error) {
        setError("Failed to load concessions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchConcessions();
  }, []);

  // Xử lý thay đổi số lượng
  const handleQuantityChange = (id: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  // Tính tổng tiền đồ ăn
  const totalOrder = concessions.reduce((total, item) => {
    return total + (quantities[item.id] || 0) * item.price;
  }, 0);

  // Tạo thông tin phim từ Redux state
  const movieDetails = {
    title: bookingData.movieInfo?.title || bookingData.scheduleInfo?.movieTitle || 'Unknown Movie',
    date: bookingData.scheduleInfo ? 
      `${bookingData.scheduleInfo.displayTime} ${bookingData.scheduleInfo.displayDate}` : 
      'Loading...',
    details: bookingData.scheduleInfo ? 
      `${bookingData.scheduleInfo.cinemaRoomName} - ${bookingData.selectedSeats.map(seat => seat.seatNumber).join(', ')}` :
      'Loading...',
    image: bookingData.movieInfo?.posterUrl || '/popcorn.jpg'
  };

  return (
    <>
      <Header />
      <div className="bg-[#151a23] text-white min-h-screen p-8 pt-0 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ConcessionsList
            concessions={concessions}
            quantities={quantities}
            onQuantityChange={handleQuantityChange}
            loading={loading}
            error={error}
          />
          <div className="lg:col-span-1">
            <OrderSummary 
              movieDetails={movieDetails} 
              totalOrder={totalOrder}
              bookingData={bookingData}
              concessions={concessions}
              quantities={quantities}
            />
          </div>
        </div>
      </div>
    </>
  );
} 
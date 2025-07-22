import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import ROUTES from '@/constants/routes';
import { ArrowLeft } from 'lucide-react';
import { BookingApiService } from '@/api/booking-api';
import { message } from 'antd';

interface OrderSummaryProps {
  movieDetails: any;
  totalOrder: number;
  bookingData: any;
  concessions: any[];
  quantities: { [key: number]: number };
}

const OrderSummary = ({ movieDetails, totalOrder, bookingData, concessions, quantities }: OrderSummaryProps) => {
  const router = useRouter();

  const handleCheckout = () => {
    router.push('/booking/confirm');
  };

  return (
    <div className="bg-white text-black rounded-lg md:rounded-xl shadow-lg p-2 md:p-4 flex flex-col w-full max-w-sm mx-auto">
      {/* Ảnh phim */}
      <div className="mb-4">
        <img src={movieDetails.image || '/popcorn.jpg'} alt={movieDetails.title} className="w-full h-32 object-cover rounded" />
      </div>
      <div className="font-bold text-base md:text-lg mb-2">Order Summary</div>
      <div className="mb-2">
        <div className="font-semibold">{movieDetails.title}</div>
        <div className="text-sm text-gray-500">{movieDetails.date}</div>
        <div className="text-sm text-gray-500">{movieDetails.details}</div>
      </div>
      {/* Danh sách món đã chọn */}
      <div className="mb-2">
        {concessions.filter(item => quantities[item.id] > 0).length > 0 ? (
          concessions.filter(item => quantities[item.id] > 0).map(item => (
            <div key={item.id} className="flex items-center gap-2 mb-2">
              <img src={item.imageUrl || '/popcorn.jpg'} alt={item.name} className="w-8 h-8 object-cover rounded bg-white border" />
              <span className="flex-1">{item.name} x {quantities[item.id]}</span>
              <span>{(item.price * quantities[item.id]).toLocaleString()} VND</span>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-sm">Chưa chọn món nào</div>
        )}
      </div>
      <div className="font-bold text-right text-base md:text-lg mt-4 mb-2">
        Total: <span className="text-yellow-600">{totalOrder.toLocaleString()} VND</span>
      </div>
      <div className="flex gap-2 md:gap-4 mt-4">
        <Button
          variant="outline"
          size="lg"
          className="bg-white text-black border-gray-300 hover:bg-gray-100"
          onClick={() => router.push('/booking/seat-selection')}
        >
          <ArrowLeft />
        </Button>
        <Button 
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded"
          onClick={handleCheckout}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default OrderSummary; 
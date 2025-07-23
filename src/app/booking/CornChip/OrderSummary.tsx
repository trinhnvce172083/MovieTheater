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
    <div className="bg-white text-black rounded-lg md:rounded-xl shadow-lg p-1 md:p-4 flex flex-col w-full max-w-xs md:max-w-sm mx-auto">
      {/* Ảnh phim */}
      <div className="mb-2 md:mb-4">
        <img src={movieDetails.image || '/popcorn.jpg'} alt={movieDetails.title} className="w-full h-24 md:h-32 object-cover rounded-md" />
      </div>
      <div className="font-bold text-sm md:text-lg mb-1 md:mb-2">Order Summary</div>
      <div className="mb-1 md:mb-2">
        <div className="font-semibold text-xs md:text-base">{movieDetails.title}</div>
        <div className="text-xs md:text-sm text-gray-500">{movieDetails.date}</div>
        <div className="text-xs md:text-sm text-gray-500">{movieDetails.details}</div>
      </div>
      {/* Danh sách món đã chọn */}
      <div className="mb-1 md:mb-2">
        {concessions.filter(item => quantities[item.concessionId] > 0).length > 0 ? (
          concessions.filter(item => quantities[item.concessionId] > 0).map(item => (
            <div key={item.concessionId} className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <img src={item.imageUrl || '/popcorn.jpg'} alt={item.name} className="w-6 h-6 md:w-8 md:h-8 object-cover rounded bg-white border" />
              <span className="flex-1 text-xs md:text-base">{item.name} x {quantities[item.concessionId]}</span>
              <span className="text-xs md:text-base">{(item.price * quantities[item.concessionId]).toLocaleString()} VND</span>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-xs md:text-sm">Chưa chọn món nào</div>
        )}
      </div>
      <div className="font-bold text-right text-base md:text-lg mt-2 md:mt-4 mb-1 md:mb-2">
        Total: <span className="text-yellow-600">{totalOrder.toLocaleString()} VND</span>
      </div>
      <div className="flex gap-1 md:gap-4 mt-2 md:mt-4">
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-black border-gray-300 hover:bg-gray-100 px-2 py-1 md:px-4 md:py-2"
          onClick={() => router.push('/booking/seat-selection')}
        >
          <ArrowLeft />
        </Button>
        <Button 
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 md:py-2 rounded text-xs md:text-base"
          onClick={handleCheckout}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default OrderSummary; 
"use client";

import { useEffect, useState } from 'react';
import ConcessionsList from './ConcessionsList';
import OrderSummary from './OrderSummary';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import ROUTES from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useConcession } from '@/hooks/booking/useConcession';
import { MovieApiService } from '@/api/movie-api';

export default function CornChipPage() {
  const bookingData = useSelector((state: RootState) => state.booking);
  const router = useRouter();
  
  const {
    selectedConcessions,
    concessionsTotal,
    loading,
    error,
    fetchConcessions,
    addConcessionToBooking,
    updateConcessionQuantityInBooking,
    removeConcessionFromBooking,
  } = useConcession();

  const [concessions, setConcessions] = useState([]);
  const [movieDetails, setMovieDetails] = useState<any>(null);

  // Lấy movieId từ bookingData
  const movieId = bookingData.movieInfo?.movieId || bookingData.scheduleInfo?.movieId;

  // Lấy danh sách concessions
  useEffect(() => {
    const loadConcessions = async () => {
      try {
        const concessionsData = await fetchConcessions();
        const normalized = concessionsData.map((item: any) => ({
          ...item,
          concessionId: item.concessionId ?? item.id,
        }));
        setConcessions(normalized);
      } catch (error) {
        console.error("Failed to load concessions:", error);
      }
    };
    
    loadConcessions();
  }, [fetchConcessions]);

  // Lấy movie details từ API
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movieId) return;
      const res = await MovieApiService.getMovieById(movieId);
      if (res.success && res.data) {
        setMovieDetails(res.data);
      } else {
        setMovieDetails(null);
      }
    };
    fetchMovieDetails();
  }, [movieId]);

  // Xử lý thay đổi số lượng
  const handleQuantityChange = (concessionId: number, delta: number) => {
    const currentQuantity = selectedConcessions.find(
      item => item.concessionId === concessionId
    )?.quantity || 0;

    const newQuantity = Math.max(0, currentQuantity + delta);
    const concession = concessions.find(item => item.concessionId === concessionId);

    if (newQuantity === 0) {
      removeConcessionFromBooking(concessionId);
    } else if (currentQuantity === 0 && concession) {
      // Nếu chưa có trong giỏ, thêm mới
      addConcessionToBooking(concession, newQuantity);
    } else {
      // Nếu đã có, cập nhật số lượng
      updateConcessionQuantityInBooking(concessionId, newQuantity);
    }
  };

  // Tạo thông tin phim từ movieDetails và bookingData
  const movieSummary = movieDetails ? {
    title: movieDetails.title,
    date: bookingData.scheduleInfo ? 
      `${bookingData.scheduleInfo.displayTime} ${bookingData.scheduleInfo.displayDate}` : 
      'Loading...',
    details: bookingData.scheduleInfo ? 
      `${bookingData.scheduleInfo.cinemaRoomName} - ${bookingData.selectedSeats.map(seat => seat.seatNumber).join(', ')}` :
      'Loading...',
    image: movieDetails.posterUrl || '/popcorn.jpg'
  } : {
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
      <div className="bg-[#151a23] text-white min-h-screen px-2 sm:px-4 md:px-8 pt-2">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 bg-[#151a23] rounded-xl">
          <ConcessionsList
            concessions={concessions}
            quantities={selectedConcessions.reduce((acc, item) => ({
              ...acc,
              [item.concessionId]: item.quantity
            }), {})}
            onQuantityChange={handleQuantityChange}
            loading={loading}
            error={error}
          />
          <div className="lg:col-span-1 h-full flex items-stretch w-full max-w-sm mx-auto md:max-w-full md:mx-0">
            <OrderSummary 
              movieDetails={movieSummary} 
              totalOrder={bookingData.finalAmount}
              bookingData={bookingData}
              concessions={concessions}
              quantities={selectedConcessions.reduce((acc, item) => ({
                ...acc,
                [item.concessionId]: item.quantity
              }), {})}
            />
          </div>
        </div>
      </div>
    </>
  );
} 
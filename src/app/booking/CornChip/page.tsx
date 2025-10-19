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

  // Debug logging
  console.log('CornChipPage - bookingData:', bookingData);
  console.log('CornChipPage - selectedConcessions:', selectedConcessions);
  console.log('CornChipPage - concessions:', concessions);
  console.log('CornChipPage - loading:', loading);
  console.log('CornChipPage - error:', error);

  // Lấy movieId từ bookingData
  const movieId = bookingData.movieInfo?.movieId || bookingData.scheduleInfo?.movieId;

  // Lấy danh sách concessions
  useEffect(() => {
    const loadConcessions = async () => {
      try {
        console.log('Loading concessions...');
        const concessionsData = await fetchConcessions();
        console.log('Concessions data:', concessionsData);
        const normalized = concessionsData.map((item: any) => ({
          ...item,
          concessionId: item.concessionId ?? item.id,
        }));
        
        // Sort concessions theo bảng chữ cái (alphabetical order)
        const sortedConcessions = normalized.sort((a: any, b: any) => {
          // Sort theo category trước
          const categoryOrder = { 'POPCORN': 1, 'DRINKS': 2, 'COMBO': 3 };
          const categoryA = categoryOrder[a.category] || 999;
          const categoryB = categoryOrder[b.category] || 999;
          
          if (categoryA !== categoryB) {
            return categoryA - categoryB;
          }
          
          // Nếu cùng category thì sort theo tên
          return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
        });
        
        setConcessions(sortedConcessions);
      } catch (error) {
        console.error("Failed to load concessions:", error);
        // Fallback data nếu API fail - đã sort sẵn theo category và tên
        setConcessions([
          {
            concessionId: 1,
            name: "Popcorn Traditional",
            description: "Bắp rang bơ truyền thống",
            price: 45000,
            imageUrl: "/images/concessions/popcorn-traditional.jpg",
            category: "POPCORN"
          },
          {
            concessionId: 2,
            name: "Coca Cola",
            description: "Nước ngọt Coca Cola",
            price: 25000,
            imageUrl: "/images/concessions/coca-cola.jpg",
            category: "DRINKS"
          },
          {
            concessionId: 3,
            name: "Pepsi",
            description: "Nước ngọt Pepsi",
            price: 25000,
            imageUrl: "/images/concessions/pepsi.jpg",
            category: "DRINKS"
          }
        ]);
      }
    };
    
    loadConcessions();
  }, [fetchConcessions]);

  // Lấy movie details từ API
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movieId) {
        console.log('No movieId found, using fallback data');
        setMovieDetails({
          title: "Unknown Movie",
          posterUrl: "/popcorn.jpg"
        });
        return;
      }
      try {
        const res = await MovieApiService.getMovieById(movieId);
        if (res.success && res.data) {
          setMovieDetails(res.data);
        } else {
          setMovieDetails({
            title: "Unknown Movie",
            posterUrl: "/popcorn.jpg"
          });
        }
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
        setMovieDetails({
          title: "Unknown Movie",
          posterUrl: "/popcorn.jpg"
        });
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

  // Fallback nếu không có dữ liệu
  if (!concessions || concessions.length === 0) {
    return (
      <div className="bg-[#151a23] text-white min-h-screen px-1 sm:px-2 md:px-8 pt-2">
        <div className="max-w-xs md:max-w-7xl mx-auto">
          <div className="text-center py-8">
            <h2 className="text-xl font-bold mb-4">Loading Concessions...</h2>
            <p className="text-gray-400">Please wait while we load the menu</p>
            {error && <p className="text-red-400 mt-2">Error: {error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#151a23] text-white min-h-screen px-1 sm:px-2 md:px-8 pt-2 pb-12">
        <div className="max-w-xs md:max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-8 bg-[#151a23] rounded-xl">
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
          <div className="lg:col-span-1 h-full flex items-stretch w-full max-w-xs md:max-w-full mx-auto md:mx-0">
            <OrderSummary 
              movieDetails={movieSummary} 
              totalOrder={bookingData.finalAmount || 0}
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
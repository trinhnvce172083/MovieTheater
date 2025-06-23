"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MovieDetailsApiService, type MovieDetails } from "@/api/movie-details-api";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";

interface Showtime {
  id: string;
  time: string;
  date: string;
  cinema: string;
  room: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
}

// Mock data for showtimes - bạn có thể thay thế bằng API thực tế
const mockShowtimes: Showtime[] = [
  {
    id: "1",
    time: "09:00",
    date: "2024-12-24",
    cinema: "CGV Vincom Center",
    room: "Phòng 1",
    availableSeats: 45,
    totalSeats: 80,
    price: 120000,
  },
  {
    id: "2", 
    time: "12:30",
    date: "2024-12-24",
    cinema: "CGV Vincom Center",
    room: "Phòng 2",
    availableSeats: 60,
    totalSeats: 100,
    price: 130000,
  },
  {
    id: "3",
    time: "15:45",
    date: "2024-12-24", 
    cinema: "CGV Vincom Center",
    room: "Phòng 1",
    availableSeats: 25,
    totalSeats: 80,
    price: 150000,
  },
  {
    id: "4",
    time: "19:00",
    date: "2024-12-24",
    cinema: "CGV Vincom Center", 
    room: "Phòng 3",
    availableSeats: 70,
    totalSeats: 120,
    price: 180000,
  },
  {
    id: "5",
    time: "21:30",
    date: "2024-12-24",
    cinema: "CGV Vincom Center",
    room: "Phòng 2", 
    availableSeats: 15,
    totalSeats: 100,
    price: 200000,
  },
];

export default function ShowtimeSelectionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const movieId = searchParams.get("movieId");
  
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) {
      setError("Không có thông tin phim");
      setLoading(false);
      return;
    }

    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const response = await MovieDetailsApiService.getMovieDetails(movieId);
        
        if (response.success) {
          setMovie(response.data);
        } else {
          setError(response.message || "Không thể tải thông tin phim");
        }
      } catch (err) {
        setError("Lỗi kết nối API");
        console.error("Error fetching movie details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  const handleShowtimeSelect = (showtimeId: string) => {
    setSelectedShowtime(showtimeId);
  };

  const handleProceedToSeatSelection = () => {
    if (selectedShowtime && movieId) {
      router.push(`/booking/seat-selection?movieId=${movieId}&showtimeId=${selectedShowtime}`);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0D062D] text-white">
          <div className="container mx-auto px-4 py-10">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-8 w-64 bg-gray-700 mb-8" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full bg-gray-700" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !movie) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0D062D] text-white flex items-center justify-center">
          <Card className="max-w-md w-full bg-[#1E1B3A] border-red-500/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 text-6xl">😞</div>
              <CardTitle className="text-red-400">{error}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Button asChild size="lg" className="w-full">
                <Link href="/">← Quay về trang chủ</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0D062D] text-white">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto">
            {/* Movie Info Header */}
            <Card className="mb-8 bg-[#1E1B3A] border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-24 h-36 object-cover rounded-lg"
                  />
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                    <div className="flex items-center gap-4 text-gray-300">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {movie.formattedDuration}
                      </span>
                      <Badge variant="outline">{movie.rating}</Badge>
                      <span>{movie.genre}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Showtime Selection */}
            <Card className="bg-[#1E1B3A] border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-purple-400" />
                  Chọn lịch chiếu
                </CardTitle>
                <CardDescription>
                  Chọn thời gian và phòng chiếu phù hợp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockShowtimes.map((showtime) => (
                    <Card
                      key={showtime.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        selectedShowtime === showtime.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-600 hover:border-purple-400 bg-[#2A2654]'
                      }`}
                      onClick={() => handleShowtimeSelect(showtime.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">
                                {showtime.time}
                              </div>
                              <div className="text-sm text-gray-400">
                                {new Date(showtime.date).toLocaleDateString("vi-VN")}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-gray-300">
                                <MapPin className="h-4 w-4" />
                                <span>{showtime.cinema}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-300">
                                <Users className="h-4 w-4" />
                                <span>{showtime.room}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-400">
                              {showtime.price.toLocaleString("vi-VN")} VNĐ
                            </div>
                            <div className="text-sm text-gray-400">
                              Còn {showtime.availableSeats}/{showtime.totalSeats} ghế
                            </div>
                            <div className="mt-2">
                              <Badge 
                                variant={showtime.availableSeats > 20 ? "default" : "destructive"}
                                className={showtime.availableSeats > 20 ? "bg-green-600" : ""}
                              >
                                {showtime.availableSeats > 20 ? "Còn nhiều ghế" : "Sắp hết ghế"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8 justify-between">
                  <Button variant="outline" asChild>
                    <Link href={`/movies/${movieId}`}>
                      ← Quay lại
                    </Link>
                  </Button>
                  
                  <Button 
                    onClick={handleProceedToSeatSelection}
                    disabled={!selectedShowtime}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Tiếp tục chọn ghế →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MovieDetailsApiService, type MovieDetails } from "@/api/movie-details-api";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import ShowtimePickerModal from "@/components/ShowtimePickerModal";
import { useRouter } from "next/navigation";
import type { Schedule } from "@/types/schedule";

// Shadcn components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface MovieDetailTemplateProps {
  movieId: string | number;
}

export default function MovieDetailTemplate({ movieId }: MovieDetailTemplateProps) {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  const formatTrailerUrl = (url: string) => {
    if (!url) return "";
    
    // Chuyển đổi YouTube URLs
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0D062D] text-white">
          {/* Hero Skeleton */}
          <div className="h-[60vh] bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center">
            <Skeleton className="h-16 w-96 bg-gray-700" />
          </div>

          <div className="container mx-auto px-4 py-10">
            <Card className="max-w-7xl mx-auto bg-[#1E1B3A] border-gray-700">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row gap-10">
                  {/* Poster Skeleton */}
                  <div className="flex-shrink-0">
                    <Skeleton className="w-[300px] h-[450px] bg-gray-700 rounded-lg" />
                  </div>
                  
                  {/* Content Skeleton */}
                  <div className="flex-1 space-y-6">
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-32 bg-gray-700" />
                      <Skeleton className="h-4 w-full bg-gray-700" />
                      <Skeleton className="h-4 w-3/4 bg-gray-700" />
                      <Skeleton className="h-4 w-1/2 bg-gray-700" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Skeleton className="h-4 w-4 bg-gray-700" />
                          <Skeleton className="h-4 w-20 bg-gray-700" />
                          <Skeleton className="h-4 w-24 bg-gray-700" />
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-4">
                      <Skeleton className="h-12 w-32 bg-gray-700 rounded-full" />
                      <Skeleton className="h-12 w-24 bg-gray-700 rounded-full" />
                      <Skeleton className="h-12 w-28 bg-gray-700 rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Trailer Skeleton */}
            <Card className="mt-16 max-w-6xl mx-auto bg-[#1E1B3A] border-gray-700">
              <CardContent className="p-8">
                <Skeleton className="h-8 w-64 bg-gray-700 mx-auto mb-8" />
                <Skeleton className="aspect-video w-full bg-gray-700 rounded-lg" />
              </CardContent>
            </Card>
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
        <div className="min-h-screen bg-[#0D062D] text-white flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-[#1E1B3A] border-red-500/20 animate-fadeIn">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 text-6xl">😞</div>
              <CardTitle className="text-red-400 text-xl">
                {error || "Không tìm thấy phim"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Đã xảy ra lỗi khi tải thông tin phim
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Button asChild size="lg" className="w-full">
                <Link href="/movies">
                  ← Quay lại danh sách phim
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => window.location.reload()}
              >
                🔄 Thử lại
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
        {/* Hero Section với Backdrop */}
        <div 
          className="relative h-[20vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(13, 6, 45, 0.7), rgba(13, 6, 45, 0.8)), url(${movie.posterUrl})`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-5xl font-bold text-center animate-fadeInUp px-4">
              {movie.title.toUpperCase()}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <Card className="max-w-7xl mx-auto bg-[#1E1B3A] border-gray-700 animate-slideInUp">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-10">
                {/* Poster bên trái */}
                <div className="relative group animate-scaleIn flex-shrink-0">
                  <div className="relative overflow-hidden rounded-xl">
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title}
                      width={300}
                      height={450}
                      className="w-[300px] h-[450px] object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-movie.jpg";
                      }}
                    />
                    
                    {/* Badges */}
                    {/* <div className="absolute top-3 left-3 space-y-2">
                      {movie.isFeatured && (
                        <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white animate-pulse">
                          ⭐ NỔI BẬT
                        </Badge>
                      )}
                    </div> */}
                    
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold">
                        {movie.rating}
                      </Badge>
                    </div>
                    
                    {/* Overlay hiệu ứng */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>

                {/* Chi tiết bên phải */}
                <div className="flex-1 space-y-8 animate-fadeInRight">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-[#2A2654]">
                      <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-600">
                        📋 Tổng quan
                      </TabsTrigger>
                      <TabsTrigger value="details" className="text-white data-[state=active]:bg-purple-600">
                        📊 Chi tiết
                      </TabsTrigger>
                      <TabsTrigger value="rating" className="text-white data-[state=active]:bg-purple-600">
                        ⭐ Đánh giá
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-6">
                      <Card className="bg-[#2A2654] border-purple-500/20">
                        <CardHeader>
                          <CardTitle className="text-purple-300 flex items-center gap-2">
                            🎬 Nội dung phim
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 leading-relaxed">
                            {movie.description}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-[#2A2654] border-purple-500/20">
                        <CardHeader>
                          <CardTitle className="text-purple-300 flex items-center gap-2">
                            🎭 Thông tin cơ bản
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">🎭 Thể loại:</span>
                                <Badge variant="outline" className="text-purple-300 border-purple-500">
                                  {movie.genre}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">🎬 Đạo diễn:</span>
                                <span className="text-white font-medium">{movie.director}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">⏱️ Thời gian:</span>
                                <Badge variant="secondary">
                                  {movie.formattedDuration || `${movie.duration} phút`}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">🌍 Ngôn ngữ:</span>
                                <span className="text-white font-medium">{movie.language}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">🏴 Quốc gia:</span>
                                <span className="text-white font-medium">{movie.country}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">📅 Khởi chiếu:</span>
                                <span className="text-white font-medium">
                                  {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="details" className="space-y-6">
                      <Card className="bg-[#2A2654] border-purple-500/20">
                        <CardHeader>
                          <CardTitle className="text-purple-300 flex items-center gap-2">
                            🎪 Diễn viên & Crew
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Diễn viên chính:</h4>
                              <p className="text-white">{movie.cast}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Hãng sản xuất:</h4>
                              <p className="text-white">{movie.productionCompany || 'Chưa cập nhật'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-[#2A2654] border-purple-500/20">
                        <CardHeader>
                          <CardTitle className="text-purple-300 flex items-center gap-2">
                            💰 Thống kê phim
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-[#1E1B3A] rounded-lg">
                              <p className="text-gray-400 text-sm">Giá vé</p>
                              <p className="text-green-400 font-bold text-lg">
                                {movie.price ? movie.price.toLocaleString("vi-VN") : '0'} VNĐ
                              </p>
                            </div>
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            
                            
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="rating" className="space-y-6">
                      <Card className="bg-[#2A2654] border-purple-500/20">
                        <CardHeader>
                          <CardTitle className="text-purple-300 flex items-center gap-2">
                            ⭐ Điểm đánh giá
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center space-y-4">
                            <div className="text-6xl font-bold text-yellow-400">
                              {movie.imdbRating || 0}
                            </div>
                            <div className="text-gray-400">
                              <span className="text-xl">/10</span>
                              <p className="text-sm mt-1">IMDB Rating</p>
                            </div>
                            <Progress 
                              value={(movie.imdbRating || 0) * 10} 
                              className="w-full max-w-md mx-auto"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                  
                  {/* Status and Action Badges */}
                  <div className="flex flex-wrap items-center gap-4">
                    <Badge 
                      variant={movie.isNowShowing ? "default" : movie.isComingSoon ? "secondary" : "outline"}
                      className={`px-4 py-2 ${
                        movie.isNowShowing ? 'bg-green-600 text-white animate-pulse' : 
                        movie.isComingSoon ? 'bg-orange-600 text-white' : 'bg-gray-600 text-white'
                      }`}
                    >
                      {movie.isNowShowing ? '🎬 ĐANG CHIẾU' : movie.isComingSoon ? '⏰ SẮP CHIẾU' : '📼 KẾT THÚC'}
                    </Badge>

                  </div>

                  {/* Nút hành động */}
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                      onClick={() => setIsModalOpen(true)}
                    >
                      🎟 ĐẶT VÉ NGAY
                    </Button>
                    

                    
                    <Button 
                      asChild 
                      variant="outline" 
                      size="lg" 
                      className="border-gray-600 text-black-300 hover:bg-gray-700 hover:text-white transition-all duration-300"
                    >
                      <Link href="/">
                        ← QUAY LẠI
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>

            {/* Video Trailer */}
            <Card className="mt-16 max-w-6xl mx-auto bg-[#1E1B3A] border-gray-700 animate-fadeInUp">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🎬 TRAILER CHÍNH THỨC
                </CardTitle>
                <CardDescription className="text-center text-gray-400">
                  Xem trailer để có cái nhìn tổng quan về phim
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl group">
                  <iframe
                    width="100%"
                    height="100%"
                    src={formatTrailerUrl(movie.trailerUrl)}
                    title={`${movie.title} Trailer`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <ShowtimePickerModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          movieTitle={movie.title}
          movieId={movieId}
          onContinue={(schedule: Schedule) => {
            setIsModalOpen(false);
            if (!schedule.cinemaRoomId) {
              return;
            }
            router.push(
              `/booking/seat-selection?scheduleId=${schedule.scheduleId}&roomId=${schedule.cinemaRoomId}`
            );
          }}
        />
        <Footer />
      </>
    );
  } 
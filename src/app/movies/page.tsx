"use client";

import React, { useEffect, useState } from "react";
import { Card, Typography, Button, Space, Tag } from "antd";
import { useRouter } from "next/navigation";
import { MovieApiService } from "@/api/movie-api";
import { Clock, Calendar, Star } from "lucide-react";

const { Title, Text } = Typography;

interface Movie {
  movieId: number;
  title: string;
  originalTitle: string;
  description: string;
  duration: number;
  rating: string;
  genres: string;
  director: string;
  posterUrl: string;
  trailerUrl: string;
  releaseDate: string;
  isActive: boolean;
  isFeatured: boolean;
}

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await MovieApiService.getAllMovies();
        if (response.success && response.data) {
          setMovies(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleBookNow = (movieId: number) => {
    router.push(`/movies/${movieId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} loading={true} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-4">
          Tất cả phim
        </Title>
        <Text className="text-gray-400 text-lg">
          Khám phá bộ sưu tập phim đa dạng của chúng tôi
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((movie) => (
          <Card
            key={movie.movieId}
            className="bg-[#23283a] border-gray-700 hover:border-gray-600 transition-colors"
            cover={
              <div className="relative">
                <img
                  alt={movie.title}
                  src={movie.posterUrl || "/popcorn.jpg"}
                  className="h-80 w-full object-cover"
                />
                {movie.isFeatured && (
                  <Tag
                    color="gold"
                    className="absolute top-2 right-2"
                  >
                    Nổi bật
                  </Tag>
                )}
              </div>
            }
            actions={[
              <Button
                key="book"
                type="primary"
                onClick={() => handleBookNow(movie.movieId)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Đặt vé
              </Button>
            ]}
          >
            <div className="space-y-3">
              <Title level={4} className="text-white mb-2">
                {movie.title}
              </Title>
              
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{movie.duration} phút</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{movie.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400" />
                <Text className="text-gray-400 text-sm">
                  {movie.genres}
                </Text>
              </div>
              
              <Text className="text-gray-400 text-sm line-clamp-2">
                {movie.description}
              </Text>
              
              <div className="flex items-center justify-between">
                <Text className="text-gray-500 text-xs">
                  Đạo diễn: {movie.director}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {new Date(movie.releaseDate).getFullYear()}
                </Text>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

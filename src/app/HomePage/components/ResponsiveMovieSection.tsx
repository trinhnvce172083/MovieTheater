"use client";

import React from "react";
import { Card, Typography, Button } from "antd";
import { useRouter } from "next/navigation";
import { Clock, Calendar } from "lucide-react";

const { Title, Text } = Typography;

interface Movie {
  movieId: number;
  title: string;
  posterUrl: string;
  duration: number;
  rating: string;
  genres: string;
}

interface ResponsiveMovieSectionProps {
  title: string;
  movies: Movie[];
  loading: boolean;
}

export default function ResponsiveMovieSection({ title, movies, loading }: ResponsiveMovieSectionProps) {
  const router = useRouter();

  const handleMovieClick = (movieId: number) => {
    router.push(`/movies/${movieId}`);
  };

  if (loading) {
    return (
      <div className="mb-8">
        <Title level={2} className="text-white mb-6">{title}</Title>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, index) => (
            <Card key={index} loading={true} />
          ))}
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <Title level={2} className="text-white mb-6">{title}</Title>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <div key={movie.movieId} className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={movie.posterUrl || "/popcorn.jpg"}
                alt={movie.title}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                onClick={() => handleMovieClick(movie.movieId)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                <Button
                  onClick={() => handleMovieClick(movie.movieId)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
            
            <div className="mt-3">
              <Title level={5} className="text-white truncate mb-1">
                {movie.title}
              </Title>
              <div className="flex items-center gap-3 text-gray-400 text-xs">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{movie.duration} phút</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{movie.rating}</span>
                </div>
              </div>
              <Text className="text-gray-500 text-xs truncate block mt-1">
                {movie.genres}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

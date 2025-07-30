"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

interface Movie {
  movieId: number;
  title: string;
  posterUrl: string;
  duration: number;
  rating: string;
  genres: string;
}

interface NowShowingContainerProps {
  movies: Movie[];
  loading: boolean;
}

export default function NowShowingContainer({ movies, loading }: NowShowingContainerProps) {
  const router = useRouter();

  const handleBooking = (movieId: number) => {
    router.push(`/movies/${movieId}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-300 h-64 rounded-lg mb-2"></div>
            <div className="bg-gray-300 h-4 rounded mb-1"></div>
            <div className="bg-gray-300 h-3 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <div key={movie.movieId} className="group relative">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={movie.posterUrl || "/popcorn.jpg"}
              alt={movie.title}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
              <Button
                onClick={() => handleBooking(movie.movieId)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              >
                Đặt vé
              </Button>
            </div>
          </div>
          
          <div className="mt-3">
            <h3 className="font-semibold text-lg text-white truncate">{movie.title}</h3>
            <div className="flex items-center gap-4 text-gray-400 text-sm mt-1">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{movie.duration} phút</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{movie.rating}</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-1 truncate">{movie.genres}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

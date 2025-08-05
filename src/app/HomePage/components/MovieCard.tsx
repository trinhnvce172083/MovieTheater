"use client";

import Image from "next/image";
import { Star, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Movie } from "@/types/NowShowing/movie";
import Link from "next/link";
import { memo, useMemo, useCallback } from "react";

interface MovieCardProps {
  movie: Movie;
  onViewDetails?: (movieId: string) => void;
}

export const MovieCard = memo(function MovieCard({ movie, onViewDetails }: MovieCardProps) {
  const cardStyle = useMemo(() => ({ width: '100%' }), []);
  
  const ratingColor = useMemo(() => {
    switch (movie.rating) {
      case "G": return "bg-green-500";
      case "PG": return "bg-blue-500";
      case "PG-13": return "bg-yellow-500";
      case "R": return "bg-red-500";
      default: return "bg-gray-500";
    }
  }, [movie.rating]);

  const formattedPrice = useMemo(() => {
    const numPrice = Number(movie.price || 0);
    return numPrice.toLocaleString('vi-VN') + ' VND';
  }, [movie.price]);

  const genreArr = useMemo(() => {
    if (Array.isArray(movie.genres)) {
      return movie.genres.filter(Boolean).map((g) => g.trim());
    }
    if (typeof movie.genres === "string") {
      return movie.genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);
    }
    return [];
  }, [movie.genres]);

  const releaseYear = useMemo(() => {
    return movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '2025';
  }, [movie.releaseDate]);

  const handleViewDetails = useCallback(() => {
    if (onViewDetails) {
      onViewDetails(movie.movieId?.toString() || '');
    }
  }, [onViewDetails, movie.movieId]);

  const movieDetailsUrl = `/movies/${movie.movieId || ''}`;
  const imageUrl = movie.posterUrl || "/default-movie-poster.jpg";

  return (
    <Card 
      className="w-full min-h-[420px] sm:min-h-[480px] flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-b from-gray-900 to-black border border-orange-500/20 shadow-xl hover:shadow-orange-900/30 hover:border-orange-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] group" 
      style={cardStyle}
    >
      <Link href={movieDetailsUrl} className="block">
        {/* Movie Poster */}
        <div className="relative w-full h-[280px] sm:h-[320px] md:h-[360px] overflow-hidden">
          <Image
            src={imageUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 280px, (max-width: 768px) 300px, 340px"
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            priority={movie.isFeatured}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            {movie.isFeatured && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold z-10 text-xs shadow-lg">
                ⭐ Nổi Bật
              </Badge>
            )}
            <Badge className={`${ratingColor} text-white font-bold z-10 text-xs shadow-lg ml-auto`}>
              {movie.rating}
            </Badge>
          </div>

          {/* IMDB Rating */}
          <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 z-10 shadow-lg">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-bold">
              {movie.imdbRating}
            </span>
          </div>

          {/* Quick action overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              Xem Chi Tiết
            </div>
          </div>
        </div>
      </Link>

      {/* Movie Info */}
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3 min-h-[140px] sm:min-h-[160px] flex flex-col justify-between">
        <div>
          <Link href={movieDetailsUrl} className="block">
            <h3 className="text-white font-bold text-sm sm:text-base line-clamp-1 group-hover:text-orange-400 transition-colors mb-2">
              {movie.title}
            </h3>
          </Link>

          {/* Genres */}
          <div className="flex flex-wrap gap-1 mb-2">
            {genreArr.slice(0, 2).map((genre) => (
              <Badge
                key={genre}
                variant="outline"
                className="text-[9px] sm:text-[10px] py-0.5 px-2 border-orange-500/40 text-orange-300 bg-orange-500/10"
              >
                {genre}
              </Badge>
            ))}
            {genreArr.length > 2 && (
              <Badge
                variant="outline"
                className="text-[9px] sm:text-[10px] py-0.5 px-2 border-orange-500/40 text-orange-300 bg-orange-500/10"
              >
                +{genreArr.length - 2}
              </Badge>
            )}
          </div>

          {/* Movie Details */}
          <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-orange-400" />
              <span>{movie.formattedDuration || '1h 41m'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-orange-400" />
              <span>{releaseYear}</span>
            </div>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-orange-500/30">
          <div className="text-orange-400 font-bold text-xs sm:text-sm">
            {formattedPrice}
          </div>
          <Link href={movieDetailsUrl}>
            <Button
              size="sm"
              className="h-7 sm:h-8 px-3 sm:px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-[10px] sm:text-xs font-bold transition-all duration-200 hover:scale-105 shadow-lg"
              onClick={handleViewDetails}
            >
              Đặt Vé
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});

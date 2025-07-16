"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Movie } from "@/types/NowShowing/movie";
import { memo, useCallback } from "react";

interface MovieCardProps {
  movie: Movie;
  onBookNow?: (movieId: string) => void;
}

function MovieCardComponent({ movie, onBookNow }: MovieCardProps) {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "G":
        return "bg-green-500";
      case "PG":
        return "bg-blue-500";
      case "PG-13":
        return "bg-yellow-500";
      case "R":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleBookNow = useCallback(() => {
    onBookNow?.(movie.movieId);
  }, [movie.movieId, onBookNow]);
  // Đảm bảo thể loại phim là một mảng
  const genreArr = Array.isArray(movie.genre)
    ? movie.genre
    : (typeof movie.genre === "string" ? movie.genre : "")
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);

  const imageUrl = movie.posterUrl || ""; // hoặc movie.imageUrl

  return (
    <Card className="bg-gray-900/80 border-orange-500/20 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group overflow-hidden">
      <CardContent className="p-0">
        {/* Poster phim */}
        <div className="relative overflow-hidden">
          <div className="aspect-[3/4] relative">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={movie.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                priority={movie.isFeatured}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Nhãn phim nổi bật */}
            {movie.isFeatured && (
              <Badge className="absolute top-2 left-2 bg-orange-500 text-black font-semibold text-xs sm:text-sm">
                Featured
              </Badge>
            )}

            {/* Nhãn xếp hạng */}
            <Badge
              className={`absolute top-2 right-2 ${getRatingColor(
                movie.rating
              )} text-white font-semibold text-xs sm:text-sm`}
            >
              {movie.rating}
            </Badge>

            {/* Điểm IMDB */}
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
              <span className="text-white text-xs sm:text-sm font-semibold">
                {movie.imdbRating}
              </span>
            </div>
          </div>
        </div>

        {/* Thông tin phim */}
        <div className="p-3 sm:p-4 lg:p-5">
          <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg mb-2 line-clamp-2 group-hover:text-orange-300 transition-colors">
            {movie.title}
          </h3>

          {/* Thể loại */}
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
            {genreArr.slice(0, 2).map((genre) => (
              <Badge
                key={genre}
                variant="outline"
                className="text-xs border-orange-500/30 text-orange-300 hover:bg-orange-500/10 transition-colors"
              >
                {genre}
              </Badge>
            ))}
            {genreArr.length > 2 && (
              <Badge
                variant="outline"
                className="text-xs border-orange-500/30 text-orange-300"
              >
                +{genreArr.length - 2}
              </Badge>
            )}
          </div>

          {/* Chi tiết phim */}
          <div className="space-y-2 text-xs sm:text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
              <span>{movie.formattedDuration}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
            </div>
          </div>

          {/* Giá và nút hành động */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-orange-500/20 gap-3 sm:gap-0">
            <div className="text-orange-400 font-bold text-base sm:text-lg">
              {typeof movie.price === "number"
                ? `$${movie.price.toFixed(2)}`
                : "Đang cập nhật"}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={handleBookNow}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors duration-200 text-xs sm:text-sm"
              >
                Book Now
              </Button>
              <Link href={`/movies/${movie.movieId}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500 transition-colors duration-200 text-xs sm:text-sm"
                >
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Xuất component với memo để tối ưu hiệu năng render
export const MovieCard = memo(MovieCardComponent);

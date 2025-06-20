"use client";

import Image from "next/image";
import { Star, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Movie } from "@/types/NowShowing/movie";
import { memo, useCallback } from "react";

// Simple blur placeholder for better user experience
const BLUR_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEwgJ5i4Fx7AAAAABJRU5ErkJggg==";

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

  // Ensure genre is an array
  const genreArr = Array.isArray(movie.genre)
    ? movie.genre
    : (typeof movie.genre === "string" ? movie.genre : "")
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);

  const imageUrl = movie.posterUrl || ""; // or movie.imageUrl

  return (
    <Card className="bg-gray-900/80 border-orange-500/20 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
      <CardContent className="p-0">
        {/* Movie Poster */}
        <div className="relative overflow-hidden rounded-t-lg">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={movie.title}
              width={300}
              height={450}
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              priority={movie.isFeatured}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}

          {/* Featured Badge */}
          {movie.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-orange-500 text-black font-semibold">
              Featured
            </Badge>
          )}

          {/* Rating Badge */}
          <Badge
            className={`absolute top-2 right-2 ${getRatingColor(
              movie.rating
            )} text-white font-semibold`}
          >
            {movie.rating}
          </Badge>

          {/* IMDB Rating */}
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-semibold">
              {movie.imdbRating}
            </span>
          </div>
        </div>

        {/* Movie Info */}
        <div className="p-4">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-300 transition-colors">
            {movie.title}
          </h3>

          {/* Genres */}
          <div className="flex flex-wrap gap-1 mb-3">
            {genreArr.slice(0, 2).map((genre) => (
              <Badge
                key={genre}
                variant="outline"
                className="text-xs border-orange-500/30 text-orange-300"
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

          {/* Movie Details */}
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-400" />
              <span>{movie.formattedDuration}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-400" />
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
            </div>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-orange-500/20">
            <div className="text-orange-400 font-bold text-lg">
              {typeof movie.price === "number"
                ? `$${movie.price.toFixed(2)}`
                : "Đang cập nhật"}
            </div>
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
              onClick={handleBookNow}
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>    </Card>
  );
}

export const MovieCard = memo(MovieCardComponent);

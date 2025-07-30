"use client";

import Image from "next/image";
import { Star, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Movie } from "@/types/NowShowing/movie";
import Link from "next/link";

interface MovieCardProps {
  movie: Movie;
  onViewDetails?: (movieId: string) => void;
}

export function MovieCard({ movie, onViewDetails }: MovieCardProps) {
  // Ensure the card takes full width of its container
  const cardStyle = {
    width: '100%'
  };
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

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(movie.movieId);
    }

  };

  // Format the price properly
  const formattedPrice = (price: number | string | undefined): string => {
    const numPrice = Number(price || 0);
    return numPrice.toLocaleString('vi-VN') + ' VND';
  };

  // Ensure genre is an array
  const genreArr = Array.isArray(movie.genre)
    ? movie.genre
    : (typeof movie.genre === "string" ? movie.genre : "")
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);

  const imageUrl = movie.posterUrl || ""; // or movie.imageUrl
  const movieDetailsUrl = `/movies/${movie.movieId || ''}`;

  return (
    <Card className="w-full min-h-[400px] sm:min-h-[480px] flex-shrink-0 rounded-xl overflow-hidden bg-black border border-orange-500/20 shadow-lg hover:shadow-orange-900/20 hover:border-orange-500/40 transition-all duration-300 transform hover:-translate-y-1 group" style={cardStyle}>
      <Link href={movieDetailsUrl} className="block">
        {/* Movie Poster */}
        <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] overflow-hidden">
          <Image
            src={imageUrl || "/default-image.png"}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 280px, (max-width: 768px) 300px, 320px"
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
            priority={movie.isFeatured}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Featured Badge */}
          {movie.isFeatured && (
            <Badge className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-orange-500 text-black font-semibold z-10 text-xs">
              Featured
            </Badge>
          )}

          {/* Rating Badge */}
          <Badge
            className={`absolute top-1 right-1 sm:top-2 sm:right-2 ${getRatingColor(
              movie.rating
            )} text-white font-semibold z-10 text-xs`}
          >
            {movie.rating}
          </Badge>

          {/* IMDB Rating */}
          <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 z-10">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-semibold">
              {movie.imdbRating}
            </span>
          </div>
        </div>
      </Link>      {/* Movie Info */}
      <CardContent className="p-2 sm:p-3 space-y-1.5 sm:space-y-2 min-h-[120px] sm:min-h-[160px] flex flex-col justify-between">
        <div>
          <Link href={movieDetailsUrl} className="block">
            <h3 className="text-white font-bold text-sm sm:text-base line-clamp-1 group-hover:text-orange-400 transition-colors">
              {movie.title}
            </h3>
          </Link>          {/* Genres */}
          <div className="flex flex-wrap gap-1 mt-1 sm:mt-1.5 mb-1">
            {genreArr.slice(0, 2).map((genre) => (
              <Badge
                key={genre}
                variant="outline"
                className="text-[9px] sm:text-[10px] py-0 border-orange-500/30 text-orange-300"
              >
                {genre}
              </Badge>
            ))}
            {genreArr.length > 2 && (
              <Badge
                variant="outline"
                className="text-[9px] sm:text-[10px] py-0 border-orange-500/30 text-orange-300"
              >
                +{genreArr.length - 2}
              </Badge>
            )}
          </div>

          {/* Movie Details */}          <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-1.5 mb-1 sm:mb-2">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-orange-400" />
              <span>{movie.formattedDuration || '1h 41m'}</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-orange-400" />
              <span>{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '2025'}</span>
            </div>
          </div>
        </div>        {/* Price and Action */}
        <div className="flex items-center justify-between pt-1.5 sm:pt-2 mt-auto border-t border-orange-500/20">
          <div className="text-orange-400 font-bold text-xs sm:text-sm">
            {formattedPrice(movie.price)}
          </div>
          <Link href={movieDetailsUrl}>
            <Button
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 bg-orange-500 hover:bg-orange-600 text-black text-[10px] sm:text-xs font-semibold"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

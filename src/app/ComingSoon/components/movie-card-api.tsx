"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Clock,
  Calendar,
  Eye,
  ShoppingCart,
  Zap,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Movie } from "@/types/NowShowing/movie";

interface MovieCardApiProps {
  movie: Movie;
  onBookNow?: (movieId: string) => void;
  isFeatured?: boolean;
}

export function MovieCardApi({
  movie,
  onBookNow,
  isFeatured = false,
}: MovieCardApiProps) {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "G":
        return "bg-green-500 hover:bg-green-600";
      case "PG":
        return "bg-blue-500 hover:bg-blue-600";
      case "PG-13":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "R":
        return "bg-red-500 hover:bg-red-600";
      case "NC-17":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const handleBookNow = () => {
    onBookNow?.(movie.movieId);
  };

  // Ensure genre is array
  const genreArr = Array.isArray(movie.genre)
    ? movie.genre
    : (typeof movie.genre === "string" ? movie.genre : "")
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);

  const imageUrl = movie.posterUrl || "";

  return (
    <Card
      className={`
      bg-gray-900/80 border-orange-500/20 hover:border-orange-500/50 
      transition-all duration-300 hover:scale-105 group relative overflow-hidden
      ${isFeatured ? "ring-2 ring-orange-500/30" : ""}
    `}
    >
      <CardContent className="p-0">
        {/* Movie Poster */}
        <div className="relative overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={movie.title}
              width={300}
              height={400}
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              priority={movie.isFeatured}
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">🎬</div>
                <div className="text-sm">No Image</div>
              </div>
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Featured Badge */}
          {movie.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-orange-500 text-black font-semibold animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}

          {/* Rating Badge */}
          <Badge
            className={`absolute top-2 right-2 ${getRatingColor(
              movie.rating
            )} text-white font-semibold transition-colors`}
          >
            {movie.rating}
          </Badge>

          {/* IMDB Rating */}
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-semibold">
              {movie.imdbRating.toFixed(1)}
            </span>
          </div>

          {/* Status Badge */}
          <div className="absolute bottom-2 right-2">
            <Badge
              variant="outline"
              className={`text-xs ${
                movie.status === "active"
                  ? "border-green-500/50 text-green-400 bg-green-500/10"
                  : "border-red-500/50 text-red-400 bg-red-500/10"
              }`}
            >
              {movie.status}
            </Badge>
          </div>

          {/* Hover Actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link href={`/movies/${movie.movieId}`}>
              <Button
                size="sm"
                variant="outline"
                className="bg-black/70 border-white/30 text-white hover:bg-white hover:text-black"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handleBookNow}
              className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Book
            </Button>
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
                className="text-xs border-orange-500/30 text-orange-300 hover:border-orange-500/50 transition-colors"
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
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-orange-400" />
              <span className="text-orange-400 font-bold text-lg">
                {movie.price.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2">
              <Link href={`/movies/${movie.movieId}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10 hover:border-orange-500/50"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/movies/${movie.movieId}`}>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
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

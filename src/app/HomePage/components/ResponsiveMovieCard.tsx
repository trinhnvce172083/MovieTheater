"use client";

import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/types/NowShowing/movie";
import { Calendar, Clock, Star } from "lucide-react";

interface ResponsiveMovieCardProps {
  movie: Movie;
  isUpcoming?: boolean;
}

export const ResponsiveMovieCard = memo(function ResponsiveMovieCard({
  movie,
  isUpcoming = false,
}: ResponsiveMovieCardProps) {
  const href = isUpcoming
    ? `/ComingSoon/${movie.movieId}`
    : `/movies/${movie.movieId}`;

  return (
    <Link href={href}>
      <div className="group cursor-pointer flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72">
        <div className="relative aspect-[3/4] mb-3 overflow-hidden rounded-lg">
          <Image
            src={movie.posterUrl || "/placeholder-movie.jpg"}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, 288px"
            loading="lazy"
            quality={85}
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center p-4">
              <p className="text-sm font-medium mb-2">
                {isUpcoming ? "Coming Soon" : "Now Showing"}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs">
                <Calendar size={14} />
                <span>{movie.releaseDate || "TBA"}</span>
              </div>
            </div>
          </div>

          {/* IMDB Rating Badge */}
          {movie.imdbRating && (
            <div className="absolute top-2 right-2 bg-yellow-500/90 text-black px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
              <Star size={12} fill="currentColor" />
              {movie.imdbRating}
            </div>
          )}

          {/* Duration Badge */}
          {movie.duration && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <Clock size={12} />
              {movie.duration}min
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="space-y-1">
          <h3 className="text-white font-medium text-sm sm:text-base line-clamp-2 group-hover:text-yellow-400 transition-colors">
            {movie.title}
          </h3>

          <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
            <span className="capitalize">
              {Array.isArray(movie.genre)
                ? movie.genre.join(", ")
                : movie.genre}
            </span>
            {movie.rating && (
              <>
                <span>•</span>
                <span className="bg-red-600 text-white px-1 py-0.5 rounded text-xs">
                  {movie.rating}
                </span>
              </>
            )}
          </div>

          {/* Release Date for Upcoming */}
          {isUpcoming && movie.releaseDate && (
            <div className="text-yellow-400 text-xs sm:text-sm">
              Releases: {new Date(movie.releaseDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

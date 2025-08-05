"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { MovieApiService } from "@/api/movie-api";
import type { Movie } from "@/types/NowShowing/movie";
import ClientCarousel from "./ClientCarousel";
import Image from "next/image";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import {
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

interface CarouselSlideProps {
  movie: Movie;
}

const CarouselSlide: React.FC<CarouselSlideProps> = React.memo(({ movie }) => {
  const releaseYear = useMemo(
    () => new Date(movie.releaseDate).getFullYear(),
    [movie.releaseDate]
  );
  const formattedPrice = useMemo(
    () => movie.price?.toLocaleString("vi-VN"),
    [movie.price]
  );

  return (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={movie.backdropUrl}
          alt={movie.title}
          style={{ objectFit: "fill" }}
          fill
          className="object-fill"
          priority
          sizes="100vw"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Movie Title */}
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 drop-shadow-2xl leading-tight">
              {movie.title}
            </h1>

            {/* Movie Info */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-3 md:mb-4 text-white/90">
              <div className="flex items-center gap-1.5">
                <CalendarOutlined className="text-orange-500 text-sm md:text-base" />
                <span className="text-sm md:text-base font-medium">
                  {releaseYear}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ClockCircleOutlined className="text-orange-500 text-sm md:text-base" />
                <span className="text-sm md:text-base font-medium">
                  {movie.formattedDuration}
                </span>
              </div>
              <div className="bg-orange-500 px-2 py-1 rounded-md text-xs md:text-sm font-bold text-black">
                {movie.rating}
              </div>
              <div className="text-yellow-400 font-bold text-sm md:text-base flex items-center gap-1">
                <span>⭐</span>
                <span>{movie.imdbRating}</span>
              </div>
            </div>

            {/* Genres */}
            <div className="mb-3 md:mb-4">
              <span className="text-white/80 text-sm md:text-base font-medium">
                {movie.genres}
              </span>
            </div>

            {/* Description */}
            <p className="text-white/90 text-sm md:text-base lg:text-lg mb-4 md:mb-6 line-clamp-2 md:line-clamp-3 leading-relaxed">
              {movie.description}
            </p>

            {/* Action Buttons */}
              <Link
                href={`${ROUTES.MOVIES}/${movie.movieId}`}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold border border-white/30 transition-all duration-200 hover:scale-105"
              >
                Đặt Vé Ngay
              </Link>
            </div>

            {/* Price */}
            <div className="mt-2">
              <span className="text-orange-400 font-bold text-lg md:text-xl">
                Từ {formattedPrice} VND
              </span>
            </div>
          </div>
        </div>
      </div>
  );
});

CarouselSlide.displayName = "CarouselSlide";

const HomepageCarousel: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await MovieApiService.getCarouselMovies();

      if (result.success) {
        setMovies(result.data);
      } else {
        setError(result.message || "Failed to fetch movies");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error fetching featured movies:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedMovies();
  }, [fetchFeaturedMovies]);

  const loadingComponent = useMemo(
    () => (
      <div className="h-[400px] md:h-[500px] lg:h-[600px] bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <div className="text-white text-lg">Đang tải...</div>
        </div>
      </div>
    ),
    []
  );

  const errorComponent = useMemo(
    () => (
      <div className="h-[400px] md:h-[500px] lg:h-[600px] bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">Lỗi: {error}</div>
          <button
            onClick={fetchFeaturedMovies}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    ),
    [error, fetchFeaturedMovies]
  );

  const emptyComponent = useMemo(
    () => (
      <div className="h-[400px] md:h-[500px] lg:h-[600px] bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Không có phim nào để hiển thị</div>
      </div>
    ),
    []
  );

  if (loading) return loadingComponent;
  if (error) return errorComponent;
  if (movies.length === 0) return emptyComponent;

  return (
    <div className="w-full">
      <ClientCarousel autoplay={true} effect="fade" autoplaySpeed={5000}>
        {movies.map((movie) => (
          <CarouselSlide key={movie.movieId} movie={movie} />
        ))}
      </ClientCarousel>
    </div>
  );
};

export default React.memo(HomepageCarousel);

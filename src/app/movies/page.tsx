"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MovieDetailsApiService, type MovieDetails } from "@/api/movie-details-api";

export default function MoviesPage() {
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllMovies = async () => {
      try {
        setLoading(true);
        const response = await MovieDetailsApiService.getAllMovies();
        
        if (response.success) {
          // Kiểm tra xem response.data có phải là array không
          const moviesData = Array.isArray(response.data)
            ? response.data
            : (response.data && typeof response.data === "object" && "movies" in response.data && Array.isArray((response.data as any).movies))
              ? (response.data as { movies: MovieDetails[] }).movies
              : [];
          setMovies(moviesData);
          console.log("Movies data:", moviesData);
        } else {
          setError(response.message || "Không thể tải danh sách phim");
        }
      } catch (err) {
        setError("Lỗi kết nối API");
        console.error("Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMovies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D062D] text-white flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-purple-600 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-purple-300 border-t-transparent animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
          </div>
          <p className="mt-6 text-xl animate-pulse">🎬 Đang tải danh sách phim...</p>
          <p className="mt-2 text-gray-400">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D062D] text-white flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="mb-6">
            <span className="text-6xl animate-bounce">😞</span>
          </div>
          <p className="text-red-400 text-2xl mb-4 font-bold">{error}</p>
          <p className="text-gray-400 mb-6">Đã xảy ra lỗi khi tải dữ liệu</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            🔄 Thử lại
          </button>
        </div>
      </div>
    );
  }

  const nowShowingMovies = Array.isArray(movies) ? movies.filter(movie => movie.isNowShowing) : [];
  const comingSoonMovies = Array.isArray(movies) ? movies.filter(movie => movie.isComingSoon) : [];

  return (
    <div className="min-h-screen bg-[#0D062D] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-16 animate-fadeInUp bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🎬 DANH SÁCH PHIM
        </h1>
        
        {/* Phim đang chiếu */}
        <section className="mb-16 animate-slideInUp">
          <h2 className="text-4xl font-bold mb-8 text-green-400 animate-fadeInRight">
            🎬 ĐANG CHIẾU ({nowShowingMovies.length} phim)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nowShowingMovies.map((movie, index) => (
              <Link 
                key={movie.movieId} 
                href={`/movies/MovieDetails/${getMovieSlug(movie.movieId)}`}
                className="group bg-gradient-to-br from-[#1E1B3A] to-[#2A2654] rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl movie-card animate-scaleIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-6">
                  <div className="relative group">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-20 h-28 object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-movie.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                      {movie.title}
                    </h3>
                    <div className="space-y-2">
                      <p className="flex items-center text-sm text-gray-300">
                        <span className="text-purple-400 mr-2">🎭</span>
                        {movie.genre}
                      </p>
                      <p className="flex items-center text-sm text-yellow-400">
                        <span className="mr-2">⭐</span>
                        {movie.imdbRating || 0}/10
                      </p>
                      <p className="flex items-center text-lg text-green-400 font-bold">
                        <span className="text-purple-400 mr-2">💰</span>
                        {movie.price ? movie.price.toLocaleString("vi-VN") : '0'} VNĐ
                      </p>
                      <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs rounded-full animate-pulse">
                        🎬 ĐANG CHIẾU
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Phim sắp chiếu */}
        <section className="mb-16 animate-slideInUp">
          <h2 className="text-4xl font-bold mb-8 text-orange-400 animate-fadeInRight">
            ⏰ SẮP CHIẾU ({comingSoonMovies.length} phim)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {comingSoonMovies.map((movie, index) => (
              <Link 
                key={movie.movieId} 
                href={`/movies/MovieDetails/${getMovieSlug(movie.movieId)}`}
                className="group bg-gradient-to-br from-[#1E1B3A] to-[#2A2654] rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl movie-card animate-scaleIn"
                style={{ animationDelay: `${(nowShowingMovies.length + index) * 0.1}s` }}
              >
                <div className="flex items-center space-x-6">
                  <div className="relative group">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-20 h-28 object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-movie.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-300 transition-colors">
                      {movie.title}
                    </h3>
                    <div className="space-y-2">
                      <p className="flex items-center text-sm text-gray-300">
                        <span className="text-orange-400 mr-2">🎭</span>
                        {movie.genre}
                      </p>
                      <p className="flex items-center text-sm text-yellow-400">
                        <span className="mr-2">⭐</span>
                        {movie.imdbRating || 0}/10
                      </p>
                      <p className="flex items-center text-sm text-orange-400 font-medium">
                        <span className="text-orange-400 mr-2">📅</span>
                        Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                      </p>
                      <span className="inline-block px-3 py-1 bg-orange-600 text-white text-xs rounded-full">
                        ⏰ SẮP CHIẾU
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="text-center mt-16 animate-fadeInUp">
          <div className="bg-gradient-to-r from-[#1E1B3A] to-[#2A2654] rounded-xl p-8 max-w-md mx-auto">
            <p className="text-xl text-gray-300 mb-2">
              📊 THỐNG KÊ TỔNG QUAN
            </p>
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">{nowShowingMovies.length}</p>
                <p className="text-sm text-gray-400">Đang chiếu</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-400">{comingSoonMovies.length}</p>
                <p className="text-sm text-gray-400">Sắp chiếu</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">{movies.length}</p>
                <p className="text-sm text-gray-400">Tổng cộng</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function để mapping movieId với slug
function getMovieSlug(movieId: number): string {
  const slugMap: { [key: number]: string } = {
    1: "ballerina",
    2: "howtotrainyourdragon", 
    3: "materialists",
    4: "28yearslater",
    5: "elio",
    6: "missionimpossible",
    7: "f1",
    8: "megan2",
    9: "jurassicworld",
    10: "superman",
    11: "ikwydls",
    12: "fantastic4"
  };
  
  return slugMap[movieId] || `movie-${movieId}`;
} 
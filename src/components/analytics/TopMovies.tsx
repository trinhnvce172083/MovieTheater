'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp } from 'lucide-react';
import PosterImage from '@/components/ui/poster-image';

// Import admin movie API to get featured movies
import { getMovies } from '@/api/admin/getAllMovies';
import type { Movie } from '@/api/admin/getAllMovies';

interface TopMoviesProps {
  limit?: number;
}

interface MoviePerformance {
  movieId: number;
  title: string;
  revenue: number;
  bookings: number;
  occupancyRate: number;
  posterUrl?: string;
  averageRating?: number;
  genre?: string;
}

const TopMovies: React.FC<TopMoviesProps> = ({ limit = 5 }) => {
  const [movies, setMovies] = useState<MoviePerformance[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to get poster image based on movie title
  const getPosterForMovie = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('avatar')) return '/posters/Avatar.jpg';
    if (titleLower.includes('avenger') || titleLower.includes('marvel')) return '/posters/Avenger.jpg';
    if (titleLower.includes('spider') || titleLower.includes('spiderman')) return '/posters/Spider-man.jpg';
    if (titleLower.includes('top gun') || titleLower.includes('topgun')) return '/posters/Topgun.jpeg';
    if (titleLower.includes('everything') || titleLower.includes('everywhere')) return '/posters/EEAAO.jpg';
    
    // Use Avatar.jpg as default fallback (exists in public/posters)
    return '/posters/Avatar.jpg';
  };

  // Transform Movie data to MoviePerformance format  
  const transformMovieToPerformance = useCallback((movie: Movie): MoviePerformance => {
    return {
      movieId: movie.movieId, // Already a number
      title: movie.title,
      revenue: Math.floor(Math.random() * 2000000) + 500000, // Mock revenue data
      bookings: Math.floor(Math.random() * 50000) + 10000, // Mock bookings data
      occupancyRate: Math.floor(Math.random() * 30) + 70, // Mock occupancy rate 70-100%
      posterUrl: movie.posterUrl || getPosterForMovie(movie.title),
      averageRating: movie.imdbRating || 4.5,
      genre: movie.genre || 'Action' // Already a string
    };
  }, []);

  useEffect(() => {
    const fetchTopMovies = async () => {
      try {
        console.log('🔄 Fetching featured movies from admin API...');
        
        // Use admin API to get all movies with large page size
        const result = await getMovies({
          page: 0,
          size: 100, // Get enough movies to find featured ones
          sortBy: 'movieId',
          sortDirection: 'desc'
        });
        
        if (result && result.content && Array.isArray(result.content)) {
          // Filter for featured movies only
          const featuredMovies = result.content.filter((movie: Movie) => movie.isFeatured === true);
          
          console.log(`📽️ Found ${featuredMovies.length} featured movies from ${result.content.length} total movies`);
          
          if (featuredMovies.length > 0) {
            // Transform featured movies to MoviePerformance format
            const moviesPerformance = featuredMovies
              .slice(0, limit) // Take only the limit number
              .map(transformMovieToPerformance);
            
            setMovies(moviesPerformance);
            console.log('✅ Featured movies data loaded:', moviesPerformance.length, 'movies');
          } else {
            console.warn('⚠️ No featured movies found');
            // Set empty array when no featured movies
            setMovies([]);
          }
        } else {
          console.warn('⚠️ No movies data from admin API');
          // Set empty array when no data
          setMovies([]);
        }
      } catch (error) {
        console.error('❌ Error fetching featured movies:', error);
        // Set empty array on error
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMovies();
  }, [limit, transformMovieToPerformance]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Featured Movies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-12 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Featured Movies
        </CardTitle>
      </CardHeader>
      <CardContent>
        {movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Star className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium mb-1">No Featured Movies This Week</p>
            <p className="text-sm text-gray-400">Check back later for featured content</p>
          </div>
        ) : (
          <div className="space-y-4">
            {movies.map((movie, index) => (
              <div key={movie.movieId} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                  <PosterImage
                    src={movie.posterUrl || '/posters/Avatar.jpg'}
                    alt={movie.title}
                    className="w-12 h-16 rounded-md"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{movie.title}</h4>
                  <p className="text-xs text-gray-500 mb-2">{movie.genre}</p>
                  
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 mr-1" />
                      <span>{movie.averageRating?.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-500">
                      {formatNumber(movie.bookings)} bookings
                    </span>
                    <span className="text-green-600 font-medium">
                      {movie.occupancyRate}% occupancy
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(movie.revenue)}
                  </p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
            
            {/* Show view all link for featured movies */}
            <div className="mt-4 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All Featured Movies →
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopMovies;

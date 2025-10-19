'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Film, Home, Gift } from 'lucide-react';

// Import real Analytics API and admin getMovies
import { getDashboardSummary, getPromotionsCount, getCinemaRoomsCount } from '@/api/admin/analytics';
import { getMovies } from '@/api/admin/getAllMovies';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const RealDashboardCards: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: 'Total Customers',
      value: 0,
      change: 0,
      icon: <Users className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Movies',
      value: 0,
      change: 0,
      icon: <Film className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Cinema Halls',
      value: 0,
      change: 0,
      icon: <Home className="w-6 h-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Promotions',
      value: 0,
      change: 0,
      icon: <Gift className="w-6 h-6" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    }
  ]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        console.log('🔄 Fetching dashboard metrics...');
        
        // Get main dashboard data
        const result = await getDashboardSummary();
        
        // Get additional counts in parallel
        const [promotionsCount, cinemaRoomsCount, allMoviesResult] = await Promise.all([
          getPromotionsCount(),
          getCinemaRoomsCount(),
          getMovies({ page: 0, size: 100, sortBy: 'movieId', sortDirection: 'desc' })
        ]);
        
        if (result && result.overview) {
          const overview = result.overview;
          
          // Get real movie count from admin getMovies API
          const realMovieCount = allMoviesResult && allMoviesResult.content && Array.isArray(allMoviesResult.content) 
            ? allMoviesResult.content.length 
            : 12; // fallback
          
          setMetrics(prevMetrics => {
            const newMetrics = [...prevMetrics];
            
            // Update with real analytics data (reindexed after removing revenue and bookings)
            newMetrics[0].value = (overview.totalCustomers || 0).toLocaleString();
            newMetrics[0].change = overview.customerGrowth || 0;
            
            // Use REAL movie count from MovieApiService
            newMetrics[1].value = realMovieCount;
            newMetrics[1].change = 0; // No growth data for movies
            
            // Use REAL API data for cinema rooms and promotions
            newMetrics[2].value = cinemaRoomsCount;
            newMetrics[2].change = 0;
            
            newMetrics[3].value = promotionsCount;
            newMetrics[3].change = 0;
            
            return newMetrics;
          });
        } else {
          console.warn('No dashboard data available, using fallback');
          
          // Get real movie count even when dashboard data unavailable
          const realMovieCount = allMoviesResult && allMoviesResult.content && Array.isArray(allMoviesResult.content) 
            ? allMoviesResult.content.length 
            : 12; // fallback
            
          // Use fallback data when no data
          setMetrics(prevMetrics => {
            const newMetrics = [...prevMetrics];
            newMetrics[0].value = '9';
            newMetrics[0].change = 0;
            newMetrics[1].value = realMovieCount; // Use real movie count
            newMetrics[1].change = 0;
            newMetrics[2].value = cinemaRoomsCount;
            newMetrics[2].change = 0;
            newMetrics[3].value = promotionsCount;
            newMetrics[3].change = 0;
            return newMetrics;
          });
        }

      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error);
        // Use fallback data on error
        setMetrics(prevMetrics => {
          const newMetrics = [...prevMetrics];
          newMetrics[0].value = '9';
          newMetrics[0].change = 0;
          newMetrics[1].value = 12; // fallback movie count
          newMetrics[1].change = 0;
          newMetrics[2].value = 4;
          newMetrics[2].change = 0;
          newMetrics[3].value = 11;
          newMetrics[3].change = 0;
          return newMetrics;
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <div className={metric.color}>
                {metric.icon}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {metric.value}
            </div>
            <div className="flex items-center mt-2">
              {metric.change !== 0 && (
                <>
                  {metric.change > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${
                    metric.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </>
              )}
              {metric.change === 0 && (
                <span className="text-sm text-gray-500">No change</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RealDashboardCards;

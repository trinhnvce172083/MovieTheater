'use client';

import React, { useEffect, useState } from 'react';
import { Film, Users, Calendar, Star } from 'lucide-react';

// Import real Analytics API
import { getDashboardSummary } from '@/api/admin/analytics';

interface QuickStatsProps {
  // Removed token prop as it's handled by axios interceptor
}

interface QuickStat {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const QuickStats: React.FC<QuickStatsProps> = () => {
  const [stats, setStats] = useState<QuickStat[]>([
    {
      title: 'Active Movies',
      value: 0,
      subtitle: 'movies',
      icon: <Film className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Customers',
      value: 0,
      subtitle: 'users',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Cinema Rooms',
      value: 0,
      subtitle: 'rooms',
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Average Rating',
      value: 0,
      subtitle: '⭐ rating',
      icon: <Star className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        console.log('🔄 Fetching dashboard analytics...');
        
        // Get token from localStorage
        const authToken = localStorage.getItem('accessToken');
        console.log('Token check:', authToken ? 'Token found' : 'No token');
        
        if (!authToken) {
          console.warn('No auth token available, using fallback data');
          // Fallback values when no token
          setStats(prevStats => {
            const newStats = [...prevStats];
            newStats[0].value = 12;
            newStats[1].value = 250;
            newStats[2].value = 8;
            newStats[3].value = 4.5;
            return newStats;
          });
          return;
        }

        console.log('Calling getDashboardSummary...');
        const result = await getDashboardSummary();
        console.log('API Response:', result);
        
        if (result && result.overview) {
          console.log('Updating stats with real data:', result.overview);
          setStats(prevStats => {
            const newStats = [...prevStats];
            
            // Update with real analytics data
            newStats[0].value = result.overview.activeMovies || 0; // Active Movies
            newStats[1].value = result.overview.totalCustomers || 0; // Total Customers  
            newStats[2].value = result.overview.totalShows || 0; // Total Shows (as rooms proxy)
            newStats[3].value = parseFloat((result.overview.averageRating || 0).toFixed(1)); // Average Rating
            
            return newStats;
          });
        } else {
          console.warn('API returned but no overview data:', result);
          // Keep default fallback values
        }

        console.log('✅ Dashboard analytics loaded');
      } catch (error) {
        console.error('❌ Failed to fetch dashboard analytics:');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        
        // Use fallback data on error
        setStats(prevStats => {
          const newStats = [...prevStats];
          newStats[0].value = 12;
          newStats[1].value = 250;
          newStats[2].value = 8;
          newStats[3].value = 4.5;
          return newStats;
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuickStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${stat.bgColor} hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-600">
                {stat.title}
              </div>
            </div>
            <div className={`${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;

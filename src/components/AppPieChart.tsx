'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { getMoviePerformanceAnalytics } from "@/api/admin/analytics";

// Default chart data for fallback
const defaultData = [
  { name: 'No data', value: 0, color: '#e5e7eb' },
];

const COLORS = ['#2563eb', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4'];

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartData;
    fill?: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-[140px]">
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color || payload[0].payload.fill }}
          ></div>
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
        </div>
        <p className="text-lg font-bold" style={{ color: data.color || payload[0].payload.fill }}>
          {data.value} bookings
        </p>
        <div className="text-xs text-gray-500 mt-1">
          Movie Category
        </div>
      </div>
    );
  }
  return null;
};

export default function AppPieChart() {
  const [data, setData] = useState<ChartData[]>(defaultData);
  const [totalMovies, setTotalMovies] = useState<number>(0);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        // Get movie performance data
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const movieData = await getMoviePerformanceAnalytics(startDate, endDate);
        console.log('Movie performance analytics data:', movieData);
        
        if (movieData?.topMovies && Array.isArray(movieData.topMovies)) {
          // Transform backend data to chart format
          const transformedData = movieData.topMovies.slice(0, 6).map((item: { movieTitle?: string; title?: string; totalBookings?: number; bookings?: number }, index: number) => ({
            name: item.movieTitle || item.title || `Movie ${index + 1}`,
            value: item.totalBookings || item.bookings || 0,
            color: COLORS[index % COLORS.length]
          }));
          
          setData(transformedData);
          setTotalMovies(movieData.totalMovies || movieData.topMovies.length);
        } else {
          console.warn('No movie performance data available, using default data');
        }
      } catch (error) {
        console.error('Failed to fetch movie performance analytics:', error);
        // Keep default data
      }
    };

    fetchMovieData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Movie Performance</h3>
        {data.length > 0 && data[0].name !== 'No data' && (
          <span className="text-sm text-gray-600">
            {totalMovies} total
          </span>
        )}
      </div>
      
      {data.length > 0 && data[0].name !== 'No data' ? (
        <>
          <ChartContainer config={{}} className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={70} 
                  innerRadius={20}
                  fill="#8884d8" 
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {data.slice(0, 3).map((entry, index) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-gray-600 truncate max-w-[80px]">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="h-48 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-sm">No movie performance data</div>
          </div>
        </div>
      )}
    </div>
  );
}

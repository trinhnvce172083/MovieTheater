'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { getBookingAnalytics } from "@/api/admin/analytics";

// Default chart data for fallback
const defaultData: ChartData[] = [
  { day: 'Mon', bookings: 120 },
  { day: 'Tue', bookings: 200 },
  { day: 'Wed', bookings: 150 },
  { day: 'Thu', bookings: 300 },
  { day: 'Fri', bookings: 180 },
  { day: 'Sat', bookings: 250 },
  { day: 'Sun', bookings: 220 },
];

interface ChartData {
  day: string;
  bookings: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-[120px]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
        </div>
        <p className="text-lg font-bold text-green-600">
          {value} bookings
        </p>
        <div className="text-xs text-gray-500 mt-1">
          Daily Total
        </div>
      </div>
    );
  }
  return null;
};

export default function AppLineChart() {
  const [data, setData] = useState<ChartData[]>(defaultData);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        // Get booking data for last 7 days
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const bookingData = await getBookingAnalytics(startDate, endDate, 'DAY');
        console.log('Booking analytics data:', bookingData);
        
        if (bookingData?.bookingData && Array.isArray(bookingData.bookingData)) {
          // Transform backend data to chart format
          const transformedData = bookingData.bookingData.map((item: { label?: string; value?: number; bookings?: number }, index: number) => {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayIndex = (new Date().getDay() - bookingData.bookingData.length + 1 + index + 7) % 7;
            
            return {
              day: item.label || days[dayIndex] || `Day ${index + 1}`,
              bookings: item.value || item.bookings || 0
            };
          });
          
          setData(transformedData);
        } else {
          console.warn('No booking data available, keeping default data');
          // Don't change data, keep default
        }
      } catch (error) {
        console.error('Failed to fetch booking analytics:', error);
        // Keep default data
      }
    };

    fetchBookingData();
  }, []);

  return (
    <div className="w-full">
      {data.length > 0 ? (
        <div className="h-40 w-full">
          <ChartContainer config={{}} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tick={{ fill: '#64748B' }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-sm">No booking data</div>
          </div>
        </div>
      )}
    </div>
  );
}

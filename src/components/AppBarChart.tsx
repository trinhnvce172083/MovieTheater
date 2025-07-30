'use client';

import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useEffect, useState } from "react";
import { getRevenueAnalytics } from "@/api/admin/analytics";

// Default chart data for fallback
const defaultChartData: ChartData[] = [
    { month: "Jan", revenue: 15000000 },
    { month: "Feb", revenue: 18000000 },
    { month: "Mar", revenue: 22000000 },
    { month: "Apr", revenue: 19000000 },
    { month: "May", revenue: 25000000 },
    { month: "Jun", revenue: 26680000 },
];

interface ChartData {
    month: string;
    revenue: number;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        payload: ChartData;
    }>;
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-[140px]">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded bg-blue-600"></div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                </div>
                <p className="text-lg font-bold text-blue-600">
                    {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(value)}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                    Monthly Revenue
                </div>
            </div>
        );
    }
    return null;
};

const AppBarChart = () => {
    const [chartData, setChartData] = useState<ChartData[]>(defaultChartData);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                // Get revenue data for last 6 months
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                
                const revenueData = await getRevenueAnalytics(startDate, endDate, 'MONTH');
                console.log('Revenue analytics data:', revenueData);
                
                if (revenueData?.revenueData && Array.isArray(revenueData.revenueData)) {
                    // Transform backend data to chart format
                    const transformedData = revenueData.revenueData.map((item: { label?: string; value?: number; revenue?: number }, index: number) => {
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const monthIndex = new Date().getMonth() - revenueData.revenueData.length + 1 + index;
                        const adjustedIndex = monthIndex < 0 ? 12 + monthIndex : monthIndex;
                        
                        return {
                            month: item.label || monthNames[adjustedIndex] || `M${index + 1}`,
                            revenue: item.value || item.revenue || 0
                        };
                    });
                    
                    setChartData(transformedData);
                    setTotalRevenue(revenueData.totalRevenue || 0);
                } else {
                    console.warn('No revenue data available, keeping default data');
                    // Don't change chartData, keep default
                }
            } catch (error) {
                console.error('Failed to fetch revenue analytics:', error);
                // Keep default data
            }
        };

        fetchRevenueData();
    }, []);

    return (
        <div className="w-full">
            {chartData.length > 0 ? (
                <div className="h-40 w-full">
                    <ChartContainer config={{}} className="h-full w-full">
                        <BarChart 
                            data={chartData} 
                            barCategoryGap={12} 
                            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                        >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            fontSize={11}
                            tick={{ fill: '#64748B' }}
                        />
                        <ChartTooltip content={<CustomTooltip />} />
                        <Bar 
                            dataKey="revenue" 
                            fill="#2563eb" 
                            radius={[3, 3, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
                </div>
            ) : (
                <div className="h-40 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                        <div className="text-sm">No revenue data</div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AppBarChart;
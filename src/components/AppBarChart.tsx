'use client';

import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartData = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 15000 },
    { month: "Mar", revenue: 18000 },
    { month: "Apr", revenue: 14000 },
    { month: "May", revenue: 16000 },
    { month: "Jun", revenue: 23765 },
]

const AppBarChart = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-96">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Monthly Revenue</h3>
                <span className="text-sm font-medium text-gray-600">$24k</span>
            </div>
            <div className="h-40 w-full">
                <ChartContainer config={{}} className="h-full w-full">
                    <BarChart data={chartData} barCategoryGap={12} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            fontSize={11}
                            tick={{ fill: '#64748B' }}
                            height={20}
                        />
                        <ChartTooltip 
                            content={<ChartTooltipContent />}
                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        />
                        <Bar 
                            dataKey="revenue" 
                            fill="#2563eb" 
                            radius={[3, 3, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </div>
        </div>
    )
}

export default AppBarChart;
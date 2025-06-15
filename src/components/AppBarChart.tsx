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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-[140px]">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded bg-blue-600"></div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                </div>
                <p className="text-lg font-bold text-blue-600">
                    ${value.toLocaleString()}
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
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-96 transition-all duration-300 hover:shadow-md hover:border-gray-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Monthly Revenue</h3>
                <span className="text-sm font-medium text-gray-600">$24k</span>
            </div>
            <div className="h-40 w-full">
                <ChartContainer config={{}} className="h-full w-full">
                    <BarChart 
                        data={chartData} 
                        barCategoryGap={12} 
                        margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                    >
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="#f1f5f9" 
                            horizontal={true} 
                            vertical={false} 
                        />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            fontSize={11}
                            tick={{ fill: '#64748B' }}
                            height={20}
                        />
                        <ChartTooltip 
                            content={<CustomTooltip />}
                            cursor={{ 
                                fill: 'rgba(37, 99, 235, 0.1)',
                                stroke: 'rgba(37, 99, 235, 0.3)',
                                strokeWidth: 1,
                                radius: 4
                            }}
                        />
                        <Bar 
                            dataKey="revenue" 
                            fill="#2563eb" 
                            radius={[3, 3, 0, 0]}
                            onMouseEnter={(data, index) => {
                                // Add dramatic height increase and glow effect on hover
                                const bars = document.querySelectorAll('.recharts-bar-rectangle path');
                                bars.forEach((bar, i) => {
                                    if (i === index) {
                                        (bar as HTMLElement).style.filter = 'drop-shadow(0 0 12px rgba(37, 99, 235, 0.8))';
                                        (bar as HTMLElement).style.transform = 'scaleY(1.25)';
                                        (bar as HTMLElement).style.transformOrigin = 'bottom';
                                        (bar as HTMLElement).style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                                        (bar as HTMLElement).style.fill = '#1d4ed8';
                                    }
                                });
                            }}
                            onMouseLeave={() => {
                                // Remove effects
                                const bars = document.querySelectorAll('.recharts-bar-rectangle path');
                                bars.forEach((bar) => {
                                    (bar as HTMLElement).style.filter = 'none';
                                    (bar as HTMLElement).style.transform = 'scaleY(1)';
                                    (bar as HTMLElement).style.fill = '#2563eb';
                                });
                            }}
                        />
                    </BarChart>
                </ChartContainer>
            </div>
            
            {/* Additional hover effects */}
            <style jsx>{`
                .recharts-bar-rectangle path {
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                .recharts-bar-rectangle:hover path {
                    fill: #1d4ed8 !important;
                    filter: drop-shadow(0 0 12px rgba(37, 99, 235, 0.8)) drop-shadow(0 0 20px rgba(37, 99, 235, 0.4));
                    transform: scaleY(1.25);
                    transform-origin: bottom;
                }
                
                .recharts-tooltip-wrapper {
                    z-index: 1000;
                }
                
                /* Animated entrance for tooltip */
                .recharts-tooltip-wrapper .recharts-tooltip-content {
                    animation: tooltipFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                @keyframes tooltipFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(15px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                /* Enhanced animation for the entire chart container */
                .recharts-wrapper:hover {
                    transform: translateY(-2px);
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                /* Additional glow effect for the chart area */
                .recharts-wrapper:hover .recharts-surface {
                    filter: drop-shadow(0 4px 20px rgba(37, 99, 235, 0.1));
                }
            `}
            </style>
        </div>
    )
}

export default AppBarChart;
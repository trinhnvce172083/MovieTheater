"use client";

import React from 'react';
import { Card, Select, Space, Typography } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';

const { Title } = Typography;
const { Option } = Select;

interface ChartDataPoint {
  date: string;
  revenue: number;
  bookings: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  chartType?: 'line' | 'bar' | 'combined';
  onChartTypeChange?: (type: 'line' | 'bar' | 'combined') => void;
  title?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-800 mb-2">{`Ngày: ${label}`}</p>
        {payload.map((entry, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.dataKey === 'revenue' ? 'Doanh thu: ' : 'Số đặt vé: '}
            <span className="font-semibold">
              {entry.dataKey === 'revenue' 
                ? formatCurrency(entry.value) 
                : formatNumber(entry.value)
              }
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  loading = false,
  chartType = 'combined',
  onChartTypeChange,
  title = "Biểu Đồ Doanh Thu & Đặt Vé"
}) => {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" tickFormatter={formatCurrency} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="#1890ff" 
              strokeWidth={2}
              name="Doanh Thu"
              dot={{ fill: '#1890ff', r: 4 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="bookings" 
              stroke="#52c41a" 
              strokeWidth={2}
              name="Số Đặt Vé"
              dot={{ fill: '#52c41a', r: 4 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" tickFormatter={formatCurrency} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="revenue" 
              fill="#1890ff" 
              name="Doanh Thu"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              yAxisId="right"
              dataKey="bookings" 
              fill="#52c41a" 
              name="Số Đặt Vé"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        );

      case 'combined':
      default:
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" tickFormatter={formatCurrency} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="revenue" 
              fill="#1890ff" 
              name="Doanh Thu"
              radius={[2, 2, 0, 0]}
              opacity={0.7}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="bookings" 
              stroke="#52c41a" 
              strokeWidth={3}
              name="Số Đặt Vé"
              dot={{ fill: '#52c41a', r: 5 }}
            />
          </ComposedChart>
        );
    }
  };

  return (
    <Card 
      loading={loading}
      title={
        <div className="flex justify-between items-center">
          <Title level={4} className="m-0">{title}</Title>
          {onChartTypeChange && (
            <Select
              value={chartType}
              onChange={onChartTypeChange}
              style={{ width: 120 }}
              size="small"
            >
              <Option value="combined">Kết Hợp</Option>
              <Option value="line">Đường</Option>
              <Option value="bar">Cột</Option>
            </Select>
          )}
        </div>
      }
      className="w-full"
    >
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          {renderChart()}
        </ResponsiveContainer>
      </div>
      
      {/* Chart Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Space size="large" className="w-full justify-center">
          <div className="text-center">
            <div className="text-sm text-gray-500">Tổng Doanh Thu</div>
            <div className="text-lg font-semibold text-blue-600">
              {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Tổng Đặt Vé</div>
            <div className="text-lg font-semibold text-green-600">
              {formatNumber(data.reduce((sum, item) => sum + item.bookings, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Doanh Thu TB/Ngày</div>
            <div className="text-lg font-semibold text-purple-600">
              {formatCurrency(
                data.length > 0 
                  ? data.reduce((sum, item) => sum + item.revenue, 0) / data.length 
                  : 0
              )}
            </div>
          </div>
        </Space>
      </div>
    </Card>
  );
};

export default RevenueChart;

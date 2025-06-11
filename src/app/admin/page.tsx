"use client";

import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import AppBarChart from "@/components/AppBarChart";

export default function AdminDashboard() {
  // Mock data - in a real application, this would come from an API
  const stats = {
    totalUsers: 1234,
    totalMovies: 56,
    totalShowtimes: 789,
    totalRevenue: 98765,
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-2 h-10 bg-blue-600 rounded-lg" />
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-800 drop-shadow-sm">Dashboard</h1>
      </div>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Movies"
              value={stats.totalMovies}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Showtimes"
              value={stats.totalShowtimes}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#cf1322" }}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart Section */}
      <div className="mt-8">
        <AppBarChart />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <p className="text-gray-500">No recent activity to display.</p>
        </Card>
      </div>
    </div>
  );
} 
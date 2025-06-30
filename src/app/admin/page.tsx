"use client";

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import AppBarChart from "@/components/AppBarChart";
import { getAllUsers } from "@/api/admin/getAllUsers";
import { getMovies } from "@/api/admin/getAllMovies";
import { getAllPromotions } from "@/api/admin/getAllPromotions";
import axiosClient from "@/api/axiosClient";

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalMovies, setTotalMovies] = useState<number | null>(null);
  const [totalRooms, setTotalRooms] = useState<number | null>(null);
  const [totalPromotions, setTotalPromotions] = useState<number | null>(null);
  // Mock data - in a real application, this would come from an API
  const stats = {
    totalUsers: totalUsers,
    totalMovies: totalMovies !== null ? totalMovies : "...",
    totalRooms: totalRooms !== null ? totalRooms : "...",
    totalPromotions: totalPromotions !== null ? totalPromotions : "...",
  };

  

  useEffect(() => {
    async function fetchTotalUsers() {
      try {
        const data = await getAllUsers();
        // Nếu API trả về { content: [...], totalElements: ... }
        if (typeof data.totalElements === "number") {
          setTotalUsers(data.totalElements);
        } else if (data.content && Array.isArray(data.content)) {
          setTotalUsers(data.content.length);
        }
      } catch {
        setTotalUsers(null);
      }
    }
    fetchTotalUsers();
  }, []);

  //Take all movies from the API
  useEffect(() => {
    async function fetchTotalMovies() {
      try {
        const data = await getMovies({
          page: 0,
          size: 100,
          sortBy: "title",
          sortDirection: "asc",
        });
        if (typeof data.totalElements === "number") {
          setTotalMovies(data.totalElements);
        } else if (data.content && Array.isArray(data.content)) {
          setTotalMovies(data.content.length);
        }
      } catch {
        setTotalMovies(null);
      }
    }
    fetchTotalMovies();
  }, []);

  //Take all rooms from the API
  useEffect(() => {
    async function fetchTotalRooms() {
      try {
        const response = await axiosClient.get('/cinema-rooms', {
          params: {
            page: 0,
            size: 100,
            sortBy: 'cinemaRoomName',
            sortDirection: 'asc'
          }
        });
        if (typeof response.data.page?.totalElements === "number") {
          setTotalRooms(response.data.page.totalElements);
        } else if (response.data.content && Array.isArray(response.data.content)) {
          setTotalRooms(response.data.content.length);
        }
      } catch {
        setTotalRooms(null);
      }
    }
    fetchTotalRooms();
  }, []);

  //Take all promotions from the API
  useEffect(() => {
    async function fetchTotalPromotions() {
      try {
        const data = await getAllPromotions({
          page: 0,
          size: 100,
          sortBy: "promotionName",
          sortDirection: "ASC",
        });
        if (typeof data.page?.totalElements === "number") {
          setTotalPromotions(data.page.totalElements);
        } else if (data.content && Array.isArray(data.content)) {
          setTotalPromotions(data.content.length);
        }
      } catch {
        setTotalPromotions(null);
      }
    }
    fetchTotalPromotions();
  }, []);

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
              value={stats.totalUsers !== null ? stats.totalUsers : "..."}
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
              title="Total Rooms"
              value={stats.totalRooms}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Promotions"
              value={stats.totalPromotions}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#cf1322" }}
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
"use client";

import { useState } from "react";
import { Table, Input, Typography, Button, DatePicker, Pagination, Row, Col, Card } from "antd";
import dayjs from "dayjs";

// Mock data với phim hiện tại và thời gian thực tế
const mockData = [
  {
    key: 1,
    dateCreated: "15/01/2025 14:30",
    movieName: "DORAEMON: NOBITA'S ART WORLD TALES",
    addedScore: "15",
    usedScore: "",
  },
  {
    key: 2,
    dateCreated: "12/01/2025 16:45",
    movieName: "LILO & STITCH",
    addedScore: "12",
    usedScore: "",
  },
  {
    key: 3,
    dateCreated: "10/01/2025 19:20",
    movieName: "MISSION IMPOSSIBLE: DEADLY RECKONING",
    addedScore: "18",
    usedScore: "",
  },
  {
    key: 4,
    dateCreated: "08/01/2025 13:15",
    movieName: "THE STONE",
    addedScore: "10",
    usedScore: "5",
  },
  {
    key: 5,
    dateCreated: "05/01/2025 20:30",
    movieName: "DORAEMON: NOBITA'S ART WORLD TALES",
    addedScore: "15",
    usedScore: "",
  },
  {
    key: 6,
    dateCreated: "03/01/2025 11:20",
    movieName: "LILO & STITCH",
    addedScore: "",
    usedScore: "8",
  },
  {
    key: 7,
    dateCreated: "01/01/2025 16:45",
    movieName: "THE STONE",
    addedScore: "",
    usedScore: "12",
  },
  {
    key: 8,
    dateCreated: "30/12/2024 19:30",
    movieName: "DORAEMON: NOBITA'S ART WORLD TALES",
    addedScore: "20",
    usedScore: "",
  },
];

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    width: 60,
    render: (text: any, record: any, index: number) => index + 1,
  },
  {
    title: "DATE CREATED",
    dataIndex: "dateCreated",
    key: "dateCreated",
    width: 150,
  },
  {
    title: "MOVIE NAME",
    dataIndex: "movieName",
    key: "movieName",
    width: 300,
    ellipsis: true,
    render: (text: string) => (
      <div title={text} className="truncate">
        {text}
      </div>
    ),
  },
  {
    title: "ADDED SCORE",
    dataIndex: "addedScore",
    key: "addedScore",
    width: 120,
    align: 'center' as const,
  },
  {
    title: "USED SCORE",
    dataIndex: "usedScore",
    key: "usedScore",
    width: 120,
    align: 'center' as const,
  },
];

export default function ScoreHistoryPage() {
  const [fromDate, setFromDate] = useState(dayjs("2025-01-01"));
  const [toDate, setToDate] = useState(dayjs("2025-01-31"));
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);

  // Lọc dữ liệu theo ngày
  const filteredData = mockData.filter(item => {
    const itemDate = dayjs(item.dateCreated, "DD/MM/YYYY HH:mm");
    return itemDate.isAfter(fromDate.subtract(1, 'day')) && 
           itemDate.isBefore(toDate.add(1, 'day'));
  });

  const pagedData = filteredData.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
        <Typography.Title level={4} className="text-center mb-6 lg:mb-8 mt-8">
          History of score Adding / Using
        </Typography.Title>
        
        {/* Filters */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={6}>
            <div className="mb-2 font-medium">
              From date:
            </div>
            <DatePicker
              value={fromDate}
              format="DD/MM/YYYY"
              className="w-full"
              onChange={setFromDate}
              size="middle"
            />
          </Col>
          <Col xs={24} md={6}>
            <div className="mb-2 font-medium">
              To date:
            </div>
            <DatePicker
              value={toDate}
              format="DD/MM/YYYY"
              className="w-full"
              onChange={setToDate}
              size="middle"
            />
          </Col>
        </Row>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 mb-6">
          {pagedData.map((item, index) => (
            <Card key={item.key} className="border rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm text-gray-600">#{((current - 1) * pageSize) + index + 1}</span>
                  <span className="text-xs text-gray-500">{item.dateCreated}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Movie:</span>
                  <p className="font-medium text-sm">{item.movieName}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Added Score:</span>
                    <p className="font-medium text-green-600">{item.addedScore}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Used Score:</span>
                    <p className="font-medium text-red-600">{item.usedScore || "—"}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
        <Table
          columns={columns}
          dataSource={pagedData}
          pagination={false}
          bordered
          size="middle"
          scroll={{ x: 750 }}
          className="custom-table"
        />
        </div>

        {/* Pagination */}
        <div className="flex justify-center lg:justify-end mt-6">
          <Pagination
            current={current}
            pageSize={pageSize}
            total={filteredData.length}
            onChange={setCurrent}
            showSizeChanger={false}
            size="default"
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Table, Input, Typography, Button, DatePicker, Radio, Pagination, Row, Col, Card } from "antd";
import dayjs from "dayjs";

// Mock data
const mockData = [
  {
    key: 1,
    dateCreated: "18/11/2018 13:10",
    movieName: "Doctor Strange: Phù Thủy Tối Thượng",
    addedScore: "13.500",
    usedScore: "",
  },
  // Thêm dữ liệu nếu muốn test phân trang
];

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    width: 50,
    render: (text: any, record: any, index: number) => index + 1,
  },
  {
    title: "DATE CREATED",
    dataIndex: "dateCreated",
    key: "dateCreated",
  },
  {
    title: "MOVIE NAME",
    dataIndex: "movieName",
    key: "movieName",
  },
  {
    title: "ADDED SCORE",
    dataIndex: "addedScore",
    key: "addedScore",
  },
  {
    title: "USED SCORE",
    dataIndex: "usedScore",
    key: "usedScore",
  },
];

export default function ScoreHistoryPage() {
  const [fromDate, setFromDate] = useState(dayjs("2018-11-12"));
  const [toDate, setToDate] = useState(dayjs("2018-12-30"));
  const [type, setType] = useState("add");
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);

  // Lọc dữ liệu (mock, luôn trả về mockData)
  const filteredData = mockData;
  const pagedData = filteredData.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
        <Typography.Title level={4} className="text-center mb-6 lg:mb-8 mt-8">
          History of score Adding / Using
        </Typography.Title>
        
        {/* Filters */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={6}>
            <div className="mb-2 font-medium">
              From date:<span className="text-red-500">*</span>
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
              To date:<span className="text-red-500">*</span>
            </div>
            <DatePicker
              value={toDate}
              format="DD/MM/YYYY"
              className="w-full"
              onChange={setToDate}
              size="middle"
            />
          </Col>
          <Col xs={24} md={6} className="flex items-center">
            <Radio.Group
              value={type}
              onChange={e => setType(e.target.value)}
              className="flex flex-col gap-2"
            >
              <Radio value="add">History of score adding</Radio>
              <Radio value="use">History of score using</Radio>
            </Radio.Group>
          </Col>
          <Col xs={24} md={6} className="flex items-center">
            <Button type="primary" className="w-full md:w-auto md:mt-6" size="middle">
              ✔ View score
            </Button>
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
            scroll={{ x: 800 }}
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

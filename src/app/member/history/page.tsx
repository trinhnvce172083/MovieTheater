"use client";

import { useState } from "react";
import { Table, Input, Typography, Button, DatePicker, Radio, Pagination, Row, Col } from "antd";
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
    <div style={{ background: "#f7f8fa", minHeight: "100vh", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #0001", padding: 24, maxWidth: 1400, margin: "0 auto" }}>
        <Typography.Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
          History of score Adding / Using
        </Typography.Title>
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col xs={24} md={6}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              From date:<span style={{ color: "red" }}>*</span>
            </div>
            <DatePicker
              value={fromDate}
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              onChange={setFromDate}
            />
          </Col>
          <Col xs={24} md={6}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              To date:<span style={{ color: "red" }}>*</span>
            </div>
            <DatePicker
              value={toDate}
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              onChange={setToDate}
            />
          </Col>
          <Col xs={24} md={6} style={{ display: "flex", alignItems: "center" }}>
            <Radio.Group
              value={type}
              onChange={e => setType(e.target.value)}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              <Radio value="add">History of score adding</Radio>
              <Radio value="use">History of score using</Radio>
            </Radio.Group>
          </Col>
          <Col xs={24} md={6} style={{ display: "flex", alignItems: "center" }}>
            <Button type="primary" style={{ marginTop: 24, width: 140 }}>
              ✔ View score
            </Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={pagedData}
          pagination={false}
          bordered
          size="middle"
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Pagination
            current={current}
            pageSize={pageSize}
            total={filteredData.length}
            onChange={setCurrent}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
}

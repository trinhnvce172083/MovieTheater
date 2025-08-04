"use client";

import React, { useState } from "react";
import {
  Card,
  Tabs,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Alert,
  Spin,
  Tag,
  Result,
  Space,
} from "antd";
import {
  ScanOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface CheckInResult {
  success: boolean;
  booking?: any;
  message: string;
}

export default function CheckInPage() {
  const [activeTab, setActiveTab] = useState("qr");
  const [qrCode, setQrCode] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQrCheckIn = async () => {
    if (!qrCode.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      // Mock check-in success for now
      setCheckInResult({
        success: true,
        booking: {
          bookingCode: qrCode,
          customerName: "Nguyễn Văn A",
          customerPhone: "0912345678",
          movieTitle: "Avatar: The Way of Water",
          showDate: "2024-12-25",
          showTime: "19:30",
          seats: ["A1", "A2"]
        },
        message: "Check-in thành công!"
      });
    } catch (error) {
      setCheckInResult({
        success: false,
        message: "Có lỗi xảy ra khi check-in"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingCodeCheckIn = async () => {
    if (!bookingCode.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      // Mock check-in success for now
      setCheckInResult({
        success: true,
        booking: {
          bookingCode: bookingCode,
          customerName: "Trần Thị B",
          customerPhone: "0987654321",
          movieTitle: "Black Panther: Wakanda Forever",
          showDate: "2024-12-25",
          showTime: "21:00",
          seats: ["B5"]
        },
        message: "Check-in thành công!"
      });
    } catch (error) {
      setCheckInResult({
        success: false,
        message: "Có lỗi xảy ra khi check-in"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetCheckIn = () => {
    setCheckInResult(null);
    setQrCode("");
    setBookingCode("");
  };

  if (checkInResult) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <Result
          status={checkInResult.success ? "success" : "error"}
          title={checkInResult.message}
          icon={checkInResult.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          extra={[
            <Button type="primary" key="new" onClick={resetCheckIn}>
              Check-in khách khác
            </Button>,
          ]}
        >
          {checkInResult.success && checkInResult.booking && (
            <Card className="mt-4">
              <Title level={4}>Thông tin booking</Title>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Space direction="vertical" size="small">
                    <div>
                      <Text strong>Mã booking:</Text>
                      <br />
                      <Text>{checkInResult.booking.bookingCode}</Text>
                    </div>
                    <div>
                      <Text strong>Khách hàng:</Text>
                      <br />
                      <Text>{checkInResult.booking.customerName}</Text>
                    </div>
                    <div>
                      <Text strong>Số điện thoại:</Text>
                      <br />
                      <Text>{checkInResult.booking.customerPhone}</Text>
                    </div>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size="small">
                    <div>
                      <Text strong>Phim:</Text>
                      <br />
                      <Text>{checkInResult.booking.movieTitle}</Text>
                    </div>
                    <div>
                      <Text strong>Suất chiếu:</Text>
                      <br />
                      <Text>{checkInResult.booking.showDate} - {checkInResult.booking.showTime}</Text>
                    </div>
                    <div>
                      <Text strong>Ghế:</Text>
                      <br />
                      <Text>{checkInResult.booking.seats?.join(', ')}</Text>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          )}
        </Result>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <Title level={2} className="mb-6">
        🎫 Check-in khách hàng
      </Title>

      <Alert
        message="Hướng dẫn check-in"
        description="Khách hàng có thể check-in bằng cách quét mã QR trên vé hoặc cung cấp mã booking."
        type="info"
        showIcon
        className="mb-6"
      />

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <ScanOutlined />
                Quét mã QR
              </span>
            }
            key="qr"
          >
            <div className="text-center py-8">
              <ScanOutlined className="text-6xl text-blue-500 mb-4" />
              <Title level={4}>Quét mã QR từ vé của khách hàng</Title>
              <div className="max-w-md mx-auto mt-6">
                <Input.TextArea
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Dán mã QR hoặc nhập thủ công..."
                  rows={4}
                  className="mb-4"
                />
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleQrCheckIn}
                  loading={isLoading}
                  disabled={!qrCode.trim()}
                  icon={<ScanOutlined />}
                >
                  Check-in bằng QR
                </Button>
              </div>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <SearchOutlined />
                Mã booking
              </span>
            }
            key="booking"
          >
            <div className="text-center py-8">
              <SearchOutlined className="text-6xl text-green-500 mb-4" />
              <Title level={4}>Nhập mã booking</Title>
              <div className="max-w-md mx-auto mt-6">
                <Input
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  placeholder="Nhập mã booking (VD: BK001)"
                  size="large"
                  className="mb-4"
                  prefix={<UserOutlined />}
                />
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleBookingCodeCheckIn}
                  loading={isLoading}
                  disabled={!bookingCode.trim()}
                  icon={<SearchOutlined />}
                >
                  Check-in bằng mã booking
                </Button>
              </div>
            </div>
          </TabPane>
        </Tabs>

        {isLoading && (
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4">
              <Text>Đang xử lý check-in...</Text>
            </div>
          </div>
        )}
      </Card>

      {/* Instructions */}
      <Card title="📋 Lưu ý quan trọng" className="mt-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <CheckCircleOutlined className="text-2xl text-green-600" />
              </div>
              <Title level={5}>Kiểm tra thông tin</Title>
              <Text className="text-sm text-gray-600">
                Luôn kiểm tra thông tin khách hàng và booking trước khi xác nhận check-in
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <ScanOutlined className="text-2xl text-blue-600" />
              </div>
              <Title level={5}>Thời gian check-in</Title>
              <Text className="text-sm text-gray-600">
                Khách hàng chỉ có thể check-in từ 30 phút trước giờ chiếu
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <UserOutlined className="text-2xl text-orange-600" />
              </div>
              <Title level={5}>Xác minh danh tính</Title>
              <Text className="text-sm text-gray-600">
                Yêu cầu khách hàng xuất trình CCCD/CMND nếu cần thiết
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
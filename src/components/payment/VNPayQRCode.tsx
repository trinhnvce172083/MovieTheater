"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCode } from "antd";

interface VNPayQRCodeProps {
  amount: number;
  bookingId: string;
}

const VNPayQRCode: React.FC<VNPayQRCodeProps> = ({ amount, bookingId }) => {
  // QR Code cố định theo yêu cầu
  const qrCodeData = "00020101021138560010A0000007270126000697040301120701187464630208QRIBFTTA53037045802VN62280824CHUYEN TIEN NHANH QUA QR630445D9";

  return (
    <Card className="bg-[#1a2332] border-[#2d3748]">
      <CardHeader>
        <CardTitle className="text-white text-center">
          Quét mã QR để thanh toán
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <QRCode
          value={qrCodeData}
          size={250}
          className="bg-white p-4 rounded-lg"
        />
        <div className="text-center space-y-2">
          <p className="text-gray-400 text-sm">Số tiền cần thanh toán:</p>
          <p className="text-2xl font-bold text-green-400">
            {amount.toLocaleString()}đ
          </p>
          <p className="text-gray-400 text-sm">
            Mã booking: <span className="font-mono text-white">{bookingId}</span>
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Vui lòng quét mã QR bằng ứng dụng ngân hàng để thanh toán
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VNPayQRCode;

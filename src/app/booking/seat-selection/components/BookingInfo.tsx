import React from "react";
import { Card, Typography, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { Seat } from "../seatType";

interface BookingInfoProps {
  selectedSeats: Seat[];
  loading: boolean;
  onBack: () => void;
  onContinue: () => void;
}

const BookingInfo: React.FC<BookingInfoProps> = ({
  selectedSeats,
  loading,
  onBack,
  onContinue,
}) => (
  <Card className="shadow-lg p-6 bg-white/90 rounded-2xl">
    <div className="mb-4">
      <Typography.Text className="text-black block text-lg font-semibold">
        Movie Information
      </Typography.Text>
      <Typography.Text className="text-gray-600 block">
        Showtime: Loading...
      </Typography.Text>
      <Typography.Text className="text-gray-600 block">
        Room: Loading...
      </Typography.Text>
    </div>
    <div className="mb-4">
      <Typography.Text className="text-black font-medium">
        Selected Seats:
      </Typography.Text>
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedSeats.length === 0 ? (
          <span className="text-gray-600">No seats selected</span>
        ) : (
          selectedSeats.map((seat) => (
            <span
              key={seat.id}
              className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm"
            >
              {seat.row}
              {seat.number}
            </span>
          ))
        )}
      </div>
    </div>
    <div className="mb-6">
      <Typography.Text className="text-black font-medium">
        Total Amount:
      </Typography.Text>
      <span className="text-xl text-black font-bold ml-2">
        {new Intl.NumberFormat("vi-VN").format(0)} VND
      </span>
    </div>
    <div className="flex justify-between items-center gap-4">
      <Button
        type="default"
        size="large"
        className="flex-1 rounded-full bg-white hover:bg-gray-200 text-gray-800 font-semibold h-12 text-lg transition-all"
        onClick={onBack}
      >
        <ArrowLeftOutlined />
      </Button>
      <Button
        type="primary"
        size="large"
        className="flex-1 rounded-full bg-[#a084ee] hover:bg-[#7f56d9] text-white font-semibold h-12 text-lg transition-all"
        onClick={onContinue}
        loading={loading}
      >
        Continue
      </Button>
    </div>
  </Card>
);

export default BookingInfo;

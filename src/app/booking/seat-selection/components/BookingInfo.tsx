import React from "react";
import { Card, Typography, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { Seat } from "../seatType";

interface MovieInfo {
  movieId: number;
  title: string;
  duration: number;
  posterUrl: string;
}

interface ScheduleInfo {
  scheduleId: number;
  displayTime: string;
  displayDate: string;
  cinemaRoomName: string;
  movieTitle: string;
  movieId: number;
}

interface BookingInfoProps {
  selectedSeats: Seat[];
  loading: boolean;
  onBack: () => void;
  onContinue: () => void;
  movieInfo?: MovieInfo;
  scheduleInfo?: ScheduleInfo;
}

const BookingInfo: React.FC<BookingInfoProps> = ({
  selectedSeats,
  loading,
  onBack,
  onContinue,
  movieInfo,
  scheduleInfo,
}) => (
  <Card className="shadow-lg p-6 bg-white/90 rounded-2xl">
    <div className="mb-4">
      <Typography.Text className="text-black block text-lg font-semibold">
        {movieInfo?.title || scheduleInfo?.movieTitle || "Movie Information"}
      </Typography.Text>
      <Typography.Text className="text-gray-600 block">
        Showtime: {scheduleInfo?.displayTime || "Loading..."}
      </Typography.Text>
      <Typography.Text className="text-gray-600 block">
        Room: {scheduleInfo?.cinemaRoomName || "Loading..."}
      </Typography.Text>
      {movieInfo?.duration && (
        <Typography.Text className="text-gray-600 block">
          Duration: {movieInfo.duration} minutes
        </Typography.Text>
      )}
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
              key={seat.seatId}
              className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm"
            >
              {seat.seatNumber}
            </span>
          ))
        )}
      </div>
    </div>
    <div className="flex justify-between items-center gap-4 mt-6">
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


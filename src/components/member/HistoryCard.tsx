"use client";

import React from "react";
import { Card, Typography } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import MoviePoster from "./MoviePoster";
import StatusTag from "./StatusTag";
import PriceDisplay from "./PriceDisplay";
import DateTimeDisplay from "./DateTimeDisplay";

interface HistoryCardProps {
  movieTitle: string;
  moviePoster?: string;
  cinema: string;
  showtime: string;
  seats: string[];
  totalPrice: number;
  status: "completed" | "cancelled";
  bookingDate: string;
  className?: string;
}

const HistoryCard: React.FC<HistoryCardProps> = ({
  movieTitle,
  moviePoster,
  cinema,
  showtime,
  seats,
  totalPrice,
  status,
  bookingDate,
  className = "",
}) => {
  return (
    <Card
      className={`w-full shadow-sm hover:shadow-md transition-shadow ${className}`}
      bodyStyle={{ padding: "20px" }}
    >
      <div className="flex gap-4">
        <MoviePoster src={moviePoster} alt={movieTitle} width={96} height={144} />

        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <Typography.Title level={4} className="mb-1">
              {movieTitle}
            </Typography.Title>
            <StatusTag status={status} />
          </div>

          <div className="space-y-2 text-gray-600">
            <div className="flex items-center gap-2">
              <EnvironmentOutlined className="text-blue-500" />
              <span>{cinema}</span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-green-500" />
              <DateTimeDisplay dateTime={showtime} format="full" />
            </div>

            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="text-orange-500" />
              <span>Seats: {seats.join(", ")}</span>
            </div>

            <div className="flex items-center gap-2">
              <DollarOutlined className="text-red-500" />
              <PriceDisplay amount={totalPrice} size="large" strong />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <Typography.Text type="secondary" className="text-sm">
              Booked on: <DateTimeDisplay dateTime={bookingDate} format="date" />
            </Typography.Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HistoryCard;

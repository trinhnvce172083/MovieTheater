"use client";

import React from "react";
import { Card, Typography, Divider, Tag } from "antd";
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { BookingDetails } from "@/constants/paymentTypes";
import { PriceDisplay, DateTimeDisplay } from "@/components/member";

interface OrderSummaryProps {
  booking: BookingDetails;
  className?: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ booking, className = "" }) => {
  return (
    <Card className={`shadow-lg ${className}`} title="Order Summary">
      {/* Movie Info */}
      <div className="flex gap-4 mb-6">
        <div className="w-20 h-28 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
          {booking.moviePoster ? (
            <img 
              src={booking.moviePoster} 
              alt={booking.movieTitle}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-gray-500 text-xs text-center">
              Poster
            </span>
          )}
        </div>
        
        <div className="flex-1">
          <Typography.Title level={5} className="mb-2">
            {booking.movieTitle}
          </Typography.Title>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <EnvironmentOutlined className="text-blue-500" />
              <span>{booking.cinema}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-green-500" />
              <DateTimeDisplay 
                dateTime={booking.showtime} 
                format="full"
                className="text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="text-orange-500" />
              <span>Seats: {booking.seats.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      <Divider />

      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Ticket Price x {booking.quantity}</span>
          <PriceDisplay amount={booking.subtotal} />
        </div>
        
        {booking.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-<PriceDisplay amount={booking.discount} /></span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span>Tax & Fees</span>
          <PriceDisplay amount={booking.tax} />
        </div>
        
        <Divider />
        
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <PriceDisplay amount={booking.total} strong size="large" />
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <Typography.Text type="secondary" className="text-sm">
          <strong>Note:</strong> Please arrive at the cinema at least 15 minutes before showtime. 
          Tickets are non-refundable after purchase.
        </Typography.Text>
      </div>
    </Card>
  );
};

export default OrderSummary; 
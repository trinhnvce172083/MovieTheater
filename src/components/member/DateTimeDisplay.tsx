"use client";

import React from "react";
import { Typography } from "antd";

interface DateTimeDisplayProps {
  dateTime: string;
  format?: 'full' | 'short' | 'date' | 'time';
  className?: string;
}

const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({
  dateTime,
  format = 'full',
  className = ""
}) => {
  const formatDateTime = (dateString: string, formatType: string) => {
    const date = new Date(dateString);
    
    switch (formatType) {
      case 'full':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'short':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'date':
        return date.toLocaleDateString('en-US');
      case 'time':
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      default:
        return date.toLocaleDateString('en-US');
    }
  };

  return (
    <Typography.Text className={className}>
      {formatDateTime(dateTime, format)}
    </Typography.Text>
  );
};

export default DateTimeDisplay; 
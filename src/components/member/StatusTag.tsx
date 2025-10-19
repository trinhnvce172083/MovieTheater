"use client";

import React from "react";
import { Tag } from "antd";

interface StatusTagProps {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'used' | 'expired';
  className?: string;
}

const StatusTag: React.FC<StatusTagProps> = ({ status, className = "" }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'confirmed': return 'green';
      case 'cancelled': return 'red';
      case 'completed': return 'blue';
      case 'used': return 'purple';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      case 'used': return 'Used';
      case 'expired': return 'Expired';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Tag 
      color={getStatusColor(status)}
      className={`text-sm px-3 py-1 ${className}`}
    >
      {getStatusText(status)}
    </Tag>
  );
};

export default StatusTag; 
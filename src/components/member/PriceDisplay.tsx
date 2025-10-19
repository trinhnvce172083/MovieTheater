"use client";

import React from "react";
import { Typography } from "antd";

interface PriceDisplayProps {
  amount: number;
  currency?: 'VND' | 'USD';
  className?: string;
  size?: 'small' | 'default' | 'large';
  strong?: boolean;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  currency = 'VND',
  className = "",
  size = 'default',
  strong = false
}) => {
  const formatPrice = (price: number, curr: string) => {
    if (curr === 'VND') {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'VND'
      }).format(price);
    }
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: curr
    }).format(price);
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  return (
    <Typography.Text 
      strong={strong}
      className={`${getSizeClass(size)} ${className}`}
    >
      {formatPrice(amount, currency)}
    </Typography.Text>
  );
};

export default PriceDisplay; 
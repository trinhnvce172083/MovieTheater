"use client";

import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
  highlightColor?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  seconds, 
  onComplete,
  highlightColor = "text-green-600" 
}) => {
  const [countdown, setCountdown] = useState(seconds);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [countdown, onComplete]);

  return (
    <span className={`font-bold ${highlightColor} inline-block min-w-[20px]`}>
      {countdown}
    </span>
  );
};

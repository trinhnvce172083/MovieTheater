"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ActionButtonProps {
  href: string;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  href,
  variant = "primary",
  fullWidth = false,
  className = "",
  children
}) => {
  // Xác định kiểu button dựa trên variant
  const buttonStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-green-600 hover:bg-green-700 text-white",
    outline: "border-gray-300 hover:bg-gray-200 text-gray-700"
  };

  const style = buttonStyles[variant];
  const width = fullWidth ? "w-full" : "min-w-[180px]";
  
  return (
    <Button 
      variant={variant === "outline" ? "outline" : "default"}
      size="lg" 
      className={`${style} ${width} transition-all duration-300 shadow-md hover-lift ${className}`}
      asChild
    >
      <Link href={href}>
        <span className="flex items-center justify-center gap-2">
          {children}
        </span>
      </Link>
    </Button>
  );
};

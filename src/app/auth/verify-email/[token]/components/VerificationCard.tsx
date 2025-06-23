"use client";

import React, { type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VerificationCardProps {
  type: "pending" | "success" | "error";
  children: ReactNode;
  className?: string;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({
  type,
  children,
  className = ""
}) => {
  // Dark theme optimized styles
  const cardStyles = {
    pending: {
      containerClass: "bg-gradient-to-br from-slate-900/80 via-blue-950/60 to-indigo-950/60 border-blue-500/30",
      innerGradient: "from-blue-500/20 via-indigo-600/15 to-purple-600/20",
      glowClass: "shadow-blue-500/20",
      ringClass: "ring-blue-500/30",
      iconBg: "bg-blue-500/20 border-blue-400/30",
      textColor: "text-blue-100"
    },
    success: {
      containerClass: "bg-gradient-to-br from-slate-900/80 via-emerald-950/60 to-green-950/60 border-emerald-500/30",
      innerGradient: "from-emerald-500/20 via-green-600/15 to-teal-600/20",
      glowClass: "shadow-emerald-500/20",
      ringClass: "ring-emerald-500/30",
      iconBg: "bg-emerald-500/20 border-emerald-400/30",
      textColor: "text-emerald-100"
    },
    error: {
      containerClass: "bg-gradient-to-br from-slate-800/90 via-red-900/70 to-rose-900/70 border-red-400/40",
      innerGradient: "from-red-500/30 via-rose-500/25 to-pink-500/30",
      glowClass: "shadow-red-400/25",
      ringClass: "ring-red-400/40",
      iconBg: "bg-red-500/30 border-red-300/40",
      textColor: "text-red-50"
    }
  };

  const style = cardStyles[type];

  // Status icons with better dark theme contrast
  const StatusIcon = () => {
    const iconClass = "w-6 h-6 text-white drop-shadow-sm";
    
    switch (type) {
      case "pending":
        return (
          <div className={cn(
            "inline-flex items-center justify-center w-14 h-14 rounded-xl border backdrop-blur-sm mb-6",
            style.iconBg
          )}>
            <div className="w-6 h-6 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      case "success":
        return (
          <div className={cn(
            "inline-flex items-center justify-center w-14 h-14 rounded-xl border backdrop-blur-sm mb-6",
            style.iconBg
          )}>
            <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className={cn(
            "inline-flex items-center justify-center w-14 h-14 rounded-xl border backdrop-blur-sm mb-6",
            style.iconBg
          )}>
            <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="relative group">
      {/* Outer glow effect for dark backgrounds */}
      <div className={cn(
        "absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500",
        `bg-gradient-to-br ${style.innerGradient}`,
        style.glowClass
      )}></div>
      
      {/* Main card with shadcn styling */}
      <Card className={cn(
        "relative w-full border backdrop-blur-xl transition-all duration-300",
        "hover:shadow-2xl hover:scale-[1.01] transform",
        style.containerClass,
        style.glowClass,
        "shadow-xl",
        className
      )}>
        {/* Subtle animated background */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
        </div>
        
        {/* Inner content with ring effect */}
        <div className={cn(
          "relative p-8 rounded-lg ring-1 ring-inset transition-all duration-300",
          style.ringClass,
          `bg-gradient-to-br ${style.innerGradient}`
        )}>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none"></div>
          
          {/* Content area */}
          <div className="relative text-center space-y-4">
            {/* Status icon */}
            <StatusIcon />
            
            {/* Children content with enhanced dark theme typography */}
            <div className={cn("space-y-3", style.textColor)}>
              {children}
            </div>
          </div>
          
          {/* Accent dots */}
          <div className="absolute top-4 right-4 flex space-x-1">
            <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-white/20 rounded-full animate-pulse delay-100"></div>
          </div>
        </div>
      </Card>
    </div>
  );
};
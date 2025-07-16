"use client";

import React, { memo } from "react";

interface ResponsiveNavButtonProps {
  onClick: () => void;
  disabled: boolean;
  direction: "left" | "right";
  icon: React.ReactNode;
}

const ResponsiveNavButton = memo(function ResponsiveNavButton({
  onClick,
  disabled,
  direction,
  icon,
}: ResponsiveNavButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-8 h-8 sm:w-10 sm:h-10 
        flex items-center justify-center 
        rounded-full 
        transition-all duration-300 
        ${
          disabled
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-gray-800 text-white hover:bg-gray-700 hover:scale-110"
        }
        ${!disabled && "active:scale-95"}
        focus:outline-none focus:ring-2 focus:ring-white/50
      `}
      aria-label={`Scroll ${direction}`}
    >
      {icon}
    </button>
  );
});

export default ResponsiveNavButton;

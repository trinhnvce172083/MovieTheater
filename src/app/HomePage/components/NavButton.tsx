import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

export default function NavButton({
  direction,
  onClick,
  disabled = false,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}): React.ReactElement {
  const isLeft = direction === "left";
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        absolute top-1/2 -translate-y-1/2 z-20
        ${isLeft ? "left-2 sm:left-0" : "right-2 sm:right-0"}
        w-10 h-10 sm:w-12 sm:h-12 rounded-full
        ${disabled 
          ? 'opacity-0 pointer-events-none' 
          : 'opacity-100 bg-black/80 backdrop-blur-sm text-white border border-white/10 hover:bg-neutral-800 hover:scale-105'}
        flex items-center justify-center
        transition-all duration-200
        active:scale-95
      `}
      aria-label={isLeft ? "Scroll left" : "Scroll right"}
    >
      {isLeft ? (
        <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      ) : (
        <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      )}
    </button>
  );
}

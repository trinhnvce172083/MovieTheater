import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

export default function NavButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}): React.ReactElement {
  const isLeft = direction === "left";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
    absolute top-1/2 -translate-y-1/2 z-10
    ${isLeft ? "left-4" : "right-4"}
    w-10 h-10 rounded-full
    bg-black text-white border-0
    hover:bg-neutral-800 hover:text-white
    flex items-center justify-center
    transition-all duration-200
    active:scale-95
  `}
      aria-label={isLeft ? "Trước" : "Tiếp"}
    >
      {isLeft ? (
        <ChevronLeftIcon className="h-6 w-6" />
      ) : (
        <ChevronRightIcon className="h-6 w-6" />
      )}
    </button>
  );
}

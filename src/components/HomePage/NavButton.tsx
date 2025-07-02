import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

export default function NavButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}): React.ReactElement {
  return (
    <Button
      variant="outline"
      size="icon"
      className={`
        absolute top-1/2 -translate-y-1/2 rounded-full w-10 h-10 flex items-center justify-center z-10
        border border-neutral-300
        bg-white/80
        backdrop-blur
        shadow-lg
        transition
        hover:bg-white/95
        hover:shadow-xl
        active:scale-95
        ${direction === "left" ? "left-4" : "right-4"}
      `}
      onClick={onClick}
      aria-label={`Scroll ${direction}`}
    >
      {direction === "left" ? (
        <ChevronLeftIcon className="h-6 w-6 text-neutral-700" />
      ) : (
        <ChevronRightIcon className="h-6 w-6 text-neutral-700" />
      )}
    </Button>
  );
}
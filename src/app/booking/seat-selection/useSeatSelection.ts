"use client";

import { useState } from "react";
import type { Seat } from "./seatType";

export function useSeatSelection(maxSeats: number) {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  const selectSeat = (
    seat: Seat,
    allSeats: Seat[],
    onMaxWarning?: () => void
  ) => {
    const isCurrentlySelected = selectedSeats.some((s) => s.seatId === seat.seatId);

    if (isCurrentlySelected) {
      // Bỏ chọn ghế
      setSelectedSeats((prev) => prev.filter((s) => s.seatId !== seat.seatId));
    } else {
      // Chọn ghế mới
      if (selectedSeats.length >= maxSeats) {
        if (onMaxWarning) onMaxWarning();
        return;
      }
      setSelectedSeats((prev) => [
        ...prev,
        { ...seat, status: "selected" as const },
      ]);
    }
  };

  return { selectedSeats, setSelectedSeats, selectSeat };
}

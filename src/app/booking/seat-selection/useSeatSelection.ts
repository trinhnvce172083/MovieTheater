"use client";

import { useState } from "react";
import type { Seat } from "./seatType";

export function useSeatSelection(maxSeats: number) {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  const selectSeat = (
    seat: Seat,
    allSeats: Seat[],
    onMaxWarning?: () => void,
    onRowWarning?: (row: string | number) => void
  ) => {
    const isCurrentlySelected = selectedSeats.some((s) => s.seatId === seat.seatId);

    if (selectedSeats.length > 0 && !isCurrentlySelected) {
      const currentRow = selectedSeats[0].seatRow;
      if (seat.seatRow !== currentRow) {
        if (onRowWarning) onRowWarning(currentRow);
        return;
      }
    }

    if (isCurrentlySelected) {
      setSelectedSeats((prev) => prev.filter((s) => s.seatId !== seat.seatId));
    } else {
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

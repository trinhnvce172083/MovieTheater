import { useState } from "react";
import type { Seat } from "./seatType";

export function useSeatSelection(maxSeats: number) {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  const selectSeat = (seat: Seat, onMaxWarning?: () => void) => {
    const isCurrentlySelected = selectedSeats.some((s) => s.id === seat.id);
    if (isCurrentlySelected) {
      setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
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

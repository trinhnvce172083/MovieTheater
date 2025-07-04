import { Seat } from "@/app/booking/seat-selection/seatType";
import React from "react";

interface SeatComponentProps {
  seat: Seat;
  isSelected: boolean;
  onSelect: (seat: Seat) => void;
}

const getSeatColor = (seat: Seat) => {
  const type = seat.seatType?.toUpperCase() || "";
  if (seat.status === "TEMPORARILY_RESERVED")
    return "bg-orange-200 border-orange-400";
  if (seat.status === "OCCUPIED") return "bg-gray-400 border-gray-600";
  if (type === "VIP") return "bg-yellow-400 border-yellow-600";
  if (type === "COUPLE") return "bg-pink-400 border-pink-600";
  return "bg-gray-200 border-gray-400";
};

const getSeatStyle = (seat: Seat, isSelected: boolean) => {
  const base =
    "w-10 h-10 rounded-lg flex items-center justify-center font-bold border shadow transition-all duration-200";
  if (isSelected)
    return `${base} bg-blue-500 text-white border-blue-700 scale-110`;
  if (seat.status === "OCCUPIED")
    return `${base} bg-gray-400 text-white cursor-not-allowed opacity-60`;
  if (seat.status === "TEMPORARILY_RESERVED")
    return `${base} bg-orange-200 text-orange-700 border-orange-400 cursor-not-allowed opacity-80`;
  return `${base} ${getSeatColor(
    seat
  )} text-gray-800 hover:bg-blue-100 hover:border-blue-400 cursor-pointer`;
};

const SeatComponent: React.FC<SeatComponentProps> = ({
  seat,
  isSelected,
  onSelect,
}) => {
  const handleClick = () => {
    if (seat.status === "AVAILABLE") {
      onSelect(seat);
    }
  };
  let tooltip = "";
  if (seat.status === "TEMPORARILY_RESERVED")
    tooltip = "Seat temporarily reserved";
  else if (seat.status === "OCCUPIED") tooltip = "Seat occupied";
  else if (seat.seatType?.toUpperCase() === "COUPLE") tooltip = "Couple seat";
  else if (seat.seatType?.toUpperCase() === "VIP") tooltip = "VIP seat";
  else tooltip = "Standard seat";
  return (
    <button
      className={getSeatStyle(seat, isSelected)}
      onClick={handleClick}
      disabled={seat.status !== "AVAILABLE"}
      title={tooltip}
    >
      {seat.seatNumber}
    </button>
  );
};

export default SeatComponent;

import { Seat } from "@/app/booking/seat-selection/seatType";
import React from "react";

interface TheaterLayoutProps {
  seats: Seat[];
  selectedSeats: Seat[];
  onSelectSeat: (seat: Seat) => void;
}

const getSeatColor = (seat: Seat) => {
  const type = seat.type?.toUpperCase() || "";
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

const SeatComponent: React.FC<{
  seat: Seat;
  isSelected: boolean;
  onSelect: (seat: Seat) => void;
}> = ({ seat, isSelected, onSelect }) => {
  const handleClick = () => {
    if (seat.status === "AVAILABLE") {
      onSelect(seat);
    }
  };
  let tooltip = "";
  if (seat.status === "TEMPORARILY_RESERVED")
    tooltip = "Seat temporarily reserved";
  else if (seat.status === "OCCUPIED") tooltip = "Seat occupied";
  else if (seat.type?.toUpperCase() === "COUPLE") tooltip = "Couple seat";
  else if (seat.type?.toUpperCase() === "VIP") tooltip = "VIP seat";
  else tooltip = "Standard seat";
  return (
    <button
      className={getSeatStyle(seat, isSelected)}
      onClick={handleClick}
      disabled={seat.status !== "AVAILABLE"}
      title={tooltip}
    >
      {seat.number}
    </button>
  );
};

const TheaterLayout: React.FC<TheaterLayoutProps> = ({
  seats,
  selectedSeats,
  onSelectSeat,
}) => {
  // Group by row
  const rows: Record<string, Seat[]> = {};
  seats.forEach((seat) => {
    if (!rows[seat.row]) rows[seat.row] = [];
    rows[seat.row].push(seat);
  });
  const allRows = Object.keys(rows).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="bg-gray-50 rounded-lg w-full max-w-3xl mx-auto p-4">
      <div className="w-3/4 h-8 bg-gray-300 mx-auto mb-8 rounded-lg flex items-center justify-center text-gray-600 font-medium shadow">
        Screen
      </div>
      <div className="space-y-3">
        {allRows.map((row) => {
          const rowSeats = rows[row];
          const mid = Math.floor(rowSeats.length / 2);
          const left = rowSeats.slice(0, mid);
          const right = rowSeats.slice(mid);
          return (
            <div key={row} className="flex items-center justify-center gap-2">
              <span className="w-8 text-center font-bold text-lg text-gray-700">
                {row}
              </span>
              <div className="flex gap-4">
                <div className="flex gap-2">
                  {left.map((seat) => (
                    <SeatComponent
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeats.some((s) => s.id === seat.id)}
                      onSelect={onSelectSeat}
                    />
                  ))}
                </div>
                <div className="w-8" /> {/* Lối đi ở giữa */}
                <div className="flex gap-2">
                  {right.map((seat) => (
                    <SeatComponent
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeats.some((s) => s.id === seat.id)}
                      onSelect={onSelectSeat}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Chú thích */}
      <div className="mt-8 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 border border-gray-400 rounded-lg" />
          <span>Standard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-400 border border-yellow-600 rounded-lg" />
          <span>VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-pink-400 border border-pink-600 rounded-lg" />
          <span>Couple</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 border border-blue-700 rounded-lg" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-400 border border-gray-600 rounded-lg" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-200 border border-orange-400 rounded-lg" />
          <span>Reserved</span>
        </div>
      </div>
    </div>
  );
};

export default TheaterLayout;

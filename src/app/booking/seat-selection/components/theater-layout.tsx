import { Seat } from "@/app/booking/seat-selection/seatType";
import React from "react";

interface TheaterLayoutProps {
  seats: Seat[];
  selectedSeats: Seat[];
  onSelectSeat: (seat: Seat) => void;
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

const TheaterLayout: React.FC<TheaterLayoutProps> = ({
  seats,
  selectedSeats,
  onSelectSeat,
}) => {
  // Fix lỗi: Nếu seats undefined/null thì trả về thông báo
  if (!seats || !Array.isArray(seats) || seats.length === 0) {
    return <div className="text-center text-red-500 py-8">Không có dữ liệu ghế để hiển thị.</div>;
  }
  // Group by row
  const rows: Record<string, Seat[]> = {};
  seats.forEach((seat) => {
    const rowKey = typeof seat.seatRow === 'number' ? seat.seatRow.toString() : seat.seatRow;
    if (!rows[rowKey]) rows[rowKey] = [];
    rows[rowKey].push(seat);
  });
  const allRows = Object.keys(rows).sort((a, b) => Number(a) - Number(b));

  // Tính chiều rộng hàng ghế đầu tiên để kéo dài thanh Screen
  const firstRowSeats = allRows.length > 0 ? rows[allRows[0]] : [];
  const seatWidth = 40; // px (w-10)
  const seatGap = 8; // px (gap-2)
  const leftLabelWidth = 32; // px (w-8 cho label A)
  const midGap = 32; // px (w-8 lối đi giữa)
  const totalSeats = firstRowSeats.length;
  const mid = Math.floor(totalSeats / 2);
  // Tổng width = label + (left ghế + gap) + midGap + (right ghế + gap)
  const leftSeats = mid;
  const rightSeats = totalSeats - mid;
  const leftWidth = leftSeats * seatWidth + Math.max(0, leftSeats - 1) * seatGap;
  const rightWidth = rightSeats * seatWidth + Math.max(0, rightSeats - 1) * seatGap;
  // Tính toán chính xác hơn: bao gồm cả gap giữa các nhóm ghế
  const totalWidth = leftLabelWidth + leftWidth + midGap + rightWidth;
  // Thêm padding để thanh Screen rộng hơn một chút
  const screenWidth = totalWidth + 32; // +32px padding

  return (
    <div className="rounded-lg w-full max-w-3xl mx-auto p-4">
      <div
        className="h-8 bg-gray-300 mb-8 rounded-lg flex items-center justify-center text-gray-600 font-medium shadow"
        style={{ width: screenWidth, margin: '0 auto' }}
      >
        Screen
      </div>
      <div className="space-y-3 min-w-fit overflow-x-auto pt-4 min-h-[550px]">
        {allRows.map((row, index) => {
          const rowSeats = rows[row];
          const mid = Math.floor(rowSeats.length / 2);
          const left = rowSeats.slice(0, mid);
          const right = rowSeats.slice(mid);
          return (
            <div key={row} className="flex items-center justify-center gap-2 min-w-fit">
              <span className="w-8 text-center font-bold text-lg text-gray-700">
                {String.fromCharCode(65 + index)}
              </span>
              <div className="flex gap-4">
                <div className="flex gap-2 min-w-fit">
                  {left.map((seat) => (
                    <SeatComponent
                      key={seat.seatId}
                      seat={seat}
                      isSelected={selectedSeats.some((s) => s.seatId === seat.seatId)}
                      onSelect={onSelectSeat}
                    />
                  ))}
                </div>
                <div className="w-8" /> {/* Lối đi ở giữa */}
                <div className="flex gap-2 min-w-fit">
                  {right.map((seat) => (
                    <SeatComponent
                      key={seat.seatId}
                      seat={seat}
                      isSelected={selectedSeats.some((s) => s.seatId === seat.seatId)}
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
      <div className="mt-8 mb-4 flex justify-between gap-4 sm:gap-4 lg:gap-6">
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

"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { useState } from "react";
import { applyPromotion, setPromotionCode } from "@/store/slices/bookingSlice";
import ROUTES from "@/constants/routes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "antd";
import { BookingApiService } from "@/api/booking-api";
import { message } from "antd";

export default function BookingConfirmPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const bookingData = useSelector((state: RootState) => state.booking);
  const [promoInput, setPromoInput] = useState(bookingData.promotionCode || "");
  const [promoError, setPromoError] = useState("");

  const handleApplyPromotion = () => {
    if (!promoInput.trim()) {
      setPromoError("Please enter a promotion code");
      return;
    }
    // Giả sử validate mã ở FE, thực tế nên gọi API check mã
    dispatch(setPromotionCode(promoInput.trim()));
    // Có thể dispatch(applyPromotion(...)) nếu có logic áp dụng mã
    setPromoError("");
  };

  const handlePayment = async () => {
    try {
      const seatIds = bookingData.selectedSeats.map((seat: any) => seat.seatId);
      const bookingRequest = {
        scheduleId: Number(bookingData.scheduleId),
        seatIds,
        concessions: bookingData.selectedConcessions.map((item: any) => ({
          concessionId: item.concessionId,
          quantity: item.quantity
        })),
        promotionCode: bookingData.promotionCode || undefined,
      };
      
      const response = await BookingApiService.createBooking(bookingRequest);
      console.log('Booking API response:', response);
      const bookingId = response?.data?.bookingId;
      if (bookingId) {
        localStorage.setItem('currentBookingId', String(bookingId));
        message.success('Booking successful! Redirecting to payment page...');
        router.push(ROUTES.BOOKING_PAYMENT);
      } else {
        message.error('Failed to get bookingId from backend!');
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || err.message || 'Unable to create booking');
    }
  };

  return (
    <div className="min-h-screen bg-[#151a23] text-white flex flex-col items-center py-8 px-2">
      <div className="bg-[#23283a] rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Confirm Booking</h2>
        {/* Thông tin phim */}
        <div className="mb-4">
          <div className="flex gap-4 items-center">
            <img src={bookingData.movieInfo?.posterUrl || "/popcorn.jpg"} alt="poster" className="w-24 h-32 object-cover rounded" />
            <div>
              <div className="font-bold text-lg">{bookingData.movieInfo?.title}</div>
              <div className="text-gray-300">{bookingData.scheduleInfo?.displayTime} {bookingData.scheduleInfo?.displayDate}</div>
              <div className="text-gray-300">Room: {bookingData.scheduleInfo?.cinemaRoomName}</div>
              <div className="text-gray-300">Duration: {bookingData.movieInfo?.duration} minutes</div>
            </div>
          </div>
        </div>
        {/* Ghế đã chọn */}
        <div className="mb-4">
          <div className="font-semibold">Selected Seats:</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {bookingData.selectedSeats.length === 0 ? (
              <span className="text-gray-400">No seats selected</span>
            ) : (
              bookingData.selectedSeats.map(seat => (
                <span key={seat.seatId} className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm">
                  {seat.seatNumber}
                </span>
              ))
            )}
          </div>
        </div>
        {/* Combo đã chọn */}
        <div className="mb-4">
          <div className="font-semibold">Selected Combos:</div>
          <div className="flex flex-col gap-1 mt-2">
            {bookingData.selectedConcessions.length === 0 ? (
              <span className="text-gray-400">No combos selected</span>
            ) : (
              bookingData.selectedConcessions.map(item => (
                <div key={item.concessionId} className="flex items-center gap-2">
                  <img src={item.concession.imageUrl || "/popcorn.jpg"} alt={item.concession.name} className="w-8 h-8 object-cover rounded bg-white border" />
                  <span>{item.concession.name} x {item.quantity}</span>
                  <span className="ml-auto">{(item.concession.price * item.quantity).toLocaleString()} VND</span>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Tổng tiền */}
        <div className="mb-4 text-right">
          <div>Seat Total: <span className="font-bold text-yellow-400">{bookingData.seatTotal.toLocaleString()} VND</span></div>
          <div>Combo Total: <span className="font-bold text-yellow-400">{bookingData.concessionsTotal.toLocaleString()} VND</span></div>
          <div>Discount: <span className="font-bold text-green-400">-{bookingData.discountAmount.toLocaleString()} VND</span></div>
          <div className="text-lg mt-2">Total Payment: <span className="font-bold text-yellow-500 text-xl">{bookingData.finalAmount.toLocaleString()} VND</span></div>
        </div>
        {/* Nhập mã promotion */}
        <div className="mb-6">
          <div className="font-semibold mb-2">Promotion Code</div>
          <div className="flex gap-2 items-center">
            <Input
              value={promoInput}
              onChange={e => setPromoInput(e.target.value)}
              placeholder="Enter promotion code"
              className="w-48 text-black"
            />
            <Button onClick={handleApplyPromotion} className="bg-green-500 hover:bg-green-600 text-white font-bold">Apply</Button>
          </div>
          {promoError && <div className="text-red-400 text-sm mt-1">{promoError}</div>}
        </div>
        {/* Nút thanh toán */}
        <div className="flex justify-end">
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8 py-2 rounded text-lg" onClick={handlePayment}>
            Pay Now
          </Button>
        </div>
      </div>
    </div>
  );
}
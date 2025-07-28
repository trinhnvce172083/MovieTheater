"use client";

import { App, Button, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useBooking } from "@/hooks/booking/useBooking";
import type { Seat } from "@/app/booking/seat-selection/seatType";
import { RootState } from "@/store";
import {
  initializeBooking,
  setMovieInfo,
  setScheduleInfo,
  updateSelectedSeats,
  resetBooking,
} from "@/store/slices/bookingSlice";
import { ScheduleApiService } from "@/api/schedule-api";
import { MovieApiService } from "@/api/movie-api";

import BookingInfo from "./components/BookingInfo";
import SeatLoading from "./components/SeatLoading";
import TheaterLayout from "./components/theater-layout";
import ROUTES from "@/constants/routes";
import { useSeatSelection } from "@/hooks/booking/useSeatSelection";

export default function SeatSelectionPage() {
  const MAX_SEATS = 10;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch();

  const {
    scheduleId,
    roomId,
    movieInfo,
    scheduleInfo,
  } = useSelector((state: RootState) => state.booking);



  const {
    seats,
    selectedSeats,
    loading,
    error,
    fetchSeatStatus,
    selectSeat,
    deselectSeat,
    deselectAllSeats,
    isSeatSelected,
    getSelectedSeatIds,
  } = useSeatSelection(scheduleId, roomId);

  const { createBooking } = useBooking();

  useEffect(() => {
    const scheduleIdParam = searchParams.get("scheduleId");
    const roomIdParam = searchParams.get("roomId");

    // Chỉ reset và khởi tạo booking nếu khác với Redux
    if (
      scheduleIdParam &&
      roomIdParam &&
      (scheduleIdParam !== scheduleId || roomIdParam !== roomId)
    ) {
      dispatch(resetBooking());
      dispatch(
        initializeBooking({
          scheduleId: scheduleIdParam,
          roomId: roomIdParam,
        })
      );
    }
  }, [searchParams, dispatch, scheduleId, roomId]);

  useEffect(() => {
    if (scheduleId) {
      const fetchRelatedInfo = async () => {
        try {
          const scheduleResponse = await ScheduleApiService.getScheduleById(Number(scheduleId));
          
          if (scheduleResponse.success && scheduleResponse.data) {
            const scheduleData = scheduleResponse.data;
            
            dispatch(setScheduleInfo({
              scheduleId: scheduleData.scheduleId,
              displayTime: scheduleData.displayTime,
              displayDate: scheduleData.displayDate,
              cinemaRoomName: scheduleData.cinemaRoomName,
              movieTitle: scheduleData.movieName,
              movieId: scheduleData.movieId,
            }));

            if (scheduleData.movieId) {
              const movieResponse = await MovieApiService.getMovieById(Number(scheduleData.movieId));
              
              if (movieResponse.success && movieResponse.data) {
                const movieData = movieResponse.data;
                
                dispatch(setMovieInfo({
                  movieId: Number(movieData.movieId),
                  title: movieData.title,
                  duration: movieData.duration,
                  posterUrl: movieData.posterUrl,
                }));
              } else {
                messageApi.error("Failed to load movie details");
              }
            }
          } else {
            messageApi.error("Failed to load schedule details");
          }
        } catch (e) {
          messageApi.error("Failed to load movie and schedule details");
        }
      };

      fetchRelatedInfo();
    }
  }, [scheduleId, dispatch, messageApi]);

  const handleSelectSeat = (seat: Seat) => {
    if (isSeatSelected(seat.seatId)) {
      deselectSeat(seat.seatId);
    } else {
      selectSeat(seat);
    }
  };

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      messageApi.warning("Please select at least one seat.");
      return;
    }
    dispatch(updateSelectedSeats(selectedSeats));
    const params = new URLSearchParams({
      scheduleId: scheduleId || "",
      roomId: roomId || "",
      seats: JSON.stringify(selectedSeats),
    });
    router.push(`${ROUTES.BOOKING_CORNCHIP}?${params.toString()}`);
  };

  if (error) {
    return (
      <App>
        {contextHolder}
        <div className="container mx-auto flex h-full flex-col items-center justify-center p-4 text-center">
          <div className="rounded-lg bg-red-900/20 p-8">
            <h2 className="text-2xl font-bold text-red-500">
              Oops! Something went wrong.
            </h2>
            <p className="mt-2 text-red-300">{error}</p>
            <Button
              type="primary"
              danger
              onClick={() => window.location.reload()}
              className="mt-6"
            >
              Try Again
            </Button>
          </div>
        </div>
      </App>
    );
  }

  if (loading) {
    return (
      <App>
        {contextHolder}
        <SeatLoading />
      </App>
    );
  }

  return (
    <App>
      {contextHolder}
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex flex-col gap-4 md:flex-row md:gap-8">
          {/* Left: Seat layout */}
          <div className="flex-1 p-2 md:p-6 bg-white/90 rounded-lg md:rounded-2xl shadow-lg overflow-x-auto">
            <TheaterLayout
              seats={seats}
              selectedSeats={selectedSeats}
              onSelectSeat={handleSelectSeat}
            />
          </div>
          {/* Right: Booking information */}
          <div className="w-full md:w-[350px]">
            <BookingInfo
              selectedSeats={selectedSeats}
              loading={loading}
              onBack={() => {
                if (movieInfo?.movieId) {
                  router.push(`/movies/${movieInfo.movieId}`);
                } else {
                  router.push(ROUTES.MOVIES);
                }
              }}
              onContinue={handleContinue}
              movieInfo={movieInfo}
              scheduleInfo={scheduleInfo}
            />
          </div>
        </div>
      </div>
    </App>
  );
}

"use client";

import { App, Button, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useBooking } from "@/hooks/useBooking";
import type { Seat } from "@/app/booking/seat-selection/seatType";
import { RootState } from "@/store";
import {
  initializeBooking,
  setMovieInfo,
  setScheduleInfo,
  updateSelectedSeats,
} from "@/store/slices/bookingSlice";
import { ScheduleApiService } from "@/api/schedule-api";
import { MovieApiService } from "@/api/movie-api";

import BookingInfo from "./components/BookingInfo";
import SeatLoading from "./components/SeatLoading";
import TheaterLayout from "./components/theater-layout";
import ROUTES from "@/constants/routes";
import { useSeatSelection } from "./useSeatSelection";

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

  const { seats, loading, error, fetchSeatStatus, createBooking } = useBooking({
    scheduleId,
    roomId,
  });

  const { selectedSeats, setSelectedSeats, selectSeat } =
    useSeatSelection(MAX_SEATS);

  useEffect(() => {
    const scheduleIdParam = searchParams.get("scheduleId");
    const roomIdParam = searchParams.get("roomId");

    if (scheduleIdParam && roomIdParam) {
      dispatch(
        initializeBooking({
          scheduleId: scheduleIdParam,
          roomId: roomIdParam,
        })
      );
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    if (scheduleId) {
      const fetchRelatedInfo = async () => {
        try {
          
          // Lấy thông tin schedule trực tiếp bằng scheduleId
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

            // Lấy thông tin movie nếu có movieId
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
            } else {
              // No movieId found in schedule data
            }
          } else {
            messageApi.error("Failed to load schedule details");
          }
        } catch (e) {
          messageApi.error("Failed to load movie and schedule details");
        }
      };

      fetchSeatStatus();
      fetchRelatedInfo();
    }
  }, [scheduleId, dispatch, fetchSeatStatus, messageApi]);

  const handleSelectSeat = (seat: Seat) => {
    selectSeat(
      seat,
      seats,
      () => messageApi.warning(`You can select up to ${MAX_SEATS} seats only.`),
      () => messageApi.warning("You can only select seats in the same row!")
    );
  };

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      messageApi.warning("Please select at least one seat.");
      return;
    }
    try {
      const bookingData = await createBooking(selectedSeats);

      if (bookingData) {
        messageApi.success("Booking created successfully! Redirecting...");
        dispatch(updateSelectedSeats(selectedSeats));

        const params = new URLSearchParams({
          scheduleId: scheduleId || "",
          roomId: roomId || "",
          seats: JSON.stringify(selectedSeats),
        });
        router.push(`${ROUTES.CORNCHIP}?${params.toString()}`);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        messageApi.error(
          "Some selected seats are no longer available. Please choose again."
        );
        setSelectedSeats([]);
        fetchSeatStatus();
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An error occurred while creating the booking.";
        messageApi.error(errorMessage);
      }
    }
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
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Seat layout */}
          <div className="flex-1 p-6 bg-white/90 rounded-2xl shadow-lg">
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
              onBack={() => router.back()}
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

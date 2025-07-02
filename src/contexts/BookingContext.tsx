"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Seat {
  id: number;
  row: string;
  number: string;
  type: string;
}

interface MovieInfo {
  movieId: number;
  title: string;
  duration: number;
  posterUrl: string;
}

interface ScheduleInfo {
  scheduleId: number;
  displayTime: string;
  displayDate: string;
  cinemaRoomName: string;
  movieTitle: string;
  movieId: number;
}

interface BookingData {
  scheduleId: string | null;
  roomId: string | null;
  selectedSeats: Seat[];
  movieInfo: MovieInfo | null;
  scheduleInfo: ScheduleInfo | null;
}

interface BookingContextType {
  bookingData: BookingData;
  setBookingData: (data: BookingData) => void;
  clearBookingData: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingData, setBookingData] = useState<BookingData>({
    scheduleId: null,
    roomId: null,
    selectedSeats: [],
    movieInfo: null,
    scheduleInfo: null,
  });

  const clearBookingData = () => {
    setBookingData({
      scheduleId: null,
      roomId: null,
      selectedSeats: [],
      movieInfo: null,
      scheduleInfo: null,
    });
  };

  return (
    <BookingContext.Provider value={{ bookingData, setBookingData, clearBookingData }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
} 
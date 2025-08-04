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

interface CustomerInfo {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth?: string;
  isNewMember?: boolean;
  membershipType?: 'guest' | 'member' | 'new_member';
}

interface EmployeeBookingData {
  scheduleId: string | null;
  roomId: string | null;
  selectedSeats: Seat[];
  movieInfo: MovieInfo | null;
  scheduleInfo: ScheduleInfo | null;
  customerInfo: CustomerInfo | null;
  concessions: any[];
  bookingType: 'guest' | 'member'; // For employee to specify
}

interface EmployeeBookingContextType {
  bookingData: EmployeeBookingData;
  setBookingData: (data: EmployeeBookingData) => void;
  updateCustomerInfo: (customerInfo: CustomerInfo) => void;
  clearBookingData: () => void;
}

const EmployeeBookingContext = createContext<EmployeeBookingContextType | undefined>(undefined);

export function EmployeeBookingProvider({ children }: { children: ReactNode }) {
  const [bookingData, setBookingData] = useState<EmployeeBookingData>({
    scheduleId: null,
    roomId: null,
    selectedSeats: [],
    movieInfo: null,
    scheduleInfo: null,
    customerInfo: null,
    concessions: [],
    bookingType: 'guest',
  });

  const updateCustomerInfo = (customerInfo: CustomerInfo) => {
    setBookingData(prev => ({
      ...prev,
      customerInfo,
    }));
  };

  const clearBookingData = () => {
    setBookingData({
      scheduleId: null,
      roomId: null,
      selectedSeats: [],
      movieInfo: null,
      scheduleInfo: null,
      customerInfo: null,
      concessions: [],
      bookingType: 'guest',
    });
  };

  return (
    <EmployeeBookingContext.Provider value={{ 
      bookingData, 
      setBookingData, 
      updateCustomerInfo,
      clearBookingData 
    }}>
      {children}
    </EmployeeBookingContext.Provider>
  );
}

export function useEmployeeBooking() {
  const context = useContext(EmployeeBookingContext);
  if (context === undefined) {
    throw new Error("useEmployeeBooking must be used within an EmployeeBookingProvider");
  }
  return context;
}
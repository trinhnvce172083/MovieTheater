"use client";

import React from "react";
import { BookingProvider } from "@/contexts/BookingContext";

export default function CornChipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BookingProvider>
      {children}
    </BookingProvider>
  );
} 
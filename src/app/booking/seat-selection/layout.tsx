"use client";

import React from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import { BookingProvider } from "@/contexts/BookingContext";

export default function HomePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BookingProvider>
      <section className="flex flex-col min-h-screen">
        {/* Header section */}
        <header className="fixed top-0 left-0 right-0 z-50">
          <Header />
        </header>
        {/* Main content area */}
        <main className="pt-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-orange-900 to-black flex-1">
          {children}
        </main>
        {/* Footer section */}
        <Footer />
      </section>
    </BookingProvider>
  );
}

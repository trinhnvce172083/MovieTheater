import { ReactNode } from "react";
import Header from "@/components/Header/Header";
import { BookingProvider } from "@/contexts/BookingContext";

interface EmployeeBookingLayoutProps {
  children: ReactNode;
}

export default function EmployeeBookingLayout({ children }: EmployeeBookingLayoutProps) {
  return (
    <BookingProvider>
      <Header />
      <div className="bg-[#151a23] text-white min-h-screen">
        {children}
      </div>
    </BookingProvider>
  );
}
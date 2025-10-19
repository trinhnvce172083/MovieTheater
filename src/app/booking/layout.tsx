import { ReactNode } from "react";
import Header from "@/components/Header/Header";

interface BookingLayoutProps {
  children: ReactNode;
}

export default function BookingLayout({ children }: BookingLayoutProps) {
  return (
    <>
      <Header />
      <div className="bg-[#151a23] text-white min-h-screen">
        {children}
      </div>
    </>
  );
} 
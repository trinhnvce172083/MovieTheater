import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi tiết phim | Cinema App",
  description: "Xem thông tin chi tiết phim, trailer, lịch chiếu và đặt vé ngay",
  keywords: ["phim", "rạp chiếu phim", "đặt vé", "trailer", "chi tiết phim"],
  robots: "index, follow",
  openGraph: {
    title: "Chi tiết phim | Cinema App",
    description: "Xem thông tin chi tiết phim, trailer, lịch chiếu và đặt vé ngay",
    type: "website",
  },
};

export default function MovieDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
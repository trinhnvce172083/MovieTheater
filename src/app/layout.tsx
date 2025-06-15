"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./../styles/globals.css";
import BackTop from "antd/es/float-button/BackTop";
import { Provider } from "react-redux";
import store from "@/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider store={store}>
          <main className="min-h-screen pt-24">{children}</main>
        </Provider>
        <BackTop duration={100} visibilityHeight={50} />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// import ScrollToTopButton from "@/components/ScrollToTopButton";
import BackTop from "antd/es/float-button/BackTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumiere Cinema",
  description: "A modern cinema booking experience",
};

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
        <header className="fixed top-0 left-0 right-0 z-50">
          <Header />
        </header>
        <main className="min-h-screen pt-24">{children}</main>
        <Footer />
        <BackTop duration={200} visibilityHeight={50} />
      </body>
    </html>
  );
}

"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./../styles/globals.css";
import BackTop from "antd/es/float-button/BackTop";
<<<<<<< HEAD
import { Provider } from "react-redux";
import store from "@/store";
=======
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App } from "antd";
>>>>>>> feature/Seat-selection

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
<<<<<<< HEAD
        <Provider store={store}>
          <main className="min-h-screen pt-24">{children}</main>
        </Provider>
        <BackTop duration={100} visibilityHeight={50} />
=======
        <AntdRegistry>
          <App>
            <header className="fixed top-0 left-0 right-0 z-50">
              <Header />
            </header>
            <main className="min-h-screen pt-24">{children}</main>
            <Footer />
            <BackTop duration={200} visibilityHeight={50} />
          </App>
        </AntdRegistry>
>>>>>>> feature/Seat-selection
      </body>
    </html>
  );
}

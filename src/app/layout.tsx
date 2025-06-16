"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import {ThemeProvider} from "@/components/providers/ThemeProvider";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <BackTop duration={100} visibilityHeight={50} /> */}
        <Provider store={store}>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem
            disableTransitionOnChange
          >
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}

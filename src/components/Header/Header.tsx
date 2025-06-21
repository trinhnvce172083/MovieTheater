//Header
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import LanguageDropdown from "./LanguageDropdown";

// Dynamic import để tránh hydration mismatch
const HeaderComponent = () => {
  const { isLoggedIn, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="flex items-center justify-between px-6 bg-black py-0 text-white relative z-10">
        <div className="flex items-center">
          <div className="w-24 h-24 bg-gray-300 animate-pulse rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-6 bg-black py-0 text-white relative z-10" suppressHydrationWarning>
      <div className="flex items-center">
        <Link href={ROUTES.HOME} className="mr-8">
          <Image
            src="/Logo.png"
            alt="Logo"
            width={500}
            height={500}
            className="w-auto h-24"
          />
        </Link>
        <nav className="flex space-x-8">
          <Link
            href={ROUTES.NOW_SHOWING}
            className="hover:text-red-500 transition-colors"
          >
            Now Showing
          </Link>
          {/* <Link
            href={ROUTES.BOOKING}
            className="hover:text-red-500 transition-colors"
          >
            Booking
          </Link> */}
          <Link
            href={ROUTES.COMING_SOON}
            className="hover:text-red-500 transition-colors"
          >
            Coming Soon
          </Link>
        </nav>
      </div>
      <div className="flex items-center space-x-6">
        {!isLoggedIn ? (
          <Link
            href={ROUTES.LOGIN}
            className="rounded-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-500 hover:to-orange-500 text-white px-4 py-1.5 font-medium transition-colors shadow-md"
          >
            Login
          </Link>
        ) : (
          <>
            <NotificationDropdown />
            <UserDropdown user={user} />
          </>
        )}
        <LanguageDropdown />
      </div>
    </header>
  );
};

// Export với dynamic import để tránh hydration mismatch
export default dynamic(() => Promise.resolve(HeaderComponent), {
  ssr: false,
  loading: () => (
    <header className="flex items-center justify-between px-6 bg-black py-0 text-white relative z-10">
      <div className="flex items-center">
        <div className="w-24 h-24 bg-gray-300 animate-pulse rounded"></div>
      </div>
    </header>
  ),
});

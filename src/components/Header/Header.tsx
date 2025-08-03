"use client";

import React from "react";
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
  const { isLoggedIn, userInfo } = useAuth();


  return (
    <header className="flex items-center justify-between px-2 sm:px-4 md:px-6 bg-black py-2 md:py-0 text-white relative z-10 border-b border-black/30 shadow-sm">
      <div className="flex items-center gap-2 md:gap-8">
        <Link href={ROUTES.HOME} className="mr-2 md:mr-8">
          <Image
            src="/Logo.png"
            alt="Logo"
            width={120}
            height={48}
            className="w-24 h-12 md:w-auto md:h-24"
            priority // Logo is important for First Contentful Paint
            sizes="120px"
          />
        </Link>
        <nav className="flex gap-3 md:gap-8 text-sm md:text-base flex-wrap">
          <Link
            href={ROUTES.NOW_SHOWING}
            className="hover:text-red-500 transition-colors whitespace-nowrap"
          >
            Now Showing
          </Link>
          <Link
            href={ROUTES.COMING_SOON}
            className="hover:text-red-500 transition-colors whitespace-nowrap"
          >
            Coming Soon
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2 md:gap-6">
        {!isLoggedIn ? (
          <Link
            href={ROUTES.LOGIN}
            className="rounded-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-500 hover:to-orange-500 text-white px-3 py-1 md:px-4 md:py-1.5 font-medium transition-colors shadow-md text-sm md:text-base"
          >
            Login
          </Link>
        ) : (
          <>
            <div className="rounded-full bg-white/10 p-2 md:p-0">
              <NotificationDropdown />
            </div>
            <div>
              <UserDropdown userName={username} />
            </div>
          </>
        )}
        <div className="rounded-full bg-white/10 p-2 md:p-0">
          <LanguageDropdown />
        </div>
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
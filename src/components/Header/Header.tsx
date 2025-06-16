//Header

"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "./SearchBar";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import LanguageDropdown from "./LanguageDropdown";

export default function Header() {
  const { isLoggedIn, user } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 bg-black py-0 text-white relative z-10">
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
            href={ROUTES.MOVIES}
            className="hover:text-red-500 transition-colors"
          >
            Movies
          </Link>
        </nav>
      </div>
      <div className="flex items-center space-x-6">
        <SearchBar />
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
}

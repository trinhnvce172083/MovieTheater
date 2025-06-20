//Header
"use client";

import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import dynamic from "next/dynamic";

// Dynamically import dropdowns with preload in production for better performance
const NotificationDropdown = dynamic(() => import("./NotificationDropdown"), { 
  ssr: false, 
  loading: () => <div className="w-6 h-6" /> 
});

const UserDropdown = dynamic(() => import("./UserDropdown"), { 
  ssr: false,
  loading: () => <div className="w-6 h-6" /> 
});

const LanguageDropdown = dynamic(() => import("./LanguageDropdown"), { 
  ssr: false,
  loading: () => <div className="w-6 h-6" /> 
});

// Preload these components in production for better UX
if (process.env.NODE_ENV === 'production') {
  import("./NotificationDropdown");
  import("./UserDropdown");
  import("./LanguageDropdown");
}

function Header() {
  const { isLoggedIn, user } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 bg-black py-0 text-white relative z-10">
      <div className="flex items-center">
        <Link href={ROUTES.HOME} className="mr-8">
          <Image
            src="/Logo.png"
            alt="Logo"
            width={180}
            height={72}
            className="w-auto h-24"
            priority // Logo is important for First Contentful Paint
            sizes="180px"
          />
        </Link>
        <nav className="flex space-x-8">
          <Link
            href={ROUTES.NOW_SHOWING}
            className="hover:text-red-500 transition-colors"
          >
            Now Showing
          </Link>
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
}

export default memo(Header);

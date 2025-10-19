"use client";

import { UserCircle, BarChart3 } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ROUTES from "@/constants/routes";
import { Logout_API } from "@/api/auth/Logout_API";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AdminHeader() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await Logout_API();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("isLoggedIn");
      router.push(ROUTES.HOME);

      dispatch({ type: "auth/logout" });
    }
  };

  return (
    <header className={`w-full flex items-center justify-between ${isMobile ? 'px-4 py-3' : 'px-8 py-4'} bg-white border-b border-gray-200 shadow-sm rounded-t-2xl`}>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('toggleMobileMenu'));
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
            title="Menu"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
                {/* Dashboard Icon */}
       
        <Image
          src="/Logo.png"
          alt="Lumiere Logo"
          width={isMobile ? 32 : 40}
          height={isMobile ? 32 : 40}
          className="rounded-full"
        />
        <span className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'} text-blue-900 tracking-wide`}>
          {isMobile ? 'Admin' : 'Admin Panel'}
        </span>
      </div>
      <div className="flex items-center gap-3 sm:gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1 sm:gap-2 cursor-pointer select-none">
              <UserCircle className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-gray-500`} />
              <span className={`font-medium text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}>
                {isMobile ? 'Admin' : 'Admin'}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            <DropdownMenuItem
              onClick={() => router.push(ROUTES.ADMIN_DASHBOARD)}
            >
              Admin Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(ROUTES.HOME)}
            >
              Go Homepage
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

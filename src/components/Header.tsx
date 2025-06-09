//Header

"use client";

import Image from "next/image";
import Link from "next/link";
import { SearchOutlined, GlobalOutlined } from "@ant-design/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ROUTES from "@/constants/routes";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-0 bg-black text-white relative z-10">
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
            href={ROUTES.SHOWTIMES}
            className="hover:text-red-500 transition-colors"
          >
            Showtimes
          </Link>
          <Link
            href={ROUTES.BOOKING}
            className="hover:text-red-500 transition-colors"
          >
            Booking
          </Link>
          <Link
            href={ROUTES.MOVIES}
            className="hover:text-red-500 transition-colors"
          >
            Movies
          </Link>
        </nav>
      </div>

      <div className="flex items-center space-x-6">
        <button className="text-white hover:text-red-500 transition-colors pr-5">
          <SearchOutlined style={{ fontSize: "20px" }} />
        </button>
        <Link
          href={ROUTES.LOGIN}
          className="rounded-full bg-red-500 hover:bg-blue-500 text-white px-4 py-1.5 font-medium transition-colors shadow-md"
        >
          Login
        </Link>
        <div className="flex items-center relative">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-2 hover:text-red-500 transition-colors">
              <GlobalOutlined style={{ fontSize: "16px", marginRight: "4px" }} />
              <span>EN</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="z-50 min-w-[100px] mr-4"
              align="end"
              sideOffset={8}
              alignOffset={-20}
            >
              <DropdownMenuItem className="flex justify-center hover:bg-red-500 hover:text-white cursor-pointer transition-colors focus:bg-red-500 focus:text-white">
                English
              </DropdownMenuItem>
              <DropdownMenuItem className="flex justify-center hover:bg-red-500 hover:text-white cursor-pointer transition-colors focus:bg-red-500 focus:text-white">
                Tiếng Việt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

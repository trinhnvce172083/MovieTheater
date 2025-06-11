//Header

"use client";

import { useEffect, useRef, useState } from "react";
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
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function Header() {
  const [show, setShow] = useState(true);
  const lastScrollY = useRef(0);
  const { setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setShow(false); // Kéo xuống thì ẩn
      } else {
        setShow(true); // Kéo lên thì hiện
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`flex items-center justify-between px-6 py-0 bg-black text-white relative z-10 transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ position: "sticky", top: 0 }}
    >
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

      <div className="flex items-center gap-x-6">
        <button className="text-white hover:text-red-500 transition-colors pr-2">
          <SearchOutlined style={{ fontSize: "20px" }} />
        </button>
        {/* Nút chọn theme */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative bg-transparent border-none hover:bg-gray-800/60 flex items-center justify-center p-1"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

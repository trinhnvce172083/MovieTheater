"use client";

import { Bell, UserCircle } from "lucide-react";
import Image from "next/image";

export default function AdminHeader() {
  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm rounded-t-2xl">
      <div className="flex items-center gap-3">
        <Image src="/Logo.png" alt="Lumiere Logo" width={40} height={40} className="rounded-full" />
        <span className="font-bold text-xl text-blue-900 tracking-wide">Admin Panel</span>
      </div>
      <div className="flex items-center gap-6">
        <button className="relative hover:bg-gray-100 rounded-full p-2 transition">
          <Bell className="w-6 h-6 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-2">
          <UserCircle className="w-8 h-8 text-gray-500" />
          <span className="font-medium text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  );
}
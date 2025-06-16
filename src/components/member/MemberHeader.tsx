"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  UserOutlined,
  HistoryOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";

interface MemberHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    points: number;
  };
}

const MEMBER_TABS = [
  {
    key: "account",
    label: "Account Information",
    icon: <UserOutlined />,
    path: "/member",
  },
  {
    key: "history",
    label: "History",
    icon: <HistoryOutlined />,
    path: "/member/history",
  },
  {
    key: "booked",
    label: "Booked Ticket",
    icon: <FileTextOutlined />,
    path: "/member/bookings",
  },
  {
    key: "managed",
    label: "Managed Ticket",
    icon: <SettingOutlined />,
    path: "/member/tickets",
  },
];

const MemberHeader: React.FC<MemberHeaderProps> = ({ user }) => {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col justify-between p-4">
      {/* Logo + Menu */}
      <div>
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="Logo" className="w-24 h-20 mb-4" />
        </div>

        {/* Menu */}
        <div className="flex flex-col gap-y-4 mb-6">
          {MEMBER_TABS.map((tab) => (
            <Link href={tab.path} key={tab.key}>
              <button
                className={`w-full text-left flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition ${
                  pathname === tab.path
                    ? "bg-white shadow"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* User Info */}
      <div className="flex flex-col items-center text-center text-sm mt-6">
        <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center mb-2 text-white">
          👤
        </div>
        <p className="font-semibold">{user.name}</p>
        <p className="text-gray-600 text-xs">{user.email}</p>
        <div className="flex space-x-4 mt-2 text-lg">
          <span>🔔</span>
          <span>⚙️</span>
        </div>
      </div>
    </div>
  );
};

export default MemberHeader;

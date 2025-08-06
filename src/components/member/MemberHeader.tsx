"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  UserOutlined,
  HistoryOutlined,
  FileTextOutlined,
  SettingOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { useMemberProfile } from "@/hooks/member";

interface MemberHeaderProps {
  onClose?: () => void;
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
    key: "promotions",
    label: "Promotions",
    icon: <SettingOutlined />,
    path: "/member/promotions",
  },
  {
    key: "cancelled",
    label: "Cancelled Tickets",
    icon: <CloseCircleOutlined />,
    path: "/member/tickets",
  },
];

const MemberHeader: React.FC<MemberHeaderProps> = ({ onClose }) => {
  const pathname = usePathname();
  const { profile } = useMemberProfile();

  const handleTabClick = () => {
    // Đóng mobile menu khi click vào tab
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 lg:p-10 bg-[#d2e7f5]">
      {/* User Info (avatar, username, email từ API) */}
      <div className="flex-1">
        <div className="pt-16 lg:pt-24 flex flex-col items-center mb-6">
          {/* Avatar, Name, Email */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gray-400 flex items-center justify-center mb-2 text-white text-2xl lg:text-3xl">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="avatar"
                  className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover"
                  key={profile.avatarUrl} // Force re-render when avatar changes
                />
              ) : (
                <span>👤</span>
              )}
            </div>
            <p className="font-bold text-base lg:text-lg text-center">{profile?.fullName || profile?.username || ""}</p>
            <p className="text-gray-600 text-xs text-center">{profile?.email || ""}</p>
          </div>

          {/* Menu */}
          <div className="flex flex-col gap-y-3 lg:gap-y-4 mb-6 w-full">
            {MEMBER_TABS.map((tab) => (
              <Link href={tab.path} key={tab.key} onClick={handleTabClick}>
                <button
                  className={`w-full text-left flex items-center space-x-2 px-3 lg:px-4 py-2 lg:py-2 rounded-full transition text-sm lg:text-base ${
                    pathname === tab.path
                      ? "bg-white shadow"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                >
                  <span className="text-gray-800">{tab.icon}</span>
                  <span className="text-gray-800">{tab.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Spacer to push footer to bottom */}
      <div className="flex-grow bg-[#d2e7f5]"></div>
      
      {/* Footer */}
      <div className="mt-auto pb-4 bg-[#d2e7f5]">
        <div className="text-center text-gray-600 text-xs opacity-70">
          © 2024 Lumiere Cinema
        </div>
      </div>
    </div>
  );
};

export default MemberHeader;

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
    key: "promotions",
    label: "Promotions",
    icon: <SettingOutlined />,
    path: "/member/promotions",
  },
  {
    key: "cancel",
    label: "Cancel Ticket",
    icon: <CloseCircleOutlined />,
    path: "/member/tickets",
  },
];

const MemberHeader: React.FC = () => {
  const pathname = usePathname();
  const { profile } = useMemberProfile();

  return (
    <div className="fixed top-0 min-h-screen flex flex-col justify-between p-10">
      {/* User Info (avatar, username, email từ API) */}
      <div>
        <div className="pt-24 flex flex-col items-center mb-6">
          {/* Avatar, Name, Email */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-400 flex items-center justify-center mb-2 text-white text-3xl">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span>👤</span>
              )}
            </div>
            <p className="font-bold text-lg">{profile?.fullName || profile?.username || ""}</p>
            <p className="text-gray-600 text-xs">{profile?.email || ""}</p>
          </div>

          {/* Menu */}
          <div className="flex flex-col gap-y-4 mb-6">
            {MEMBER_TABS.map((tab) => (
              <Link href={tab.path} key={tab.key}>
                <button
                  className={`w-full text-left flex items-center space-x-2 px-4 py-2 rounded-full transition ${
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
    </div>
  );
};

export default MemberHeader;
